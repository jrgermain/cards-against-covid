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
import * as reduxListener from '../redux/socket';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { setName } from '../redux/slices/user';

function WaitingForPlayers() {
    const history = useHistory();
    const dispatch = useDispatch();
    const players = useSelector(state => state.players);
    const gameCode = useSelector(state => state.gameCode);
    const user = useSelector(state => state.user);
    const status = useSelector(state => state.status);

    useEffect(() => {
        socket.connect();
        socket.emit('join game', gameCode, user.name);
        Ajax.getJson("/api/playerList?code=" + gameCode, {
            cache: false,
            onSuccess: function (playersAlreadyHere) {
                playersAlreadyHere.forEach(player => {
                    dispatch({ type: "players/add", payload: player });
                });
                reduxListener.start();
            },
            onError: function () {
                showError("Could not find game with code " + gameCode);
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
                    <Button onClick={() => socket.emit('start game', gameCode)}>Everybody's In</Button>
                </section>
                
            </main>
        </div>
    );
}

export default WaitingForPlayers;
