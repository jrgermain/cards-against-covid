import React from 'react';
import List from '../components/List';
import './WaitingForPlayers.css';
import Button from '../components/Button';
import TextBox from '../components/TextBox';
import Ajax from '../lib/ajax';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { socket } from '../index';
import { showError } from '../lib/message';
import { useDispatch, useSelector } from 'react-redux';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { setName } from '../redux/slices/user';

function WaitingForPlayers() {
    const history = useHistory();
    const dispatch = useDispatch();
    const players = useSelector(state => state.players);
    const gameCode = useSelector(state => state.gameCode);
    const user = useSelector(state => state.user);
    const status = useSelector(state => state.status.name);

    useEffect(() => {
        // Clear player list
        dispatch({ type: "players/set", payload: [] });

        // Emit "join" event to tell the server we're joining (or rejoining)
        socket.emit('join game', gameCode, user.name);

        // Get a list of players in the game and display them
        Ajax.getJson("/api/playerList?code=" + gameCode, {
            cache: false,
            onSuccess: function (playerList) {
                dispatch({ type: "players/set", payload: playerList })
            },
            onError: function () {
                if (gameCode) {
                    showError("Could not find game with code " + gameCode);
                }
                history.push("/");
            }
        });
    }, []);
    
    if (status === "IN_PROGRESS") {
        history.push("/play");
    }

    function handleKeyPress(event) {
        if (event.key === "Enter") {
            //const player = useSelector(state => state.player.name);
        }
    }

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
                <Popup trigger={<Button> Change My Name</Button>}>
                    <div>
                    <label htmlFor="player-name">Enter your name: </label>
                    <TextBox
                        id="player-name"
                        placeholder="Your name"
                        value={useSelector(state => state.user.name)}
                        onChange={e => dispatch({ type: "user/setName", payload: e.target.value})}
                        //onKeyPress={handleKeyPress}
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
