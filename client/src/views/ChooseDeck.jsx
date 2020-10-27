import React, { Component } from 'react';
import Button from '../components/Button';
// import './Start.css';

class ChooseDeck extends Component {
    render() {
        return (
            <div className="view" id="choose-deck">
                <h1>Choose a deck</h1>
                <div className="placeholder">To Do</div>
                <Button link="/waiting">Continue</Button>
            </div>
          );
    }
}

export default ChooseDeck;
