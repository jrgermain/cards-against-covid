import React from 'react';
import './Card.css';

function Card({ isPrompt, children, ...others }) {
    const cardType = isPrompt ? "prompt" : "response";
    const hasClick = others.onClick ? " hasClick" : "";
    return <div className={"card " + cardType + hasClick} {...others}>{children}</div>;
}

export default Card;
