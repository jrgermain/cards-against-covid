class Player {
    constructor(name) {
        this.name = name;
        this.isJudge = false;
        this.cards = [];
        this.response = null;
        this.score = 0;
    }
}

module.exports = Player;