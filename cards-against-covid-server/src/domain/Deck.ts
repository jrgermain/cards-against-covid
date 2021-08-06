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

    concat(anotherDeck: Deck) {
        return new Deck({
            name: this.name,
            prompts: this.prompts.concat(anotherDeck.prompts),
            responses: this.responses.concat(anotherDeck.responses),
        });
    }

    shuffle() {
        [this.prompts, this.responses].forEach((array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        });
        return this;
    }

    static combine = (...decks: Deck[]) => decks.reduce((acc, curr) => acc.concat(curr));
    static isIDeck = (item: any): item is IDeck => (
        item != null
        && typeof item.name === "string"
        && Array.isArray(item.prompts)
        && item.prompts.every((prompt: any) => typeof prompt === "string")
        && Array.isArray(item.responses)
        && item.responses.every((response: any) => typeof response === "string")
    );
}

export default Deck;
export type { IDeck };
