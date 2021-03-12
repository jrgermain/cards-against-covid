var Enum = require("./Enum");

class Game {
    constructor(deck) {
        this.players = [];
        this.deck = deck;
        this.prompt = "";
        this.state = Game.State.WAITING;
        this.round = -1;
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
            player.responses = []; // Clear last response
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