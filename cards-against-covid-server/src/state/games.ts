import type Game from "../domain/Game";

const games = new Map<string, Game>();

function addGame(game: Game): string {
    // Generate a game code. If it is not unique, try until it is.
    let code: string;
    do {
        // Get 4 random letters
        code = "";
        for (let i = 0; i < 4; i++) {
            const random = Math.floor(Math.random() * 26);
            code += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[random];
        }
    } while (games.has(code));

    // Add the game to our collection using the new game code as a key
    games.set(code, game);
    game.code = code;
    return code;
}

function getGame(gameCode: string): Game | undefined {
    return games.get(gameCode);
}

function removeGame(gameCode: string): void {
    games.delete(gameCode);
}

export {
    getGame as get,
    addGame as add,
    removeGame as remove,
};
