import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

function Button({ link = "#", onClick, children }) {
    return (
        <Link to={link} className="button-wrapper">
            <button onClick={onClick}>{children}</button>
        </Link>
    );
}

export default Button;
