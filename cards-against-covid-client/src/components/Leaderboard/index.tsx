import React, { ReactElement, useState } from "react";
import classNames from "classnames";
import Button from "../Button";
import Card from "../Card";
import "./Leaderboard.css";
import { send, useApi } from "../../lib/api";
import { RestoreStateArgs } from "../../lib/commonTypes";

type PlayerData = {
    isWinner: boolean;
    isConnected: boolean;
    isJudge: boolean;
    name: string;
    responses: string[];
    score: number;
}

type LeaderboardProps = {
    players: PlayerData[] | null;
    prompt: string;
}

function Leaderboard({ players, prompt }: LeaderboardProps): ReactElement {
    const [isWaiting, setWaiting] = useState<boolean>(false);

    useApi<RestoreStateArgs>("restoreState", (gameData) => {
        setWaiting(gameData.readyForNext);
    });

    const renderPlayer = (player: PlayerData) => {
        // Figure out which css classes to give the card
        const rowClass = classNames({
            winner: player.isWinner,
            inactive: !player.isConnected,
        });

        return (
            <div role="row" className={rowClass}>
                <span className="cell" role="gridcell">
                    <span className="player-name">{player.name}</span>
                    {player.isWinner && <span className="winner-label">Winner!</span>}
                    {!player.isConnected && <span className="inactive-label">Inactive</span>}
                </span>
                <span className="cell" role="gridcell">
                    {player.isJudge
                        ? <Card type="prompt">{prompt}</Card>
                        : <Card type="multi-response">{player.responses}</Card>}
                </span>
                <span className="cell" role="gridcell">
                    <span className="player-score">{player.score || 0}</span>
                </span>
            </div>
        );
    };

    function handleNextRound() {
        // Tell the server this player is ready and show that we are waiting on the others
        if (!isWaiting) {
            send("readyForNext");
            setWaiting(true);
        }
    }

    if (!players) {
        return <></>;
    }

    return (
        <div className="leaderboard" role="dialog" aria-modal="true" aria-labelledby="leaderboard-label">
            <div className="leaderboard-content">
                <span id="leaderboard-label">Leaderboard</span>

                <div className="leaderboard-grid-wrapper" role="grid">
                    <div className="leaderboard-grid-header" role="rowgroup">
                        <div role="row">
                            <span className="cell" role="columnheader">Name</span>
                            <span className="cell" role="columnheader">Card</span>
                            <span className="cell" role="columnheader">Score</span>
                        </div>
                    </div>
                    <div className="leaderboard-grid-body" role="rowgroup">
                        {players.map(renderPlayer)}
                    </div>
                </div>
                <Button onClick={handleNextRound} aria-pressed={isWaiting} disabled={isWaiting}>
                    {isWaiting ? "Waiting for other players..." : "Next Round"}
                </Button>
            </div>
        </div>
    );
}

export default Leaderboard;
