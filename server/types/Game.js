var Enum = require("./Enum");

class Game {
    constructor(deck, roundLimit) {
        this.players = [];
        this.deck = deck;
        this.prompt = "";
        this.state = Game.State.WAITING;
        this.round = -1;
        this.cardsPerPlayer = 0;
        this.roundLimit = roundLimit ?? Infinity;
    }

    start() {
        this.state = Game.State.IN_PROGRESS;

        /* By default, players get 7 response cards each. Every player should start off with the same number of cards.
         * If there aren't enough cards for everyone to get 7, lower this size so everyone can start with the same number. 
         * Enforce a maximum of 7 cards per player.
         */
        const totalCardsPerPlayer = Math.floor(this.deck.responses.length / this.players.length);
        this.cardsPerPlayer = Math.min(7, totalCardsPerPlayer);
    }

    nextRound() {
        // If we reached the user-defined round limit, end the game
        if (this.round + 1 >= this.roundLimit) {
            this.end();
            return;
        }

        // Discard used responses
        for (const player of this.players) {
            player.cards = player.cards.filter(card => !player.responses.includes(card));
        }

        // Deal players enough cards to have a full hand
        for (const player of this.players) {
            const cardsNeeded = this.cardsPerPlayer - player.cards.length;
            if (cardsNeeded > 0) {
                const cardsDrawn = this.deck.responses.splice(0, cardsNeeded);
                player.cards = [...player.cards, ...cardsDrawn];
            }
            player.responses = []; // Clear last response
        }

        // Update player roles
        const judge = this.players.find(player => player.isJudge);
        const nextJudge = this.getNextJudge();
        if (judge) {
            judge.isJudge = false;
        }
        nextJudge.isJudge = true;

        // Reset 'ready for next round' and 'is winner'
        this.players.forEach(player => player.isReadyForNextRound = player.isWinner = false);

        // Select new prompt
        if (this.deck.prompts.length > 0) {
            // If there are prompts left, remove the last one from the deck and use it
            this.prompt = this.deck.prompts.pop();
        } else {
            // All prompts have been exhausted
            this.end();
            return;
        }

        // Make sure we have enough response cards
        const numCardsRequired = this.prompt.match(/_+/g)?.length ?? 1;
        const allPlayersCanAnswer = this.players.filter(player => !player.isJudge && player.isConnected).every(player => player.cards.length >= numCardsRequired);
        if (!allPlayersCanAnswer) {
            this.end();
            return;
        }

        this.round++;
    }

    end() {
        // Set state
        this.state = Game.State.ENDED;
        
        // Sort players by score
        this.players.sort((a,b) => b.score - a.score);
        const topScore = this.players[0].score;
        this.players.forEach(player => player.isWinner = (player.score === topScore));
    }

    getNextJudge() {
        // Index of current judge in players array
        const judgeIndex = this.players.findIndex(player => player.isJudge);
        
        // Make sure there are players connected to avoid an infinite loop
        if (this.players.every(player => !player.isConnected)) {
            return null;
        }

        // Get the next connected player
        let nextJudgeIndex = judgeIndex;
        do {
            nextJudgeIndex = (nextJudgeIndex + 1) % this.players.length;
        } while (!this.players[nextJudgeIndex].isConnected)

        return this.players[nextJudgeIndex];
    }

    // Call this after the game has started and nextRound has been called at least once
    calculateRoundsLeft() {
        // Simulate playing multiple rounds until we run out of cards. Record how many rounds we were able to play.
        const activePlayers = this.players.filter(player => player.isConnected);
        const playerCards = activePlayers.map(player => player.cards.length);
        const prompts = [...this.deck.prompts, this.prompt];
        let numResponses = this.deck.responses.length;
        let judgeIndex = activePlayers.findIndex(player => player.isJudge);
        let round = 0;
        while (prompts.length > 0) {
            // Simulate playing the required number of cards
            const numBlanks = prompts.pop().match(/_+/g)?.length ?? 1;
            for (let i = 0; i < activePlayers.length; i++) {
                // Skip over judge
                if (i !== judgeIndex) {
                    // If there are 2 blanks, subtract 2 cards from all players who are answering
                    playerCards[i] -= numBlanks;
                }
            }

            // If a player would be at a negative card count after this round, we know we can't advance any further
            if (playerCards.some(count => count < 0)) {
                break;
            }

            // Simulate replenishing cards at the end of the round
            for (let i = 0; i < activePlayers.length; i++) {
                // Skip over judge, and don't try to replenish more cards than are available
                if (numResponses > 0 && i !== judgeIndex) {
                    const cardsToReplenish = Math.min(this.cardsPerPlayer - playerCards[i], numResponses);
                    playerCards[i] += cardsToReplenish;
                    numResponses -= cardsToReplenish;
                }
            }
             
            // All players currently have enough cards to keep playing. Increment round count and keep going
            round++;
            judgeIndex = (judgeIndex + 1) % activePlayers.length;

            // If there is a user-defined limit for the number of rounds, make sure we don't exceed it
            if (round >= this.roundLimit) {
                break;
            }
        }

        console.log("Game.calculateRoundsLeft: Can do " + round + " more round(s)")
        return round;        
    }
}

Game.State = Enum("WAITING", "IN_PROGRESS", "ENDED");

Game.Code = {
    _alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    generate: function (games = {}) {
        let code = "";

        // Get 4 random letters
        for (let i = 0; i < 4; i++) {
            const random = Math.floor(Math.random() * 26);
            code += Game.Code._alphabet[random];
        }
    
        // If the code already exists, make a new one
        return (code in games) ? Game.Code.generate(games) : code;
    }
}

module.exports = Game;