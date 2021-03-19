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
        <tr className={player.isWinner ? "winner" : undefined}>
            <td>
                <label>{player.name}</label>
                {player.isWinner && <label className="winner-label">Winner!</label>}
            </td>
            <td>
                {player.isJudge
                    ? <Card type="prompt">{prompt}</Card>
                    : <Card type="response">{player.responses}</Card>}
            </td>
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
                            <th>Card</th>
                            <th>Score</th>
                        </tr>
                        <tr></tr>
                    </thead>
                    <tbody>
                        {players.map(renderPlayer)}
                    </tbody>
                </table>
                {/* <table>
                    <tr>
                        <td>Winning Phrase:</td>
                        <td><Card type="prompt">{prompt}</Card></td>
                        <td><Card type="response">{winner.responses}</Card></td>                        
                    </tr>
                </table> */}
                <Button onClick={handleNextRound} disabled={isWaiting}>{isWaiting ? "Waiting for other players..." : "Next Round"}</Button>
            </div>
        </div>
    );
}

export default Leaderboard;