import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import Chat from "../../components/Chat";
import "./Play.css";
import Leaderboard from "../../components/Leaderboard";
import PlayerControls from "./PlayerControls";
import JudgeControls from "./JudgeControls";
import { useApi, resetConnection, send } from "../../lib/api";

const NORMAL_WEIGHT = { fontWeight: "normal" };

function Play() {
    const history = useHistory();
    const location = useLocation();
    const { username, gameCode } = location.state || {};

    const [prompt, setPrompt] = useState(location.state?.prompt ?? "");
    const [round, setRound] = useState(location.state?.round ?? 0);
    const [roundsLeft, setRoundsLeft] = useState(location.state?.roundsLeft ?? 0);
    const [role, setRole] = useState(location.state?.role ?? "");
    const [judge, setJudge] = useState(location.state?.judge ?? "");
    const [leaderboardContent, setLeaderboardContent] = useState(null);
    const hideLeaderboard = () => setLeaderboardContent(null);

    // Leave the game, but allow the user to easily rejoin by clicking a toast
    const handlePopState = () => {
        // Leave the game by resetting the socket connection
        resetConnection();

        toast.info("You left the game. Click/tap here to rejoin.", {
            onClick: () => {
                history.push(`/join?code=${gameCode}&name=${username}`, { submit: true });
            },
        });
    };

    // When a new round starts, hide the leaderboard and update the state
    useApi("newRound", (gameData) => {
        hideLeaderboard();
        setPrompt(gameData.prompt);
        setRound(gameData.round);
        setRoundsLeft(gameData.roundsLeft);
        setRole(gameData.role);
        setJudge(gameData.judge);
    });

    // When the judge selects a winner, show the leaderboard
    useApi("winnerSelected", (leaderboard) => {
        setLeaderboardContent(leaderboard);
    });

    // When the page is refreshed, load the correct data
    useApi("restoreState", (gameData) => {
        setLeaderboardContent(gameData.leaderboardContent);
        setPrompt(gameData.prompt);
        setRound(gameData.round);
        setRoundsLeft(gameData.roundsLeft);
        setRole(gameData.role);
        setJudge(gameData.judge);
    });

    // When a player leaves, alert the user
    useApi("playerDisconnected", (name) => {
        toast.info(`${name} disconnected`);
    });

    // When a player re-joins the game, alert the user
    useApi("playerReconnected", (name) => {
        toast.info(`${name} reconnected`);
    });

    // When a player re-joins the game, alert the user
    useApi("gameOver", (players) => {
        history.replace("/game-over", { players });
    });

    useApi("gameStatus", (state) => {
        // A state of 1 indicates a game is in progress
        if (state !== 1) {
            history.replace("/");
            resetConnection();
        }
    });

    /* Once the page loads, remove initial state. This prevents a stale state from being used when
     * the page reloads.
     */
    useEffect(() => {
        history.replace({ state: { username } });
    }, []);

    useEffect(() => {
        send("getGameStatus");
    }, []);

    useEffect(() => {
        window.addEventListener("popstate", handlePopState);

        return function cleanup() {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    return (
        <div className="view" id="play">
            <Leaderboard
                players={leaderboardContent}
                prompt={prompt}
            />

            <main>
                <div className="round">
                    {`Round ${round}/${round + roundsLeft}`}
                </div>
                <h1>
                    {username}
                    <span style={NORMAL_WEIGHT}>, you are </span>
                    {role}
                    <span style={NORMAL_WEIGHT}>.</span>
                </h1>
                {/* If player is not the judge, show who is */}
                {role !== "judging" && (
                    <div className="judge-name">
                        <strong>{judge}</strong>
                        {" "}
                        is judging.
                    </div>
                )}

                <div className="game-controls">
                    <h2>Your prompt:</h2>
                    <Card type="prompt">{prompt}</Card>
                    {/* {role === "judging" ? <JudgeControls /> : <PlayerControls />} */}
                    <JudgeControls role={role} />
                    <PlayerControls role={role} />
                </div>
            </main>
            <Chat />
        </div>
    );
}

export default Play;
