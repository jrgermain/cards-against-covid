import { randomUUID } from "crypto";
import WebSocket from "ws";
import { isDev } from "../config";
import Game, { GameState } from "./Game";
import * as connections from "../state/connections";
import * as games from "../state/games";
import { getDecks, getExpansionPacks, saveExpansionPack } from "../cards";
import Deck from "./Deck";
import Player from "./Player";
import type { IDeck } from "./Deck";

type ICreateGameArgs = { deckName: string, expansionPackNames: string[], roundLimit?: number };
type IJoinGameArgs = { gameCode: string, playerName: string };
type EventName = (
    "init" |
    "getDecks" |
    "getExpansionPacks" |
    "createExpansionPack" |
    "createGame" |
    "joinGame" |
    "getPlayerList" |
    "startGame" |
    "selectCard" |
    "selectAnswer" |
    "sendChat" |
    "readyForNext" |
    "changeName" |
    "getGameStatus"
);
type EventHandler = (eventPayload: any) => void;
enum PingStatus { UNHEALTHY, PENDING, HEALTHY }

class Connection {
    id: string;
    playerInfo?: Player;
    game?: Game;
    private disconnectTimestamp?: number;
    private pingStatus?: PingStatus;
    private pingInterval?: NodeJS.Timeout;
    private socket: WebSocket;
    private handlers: Record<EventName, EventHandler> = {
        init: (sessionId: string | null) => {
            /* Every time the player refreshes the screen, they are given a brand new WebSocket
             * connection, so the server generates uuids to track sessions. The client stores its
             * assigned id in sessionStorage so it will persist when the page is reloaded, but not
             * when the tab is closed.
             *
             * When a user loads the app, the uuid in sessionStorage (or null, for a new session) is
             * sent as the 'sessionId' argument above. If an inactive session with that id exists in
             * an ongoing game, this connection "merges" with the existing inactive one.
             */
            if (sessionId) {
                const existingConnection = connections.get(sessionId);
                if (existingConnection && !existingConnection.isActive) {
                    // Merge this connection with the existing, inactive one
                    this.transferTo(existingConnection);
                    return;
                }
            }

            this.send("sessionEstablished", this.id);
        },

        getDecks: async () => {
            const decks = await getDecks();

            this.send("deckList", decks.map((d) => ({
                name: d.name,
                numPrompts: d.prompts.length,
                numResponses: d.responses.length,
            })));
        },

        getExpansionPacks: async () => {
            const packs = await getExpansionPacks();

            this.send("packList", packs.map((p) => ({
                name: p.name,
                numPrompts: p.prompts.length,
                numResponses: p.responses.length,
            })));
        },

        createExpansionPack: async ({ name, prompts, responses }: IDeck) => {
            try {
                await saveExpansionPack(new Deck({ name, prompts, responses }));
                this.send("expansionPackCreated", name);
            } catch (e) {
                this.sendError(e?.message);
            }
        },

        createGame: async ({ deckName, expansionPackNames, roundLimit = Infinity }: ICreateGameArgs) => {
            const allDecks = await getDecks();
            const allExpansionPacks = await getExpansionPacks();

            const deck = allDecks.find((d) => d.name === deckName);
            if (!deck) {
                this.sendError(`No deck matching name ${deckName}`);
                return;
            }

            const packs = allExpansionPacks.filter((p) => expansionPackNames.includes(p.name));

            const cards = Deck.combine(deck, ...packs).shuffle();
            const game = new Game(cards, roundLimit);
            const gameCode = games.add(game);

            this.game = game;

            this.send("gameCreated", gameCode);
        },

        joinGame: ({ gameCode, playerName }: IJoinGameArgs) => {
            const trimmedName = playerName?.trim();

            if (!trimmedName) {
                this.sendError("A name is required, but none was provided");
                return;
            }

            const game = games.get(gameCode);
            if (!game) {
                this.sendError("The game does not exist");
                return;
            }

            const existingPlayer = game.players.find((p) => p.name === trimmedName);

            if (game.state === GameState.WAITING) {
                if (existingPlayer?.isConnected) {
                    this.sendError("A player with that name already exists");
                } else if (existingPlayer) {
                    // Transfer to existing, inactive connection
                    const existingConnectionIndex = game.players.indexOf(existingPlayer);
                    this.transferTo(game.connections[existingConnectionIndex]);
                } else {
                    // Tell current players that this player joined the game
                    game.sendAll("playerJoined", { name: trimmedName, isConnected: true });

                    // Update this connection and the game object
                    this.playerInfo = new Player(trimmedName);
                    this.game = game;
                    this.send("joinedGame", gameCode);
                    game.connections.push(this);
                }
            } else if (game.state === GameState.IN_PROGRESS) {
                if (existingPlayer?.isConnected) {
                    this.sendError("This player is already connected. If you think this is a mistake, try closing this tab and re-joining.");
                } else if (existingPlayer) {
                    // Transfer to existing, inactive connection
                    const existingConnectionIndex = game.players.indexOf(existingPlayer);
                    this.transferTo(game.connections[existingConnectionIndex]);
                } else {
                    this.sendError("The game is not accepting new players");
                }
            } else {
                this.sendError("The game has ended");
            }
        },

        getPlayerList: () => {
            this.send("playerList", this.game?.players?.map((p) => ({ name: p.name, isConnected: p.isConnected })));
        },

        startGame: () => {
            const { game } = this;
            if (!game) {
                this.sendError("The game does not exist");
                return;
            }

            if (game.state === GameState.WAITING && game.connections.length > 2) {
                game.start();
                const roundInfo = game.getRoundInfo();
                game.connections.forEach((c) => c.send("gameStarted", {
                    ...roundInfo,
                    ...game.getPlayerInfo(c.playerInfo!),
                }));
            } else if (game.state === GameState.WAITING) {
                this.sendError("Please wait for at least 3 players to join");
            } else {
                this.sendError("Game has already started");
            }
        },

        selectCard: (index: number) => {
            const { game } = this;
            if (!game) {
                this.sendError("The game does not exist");
                return;
            }

            if (!this.playerInfo) {
                return;
            }

            // If every player has answered, prevent the user from changing their answers
            if (game.isLocked) {
                this.sendError("Please wait for the judge to select a winner");
                return;
            }

            const player = this.playerInfo;
            const promptsRequired = game.numBlanks;
            const promptsSelected = player.responses.length;
            const card = player.cards[index];
            const cardIsSelected = player.responses.includes(card);

            if (cardIsSelected) {
                // If the card is selected, deselect it
                player.responses.splice(player.responses.indexOf(card), 1);
            } else if (promptsSelected < promptsRequired) {
                // If the card is not yet selected and the user's hand is not full, play it
                player.responses.push(card);

                if (game.isLocked) {
                    game.sendAll("lockPlayerInputs");
                }
            } else {
                // If the card is not selected and the user's hand is full, show error
                this.sendError("Please deselect a card first");
                return;
            }

            const judge = game.connections.find((c) => c.playerInfo?.isJudge);
            if (!judge) {
                return;
            }

            const { name, responses, isConnected } = player;
            judge.send("cardSelected", { name, responses, isConnected });
            this.send("cardSelected", responses);
        },

        selectAnswer: (playerName: string) => {
            const { game } = this;
            if (!game) {
                this.sendError("The game does not exist");
                return;
            }

            const isJudge = this.playerInfo?.isJudge;
            if (!isJudge) {
                this.sendError("You are not the judge");
                return;
            }

            const winner = game.players.find((p) => p.name === playerName);
            if (!winner) {
                this.sendError("Player not found");
                return;
            }

            winner.isWinner = true;
            winner.score++;

            game.sendAll("winnerSelected", game.getLeaderboard());
        },

        sendChat: (content: string) => {
            const { game } = this;
            if (!game) {
                this.sendError("The game does not exist");
                return;
            }
            if (!this.playerInfo) {
                this.sendError("You do not exist");
                return;
            }

            if (game.state === GameState.IN_PROGRESS) {
                const message = {
                    sender: this.playerInfo.name,
                    content,
                };
                game.sendAll("chatMessage", message);
            }
        },

        readyForNext: () => {
            const { game } = this;
            if (!game) {
                this.sendError("The game does not exist");
                return;
            }

            if (this.playerInfo) {
                this.playerInfo.isReadyForNextRound = true;

                // If all connected players are ready for the next round, advance the game
                if (game.players.every((p) => p.isReadyForNextRound || !p.isConnected)) {
                    game.nextRound();
                }
            }
        },

        changeName: (newName: string) => {
            if (!newName) {
                this.sendError("A name is required, but none was provided");
                return;
            }

            const { game } = this;
            if (!game) {
                this.sendError("The game does not exist");
                return;
            }

            if (this.playerInfo) {
                const oldName = this.playerInfo.name;
                this.playerInfo.name = newName;
                game.sendAll("nameChanged", { oldName, newName });
            }
        },

        getGameStatus: () => {
            this.send("gameStatus", this.game?.state?.valueOf());
        },
    };

