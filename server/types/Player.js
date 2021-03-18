class Player {
    constructor(name) {
        this.name = name;
        this.isJudge = false;
        this.cards = [];
        this.responses = [];
        this.score = 0;
        this.isReadyForNextRound = false;
    }
}

module.exports = Player;