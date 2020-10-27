import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

class Button extends Component {

    render() {
        const className = this.props.isPrompt ? "card prompt" : "card response";
        return (
            <Link to={this.props.link || "#"} className="button-wrapper">
                <button className={className}>{this.props.children}</button>
            </Link>
        );
    }
}

export default Button;
