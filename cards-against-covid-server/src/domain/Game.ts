import type Deck from "./Deck";
import type Player from "./Player";
import type Connection from "./Connection";
import * as games from "../state/games";
import type ChatMessage from "./ChatMessage";

enum GameState {
    WAITING,
    IN_PROGRESS,
    ENDED,
}

class Game {
    deck: Deck;
    roundLimit: number;
    connections: Connection[] = [];
    prompt = "";
    state = GameState.WAITING;
    round = 0;
    cardsPerPlayer = 0;
    code?: string;
    chats: ChatMessage[] = [];

    get players(): Player[] {
        return (
            this.connections
                .map((connection) => connection.playerInfo)
                .filter(Boolean) as Player[]
        );
    }

    get numBlanks(): number {
        return this.prompt.match(/_+/g)?.length ?? 1;
    }

    get promptIsMultiSelect(): boolean {
        return this.numBlanks > 1;
    }

    get isLocked(): boolean {
        const { numBlanks } = this;
        return this.connections.length > 0 && this.players.every((p) => (
            p.isJudge || !p.isConnected || p.responses.length === numBlanks
        ));
    }

    constructor(deck: Deck, roundLimit: number) {
        this.deck = deck;
        this.roundLimit = roundLimit;
    }

    start(): void {
        if (this.state === GameState.WAITING) {
            this.state = GameState.IN_PROGRESS;

            /* By default, players get 7 response cards each. Every player should start off with the
             * same number of cards. If there aren't enough cards for everyone to get 7, lower this
             * size so everyone can start with the same number. Enforce a maximum of 7 per player.
             */
            const totalCardsPerPlayer = Math.floor(this.deck.responses.length / this.players.length);
            this.cardsPerPlayer = Math.min(7, totalCardsPerPlayer);

            // Start the first round
            this.nextRound();
        }
    }

    nextRound(): void {
        // If we reached the user-defined round limit, end the game
        if (this.round + 1 >= this.roundLimit) {
            this.end();
            return;
        }

        // Discard used responses
        this.players.forEach((player) => {
            player.cards = player.cards.filter((card) => !player.responses.includes(card));
        });

        // Deal players enough cards to have a full hand
        this.players.forEach((player) => {
            const cardsNeeded = this.cardsPerPlayer - player.cards.length;
            if (cardsNeeded > 0) {
                const cardsDrawn = this.deck.responses.splice(0, cardsNeeded);
                player.cards = [...player.cards, ...cardsDrawn];
            }
            player.responses = []; // Clear last response
        });

        // Update player roles
        const judge = this.players.find((player) => player.isJudge);
        const nextJudge = this.getNextJudge();
        if (judge) {
            judge.isJudge = false;
        }
        if (nextJudge) {
            nextJudge.isJudge = true;
        }

        // Reset 'ready for next round' and 'is winner' to false for all players
        this.players.forEach((player) => {
            player.isReadyForNextRound = false;
            player.isWinner = false;
        });

        // Select new prompt
        if (this.deck.prompts.length > 0) {
            // If there are prompts left, remove the last one from the deck and use it
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- array is non-empty
            this.prompt = this.deck.prompts.pop()!;
        } else {
            // All prompts have been exhausted
            this.end();
            return;
        }

        // Make sure we have enough response cards
        const numCardsRequired = this.prompt.match(/_+/g)?.length ?? 1;
        const playersToRespond = this.players.filter((p) => !p.isJudge && p.isConnected);
        const allCanRespond = playersToRespond.every((p) => p.cards.length >= numCardsRequired);
        if (!allCanRespond) {
            this.end();
            return;
        }

        this.round++;

        // Send each player the info they need for the game
        const roundInfo = this.getRoundInfo();
        this.connections.forEach((c) => {
            c.playerInfo && c.send("newRound", {
                ...roundInfo,
                ...this.getPlayerInfo(c.playerInfo),
            });
        });
    }

    end(): void {
        if (this.state === GameState.IN_PROGRESS) {
            // Sort players by score
            this.players.sort((a, b) => b.score - a.score);

            // There might be a tie, so we can't just mark the first player as winner
            const topScore = this.players[0].score;
            for (let i = 0; i < this.players.length; i++) {
                const player = this.players[i];
                if (player.score === topScore) {
                    player.isWinner = true;
                } else {
                    break;
                }
            }

            // Tell everybody the game is over
            this.sendAll("gameOver", this.players.map(
                ({ name, score, isWinner }) => ({ name, score, isWinner }),
            ));
        }

        // Delete info specific to this game from the connections
        this.connections.forEach((c) => {
            delete c.playerInfo;
            delete c.game;
        });

        // Set state
        this.state = GameState.ENDED; // TODO: we probably don't need this state
        if (this.code) {
            console.log("Ending game", this.code);
            games.remove(this.code);    
        }
    }

    getNextJudge(): Player | null {
        // Index of current judge in players array
        const judgeIndex = this.players.findIndex((player) => player.isJudge);

        // Make sure there are players connected to avoid an infinite loop
        if (this.players.every((player) => !player.isConnected)) {
            return null;
        }

        // Get the next connected player
        let nextJudgeIndex = judgeIndex;
        do {
            nextJudgeIndex = (nextJudgeIndex + 1) % this.players.length;
        } while (!this.players[nextJudgeIndex].isConnected);

        return this.players[nextJudgeIndex];
    }

