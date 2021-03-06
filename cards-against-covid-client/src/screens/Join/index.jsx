import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Button from "../../components/Button";
import "./Join.css";
import * as api from "../../lib/api";
import TextBox from "../../components/TextBox";
import * as socketListener from "../../redux/socket";

const gameCodeRegex = /^[a-z]{4}$/i;

function Join() {
    const history = useHistory();
    const dispatch = useDispatch();

    const [nameError, setNameError] = useState("");
    const [gameCodeError, setGameCodeError] = useState("");

    const user = useSelector((state) => state.user);
    const gameCode = useSelector((state) => state.gameCode);

    useEffect(() => {
        // If a user leaves a game, they might be brought here. This means we should reset the app.
        socketListener.stop(); // Stop listening for state updates
        socketListener.reset(); // Clear local app state and trigger a disconnect on the server

        /* If the user came from a join link, populate the game code, then set the URL to the
         * 'normal' join url
         */
        const params = new URLSearchParams(history.location.search);
        if (params.has("code")) {
            const code = params.get("code");
            if (gameCodeRegex.test(code)) {
                dispatch({ type: "gameCode/set", payload: code.toUpperCase() });
            } else {
                toast.warn("Invalid join link");
            }
            history.replace({ search: "" });
        }
    }, []);

    async function joinGame() {
        // Clear any error messages currently displayed
        setNameError("");
        setGameCodeError("");

        /* Perform a form check to make sure name and game code are in the correct format. This
         * prevents us from making invalid requests to the server that we know will fail.
         */
        let passesFormCheck = true;

        if (!user.name) {
            setNameError("Please enter a name.");
            passesFormCheck = false;
        }

        if (!gameCodeRegex.test(gameCode)) {
            setGameCodeError("Invalid game code.");
            passesFormCheck = false;
        }

        if (!passesFormCheck) {
            return;
        }

        // The data is in the right format, so try to join a game
        try {
            await api.post("joinGame", { code: gameCode, name: user.name.trim() });
        } catch (e) {
            // We got a response other than a success
            if (e === "Not Found") {
                setGameCodeError("The game you specified doesn't exist or isn't accepting players.");
            } else if (e === "Bad Request") {
                setNameError(`There is already a player named "${user.name}" in game "${gameCode}".`);
            }
            return;
        }

        // Save the last good game code and name for future games (or if the user gets disconnected)
        localStorage.setItem("last-username", user.name);
        localStorage.setItem("last-game-code", gameCode);

        // We had a success response, so the player must have joined. Move on to the wait screen
        history.push("/waiting");
    }

    function handleKeyPress(event) {
        if (event.key === "Enter") {
            joinGame();
        }
    }

    return (
        <main className="view" id="join">
            <h1>Join a game</h1>
            <section className="user-info">
                <div>
                    <label htmlFor="player-name">Enter your name: </label>
                    <TextBox
                        id="player-name"
                        placeholder="Your name"
                        value={user.name}
                        onChange={(e) => dispatch({ type: "user/setName", payload: e.target.value })}
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
                        onChange={(e) => dispatch({ type: "gameCode/set", payload: e.target.value.toUpperCase() })}
                        onKeyPress={handleKeyPress}
                        errorCondition={!!gameCodeError}
                        errorMessage={gameCodeError}
                        maxLength="4"
                    />
                </div>
            </section>
            <Button onClick={joinGame}>Join</Button>
        </main>
    );
}

export default Join;
