import React, { Component } from 'react';
import Card from './Card';
import CardDeck from './CardDeck';
import PlayerList from './PlayerList';

// import './Card.css';

class JudgingControls extends Component {
    constructor() {
        super();
        this.state = {
            prompt: "My ______ hurts.",
            players: [
                { name: "Joey", isJudge: false, hasAnswered: true },
                { name: "Amanda", isJudge: true, hasAnswered: null },
                { name: "Mark", isJudge: false, hasAnswered: false },
            ]
        }
    }

    render() {
        const needsToAnswer = player => !(player.isJudge || player.hasAnswered);
        return (
            <div className="game-controls">
                <span>Your prompt:</span>
                <Card text={this.state.prompt} isPrompt={true}></Card>
                {this.state.players.finter(needsToAnswer).length === 0 
                    ? <CardDeck></CardDeck> 
                    : <PlayerList label="Still waiting on responses from:" filter={needsToAnswer} players={this.state.players}></PlayerList>
                }
            </div>
        );
    }
}

export default JudgingControls;