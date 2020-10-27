import React, { Component } from 'react';
import './PlayerList.css'

class PlayerList extends Component {

    render() {
        const filter = typeof this.props.filter === "function" ? this.props.filter : function () { return true };
        const players = (this.props.players || []).filter(filter);
        return (
            <div className="player-list">
                <label>{this.props.label}</label>
                <ul className="player-list">
                    {players.map(player => <li>{player.name}</li>)}
                </ul>
            </div>
            
        );
    }
}

export default PlayerList;
