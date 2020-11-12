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

    // On the first render, pre-fill the name field with the last-used name
    useEffect(() => {
        document.getElementById("player-name").value = localStorage.getItem("player-name");
    }, []);

    async function joinGame() {
        const code = document.getElementById("game-code").value;
        const name = document.getElementById("player-name").value;

        // Validate name
        if (!name) {
            return setErrorCode(1);
        }

        // Validate game code
        try {
            await Ajax.postJson("./api/joinGame", JSON.stringify({ code, name }));
        } catch (e) {
            return setErrorCode(2);
        }

        // Proceed to the next page
        localStorage.setItem("player-name", name);
        history.push("/waiting/" + code);
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
                    <input id="player-name" type="text" placeholder="Your name" className={"big-text"} data-error={errorCode === 1} onKeyPress={handleKeyPress}></input>
                    <span className="error-text">Please enter a name.</span>
                </div>
                <div>
                    <label htmlFor="game-code">Enter game code: </label>
                    <input id="game-code" type="text" placeholder="Game Code" className={"big-text uppercase"} data-error={errorCode === 2} maxLength="4" onKeyPress={handleKeyPress}></input>
                    <span className="error-text">The game you specified doesn't exist or isn't accepting players.</span>
                </div>
            </section>
            <Button onClick={joinGame}>Join</Button>
        </div>
    );
}

export default Join;
