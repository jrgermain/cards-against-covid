import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

function Button({ link, onClick, children, disabled, ...others }) {
    if (disabled) {
        link = onClick = undefined;
    }

    if (link) {
        return (
            <Link to={link} className="Button" {...{ onClick, children, disabled, ...others }}>
                {/* <button aria-hidden="true" onClick={onClick}>{children}</button> */}
            </Link>
        )
    } else {
        return (
            // <span className="button-wrapper" role="button">
                <button className="Button" {...{ disabled, onClick, ...others }}>{children}</button>
            // </span>
        )
    }
}

export default Button;
