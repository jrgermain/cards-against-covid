import React from 'react';
import Button from '../Button';
import DeckMakerEntry from './DeckMakerEntry';
import './DeckMaker.css';

function DeckMaker({ label, cards, setCards }) {
    // Add a blank card to the end of the current list of cards
    function addCard() {
        const newCardList = [...cards, ""];
        setCards(newCardList);
    }
    return (
        <div className="deck-maker">
            <h2>{label}</h2>
            <ul aria-label="Cards in this set">
                {cards.map((text, index, cards) => DeckMakerEntry({ text, setCards }, index, cards))}
            </ul>
            <Button onClick={addCard}>Add Card</Button>
        </div>
    )
}

export default DeckMaker;