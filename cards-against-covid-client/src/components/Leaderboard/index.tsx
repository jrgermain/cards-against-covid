import React, { ReactElement, useState } from "react";
import Button from "../Button";
import "./Leaderboard.css";
import { send, useApi } from "../../lib/api";
import { RestoreStateArgs } from "../../lib/commonTypes";
import type { PlayerData } from "./PlayerData";
import Row from "./Row";

type LeaderboardProps = {
    players: PlayerData[] | null;
    prompt: string;
}

function Leaderboard({ players, prompt }: LeaderboardProps): ReactElement {
    const [isWaiting, setWaiting] = useState<boolean>(false);

    useApi<RestoreStateArgs>("restoreState", (gameData) => {
        setWaiting(gameData.readyForNext);
    });

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
                        {players.map((player) => (
                            <Row player={player} prompt={prompt} key={player.name} />
                        ))}
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
