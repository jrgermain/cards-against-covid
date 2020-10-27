import React, { Component } from 'react';
import Card from './Card';
// import './Card.css';

class CardDeck extends Component {

    render() {
        return (
            <div className="deck">
                <Card text="Test card #1."></Card>
                <Card text="Test card #2."></Card>
            </div>
        );
    }
}

export default CardDeck;
