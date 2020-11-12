var Enum = require("./Enum");

class Game {
    constructor(deck) {
        this.players = [];
        this.deck = deck;
        this.prompt = deck.prompts.pop();
        this.state = Game.State.WAITING;
    }

    start() {
        for (const player of players) {
            // Transfer the first 7 cards into the player's hand
            player.cards = this.deck.responses.splice(0,7);
        }

        const randomPlayer = this.players[Math.floor(Math.random() * this.players.length)];
        randomPlayer.isJudge = true;

        this.state = Game.State.IN_PROGRESS;
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