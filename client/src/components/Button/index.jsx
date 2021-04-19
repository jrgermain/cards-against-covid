import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

function Button({ link, onClick, children, disabled, ...others }) {
    if (disabled) {
        link = onClick = undefined;
    }

    if (link) {
        // Note that button can't be disabled because link would be undefined
        return <Link to={link} className="Button" tabIndex="0" {...{ onClick, children, ...others }} />
    } else {
        return <button className="Button" tabIndex={disabled ? "-1" : "0"} {...{ onClick, children, disabled, ...others }} />
    }
}

export default Button;
