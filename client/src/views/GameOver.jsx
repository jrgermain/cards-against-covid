import React from 'react';
import { useSelector } from 'react-redux';
import Button from '../components/Button';
import './GameOver.css';

function GameOver() {
    const players = useSelector(state => state.players);
    return (
        <div className="view" id="game-over">
            <h1>Game Over</h1>
            <div className="final-score-wrapper">
                <h2>Final score</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map(player => (
                            <tr>
                                <td>{player.name}</td>
                                <td>{player.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Button link="/">Back to Home</Button>
        </div>
    );
}

export default GameOver;
