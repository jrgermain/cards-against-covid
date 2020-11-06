import React from 'react';
import './Card.css';

function Card({ isPrompt, children }) {
    const cardType = isPrompt ? "prompt" : "response";
    return <div className={"card " + cardType}>{children}</div>;
}

export default Card;
