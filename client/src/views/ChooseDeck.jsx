import React, {useEffect} from 'react';
import Button from '../components/Button';
import '../components/Dropdown.css';
import Ajax from '../lib/ajax';
import { useHistory } from "react-router-dom";
import { useState } from 'react';
import TextBox from '../components/TextBox';
import CheckBox from '../components/CheckBox';
import './ChooseDeck.css';

function ChooseDeck() {
    const history = useHistory();
    const [name, setName] = useState(localStorage.getItem("player-name"));
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [decks, setDecks] = useState([]);
    const [expansions, setExpansions] = useState([]);
    const [selectedDeck, selectDeck] = useState("Cards Against Humanity (18+)");
    const selectedExpansions = new Set();

    // On first load, get list of available cards
    useEffect(() => {
        Ajax.getJSON("/api/deckList").then(decks => {
            setDecks(decks.map(deck => deck.name));
        });
        Ajax.getJSON("/api/expansionList").then(packs => {
            setExpansions(packs);
        });
    }, []);

    async function initGame() {
        setHasSubmitted(true);

        if (name) {
            localStorage.setItem("player-name", name);
        } else {
            console.error("No player name");
            return;
        }

        // Create a game, then join it
        try {
            const gameCode = await Ajax.postJson("/api/startGame", JSON.stringify({ deckName: selectedDeck, expansionPacks: Array.from(selectedExpansions) }));
            await Ajax.postJson("/api/joinGame", JSON.stringify({ code: gameCode, name }));
            history.push(`/waiting/${gameCode}`, { name });
        } catch (e) {
            console.error(e);
        }
    }

    const handleNameChange = e => setName(e.target.value);
    const handleDeckChange = e => selectDeck(e.target.value);
    const handlePackChange = e => e.target.checked ? selectedExpansions.add(e.target.labels[0].innerText) : selectedExpansions.delete(e.target.labels[0].innerText);

    return (
        <div className="view" id="choose-deck">
            <h1>Start a game</h1>
            
            <div>
                <label htmlFor="player-name">Enter your name: </label>
                <TextBox 
                    id="player-name"
                    placeholder="Your name"
                    value={name}
                    onChange={handleNameChange}
                    errorCondition={hasSubmitted && !name}
                    errorMessage="Please enter a name."
                />
            </div>
            
            <h1 className="header-css">Choose a Deck:</h1>  
            <select className="select-css" value={selectedDeck} onChange={handleDeckChange}>
                {decks.length === 0 && <option disabled>Loading decks...</option>}
                {decks.map(deck => <option>{deck}</option>)}
            </select>

            <h1 className="header-css">Choose Expansion Pack(s):</h1>          
            <div className="expansion-packs">
                {expansions.map(pack => <CheckBox label={pack.name} onChange={handlePackChange} />)}
            </div>
            
            <Button onClick={initGame}>Continue</Button> 
        </div>
    );

}

export default ChooseDeck;