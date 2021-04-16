import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

function Button({ link, onClick, children, disabled, ...others }) {
    if (disabled) {
        link = onClick = undefined;
    }

    if (link) {
        return (
            <Link to={link} className="button-wrapper" role="presentation" {...others}>
                <button onClick={onClick}>{children}</button>
            </Link>
        )
    } else {
        return (
            <span className="button-wrapper" role="presentation">
                <button {...{ disabled, onClick, ...others }}>{children}</button>
            </span>
        )
    }
}

export default Button;
