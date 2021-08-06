/* eslint-disable no-underscore-dangle */
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

class Connection {
    id: string;
    playerInfo?: Player;
    game?: Game;
    private socket: WebSocket;
    private handlers: Record<EventName, EventHandler> = {
        init: (sessionId: string | null) => {
            /* Every time the player refreshes the screen, they are given a brand new WebSocket
             * connection, so the server generates uuids to track sessions. The client stores its
             * assigned id in sessionStorage so it will persist when the page is reloaded, but not
             * when the tab is closed.
             *
             * When a user loads the app, the uuid in sessionStorage (or null, for a new session) is
             * sent as the 'sessionId' argument above. If a session with that id exists and is not
             * active, this connection "merges" with the existing inactive one.
             */
            if (sessionId) {
                const existingConnection = connections.get(sessionId);
                if (existingConnection && !existingConnection.isActive) {
                    // Merge this connection with the existing, inactive one
                    console.log("Replacing connection", sessionId);
                    existingConnection.reconnect(this.socket);
                    connections.remove(this);
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
            if (playerName.trim() === "") {
                this.sendError("A name is required, but none was provided");
                return;
            }

            const game = games.get(gameCode);
            if (!game) {
                this.sendError("The game does not exist");
                return;
            }

            const trimmedName = playerName.trim();

            if (game.state === GameState.WAITING) {
                if (game.players.some((p) => p.name === trimmedName)) {
                    this.sendError("A player with that name already exists");
                    return;
                }
                this.playerInfo = new Player(trimmedName);
                game.connections.push(this);
                game.connections.forEach((c) => {
                    if (c === this) {
                        // Send the player who joined a list of players in the game
                        const playerList = game.players.map((p) => p.name);
                        c.send("joinedGame", {
                            playerList,
                            gameCode,
                        });
                    } else {
                        // Tell other players that this player joined the game
                        c.send("playerJoined", playerName);
                    }
                });
            } else if (game.state === GameState.IN_PROGRESS) {
                if (game.players.some((p) => p.name === trimmedName && !p.isConnected)) {
                    // eslint-disable-next-line max-len
                    const peers = game.connections.filter((c) => c.playerInfo?.name !== trimmedName);
                    peers.forEach((p) => {
                        p.send("playerReconnected", trimmedName);
                    });
                } else {
                    this.sendError("The game is not accepting new players");
                    return;
                }
            } else {
                this.sendError("The game has ended");
                return;
            }

            this.game = game;
        },

        getPlayerList: () => {
            this.send("playerList", this.game?.players?.map((p) => p.name));
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
                    ...game.getPlayerInfo(c.playerInfo as Player),
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

            const { name, responses } = player;
            judge.send("cardSelected", { name, responses });
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

            // Get a subset of the data in the player list--only the names, responses, and roles
            const leaderboard = game.players
                .map(({
                    name,
                    responses,
                    score,
                    isJudge: _isJudge, // Fixes eslint error since isJudge is already in scope
                    isWinner,
                    isConnected,
                }) => ({
                    name,
                    responses,
                    score,
                    isJudge: _isJudge,
                    isWinner,
                    isConnected,
                }));

            game.sendAll("winnerSelected", leaderboard);
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

                // If all players are ready for the next round, advance the game
                if (game.players.every((p) => p.isReadyForNextRound)) {
                    game.nextRound();

                    // Send each player the info they need for the game
                    const roundInfo = game.getRoundInfo();
                    game.connections.forEach((c) => {
                        c.send("newRound", {
                            ...roundInfo,
                            ...game.getPlayerInfo(c.playerInfo as Player),
                        });
                    });
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
            this.send("statusUpdate", this.game?.state?.valueOf());
        },
    };

    get isActive() {
        return this.socket.readyState === WebSocket.OPEN;
    }

    constructor(socket: WebSocket) {
        this.id = randomUUID();
        this.socket = socket;
        this.socket.on("message", (message) => {
            if (typeof message === "string") {
                this.processMessage(message);
            }
        });
    }

    reconnect(newSocket: WebSocket) {
        // Replace the old socket connection with the new one
        const oldSocket = this.socket;
        if (oldSocket !== newSocket) {
            this.socket = newSocket;
            if (oldSocket.readyState === WebSocket.OPEN) {
                oldSocket.close();
            }
        }

        // Send reconnect message to peers
        this.game?.connections.forEach((c) => {
            if (c !== this) {
                c.send("infoMessage", `${this.playerInfo?.name} reconnected`);
            }
        });

        // Give the client who reconnected the latest state
        if (this.game?.state === GameState.IN_PROGRESS) {
            this.send("restoreState", {
                ...this.game.getRoundInfo(),
                ...this.game.getPlayerInfo(this.playerInfo as Player),
                username: this.playerInfo?.name,
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
        if (this.playerInfo && this.game) {
            this.game.connections.forEach((c) => {
                if (c !== this) {
                    c.send("infoMessage", `${this.playerInfo?.name} disconnected`);
                }
            });
        }
        this.socket.close();
    }
}

export default Connection;
