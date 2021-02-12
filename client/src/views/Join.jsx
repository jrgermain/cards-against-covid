import React from 'react';
import Button from '../components/Button';
import './Join.css';
import { useHistory } from 'react-router-dom';
import Ajax from '../lib/ajax';
import { useState } from 'react';
import TextBox from '../components/TextBox';
import { useDispatch, useSelector } from 'react-redux';

function Join() {
    const history = useHistory();
    const dispatch = useDispatch();

    const [nameError, setNameError] = useState("");
    const [gameCodeError, setGameCodeError] = useState("");


    const user = useSelector(state => state.user);
    const gameCode = useSelector(state => state.gameCode);

    async function joinGame() {
        setNameError("");
        setGameCodeError("");

        let passesFormCheck = true;

        if (!user.name) {
            setNameError("Please enter a name.");
            passesFormCheck = false;
        }

        if (!/[a-z]{4}/i.test(gameCode)) {
            setGameCodeError("Invalid game code.");
            passesFormCheck = false;
        }

        if (!passesFormCheck) {
            return;
        }

        try {
            await Ajax.postJson("./api/joinGame", JSON.stringify({ code: gameCode, name: user.name }));
        } catch (e) {
            if (e === "Not Found") {
                setGameCodeError("The game you specified doesn't exist or isn't accepting players.");
            } else if (e === "Bad Request") {
                setNameError(`There is already a player named "${user.name}" in game "${gameCode}".`);
            }
            return;
        }

        localStorage.setItem("player-name", user.name);
        history.push("/waiting");    
    }

    function handleKeyPress(event) {
        if (event.key === "Enter") {
            joinGame();
        }
    }

    return (
        <div className="view" id="join">
            <h1>Join a game</h1>
            <section className="user-info">
                <div>
                    <label htmlFor="player-name">Enter your name: </label>
                    <TextBox
                        id="player-name"
                        placeholder="Your name"
                        value={user.name}
                        onChange={e => dispatch({ type: "user/setName", payload: e.target.value })}
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
                        onChange={e => dispatch({ type: "gameCode/set", payload: e.target.value.toUpperCase() })}
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
