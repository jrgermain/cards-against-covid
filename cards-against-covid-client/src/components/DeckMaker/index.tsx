import React, { ReactElement } from "react";
import Button from "../Button";
import DeckMakerEntry from "./DeckMakerEntry";
import "./DeckMaker.css";

type DeckMakerProps = {
    description: string;
    label: string;
    cards: string[];
    setCards: (cards: string[]) => void;
}

function DeckMaker({ description, label, cards, setCards }: DeckMakerProps): ReactElement {
    // Add a blank card to the end of the current list of cards
    function addCard() {
        const newCardList = [...cards, ""];
        setCards(newCardList);
    }
    return (
        <div className="deck-maker">
            <h2>{label}</h2>
            <ul aria-label={description}>
                {cards.map((text, index, array) => (
                    <DeckMakerEntry
                        key={index}
                        text={text}
                        setCards={setCards}
                        index={index}
                        allEntries={array}
                    />
                ))}
            </ul>
            <Button onClick={addCard}>Add Card</Button>
        </div>
    );
}

export default DeckMaker;
