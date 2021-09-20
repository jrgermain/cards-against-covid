import React, { ReactElement } from "react";
import Button from "../Button";
import DeckMakerEntry from "./DeckMakerEntry";
import "./DeckMaker.css";

type DeckMakerProps = {
    label: string;
    cards: string[];
    setCards: (cards: string[]) => void;
}

function DeckMaker({ label, cards, setCards }: DeckMakerProps): ReactElement {
    // Add a blank card to the end of the current list of cards
    function addCard() {
        const newCardList = [...cards, ""];
        setCards(newCardList);
    }
    return (
        <div className="deck-maker">
            <h2>{label}</h2>
            <ul aria-label="Cards in this set">
                {cards.map((text, index, arr) => DeckMakerEntry({ text, setCards }, index, arr))}
            </ul>
            <Button onClick={addCard}>Add Card</Button>
        </div>
    );
}

export default DeckMaker;
