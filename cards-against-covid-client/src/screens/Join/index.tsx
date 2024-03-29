import React, { ReactElement, useEffect, useState, KeyboardEvent } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import "./Join.css";
import { useApi, send } from "../../lib/api";
import TextBox from "../../components/TextBox";
import { RestoreStateArgs } from "../../lib/commonTypes";
import { loadUsername, saveUsername } from "../../lib/username";

interface JoinLocationState {
    submit?: boolean;
}

const gameCodeRegex = /^[a-z]{4}$/i;

function Join(): ReactElement {
    const history = useHistory();
    const location = useLocation<JoinLocationState>();
    const [username, setUsername] = useState<string>(() => loadUsername() ?? "");
    const [gameCode, setGameCode] = useState<string>("");
    const [gameCodeError, setGameCodeError] = useState<string>("");
    const [usernameError, setUsernameError] = useState<string>("");
    const [autoSubmit, setAutoSubmit] = useState<boolean>(false);

    useEffect(() => {
        if (!location.search) {
            return;
        }

        // Use parameters in the url to set the initial page state
        const params = new URLSearchParams(location.search);

        if (params.has("code")) {
            const code = params.get("code");
            if (code != null && gameCodeRegex.test(code)) {
                setGameCode(code.toUpperCase());
            } else {
                toast.warn("Invalid join link");
                setGameCode("");
            }
            params.delete("code");
        }
        if (params.has("name")) {
            const name = params.get("name");
            if (name != null) {
                setUsername(name);
            }
            params.delete("name");
        }

        // Remove join parameters from the url after using them
        history.replace({ search: params.toString() });

        // Submit the form
        setAutoSubmit(!!location.state?.submit);
    }, [location.search, location.state?.submit]);

    // When the user successfully joins a game, move on to the wait screen
    useApi("joinedGame", () => {
        // Update last used username
        saveUsername(username);

        // Navigate to the wait screen
        history.push("/waiting", { username, gameCode });
    }, [username, gameCode]);

    // When the user successfully rejoins a game, move on to the play screen and restore game state
    useApi<RestoreStateArgs>("restoreState", (gameData) => {
        // Update last used username
        saveUsername(username);

        // Navigate to the play screen
        history.push("/play", { ...gameData, username });
    }, [username]);

    async function joinGame() {
        // Clear any error messages currently displayed
        setUsernameError("");
        setGameCodeError("");

        /* Perform a form check to make sure name and game code are in the correct format. This
         * prevents us from making invalid requests to the server that we know will fail.
         */
        let passesFormCheck = true;

        if (!username) {
            setUsernameError("Please enter a name.");
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
        send("joinGame", { gameCode, playerName: username });
    }

    function handleKeyPress(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            joinGame();
        }
    }

    useEffect(() => {
        if (autoSubmit) {
            setAutoSubmit(false);
            joinGame();
        }
    }, [autoSubmit]);

    return (
        <main className="view" id="join">
            <h1>Join a game</h1>
            <section className="user-info">
                <div>
                    <label htmlFor="player-name">Enter your name: </label>
                    <TextBox
                        id="player-name"
                        placeholder="Your name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}
                        errorCondition={!!usernameError}
                        errorMessage={usernameError}
                    />
                </div>
                <div>
                    <label htmlFor="game-code">Enter game code: </label>
                    <TextBox
                        id="game-code"
                        placeholder="Game code"
                        value={gameCode}
                        onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                        onKeyPress={handleKeyPress}
                        errorCondition={!!gameCodeError}
                        errorMessage={gameCodeError}
                        maxLength={4}
                    />
                </div>
            </section>
            <Button onClick={joinGame}>Join</Button>
        </main>
    );
}

export default Join;
