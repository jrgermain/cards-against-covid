interface IDeck {
    name: string;
    prompts: string[];
    responses: string[];
}

class Deck {
    name: string;
    prompts: string[];
    responses: string[];

    constructor({ name, prompts, responses }: IDeck) {
        this.name = name;
        this.prompts = prompts;
        this.responses = responses;
    }

    concat(anotherDeck: Deck): Deck {
        return new Deck({
            name: this.name,
            prompts: this.prompts.concat(anotherDeck.prompts),
            responses: this.responses.concat(anotherDeck.responses),
        });
    }

    shuffle(): this {
        [this.prompts, this.responses].forEach((array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        });
        return this;
    }

    static combine = (...decks: Deck[]): Deck => decks.reduce((acc, curr) => acc.concat(curr));
    static isIDeck = (x: unknown): x is IDeck => {
        if (x === null || typeof x !== "object") {
            return false;
        }
        const deck = x as IDeck;
        return (
            typeof deck.name === "string"
            && Array.isArray(deck.prompts)
            && deck.prompts.every((prompt: unknown) => typeof prompt === "string")
            && Array.isArray(deck.responses)
            && deck.responses.every((response: unknown) => typeof response === "string")
        );
    };
}

export default Deck;
export type { IDeck };