    get isActive() {
        return this.socket.readyState === WebSocket.OPEN && this.pingStatus === PingStatus.HEALTHY;
    }

    constructor(socket: WebSocket) {
        this.id = randomUUID();
        this.socket = socket;
        this.initSocket();
    }

    stopHealthCheck() {
        if (this.pingInterval) {
            globalThis.clearInterval(this.pingInterval);
        }
    }

    private initSocket() {
        // Message handling
        this.socket.on("message", (message) => {
            if (typeof message === "string") {
                this.processMessage(message);
            }
        });

        // Health check - send pings periodically to check that connection is healthy
        this.pingStatus = PingStatus.HEALTHY;
        this.pingInterval = globalThis.setInterval(() => {
            if (this.isActive) {
                this.socket.ping();
                this.pingStatus = PingStatus.PENDING;
            } else {
                if (isDev) {
                    console.warn("Unhealthy connection", this.id);
                }
                this.end();
            }
        }, 2000);

        this.socket.on("pong", () => {
            this.pingStatus = PingStatus.HEALTHY;
        });

        this.socket.on("close", () => {
            this.end();
        });
    }

    transferTo(existingConnection: Connection) {
        if (isDev) {
            console.log(`Transferring data from temporary connection ${this.id} to existing connection ${existingConnection.id}`);
        }

        // Tell the client to use the existing session id
        this.send("sessionEstablished", existingConnection.id);

        // Stop polling for connection health, since we are closing this connection
        this.stopHealthCheck();

        // Transfer everything to the existing connection
        existingConnection.takeOver(this);

        // Remove this connection, as it is no longer needed
        connections.remove(this);
    }

