class Player {
    name: string;
    cards: string[] = [];
    responses: string[] = [];
    score = 0;
    isJudge = false;
    isReadyForNextRound = false;
    isWinner = false;
    isConnected = true;

    constructor(name: string) {
        this.name = name;
    }
}

export default Player;
