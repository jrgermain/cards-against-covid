import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import CardDeck from '../components/CardDeck';
import Chat from '../components/Chat';
import List from '../components/List';
import { socket } from '../index';
import './Play.css';

const NORMAL_WEIGHT = {fontWeight: "normal"};
const needsToAnswer = player => !(player.isJudge || player.response);

function Play({ location }) {
    const { gameCode, name } = location.state;
    const [game, setGame] = useState(location.state.game);
    const player = game.players.find(player => player.name === name);
    const role = player.isJudge ? "judging" : "answering";

    useEffect(() => {
        socket.on("game updated", game => {
            setGame(game);
        });
    }, []);

    return (
        <div className="view" id="play">
            <main>
                <h1>
                    {name}<span style={NORMAL_WEIGHT}>, you are </span>{role}<span style={NORMAL_WEIGHT}>.</span>
                </h1>
                <div className="game-controls">
                    <span>Your prompt:</span>
                    <Card isPrompt>{game.prompt}</Card>
                    {role === "judging" 
                        ? game.players.filter(needsToAnswer).length > 0
                            ? <List label="Still waiting on responses from:" items={game.players} filter={needsToAnswer} map={player => player.name} />
                            : <CardDeck>{game.players.filter(player => !player.isJudge).map(player => <Card>{player.response}</Card>)}</CardDeck>
                        : <CardDeck>{player.cards.map(text => <Card>{text}</Card>)}</CardDeck>}
                </div>
                <button className="panel-toggle">Show Chat</button>
            </main>
            <Chat gameCode={gameCode} name={name}></Chat>
        </div>
    );
}

export default Play;
