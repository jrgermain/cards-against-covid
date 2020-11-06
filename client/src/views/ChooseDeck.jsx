import React from 'react';
import Button from '../components/Button';
import Ajax from '../lib/ajax';
import { useHistory } from "react-router-dom";

function ChooseDeck() {
    const history = useHistory();

    async function initGame() {
        console.log("NEW GAME")
        try {
            // Generate a game code and navigate to the "Waiting for players" screen
            const gameCode = await Ajax.post("./api/startGame");
            history.push("/waiting/" + gameCode);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="view" id="choose-deck">
            <h1>Choose a deck</h1>
            <div className="placeholder" style={{marginBottom: "auto"}}>To Do</div>
            <Button onClick={initGame}>Continue</Button>
        </div>
    );
}

export default ChooseDeck;
