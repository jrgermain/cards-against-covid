/* eslint-disable no-alert -- TODO use a modal to confirm card deletion */
import React, { ChangeEvent, ReactElement } from "react";

type DeckMakerEntryProps = {
    text: string;
    setCards: (cards: string[]) => void;
    index: number;
    allEntries: string[];
}

function DeckMakerEntry({ text, setCards, index, allEntries }: DeckMakerEntryProps): ReactElement {
    // Called when we change the text of a card
    function update(event: ChangeEvent<HTMLInputElement>) {
        // Get the updated text
        const newValue = event.target.value;

        // Get a copy of the existing card list (to void mutating state)
        const copy = [...allEntries];

        // Update the corresponding entry in the copy
        copy[index] = newValue;

        // Replace the old card list with the new one
        setCards(copy);
    }

    // Called when we hit the delete button next to a card
    function remove() {
        // If the card is not empty, confirm that the user really wants to delete it.
        if (!text || window.confirm("Are you sure you want to delete this card?")) {
            // Create a copy of the card list that excludes the current card
            const allCardsButThisOne = allEntries.filter((_, i) => i !== index);

            // Replace the old card list with the new one
            setCards(allCardsButThisOne);
        }
    }

    return (
        <li>
            <input
                type="text"
                className="big-text"
                value={text}
                onChange={update}
                aria-label={`Card ${index + 1} text`}
            />
            <button
                type="button"
                className="delete"
                onClick={remove}
                title="Delete this card"
                aria-label={`Delete card ${index + 1}`}
            >
                X
            </button>
        </li>
    );
}

export default DeckMakerEntry;
