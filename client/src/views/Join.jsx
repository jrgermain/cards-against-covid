import React from 'react';
import Button from '../components/Button';
import './Join.css';
import { useHistory } from 'react-router-dom';
import Ajax from '../lib/ajax';
import { useState } from 'react';
import { useEffect } from 'react';

function Join() {
    const history = useHistory();
    const [errorCode, setErrorCode] = useState(0);
    const [name, setName] = useState(localStorage.getItem("player-name"));
    const [gameCode, setGameCode] = useState("");

    async function joinGame() {
        // Validate name
        if (!name) {
            return setErrorCode(1);
        }

        // Validate game code
        try {
            await Ajax.postJson("./api/joinGame", JSON.stringify({ code: gameCode, name }));
        } catch (e) {
            return setErrorCode(2);
        }

        // Proceed to the next page
        localStorage.setItem("player-name", name);
        history.push("/waiting/" + gameCode);
    }

    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            joinGame();
        }
    }

    return (
        <div className="view" id="join">
            <h1>Join a game</h1>
            <section className="user-info">
                <div>
                    <label htmlFor="player-name">Enter your name: </label>
                    <input id="player-name" type="text" placeholder="Your name" className={"big-text"} data-error={errorCode === 1} onKeyPress={handleKeyPress} value={name} onChange={e => setName(e.target.value)}></input>
                    <span className="error-text">Please enter a name.</span>
                </div>
                <div>
                    <label htmlFor="game-code">Enter game code: </label>
                    <input id="game-code" type="text" placeholder="Game Code" className={"big-text uppercase"} data-error={errorCode === 2} maxLength="4" onKeyPress={handleKeyPress} value={gameCode} onChange={e => setGameCode(e.target.value)}></input>
                    <span className="error-text">The game you specified doesn't exist or isn't accepting players.</span>
                </div>
            </section>
            <Button onClick={joinGame}>Join</Button>
        </div>
    );
}

export default Join;
