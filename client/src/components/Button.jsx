import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

class Button extends Component {

    render() {
        return (
            <Link to={this.props.link || "#"} className="button-wrapper">
                <button onClick={this.props.onClick}>{this.props.children}</button>
            </Link>
        );
    }
}

export default Button;
