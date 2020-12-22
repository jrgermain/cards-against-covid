import React from 'react';
import PlayerList from '../components/PlayerList';
import './WaitingForPlayers.css';
import Button from '../components/Button';
import { useState } from 'react';
import Ajax from '../lib/ajax';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

function WaitingForPlayers({ match, location }) {
    const history = useHistory();
    console.log(location)
    const player = new URLSearchParams(location.search).get("player");
    const [players, setPlayers] = useState([]);

    // Poll for new players every 2.5 seconds
    useEffect(() => {
        getPlayerList();
        const refreshInterval = window.setInterval(getPlayerList, 2500);
        return function () {
            window.clearInterval(refreshInterval)
        }
    }, []);
    
    function getPlayerList() {
        Ajax.getJson("/api/playerList?code=" + match.params.game, { cache: false })
            .then(setPlayers)
            .catch(history.goBack);
    }

    return (
        <div className="view" id="waiting-for-players">
            <h1>Waiting for players...</h1>
            <main>
                <section className="user-info">
                    <h2>About you</h2>
                    <div>
                        <span>Your game code: </span>
                        <strong className="game-code">{match.params.game}</strong>
                    </div>
                    <div>
                        <span>Your name: </span>
                        <strong className="player-name">{player}</strong>
                    </div>
                </section>
                <section className="currently-joined">
                    <h2>Currently joined:</h2>
                    <PlayerList players={players}></PlayerList>
                </section>
                <section className="change-name">
                    <Button>Change My Name</Button>
                </section>
                <section className="start-game">
                    <Button link="/play">Everybody's In</Button>
                </section>
            </main>
        </div>
    );
}

export default WaitingForPlayers;
