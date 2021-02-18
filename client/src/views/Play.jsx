import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Card from '../components/Card';
import CardDeck from '../components/CardDeck';
import Chat from '../components/Chat';
import List from '../components/List';
import './Table.css';
import './Play.css';

const NORMAL_WEIGHT = { fontWeight: "normal" };
const needsToAnswer = player => !(player.isJudge || player.response);

function Play() {
    const history = useHistory();
    const gameCode = useSelector(state => state.gameCode);
    const players  = useSelector(state => state.players);
    const prompt = useSelector(state => state.prompt);
    const username = useSelector(state => state.user.name);
    const user = useSelector(state => state.players.find(player => player.name === username));
    const score = useSelector(state => state.player);
    if (!user) {
        history.push("/");
        return <></>;
    }
    
    return (
        <div className="view" id="play">
            <main>
            <div>
                <table><tr>
                    <th>Player</th>
                    <th>Points</th>
                    </tr></table>
                    <table><tr>
                        <td>Luke Skywalker</td>
                        <td>1000</td>
                    </tr>
                    <tr>
                        <td>Michael Jordan</td>
                        <td>500</td>
                    </tr>
                    <tr>
                        <td>Joey</td>
                        <td>250</td>
                    </tr></table>
                </div>
                <h1>
                    {username}<span style={NORMAL_WEIGHT}>, you are </span>{user.isJudge ? "judging" : "answering"}<span style={NORMAL_WEIGHT}>.</span>
                </h1>
                <div className="game-controls">
                    <span>Your prompt:</span>
                    <Card isPrompt>{prompt}</Card>
                    {user.isJudge 
                        ? players.filter(needsToAnswer).length > 0
                            ? <List label="Still waiting on responses from:" items={players} filter={needsToAnswer} map={player => player.name} />
                            : <CardDeck>{players.filter(player => !player.isJudge).map(player => <Card>{player.response}</Card>)}</CardDeck>
                        : <CardDeck>{user.cards.map(text => <Card>{text}</Card>)}</CardDeck>}
                </div>
            </main>
            <Chat gameCode={gameCode} name={user.name}></Chat>
        </div>
    );
}

export default Play;
