import React, { Component } from 'react';
import Button from '../components/Button';
import Ajax from '../lib/ajax';
import { useHistory } from "react-router-dom";
// import './Start.css';

function ChooseDeck() {
    const history = useHistory();

    async function initGame() {
        console.log("NEW GAME")
        try {
            const gameCode = await Ajax.post("./api/startGame", { cache: false });
            history.push("/waiting/" + gameCode);
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <div className="view" id="choose-deck">
            <h1>Choose a deck</h1>
            <div className="placeholder">To Do</div>
            <Button onClick={initGame}>Continue</Button>
        </div>
    );
}

export default ChooseDeck;
