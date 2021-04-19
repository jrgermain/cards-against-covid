import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { socket } from '../..';
import Button from '../Button';
import Card from '../Card';
import './Leaderboard.css';
import classNames from 'classnames';

function Leaderboard() {
    const [isWaiting, setWaiting] = useState(false);
    const gameCode = useSelector(state => state.gameCode);
    const username = useSelector(state => state.user.name);
    const players  = useSelector(state => state.players);
    const prompt = useSelector(state => state.prompt); 

    const renderPlayer = player => {
        // Figure out which css classes to give the card
        const rowClass = classNames({
            winner: player.isWinner,
            inactive: !player.isConnected
        });

        return (
            <div role="row" className={rowClass}>
                <span className="cell" role="gridcell">
                    <label className="player-name">{player.name}</label>
                    {player.isWinner && <label className="winner-label">Winner!</label>}
                    {!player.isConnected && <label className="inactive-label">Inactive</label>}
                </span>
                <span className="cell" role="gridcell">
                    {player.isJudge
                        ? <Card type="prompt">{prompt}</Card>
                        : <Card type="response">{player.responses}</Card>}
                </span>
                <span className="cell" role="gridcell">
                    <span className="player-score">{player.score || 0}</span>
                </span>
            </div>
        );
    }

    function handleNextRound() {
        // Tell the server this player is ready and show that we are waiting on the others
        if (!isWaiting) {
            socket.emit("player ready", gameCode, username);
            setWaiting(true);
        }
    }
 

    return (
        <div className="leaderboard" role="dialog" aria-modal="true">
            <div className="leaderboard-content">
                <label>Leaderboard</label>

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
                <Button onClick={handleNextRound} aria-pressed={isWaiting} disabled={isWaiting}>{isWaiting ? "Waiting for other players..." : "Next Round"}</Button>
            </div>
        </div>
    );
}

export default Leaderboard;