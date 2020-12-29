import React from 'react';
import Button from './Button';
import DeckMakerEntry from './DeckMakerEntry';
import './DeckMaker.css';

function DeckMaker({ label, value, onChange }) {
    // Add a blank card to the end of the current list of cards
    function addCard() {
        onChange(value.concat(""));
    }
    return (
        <div className="deck-maker">
            <h2>{label}</h2>
            <ul>
                {value.map((value, i, src) => DeckMakerEntry({ value, onChange }, i, src))}
            </ul>
            <Button onClick={addCard}>Add Card</Button>
        </div>
    )
}

export default DeckMaker;