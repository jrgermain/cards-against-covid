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
            responses: this.responses.concat(anotherDeck.responses)
        });
    }
}

Deck.combine = (acc, curr) => acc.concat(curr);

module.exports = Deck;