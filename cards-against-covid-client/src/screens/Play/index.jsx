import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Card from "../../components/Card";
import Chat from "../../components/Chat";
import "./Play.css";
import Leaderboard from "../../components/Leaderboard";
import PlayerControls from "./PlayerControls";
import JudgeControls from "./JudgeControls";
import { useApi } from "../../lib/api";

const NORMAL_WEIGHT = { fontWeight: "normal" };

function Play() {
    const location = useLocation();
    const { username } = location.state || {};

    const [prompt, setPrompt] = useState(location.state?.prompt ?? "");
    const [round, setRound] = useState(location.state?.round ?? 0);
    const [roundsLeft, setRoundsLeft] = useState(location.state?.roundsLeft ?? 0);
    const [role, setRole] = useState(location.state?.role ?? "");
    const [judge, setJudge] = useState(location.state?.judge ?? "");
    const [leaderboardContent, setLeaderboardContent] = useState(null);

    // When a new round starts, hide the leaderboard and update the state
    useApi("newRound", (gameData) => {
        setLeaderboardContent(null);
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

    return (
        <div className="view" id="play">
            {leaderboardContent && (
                <Leaderboard
                    players={leaderboardContent}
                    prompt={prompt}
                />
            )}

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
