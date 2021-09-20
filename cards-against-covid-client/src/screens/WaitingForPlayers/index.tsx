import React, { useState, useEffect, ReactElement, ChangeEvent, KeyboardEvent } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Popup from "reactjs-popup";
import { toast } from "react-toastify";
import List from "../../components/List";
import "./WaitingForPlayers.css";
import Button from "../../components/Button";
import TextBox from "../../components/TextBox";
import { useApi, send, resetConnection } from "../../lib/api";
import { closePopup, handlePopupOpen } from "../../lib/popupFixes";
import { GameStartedArgs } from "../../lib/commonTypes";

type PlayerData = {
    name: string;
    isConnected: boolean;
}

type NameChangedArgs = {
    oldName: string;
    newName: string;
}

interface WaitingForPlayersLocationState {
    username?: string;
    gameCode?: string;
}

const handleCopy = () => {
    const link = document.getElementById("invite-link") as HTMLInputElement;
    link.select();
    if (document.execCommand("copy")) {
        toast.success("Link copied to clipboard");
        closePopup();
    } else {
        toast.error("Could not copy link");
    }
};

const handlePopState = () => {
    resetConnection();
};

function WaitingForPlayers(): ReactElement {
    const history = useHistory();
    const location = useLocation<WaitingForPlayersLocationState>();
    const [players, setPlayers] = useState<PlayerData[]>([]);
    const [username, setUsername] = useState<string>(location.state?.username ?? "");
    const [tempUsername, setTempUsername] = useState<string>(location.state?.username ?? "");
    const [gameCode] = useState<string>(location.state?.gameCode ?? "");

    // When a player joins, add them to the player list
    useApi<PlayerData>("playerJoined", (player) => {
        setPlayers([...players, player]);
    }, [players]);

    // When a player leaves, set isConnected to false for that player
    useApi<string>("playerDisconnected", (name) => {
        setPlayers(players.map((p) => (p.name === name ? { ...p, isConnected: false } : p)));
    }, [players]);

    // When a player returns, set isConnected to true for that player
    useApi<string>("playerReconnected", (name) => {
        setPlayers(players.map((p) => (p.name === name ? { ...p, isConnected: true } : p)));
    }, [players]);

    // When a user changes their name, update the state
    useApi<NameChangedArgs>("nameChanged", ({ oldName, newName }) => {
        // Replace the entry in the player list
        const newPlayers = players.map((player) => (player.name === oldName ? { ...player, name: newName } : player));
        setPlayers(newPlayers);

        // If the current user is the one who changed their name, update the rest of the UI too
        if (oldName === username) {
            setUsername(newName);
        }
    }, [players, username]);

    // When the game starts, move to the play screen
    useApi<GameStartedArgs>("gameStarted", (gameData) => {
        history.replace("/play", { ...gameData, username, gameCode });
    }, [username, gameCode]);

    // When we receive the list of players, update the state
    useApi("playerList", (playerList: PlayerData[]) => {
        if (playerList) {
            setPlayers(playerList);
        } else {
            // Getting null/undefined instead of an array means there is no game on the server
            history.replace("/");
        }
    });

    // Ask for the list of players
    useEffect(() => {
        send("getPlayerList");
    }, []);

    useEffect(() => {
        window.addEventListener("popstate", handlePopState);

        return function cleanup() {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    // If user loaded this page directly without actually joining a game, kick them out
    if (!gameCode) {
        history.replace("/");
    }

    const submitName = () => {
        send("changeName", tempUsername);
        closePopup();
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
                        <strong className="player-name">{username}</strong>
                    </div>
                </section>
                <section className="currently-joined">
                    <h2>Currently joined:</h2>
                    <List items={players} map={(p) => p.name} filter={(p) => p.isConnected} />
                </section>
                <section className="button-group">
                    <Popup trigger={<button type="button" className="Button">Change My Name</button>} position="top center" arrow onOpen={() => handlePopupOpen("Enter a new name")}>
                        <div className="change-name-popup">
                            <label id="player-name-label" htmlFor="player-name">Enter a new name:</label>
                            <TextBox
                                id="player-name"
                                placeholder="Your name"
                                value={tempUsername}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setTempUsername(e.target.value)}
                                onKeyPress={(e: KeyboardEvent) => e.key === "Enter" && submitName()}
                            />
                            <Button onClick={submitName}>Submit</Button>
                        </div>
                    </Popup>
                    <Popup trigger={<button type="button" className="Button">Invite Others</button>} position="top center" arrow onOpen={() => handlePopupOpen("Copy invite link")}>
                        <span className="invite-popup">
                            <span>Friends can use the link below to join this game:</span>
                            <TextBox disabled value={`${window.location.origin}/join/${gameCode}`} id="invite-link" />
                            <Button onClick={handleCopy}>Copy</Button>
                        </span>
                    </Popup>
                    <Button primary onClick={() => send("startGame")}>Everybody&apos;s In</Button>
                </section>
            </main>
        </div>
    );
}

export default WaitingForPlayers;
