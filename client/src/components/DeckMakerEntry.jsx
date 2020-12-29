import React from 'react';

function DeckMakerEntry({ value, onChange }, i, src) {
    // Called when we change the text of a card
    function update(event) {
        const newValue = event.target.value;
        const copy = src.slice(0);
        copy[i] = newValue;
        onChange(copy);
    }

    // Called when we hit the delete button next to a card
    function remove() {
        if (!value || window.confirm("Are you sure you want to delete this card?")) {
            onChange(src.filter((_, index) => index !== i));
        }
    }

    return (
        <li>
            <input type="text" className="big-text" value={value} onChange={update}></input>
            <span className="delete" onClick={remove} title="Delete this card">X</span>
        </li>
    )
}

export default DeckMakerEntry;