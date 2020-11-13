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
            console.log('Player chose adult deck');
            const gameDeck = Ajax.post("./api/adultDeck");
            console.log(gameDeck);
        }
        if (event.target.value == 1) {
            console.log('Player chose kid/child deck');
            const gameDeck = Ajax.post("./api/childDeck");
            console.log(gameDeck);
        }
    }

    return (
        <div className="view" id="choose-deck">
            <h1>Choose a deck</h1>

            <label htmlFor="player-name">Enter your name: </label>
            <input id="player-name" type="text" placeholder="Your name" className={"big-text"} data-error={hasSubmitted && !name} value={name} onChange={e => setName(e.target.value)}></input>
            <span className="error-text">Please enter a name.</span>

            <select class="select-css" onChange={handleChange}>
                <option class="select-items" value="0"  > Adult (18+)</option>
                <option class="select-items" value="1"  >Child</option>
            </select>


            <Button onClick={initGame}>Continue</Button>
        </div>

    );

}

export default ChooseDeck;