    // Call this after the game has started and nextRound has been called at least once
    calculateRoundsLeft(): number {
        /* Simulate playing multiple rounds until we run out of cards. Record how many rounds we
         * were able to play.
         */
        const activePlayers = this.players.filter((player) => player.isConnected);
        const playerCards = activePlayers.map((player) => player.cards.length);
        const prompts = [...this.deck.prompts, this.prompt];
        let numResponses = this.deck.responses.length;
        let judgeIndex = activePlayers.findIndex((player) => player.isJudge);
        let round = 0;
        while (prompts.length > 0) {
            // Simulate playing the required number of cards
            const numBlanks = prompts.pop()?.match(/_+/g)?.length ?? 1;
            for (let i = 0; i < activePlayers.length; i++) {
                // Skip over judge
                if (i !== judgeIndex) {
                    // If there are 2 blanks, subtract 2 cards from all players who are answering
                    playerCards[i] -= numBlanks;
                }
            }

            /* If a player would be at a negative card count after this round, we know we can't
             * advance any further
             */
            if (playerCards.some((count) => count < 0)) {
                break;
            }

            // Simulate replenishing cards at the end of the round
            for (let i = 0; i < activePlayers.length; i++) {
                // Skip over judge, and don't try to replenish more cards than are available
                if (numResponses > 0 && i !== judgeIndex) {
                    const numNeeded = Math.min(this.cardsPerPlayer - playerCards[i], numResponses);
                    playerCards[i] += numNeeded;
                    numResponses -= numNeeded;
                }
            }

            // All players have enough cards to keep playing. Increment round # and keep going.
            round++;
            judgeIndex = (judgeIndex + 1) % activePlayers.length;

            // If there is a defined limit on the number of rounds, make sure we don't exceed it
            if (round >= this.roundLimit) {
                break;
            }
        }

        console.log(`Game.calculateRoundsLeft: Can do ${round} more round(s)`);
        return round;
    }

    // Get player-specific info about the game state
    getPlayerInfo(player: Player): PlayerInfo {
        const info: Partial<PlayerInfo> = {};

        if (player.isJudge) {
            info.role = "judging";

            /* Add a 'players' item that is similar to this.players but doesn't
             * include the judge and only includes 'name' and 'responses'
             */
            info.players = this.players
                .filter((p) => !p.isJudge)
                .map(({ name, responses, isConnected }) => ({ name, responses, isConnected }));
        } else {
            info.role = "answering";
            info.judge = this.players.find((p) => p.isJudge)?.name;
            info.userCards = player.cards;
            info.userResponses = player.responses;
        }

        info.readyForNext = player.isReadyForNextRound;

        return info as PlayerInfo;
    }

    // Get info about the state of the game at the current round
    getRoundInfo(): RoundInfo {
        return ({
            prompt: this.prompt,
            numBlanks: this.numBlanks,
            round: this.round,
            roundsLeft: this.calculateRoundsLeft(),
        });
    }

    // Get a subset of the data in the player list
    getLeaderboard(): LeaderboardEntry[] {
        return this.players
            .map(({
                name,
                responses,
                score,
                isJudge,
                isWinner,
                isConnected,
            }) => ({
                name,
                responses,
                score,
                isJudge,
                isWinner,
                isConnected,
            }));
    }

    sendAll(event: string, payload?: unknown): void {
        this.connections.forEach((c) => {
            c.send(event, payload);
        });
    }

    // connection is a connection in this game
    removeConnection(connection: Connection): void {
        // Immediately mark player as inactive so they are allowed to reconnect
        if (connection.playerInfo) {
            connection.playerInfo.isConnected = false;
        }

        /* Only tell other players in the game that this player has left if they have been gone for
         * at least 2 seconds. If they disconnect and reconnect within 2 seconds, don't do anything.
         */
        globalThis.setTimeout(() => {
            if (!connection.isActive && connection.playerInfo) {
                // A player left and has been gone for 2+ seconds
                this.sendAll("playerDisconnected", connection.playerInfo.name);

                /* End the game if...
                 * - The game is in progress but there aren't enough players to keep playing, OR
                 * - Everybody left before the game started
                 */
                const connectedPlayers = this.players.filter((p) => p?.isConnected).length;
                if (
                    (this.state === GameState.IN_PROGRESS && connectedPlayers < 3)
                    || (this.state === GameState.WAITING && connectedPlayers === 0)
                ) {
                    this.end();
                    return;
                }

                /* Advance the game if...
                 * - All connected players are ready for the next round, OR
                 * - The judge left
                 */
                if (
                    this.players.every((p) => p.isReadyForNextRound || !p.isConnected)
                    || connection.playerInfo.isJudge
                ) {
                    this.nextRound();
                }
            }
        }, 2000);
    }
}

type JudgePlayerInfo = {
    name: string;
    responses: string[];
    isConnected: boolean;
}

type PlayerInfo = {
    readyForNext: boolean;
    role: "judging" | "answering";
    players?: JudgePlayerInfo[];
    judge?: string;
    userCards?: string[];
    userResponses?: string[];
}

type RoundInfo = {
    prompt: string;
    numBlanks: number;
    round: number;
    roundsLeft: number;
}

type LeaderboardEntry = {
    name: string;
    responses: string[];
    score: number;
    isJudge: boolean;
    isWinner: boolean;
    isConnected: boolean;
}

export default Game;
export { GameState };
