import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

function Button({ link, onClick, children, disabled, primary, ...others }) {
    if (disabled) {
        link = onClick = undefined;
    }

    const className = classNames("Button", { primary });

    if (link) {
        // Note that button can't be disabled because link would be undefined
        return <Link to={link} tabIndex="0" {...{ onClick, children, className, ...others }} />
    } else {
        return <button tabIndex={disabled ? "-1" : "0"} {...{ onClick, children, className, disabled, ...others }} />
    }
}

export default Button;
