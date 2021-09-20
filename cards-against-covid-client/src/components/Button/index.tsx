import classNames from "classnames";
import React, { HTMLAttributes, MouseEventHandler, ReactChild, ReactElement } from "react";
import { Link } from "react-router-dom";
import "./Button.css";

type ButtonProps = HTMLAttributes<HTMLElement> & {
    link?: string;
    onClick?: MouseEventHandler;
    children?: ReactChild;
    disabled?: boolean;
    primary?: boolean;
}

function Button({ link, onClick, children, disabled, primary, ...others }: ButtonProps): ReactElement {
    if (disabled) {
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
        return <Link to={link} tabIndex={0} {...props} />;
    }
    return <button type="button" tabIndex={disabled ? -1 : 0} {...props} />;
}

export default Button;
