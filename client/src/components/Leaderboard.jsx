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
    
    const renderPlayer = player => (
        <tr>
            <td>{player.name}</td>
            <td><span className="player-score">{player.score || 0}</span></td>
        </tr>
    );

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
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Score</th>
                        </tr>
                        <tr></tr>
                    </thead>
                    <tbody>
                        {players.map(renderPlayer)}
                    </tbody>
                    <tr>
                            <th>Winning Phrase:</th>
                            <th>{prompt}</th>
                            <th className="leaderboard-win"> {winner.responses}</th>
                        </tr>
                        
                </table>
                <Button onClick={handleNextRound} disabled={isWaiting}>{isWaiting ? "Waiting for other players..." : "Next Round"}</Button>
            </div>
        </div>
    );
}

export default Leaderboard;