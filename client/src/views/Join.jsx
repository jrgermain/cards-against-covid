import React, { Component } from 'react';
import Button from '../components/Button';
import './Join.css';

class Join extends Component {

    constructor() {
        super();
        this.state = {gameCode: ""}
    }

    render() {
        return (
            <div className="view" id="join">
                <h1>Join a game</h1>
                <div className="game-code-entry">
                    <label htmlFor="game-code">Enter game code: </label>
                    <input id="game-code" type="text" placeholder="Game Code" className="big-text uppercase" maxLength="4" onChange={this.handleChange.bind(this)}></input>
                </div>
                <Button link={`/join/${this.state.gameCode}`}>Join</Button>

            </div>
        );
    }

    handleChange(event) {
        this.setState({ gameCode: event.target.value });
    }
}

export default Join;
