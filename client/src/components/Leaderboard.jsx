import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Button from './Button';
import './Leaderboard.css'

function Leaderboard() {
    const [isDisplayed, setIsDisplayed] = useState(true);
    const players  = useSelector(state => state.players);
    const renderPlayer = player => <tr><td>{player.name}</td><td><span className="player-score">{player.score || 0}</span></td></tr>;
    
    if (!isDisplayed) {
        return <></>;
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
                <Button onClick={() => setIsDisplayed(false)}>Dismiss</Button>
            </div>
        </div>
    );
}

export default Leaderboard;