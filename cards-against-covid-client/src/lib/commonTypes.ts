export type PlayerRole = "judging" | "answering";

type GameDataBase = {
    prompt: string;
    numBlanks: number;
    round: number;
    roundsLeft: number;
    role: PlayerRole;
    readyForNext: boolean;

    // Specific to judge
    players?: {name: string, responses: string[], isConnected: boolean}[];

    // Specific to answerer
    judge?: string;
    userCards?: string[];
    userResponses?: string[];
}

export type NewRoundArgs = GameDataBase;
export type GameStartedArgs = GameDataBase;

export type LeaderboardPlayer = {
    name: string;
    responses: string[];
    score: number;
    isJudge: boolean;
    isWinner: boolean;
    isConnected: boolean;
};

type ChatMessage = {
    sender: string,
    content: string,
};

export type RestoreStateArgs = GameDataBase & {
    leaderboardContent: LeaderboardPlayer[] | null;
    isLocked: boolean;
    gameCode: string;
    chats: ChatMessage[];
};
