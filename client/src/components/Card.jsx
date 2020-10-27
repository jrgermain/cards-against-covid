import React, { Component } from 'react';
import './Card.css';

class Card extends Component {

    render() {
        const className = this.props.isPrompt ? "card prompt" : "card response";
        return (
            <div className={className}>
                {this.props.text}
            </div>
        );
    }
}

export default Card;
