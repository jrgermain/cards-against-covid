import React from 'react';
import './Card.css';

function Card({ isPrompt, children, isSelected, ...others }) {
    const cardType = isPrompt ? " prompt" : " response";
    const selected = isSelected ? " selected" : "";
    const hasClick = others.onClick ? " hasClick" : "";
    return <div className={"card" + cardType + selected + hasClick} {...others}>{children}</div>;
}

export default Card;
