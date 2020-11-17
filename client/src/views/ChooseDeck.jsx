import React from 'react';
import Button from '../components/Button';
import '../components/Dropdown.css';
import Ajax from '../lib/ajax';
import { useHistory } from "react-router-dom";
import { useState } from 'react';

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
            history.push("/waiting/" + gameCode);
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
            const gameDeck = Ajax.post("./api/packVine");
            console.log(gameDeck);
        }
    }

    return (
        <div className="view" id="choose-deck">
            <h1>Choose a Deck</h1>            

            <label htmlFor="player-name">Enter your name: </label>
            <input id="player-name" type="text" placeholder="Your name" className={"big-text"} data-error={hasSubmitted && !name} value={name} onChange={e => setName(e.target.value)}></input>
            <span className="error-text">Please enter a name.</span>


            <select class="select-css" onChange={handleChange}>
                <option> Choose a Deck</option>
                <option value="0"  > Adult (18+)</option>
                <option value="1"  >Child</option>
            </select>

            <h1 class="header-css">Choose an Expansion Pack</h1>
            <select class="select-css" onChange={handleChange}>
                <option> Choose an Expansion Pack (optional)</option>
                <option value="2"  > Disney... Plus? (18+)</option>
                <option value="3"  >Hogwarts After Hours (18+)</option>
                <option value="4"  >Rest in Peace: Vine References</option>
            </select>

            <Button onClick={initGame}>Continue</Button>
        </div>

    );

}

export default ChooseDeck;