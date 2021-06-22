class Deck {
    constructor({ name, prompts, responses }) {
        this.name = name;
        this.prompts = prompts;
        this.responses = responses;
    }

    concat(anotherDeck) {
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
}

Deck.combine = (acc, curr) => acc.concat(curr);

module.exports = Deck;
