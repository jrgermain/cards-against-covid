import React from 'react';
import Button from '../components/Button';
import '../components/Dropdown.css';
import Ajax from '../lib/ajax';
import { useHistory } from "react-router-dom";
import { useState } from 'react';
import TextBox from '../components/TextBox';

function ChooseDeck() {
    const history = useHistory();
    const [name, setName] = useState(localStorage.getItem("player-name"));
    const [hasSubmitted, setHasSubmitted] = useState(false);

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
            const gameCode = await Ajax.post("/api/startGame");
            await Ajax.postJson("/api/joinGame", JSON.stringify({ code: gameCode, name }));
            history.push(`/waiting/${gameCode}`, { name });
        } catch (e) {
            console.error(e);
        }
    }

    function handleChange(event) {
        console.log(event.target.value);
        if (event.target.value == 0) {
            const gameDeck = Ajax.post("./api/adultDeck");
            console.log(gameDeck);
        }
        if (event.target.value == 1) {
            const gameDeck = Ajax.post("./api/childDeck");
            console.log(gameDeck);
        }
        if (event.target.value == 2) {
            const gameDeck = Ajax.post("./api/packDisney");
            console.log(gameDeck);
        }
        if (event.target.value == 3) {
            const gameDeck = Ajax.post("./api/packHarryPotter");
            console.log(gameDeck);
        }
        if (event.target.value == 4) {
            const gameDeck = Ajax.post("./api/packCovid");
            console.log(gameDeck);
        }
        if (event.target.value == 5) {
            const gameDeck = Ajax.post("./api/packVine");
            console.log(gameDeck);
        }
        if (event.target.value == 6) {
            const gameDeck = Ajax.post("./api/childPackDisney");
            console.log(gameDeck);
        }
    }

    const handleNameChange = e => setName(e.target.value);
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
                    errorMessage={"Please enter a name."} 
                />
            </div>
            
            <h1 class="header-css">Choose a Deck:</h1>  
            <select class="select-css" onChange={handleChange}>
                <option> Choose a Deck</option>
                <option value="0"  > Adult (18+)</option>
                <option value="1"  >Child</option>
            </select>

            <h1 class="header-css">Choose an Expansion Pack:</h1>
            <select class="select-css" onChange={handleChange}>
                <option>Choose an Expansion Pack (optional)</option>
                <option value="5"  >Rest in Peace: Vine References</option>
                <option value="6"  >Disney: The way it was intended</option>
                <option value="2"  >Disney... Plus? (18+)</option>
                <option value="3"  >Hogwarts After Hours (18+)</option>
                <option value="4"  >COVID: Pandemics aren't funny... usually (18+)</option>
            </select>
            
            <Button onClick={initGame}>Continue</Button> 
        </div>

    );

}

export default ChooseDeck;