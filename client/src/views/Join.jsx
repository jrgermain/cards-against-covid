import React from 'react';
import Button from '../components/Button';
import './Join.css';
import { useHistory } from 'react-router-dom';
import Ajax from '../lib/ajax';
import { useState } from 'react';
import TextBox from '../components/TextBox';

function Join() {
    const history = useHistory();
    const [name, setName] = useState(localStorage.getItem("player-name"));
    const [nameError, setNameError] = useState("");
    const [gameCode, setGameCode] = useState("");
    const [gameCodeError, setGameCodeError] = useState("");

    async function joinGame() {
        setNameError("");
        setGameCodeError("");

        let inputIsValid = true;

        if (!name) {
            setNameError("Please enter a name.");
            inputIsValid = false;
        }

        if (!/[a-z]{4}/i.test(gameCode)) {
            setGameCodeError("Invalid game code.");
            inputIsValid = false;
        }

        if (!inputIsValid) {
            return;
        }

        try {
            await Ajax.postJson("./api/joinGame", JSON.stringify({ code: gameCode, name }));
        } catch (e) {
            if (e === "Not Found") {
                setGameCodeError("The game you specified doesn't exist or isn't accepting players.");
            } else if (e === "Bad Request") {
                setNameError(`There is already a player named "${name}" in game "${gameCode}".`);
            }
            return;
        }

        localStorage.setItem("player-name", name);
        history.push(`/waiting/${gameCode}`, { name });    
    }

    function handleKeyPress(event) {
        if (event.key === "Enter") {
            joinGame();
        }
    }

    const handleNameChange = e => setName(e.target.value);
    const handleGameCodeChange = e => setGameCode(e.target.value.toUpperCase());
    return (
        <div className="view" id="join">
            <h1>Join a game</h1>
            <section className="user-info">
                <div>
                    <label htmlFor="player-name">Enter your name: </label>
                    <TextBox
                        id="player-name"
                        placeholder="Your name"
                        value={name}
                        onChange={handleNameChange}
                        onKeyPress={handleKeyPress}
                        errorCondition={!!nameError}
                        errorMessage={nameError}
                    />
                </div>
                <div>
                    <label htmlFor="game-code">Enter game code: </label>
                    <TextBox
                        id="game-code"
                        placeholder="Game code"
                        value={gameCode}
                        onChange={handleGameCodeChange}
                        onKeyPress={handleKeyPress}
                        errorCondition={!!gameCodeError}
                        errorMessage={gameCodeError}
                        maxLength="4"
                    />
                </div>
            </section>
            <Button onClick={joinGame}>Join</Button>
        </div>
    );
}

export default Join;
