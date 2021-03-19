import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { socket } from '..';
import Button from './Button';
import Card from './Card';
import CardDeck from '../components/CardDeck';
import './Leaderboard.css'

function Leaderboard() {
    const [isWaiting, setWaiting] = useState(false);
    const gameCode = useSelector(state => state.gameCode);
    const username = useSelector(state => state.user.name);
    const players  = useSelector(state => state.players);
    const prompt = useSelector(state => state.prompt); 
    const winner = useSelector(state => state.players.find(player => player.isWinner))

    const renderPlayer = player => {
        const cellClass = "cell" + (player.isWinner ? " winner" : "");
        return (
            <>
            <span className={cellClass}>
                <label className="player-name">{player.name}</label>
                {player.isWinner && <label className="winner-label">Winner!</label>}
            </span>
            <span className={cellClass}>
                {player.isJudge
                    ? <Card type="prompt">{prompt}</Card>
                    : <Card type="response">{player.responses}</Card>}
            </span>
            <span className={cellClass}>
                <span className="player-score">{player.score || 0}</span>
            </span>
            </>
        );
    }

    function handleNextRound() {
        // Tell the server this player is ready and show that we are waiting on the others
        const round = 0; 
        if (!isWaiting) {
            socket.emit("player ready", gameCode, username);
            setWaiting(true);
            round ++; 
        }
    }
 

    return (
        <div className="leaderboard">
            <div className="leaderboard-content">
                <label>Leaderboard</label>

                <div className="leaderboard-grid-wrapper">
                    <div className="leaderboard-grid-header">
                        <span className="cell">Name</span>
                        <span className="cell">Card</span>
                        <span className="cell">Score</span>
                    </div>
                    <div className="leaderboard-grid-body">
                        {players.map(renderPlayer)}
                    </div>
                </div>
                <Button onClick={handleNextRound} disabled={isWaiting}>{isWaiting ? "Waiting for other players..." : "Next Round"}</Button>
            </div>
        </div>
    );
}

export default Leaderboard;