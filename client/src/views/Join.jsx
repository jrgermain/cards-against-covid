import React from 'react';
import Button from '../components/Button';
import './Join.css';
import { useHistory } from 'react-router-dom';
import Ajax from '../lib/ajax';
import { useState } from 'react';
import TextBox from '../components/TextBox';

function Join() {
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [joinError, setJoinError] = useState(false);
    const [name, setName] = useState(localStorage.getItem("player-name"));
    const [gameCode, setGameCode] = useState("");

    async function joinGame() {
        setHasSubmitted(true);

        if (!name) {
            return;
        }

        if (!gameCode || gameCode.length !== 4) {
            return setJoinError(true);
        }

        try {
            await Ajax.postJson("./api/joinGame", JSON.stringify({ code: gameCode, name }));
        } catch (e) {
            return setJoinError(true);
        }

        localStorage.setItem("player-name", name);
        history.push(`/waiting/${gameCode}`, { name });    
    }

    function handleKeyPress(event) {
        if (event.key === 'Enter') {
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
                        errorCondition={hasSubmitted && !name}
                        errorMessage={"Please enter a name."}
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
                        errorCondition={joinError}
                        errorMessage={"The game you specified doesn't exist or isn't accepting players."}
                        maxLength="4"
                    />
                </div>
            </section>
            <Button onClick={joinGame}>Join</Button>
        </div>
    );
}

export default Join;
