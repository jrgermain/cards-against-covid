import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { socket } from '..';
import Button from './Button';
import './Leaderboard.css'

function Leaderboard() {
    const [isWaiting, setWaiting] = useState(false);
    const gameCode = useSelector(state => state.gameCode);
    const username = useSelector(state => state.user.name);
    const players  = useSelector(state => state.players);
    
    const renderPlayer = player => (
        <tr>
            <td>{player.name}</td>
            <td><span className="player-score">{player.score || 0}</span></td>
        </tr>
    );

    function handleNextRound() {
        // Tell the server this player is ready and show that we are waiting on the others
        if (!isWaiting) {
            socket.emit("player ready", gameCode, username);
            setWaiting(true);
        }
    }

    return (
        <div className="leaderboard">
            <div className="leaderboard-content">
                <label>Leaderboard</label>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map(renderPlayer)}
                    </tbody>
                </table>
                <Button onClick={handleNextRound} disabled={isWaiting}>{isWaiting ? "Waiting for other players..." : "Next Round"}</Button>
            </div>
        </div>
    );
}

export default Leaderboard;