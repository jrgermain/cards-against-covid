import React, { Component } from 'react';
import Button from '../components/Button';
import './Join.css';
import { useHistory} from 'react-router-dom';
import Ajax from '../lib/ajax';

function Join() {
    const history = useHistory();

    async function joinGame() {
        try {
            const code = document.getElementById("game-code").value;
            await Ajax.getJson("./api/findGame?code=" + code, { cache: false });
            history.push("/waiting/" + code);
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <div className="view" id="join">
            <h1>Join a game</h1>
            <div className="game-code-entry">
                <label htmlFor="game-code">Enter game code: </label>
                <input id="game-code" type="text" placeholder="Game Code" className="big-text uppercase" maxLength="4"></input>
            </div>
            <Button onClick={joinGame}>Join</Button>

        </div>
    );
}

export default Join;
