import classNames from "classnames";
import React from "react";
import { Link } from "react-router-dom";
import "./Button.css";

function Button({ link, onClick, children, disabled, primary, ...others }) {
    if (disabled) {
        // eslint-disable-next-line -- I know this isn't ideal but it makes things simple
        link = onClick = undefined;
    }

    const className = classNames("Button", { primary });
    const props = {
        onClick,
        className,
        disabled,
        children,
        ...others,
    };

    if (link) {
        return <Link to={link} tabIndex="0" {...props} />;
    }
    return <button type="button" tabIndex={disabled ? "-1" : "0"} {...props} />;
}

export default Button;
