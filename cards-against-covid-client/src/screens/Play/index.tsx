import React, { ReactElement, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import Chat from "../../components/Chat";
import "./Play.css";
import Leaderboard from "../../components/Leaderboard";
import PlayerControls from "./PlayerControls";
import JudgeControls from "./JudgeControls";
import { useApi, resetConnection, send } from "../../lib/api";
import { LeaderboardPlayer, NewRoundArgs, PlayerRole, RestoreStateArgs } from "../../lib/commonTypes";

interface PlayLocationState {
    username: string;
    gameCode: string;
    prompt?: string;
    round?: number;
    roundsLeft?: number;
    role?: PlayerRole;
    judge?: string;
}

const NORMAL_WEIGHT = { fontWeight: "normal" } as const;

function Play(): ReactElement {
    const history = useHistory();
    const location = useLocation<PlayLocationState>();
    const { username, gameCode } = location.state ?? {};

    const [prompt, setPrompt] = useState<string>(location.state?.prompt ?? "");
    const [round, setRound] = useState<number>(location.state?.round ?? 0);
    const [roundsLeft, setRoundsLeft] = useState<number>(location.state?.roundsLeft ?? 0);
    const [role, setRole] = useState<PlayerRole>(location.state?.role ?? "answering");
    const [judge, setJudge] = useState<string | undefined>(location.state?.judge);
    const [leaderboardContent, setLeaderboardContent] = useState<LeaderboardPlayer[] | null>(null);
    const hideLeaderboard = () => setLeaderboardContent(null);

    // Leave the game, but allow the user to easily rejoin by clicking a toast
    const handlePopState = () => {
        // Leave the game by resetting the socket connection
        resetConnection();

        toast.info(`You left game ${gameCode}. Click/tap here to rejoin.`, {
            onClick: () => {
                history.push(`/join?code=${gameCode}&name=${username}`, { submit: true });
            },
        });
    };

    // When a new round starts, hide the leaderboard and update the state
    useApi<NewRoundArgs>("newRound", (gameData) => {
        hideLeaderboard();
        setPrompt(gameData.prompt);
        setRound(gameData.round);
        setRoundsLeft(gameData.roundsLeft);
        setRole(gameData.role);
        setJudge(gameData.judge);
    });

    // When the judge selects a winner, show the leaderboard
    useApi<LeaderboardPlayer[]>("winnerSelected", (leaderboard) => {
        setLeaderboardContent(leaderboard);
    });

    // When the page is refreshed, load the correct data
    useApi<RestoreStateArgs>("restoreState", (gameData) => {
        setLeaderboardContent(gameData.leaderboardContent);
        setPrompt(gameData.prompt);
        setRound(gameData.round);
        setRoundsLeft(gameData.roundsLeft);
        setRole(gameData.role);
        setJudge(gameData.judge);
    });

    // When a player leaves, alert the user
    useApi<string>("playerDisconnected", (name) => {
        toast.info(`${name} disconnected`);
    });

    // When a player re-joins the game, alert the user
    useApi<string>("playerReconnected", (name) => {
        toast.info(`${name} reconnected`);
    });

    // When a player re-joins the game, alert the user
    useApi("gameOver", (players) => {
        history.replace("/game-over", { players });
    });

    useApi<number>("gameStatus", (state) => {
        // A state of 1 indicates a game is in progress
        if (state !== 1) {
            history.replace("/");
            resetConnection();
        }
    });

    useApi("lockPlayerInputs", () => {
        const directions = role === "judging"
            ? "Pick a favorite response"
            : "Wait for the judge to pick a favorite";
        toast.info(`All players have answered. ${directions}.`);
    });

    /* Once the page loads, remove initial state. This prevents a stale state from being used when
     * the page reloads.
     */
    useEffect(() => {
        history.replace({ state: { username, gameCode } });
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
                    {`Round ${round} of ${round + roundsLeft}`}
                </div>
                <h1>
                    {username}
                    <span style={NORMAL_WEIGHT}>, you are </span>
                    {role}
                    <span style={NORMAL_WEIGHT}>.</span>
                </h1>
                {/* If player is not the judge, show who is */}
                {role !== "judging" && judge != null && (
                    <div className="judge-name">
                        <strong>{judge}</strong>
                        {" "}
                        is judging.
                    </div>
                )}

                <div className="game-controls">
                    <h2>Your prompt:</h2>
                    <Card type="prompt">{prompt}</Card>
                    <JudgeControls role={role} disabled={!!leaderboardContent} />
                    <PlayerControls role={role} disabled={!!leaderboardContent} />
                </div>
            </main>
            <Chat />
        </div>
    );
}

export default Play;
