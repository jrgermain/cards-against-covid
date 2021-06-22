import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Popup from "reactjs-popup";
import { toast } from "react-toastify";

import List from "../../components/List";
import "./WaitingForPlayers.css";
import Button from "../../components/Button";
import TextBox from "../../components/TextBox";

import { socket } from "../../serverConfig";
import * as socketListener from "../../redux/socket";
import * as api from "../../lib/api";

function WaitingForPlayers() {
    const history = useHistory();
    const dispatch = useDispatch();
    const players = useSelector((state) => state.players.filter((player) => player.isConnected));
    const gameCode = useSelector((state) => state.gameCode);
    const user = useSelector((state) => state.user);
    const status = useSelector((state) => state.status.name);
    const [textName, setTextName] = useState(user.name);

    /* When the page is loaded/reloaded, clear the local player list and then send a request to the
     * socket. This request tells the socket the player is here, and the socket will respond with
     * the correct player list. Put this in a useEffect so it doesn't happen every time we re-
     * render the view (such as when another player joins).
     */
    useEffect(() => {
        // Check that the game exists first and make sure it hasn't already started
        api.getText(`gameState?code=${gameCode}`).then((statusText) => {
            if (statusText === "INVALID") {
                toast.error("The specified game does not exist");
                history.replace("/");
            } else if (statusText === "IN_PROGRESS") {
                history.replace("/play");
            }
        });
        socketListener.start();
        dispatch({ type: "players/clear" });
        socket.emit("join game", gameCode, user.name);
        socket.emit("client reload", gameCode, user.name);
    }, []);

    // If game has started, redirect to Play screen
    if (status === "IN_PROGRESS") {
        history.replace("/play");
    }

    // If user loaded this page directly without actually joining a game, kick them out
    if (!gameCode) {
        history.replace("/");
    }

    // Respond to the user pressing "Everybody's In"
    const handleStart = () => {
        if (players.length < 3) {
            toast.error("Please wait for at least 3 players to join");
        } else {
            socket.emit("start game", gameCode);
        }
    };

    const closePopup = () => {
        // Close the window by simulating esc key
        document.dispatchEvent(new KeyboardEvent("keyup", { key: "Escape" }));
    };

    // Respond to the user pressing "Submit" within the "Change Name" popup
    const handleChangeName = () => {
        socket.emit("change name", gameCode, user.name, textName);
        closePopup();
    };

    const handleCopy = () => {
        const link = document.getElementById("invite-link");
        link.select();
        if (document.execCommand("copy")) {
            toast.success("Link copied to clipboard");
            closePopup();
        } else {
            toast.error("Could not copy link");
        }
    };

    const handlePopupOpen = (ariaLabel) => {
        const popup = document.querySelector(".popup-content");
        if (popup) {
            popup.setAttribute("role", "dialog");
            popup.setAttribute("aria-label", ariaLabel);
        }

        /* Force the popup to reposition itself (workaround for the popup's initial position being
         * too far right)
         */
        window.setTimeout(() => {
            window.dispatchEvent(new Event("resize"));
        }, 100);
    };

    return (
        <div className="view" id="waiting-for-players">
            <main>
                <h1>Waiting for players...</h1>
                <section className="game-info">
                    <h2>Game info:</h2>
                    <div>
                        <span>Your game code: </span>
                        <strong className="game-code">{gameCode}</strong>
                    </div>
                    <div>
                        <span>Your name: </span>
                        <strong className="player-name">{user.name}</strong>
                    </div>
                </section>
                <section className="currently-joined">
                    <h2>Currently joined:</h2>
                    <List items={players} map={(player) => player.name} />
                </section>
                <section className="button-group">
                    <Popup trigger={<button type="button" className="Button">Change My Name</button>} position="top center" arrow onOpen={() => handlePopupOpen("Enter a new name")}>
                        <div className="change-name-popup">
                            <label id="player-name-label" htmlFor="player-name">Enter a new name:</label>
                            <TextBox
                                id="player-name"
                                placeholder="Your name"
                                value={textName}
                                onChange={(e) => setTextName(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleChangeName()}
                            />
                            <Button onClick={handleChangeName}>Submit</Button>
                        </div>
                    </Popup>
                    <Popup trigger={<button type="button" className="Button">Invite Others</button>} position="top center" arrow onOpen={() => handlePopupOpen("Copy invite link")}>
                        <span className="invite-popup">
                            <span>Friends can use the link below to join this game:</span>
                            <TextBox disabled value={`${window.location.origin}/join/${gameCode}`} id="invite-link" />
                            <Button onClick={handleCopy}>Copy</Button>
                        </span>
                    </Popup>
                    <Button primary onClick={handleStart}>Everybody&apos;s In</Button>
                </section>
            </main>
        </div>
    );
}

export default WaitingForPlayers;
