import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { socket } from '..';
import Card from '../components/Card';
import CardDeck from '../components/CardDeck';
import Chat from '../components/Chat';
import List from '../components/List';
import './Table.css';
import './Play.css';
import Leaderboard from '../components/Leaderboard';

const NORMAL_WEIGHT = { fontWeight: "normal" };
const needsToAnswer = player => !(player.isJudge || player.response); 

function Play() {
    const history = useHistory();
    const gameCode = useSelector(state => state.gameCode);
    const players  = useSelector(state => state.players);
    const prompt = useSelector(state => state.prompt);
    const username = useSelector(state => state.user.name);
    const user = useSelector(state => state.players.find(player => player.name === username));

    useEffect(() => {
        // The page either loaded for the first time or refreshed. If it refreshed, rejoin the room.
        socket.emit("client reload", gameCode, username);
    }, []);

    if (!user) {
        history.push("/");
        return <></>;
    }
    
    const JudgeControls = () => {
        if (players.filter(needsToAnswer).length > 0) {
            return <List label="Still waiting on responses from:" items={players} filter={needsToAnswer} map={player => player.name} /> 
        } else {
            const responseCards = players.filter(player => !player.isJudge).map(player => <Card onClick={() => socket.emit("judge select", gameCode, player.name)}>{player.response}</Card>);
            return (
                <div>
                    <h2>Select a winning response</h2>
                    <CardDeck>{responseCards}</CardDeck>
                </div>
            );
        }
    }
    const PlayerControls = () => <CardDeck>{user.cards.map(text => <Card>{text}</Card>)}</CardDeck>

    return (
        <div className="view" id="play">
            <Leaderboard />
            <main>
                <h1>
                    {username}<span style={NORMAL_WEIGHT}>, you are </span>{user.isJudge ? "judging" : "answering"}<span style={NORMAL_WEIGHT}>.</span>
                </h1>
                <div className="game-controls">
                    <span>Your prompt:</span>
                    <Card isPrompt>{prompt}</Card>
                    {user.isJudge ? <JudgeControls /> : <PlayerControls />}
                    
                    {/* Below is for testing only. Remove once answering role is implemented. */}
                    {!user.isJudge && <button onClick={() => socket.emit('test: pop card', gameCode, username)}>DEBUG: Pop last card</button>}
                </div>
            </main>
            <Chat gameCode={gameCode} name={user.name}></Chat>
        </div>
    );
}

export default Play;
