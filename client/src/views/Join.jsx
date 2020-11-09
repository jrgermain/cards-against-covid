import React from 'react';
import Button from '../components/Button';
import './Join.css';
import { useHistory} from 'react-router-dom';
import Ajax from '../lib/ajax';
import { useState } from 'react';

function Join() {
    const history = useHistory();
    const [isError, setError] = useState(false);

    async function joinGame() {
        try {
            const code = document.getElementById("game-code").value;
            await Ajax.getJson("./api/findGame?code=" + code, { cache: false });
            history.push("/waiting/" + code);
        } catch (e) {
            setError(true);
        }
    }

    let inputClass = "big-text uppercase";
    if (isError) {
        inputClass += " error";
    }

    return (
        <div className="view" id="join">
            <h1>Join a game</h1>
            <div className="game-code-entry">
                <label htmlFor="game-code">Enter game code: </label>
                <input id="game-code" type="text" placeholder="Game Code" className={inputClass} maxLength="4"></input>
                {isError && <span className="error-text">The game you specified doesn't exist or isn't accepting players.</span>}
            </div>
            <Button onClick={joinGame}>Join</Button>

        </div>
    );
}

export default Join;