    takeOver(tempConnection: Connection) {
        // Replace the old socket connection with the new one
        const oldSocket = this.socket;
        const newSocket = tempConnection.socket;
        if (oldSocket !== newSocket) {
            this.socket = newSocket;
            if (oldSocket.readyState === WebSocket.OPEN) {
                oldSocket.terminate();
            }

            // Remove event listeners bound to the previous Connection instance
            const events = ["message", "pong", "close"];
            events.forEach((event) => {
                oldSocket.removeAllListeners(event);
                newSocket.removeAllListeners(event);
            });

            // Add event handlers to the new socket
            this.initSocket();
        }

        if (!this.playerInfo) {
            return;
        }

        this.playerInfo.isConnected = true;

        /* If it has been more than 2 seconds after disconnect, show a message that the player
         * reconnected. This matches how we only notify players of the disconnect if the player has
         * been away longer than 2 seconds, effectively giving them a 2-second buffer to handle
         * refreshing the page.
         */
        const timeAway = Date.now() - this.disconnectTimestamp!;
        if (timeAway >= 2000) {
            if (isDev) {
                console.log(`${this.playerInfo?.name} returned after being away for ${(timeAway / 1000).toFixed(2)} seconds`);
            }
            this.game?.connections.filter((c) => c !== this).forEach(((c) => {
                c.send("playerReconnected", this.playerInfo!.name);
            }));
        }

        // Give the client who reconnected the latest state
        if (this.game?.state === GameState.IN_PROGRESS) {
            this.send("restoreState", {
                ...this.game.getRoundInfo(),
                ...this.game.getPlayerInfo(this.playerInfo),
                leaderboardContent: this.game.players.some((p) => p.isWinner)
                    ? this.game.getLeaderboard()
                    : null,
                isLocked: this.game.isLocked,
                gameCode: this.game.code,
            });
        }
    }

    processMessage(message: string) {
        // CAC messages are in the form: `CAC:${eventName}:${jsonPayload}`
        if (message.startsWith("CAC:")) {
            const secondColon = message.indexOf(":", 4);
            const eventName = message.slice(4, secondColon);
            let payload = message.slice(secondColon + 1);
            try {
                payload = JSON.parse(payload);
            } catch (e) {
                console.warn("Recieved non-json payload: ", payload);
            }

            if (eventName in this.handlers) {
                if (isDev) {
                    console.log("(Connection.processMessage): executing handler", { eventName, payload });
                }
                this.handlers[eventName as EventName](payload);
            } else if (isDev) {
                console.log(`(Connection.processMessage): no handler for "${eventName}"`);
            }
        }
    }

    send(event: string, payload?: any) {
        this.socket.send(JSON.stringify({ event, payload }));
    }

    sendError(message?: string) {
        if (isDev) {
            console.error("Sending error to socket: ", message);
        }
        this.send("errorMessage", message || "An unexpected error occurred");
    }

    end() {
        if (isDev) {
            console.log("Closing connection", this.id);
        }

        this.stopHealthCheck();
        this.disconnectTimestamp = Date.now();

        if (this.game) {
            this.game.removeConnection(this);
        }

        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.terminate();
        }
    }
}

export default Connection;
