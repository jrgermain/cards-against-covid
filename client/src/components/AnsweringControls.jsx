import React, { Component } from 'react';
import Card from './Card';
import CardDeck from './CardDeck';
import Button from './Button';
// import './Card.css';

class AnsweringControls extends Component {
    constructor() {
        super()
        this.state = {
            prompt: "TSA guidelines now prohibit __________________ on airplanes."
        } 
    }
    render() {
        return (
            <div className="game-controls">
                <Card text={this.state.prompt} isPrompt={true}></Card>
                <CardDeck></CardDeck>
                <Button>Submit Card</Button>
            </div>
        );
    }
}

export default AnsweringControls;
