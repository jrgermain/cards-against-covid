class Player {
    name: string;
    cards: string[] = [];
    responses: string[] = [];
    score: number = 0;
    isJudge: boolean = false;
    isReadyForNextRound: boolean = false;
    isWinner: boolean = false;
    isConnected: boolean = true;

    constructor(name: string) {
        this.name = name;
    }
}

export default Player;
