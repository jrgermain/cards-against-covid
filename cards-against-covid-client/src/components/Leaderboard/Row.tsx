import React, { ReactElement } from "react";
import classNames from "classnames";
import Card from "../Card";
import type { PlayerData } from "./PlayerData";

type RowProps = {
    player: PlayerData;
    prompt: string;
}

function Row({ player, prompt }: RowProps): ReactElement {
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
                {player.isJudge && <span className="sr-only">Judge</span>}
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
}

export default Row;
