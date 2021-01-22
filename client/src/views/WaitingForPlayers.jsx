import React from 'react';
import List from '../components/List';
import './WaitingForPlayers.css';
import Button from '../components/Button';
import { useState } from 'react';
import Ajax from '../lib/ajax';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { socket } from '../index';
import { showError } from '../lib/message';

function WaitingForPlayers({ match, location }) {
    const history = useHistory();
    const [players, setPlayers] = useState([]);
    if (!location.state) {
        history.push("/");
        window.location.reload();
    }
    const { name } = location.state;
    useEffect(() => {
        socket.connect();

        Ajax.getJson("/api/playerList?code=" + match.params.game, { 
            cache: false,
            onSuccess: function (playersAlreadyHere) {
                setPlayers(playersAlreadyHere);
                socket.emit('join game', match.params.game, name);
                socket.on("game updated", game => {
                    if (game.state === "IN_PROGRESS") {
                        history.push("/play", { name, game });
                    } else {
                        setPlayers(game.players);
                    }
                });
            },
            onError: function () {
                showError("Could not find game with code " + match.params.game);
                history.push("/");
            }
        });
    }, []);

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
                        <strong className="player-name">{name}</strong>
                    </div>
                </section>
                <section className="currently-joined">
                    <h2>Currently joined:</h2>
                    <List items={players} map={player => player.name} />
                </section>
                <section className="change-name">
                    <Button>Change My Name</Button>
                </section>
                <section className="start-game">
                    <Button onClick={() => socket.emit('start game', match.params.game)}>Everybody's In</Button>
                </section>
            </main>
        </div>
    );
}

export default WaitingForPlayers;
