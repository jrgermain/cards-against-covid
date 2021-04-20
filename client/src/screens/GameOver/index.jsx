import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import Button from '../../components/Button';
import './GameOver.css';
import * as socketListener from '../../redux/socket';
import Table from '../../components/Table';

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
                <Table head={["Player", "Points"]} body={players.map(player => [player.name, player.score])} />
            </div>
            <Button link="/">Back to Home</Button>
        </div>
    );
}

export default GameOver;
