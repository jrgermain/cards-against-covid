import React, { useState } from 'react';
import Card from '../components/Card';
import CardDeck from '../components/CardDeck';
import Chat from '../components/Chat';
import List from '../components/List';
import './Play.css';

const DEMO_STATE = {
    name: "Joey", 
    prompt: "My _______ hurts",
    cards: [
        "Card 1",
        "Card 2",
        "Card 3",
        "Card 4",
        "Card 5"
    ],
    players: [
        { name: "Joey", isJudge: true, response: null },
        { name: "Amanda", isJudge: false, response: null },
        { name: "Mark", isJudge: false, response: "mark response" },
        { name: "Stefan", isJudge: false, response: "stefan response" }
    ]
};
const NORMAL_WEIGHT = {fontWeight: "normal"};
const needsToAnswer = player => !(player.isJudge || player.response);

function Play() {

    const [state, setState] = useState(DEMO_STATE);
    const { name, prompt, cards, players } = state;
    const me = players.find(player => player.name === name);
    const role = me.isJudge ? "judging" : "answering";
    return (
        <div className="view" id="play">
            <main>
                <h1>
                    {name}<span style={NORMAL_WEIGHT}>, you are </span>{role}<span style={NORMAL_WEIGHT}>.</span>
                </h1>
                <div className="game-controls">
                    <span>Your prompt:</span>
                    <Card isPrompt>{prompt}</Card>
                    {role === "judging" 
                        ? players.filter(needsToAnswer).length > 0
                            ? <List label="Still waiting on responses from:" items={players} filter={needsToAnswer} map={player => player.name} />
                            : <CardDeck>{players.filter(player => !player.isJudge).map(player => <Card>{player.response}</Card>)}</CardDeck>
                        : <CardDeck>{cards.map(text => <Card>{text}</Card>)}</CardDeck>}
                </div>
                <button className="panel-toggle">Show Chat</button>
            </main>
            <Chat></Chat>
        </div>
    );
}

export default Play;
