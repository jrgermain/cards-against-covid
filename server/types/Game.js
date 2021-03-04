var Enum = require("./Enum");

class Game {
    constructor(deck) {
        this.players = [];
        this.deck = deck;
        this.prompt = "";
        this.state = Game.State.WAITING;
        this.round = -1;

        // TODO: Remove this when answering prompts with multiple blanks is implemented 
        this.deck.prompts = this.deck.prompts.filter(card => {
            // Return true IFF card requires one response. This filters out multi-response cards.

            // Cards with no blanks are probably single-response, so assume they are
            const noBlanks = /^[^_]+$/;
            if (noBlanks.test(card)) {
                return true;
            }

            // If there are blanks, make sure we only get cards with 1.
            const aBlank = /_+/g; // a blank is one or more consecutive underscores.
            const blanks = card.match(aBlank);
            const numBlanks = blanks.length;
            return numBlanks === 1;
        });
    }

    start() {
        this.state = Game.State.IN_PROGRESS;
    }

    nextRound() {
        // Deal players enough cards to have 7 each
        for (const player of this.players) {
            const cardsNeeded = 7 - player.cards.length;
            if (cardsNeeded > 0) {
                const cardsDrawn = this.deck.responses.splice(0, cardsNeeded);
                player.cards = [...player.cards, ...cardsDrawn];
            }
            player.response = null; // Clear last response
        }

        // If there is currently a judge, pass role onto next player. Otherwise (e.g. first round) make first player judge.
        const judgeIndex = this.players.findIndex(player => player.isJudge);
        if (judgeIndex > -1) {
            const nextJudgeIndex = (judgeIndex + 1) % this.players.length;
            this.players[judgeIndex].isJudge = false;
            this.players[nextJudgeIndex].isJudge = true;
        } else {
            this.players[0].isJudge = true;
        }

        this.round++;
        this.prompt = this.deck.prompts.pop();
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