import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import Button from '../components/Button';
import './GameOver.css';
import * as socketListener from '../redux/socket';

function GameOver() {
    const history = useHistory();

    const players = useSelector(state => state.players);
    const gameCode = useSelector(state => state.gameCode);

    // If user loaded this page directly without actually joining a game, kick them out
    if (!gameCode) {
        history.replace("/");
    }

    useEffect(() => {
        socketListener.stop();
    }, []);

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
