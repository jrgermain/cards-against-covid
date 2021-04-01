import React from 'react';
import List from '../components/List';
import './WaitingForPlayers.css';
import Button from '../components/Button';
import TextBox from '../components/TextBox';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { socket } from '../index';
import { showError } from '../lib/message';
import { useDispatch, useSelector } from 'react-redux';
import * as socketListener from '../redux/socket';
import Ajax from '../lib/ajax';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

function WaitingForPlayers() {
    const history = useHistory();
    const dispatch = useDispatch();
    const players = useSelector(state => state.players.filter(player => player.isConnected));
    const gameCode = useSelector(state => state.gameCode);
    const user = useSelector(state => state.user);
    const status = useSelector(state => state.status.name);

    /* When the page is loaded/reloaded, clear the local player list and then send a request to the socket.
     * This request tells the socket the player is here, and the socket will respond with the correct player list.
     * Put this in a useEffect so it doesn't happen every time we re-render the view (such as when another player joins).
     */
    useEffect(() => {
        // Check that the game exists first
        Ajax.get('/api/doesGameExist?code=' + gameCode).then(exists => {
            if (exists !== "true") {
                history.replace("/");
            }
        });
        socketListener.start();
        dispatch({ type: "players/set", payload: [] });
        socket.emit('join game', gameCode, user.name);
        socket.emit("client reload", gameCode, user.name);    
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    // If game has started, redirect to Play screen
    if (status === "IN_PROGRESS") {
        history.replace("/play");
    }

    // If user loaded this page directly without actually joining a game, kick them out
    if (!gameCode) {
        history.replace("/");
    }

    // Respond to the user pressing "Everybody's In"
    function handleStart() {
        if (players.length < 3) {
            showError("Please wait for at least 3 players to join");
        } else {
            socket.emit('start game', gameCode);
        }
    }

    return (
        <div className="view" id="waiting-for-players">
            <h1>Waiting for players...</h1>
            <main>
                <section className="user-info">
                    <h2>About you</h2>
                    <div>
                        <span>Your game code: </span>
                        <strong className="game-code">{gameCode}</strong>
                    </div>
                    <div>
                        <span>Your name: </span>
                        <strong className="player-name">{user.name}</strong>
                    </div>
                </section>
                <section className="currently-joined">
                    <h2>Currently joined:</h2>
                    <List items={players} map={player => player.name} />
                </section>
                <section className="change-name">
                    <Popup trigger={<Button disabled> Change My Name</Button>}>
                        <div>
                            <label htmlFor="player-name">Enter your name: </label>
                            <TextBox
                                id="player-name"
                                placeholder="Your name"
                                value={useSelector(state => state.user.name)}
                                onChange={e => dispatch({ type: "user/setName", payload: e.target.value })}
                            />
                        </div>
                    </Popup>
                </section>
                <section className="start-game">
                    <Button onClick={handleStart}>Everybody's In</Button>
                </section>
                
            </main>
        </div>
    );
}

export default WaitingForPlayers;
