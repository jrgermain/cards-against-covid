import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

function Button({ link, onClick, children }) {
    if (link) {
        return (
            <Link to={link} className="button-wrapper">
                <button onClick={onClick}>{children}</button>
            </Link>
        )
    } else {
        return (
            <span className="button-wrapper">
                <button onClick={onClick}>{children}</button>
            </span>
        )
    }
}

export default Button;
