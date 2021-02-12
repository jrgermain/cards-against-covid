import React, {useEffect} from 'react';
import Button from '../components/Button';
import '../components/Dropdown.css';
import Ajax from '../lib/ajax';
import { useHistory } from "react-router-dom";
import { useState } from 'react';
import TextBox from '../components/TextBox';
import CheckBox from '../components/CheckBox';
import './ChooseDeck.css';
import { useDispatch, useSelector } from 'react-redux';

function ChooseDeck() {
    const history = useHistory();
    const dispatch = useDispatch();

    const user = useSelector(state => state.user);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [decks, setDecks] = useState([]);
    const [expansions, setExpansions] = useState([]);

    // On first load, get list of available cards
    useEffect(() => {
        Ajax.getJSON("/api/deckList").then(decks => {
            // Select first deck
            decks.forEach((deck, i) => {
                deck.isSelected = i === 0;
            });
            setDecks(decks);
        });
        Ajax.getJSON("/api/expansionList").then(expansions => {
            expansions.forEach(expansion => {
                expansion.isSelected = false;
            });
            setExpansions(expansions);
        });
    }, []);


    const handleDeckChange = e => {
        // Set the selected deck based on the value of the dropdown
        setDecks(decks.map(deck => ({
            ...deck,
            isSelected: deck.name === e.target.value
        })));
    }
    const handlePackChange = e => {
        // Change the value of the input that was clicked
        // TODO: clean this up
        setExpansions(expansions.map(pack => ({
            ...pack,
            isSelected: pack.name === e.target.labels[0].textContent ? e.target.checked : pack.isSelected
        })));
    }
    const handleSubmit = async () => {
        setHasSubmitted(true);

        if (user.name) {
            localStorage.setItem("player-name", user.name);
        } else {
            console.error("No player name");
            return;
        }

        // Create a game, then join it
        try {
            const deckName = decks.find(deck => deck.isSelected).name;
            const expansionPacks = expansions.filter(pack => pack.isSelected).map(pack => pack.name);
            const gameCode = await Ajax.postJson("/api/startGame", JSON.stringify({ deckName, expansionPacks }));
            await Ajax.postJson("/api/joinGame", JSON.stringify({ code: gameCode, name: user.name }));
            dispatch({ type: "gameCode/set", payload: gameCode });
            
            history.push("/waiting");
        } catch (e) {
            console.error(e);
        }

    }

    return (
        <div className="view" id="choose-deck">
            <h1>Start a game</h1>
            
            <div>
                <label htmlFor="player-name">Enter your name: </label>                
                <TextBox
                    id="player-name"
                    placeholder="Your name"
                    value={useSelector(state => state.user.name)}
                    onChange={e => dispatch({ type: "user/setName", payload: e.target.value })}
                    errorCondition={hasSubmitted && !user.name}
                    errorMessage="Please enter a name."
                />
            </div>
            
            <h1 className="header-css">Choose a Deck:</h1>  
            <select className="select-css" value={decks.find(deck => deck.isSelected)?.name} onChange={handleDeckChange}>
                {decks.length === 0 && <option disabled>Loading decks...</option>}
                {decks.map((deck, i) => <option key={i} selected={deck.isSelected}>{deck.name}</option>)}
            </select>

            <h1 className="header-css">Choose Expansion Pack(s):</h1>          
            <div className="expansion-packs">
                {expansions.map(pack => <CheckBox label={pack.name} onChange={handlePackChange} checked={pack.isSelected} />)}
            </div>
            
            <Button onClick={handleSubmit}>Continue</Button> 
        </div>
    );

}

export default ChooseDeck;