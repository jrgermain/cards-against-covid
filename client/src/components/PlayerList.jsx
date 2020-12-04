import React from 'react';
import './PlayerList.css';

const NOP_FILTER = () => true;

function PlayerList({ players, filter, label }) {
    const filterFunction = typeof filter === "function" ? filter : NOP_FILTER;
    const filteredPlayers = (players || []).filter(filterFunction);
    return (
        <div className="player-list">
            <label>{label}</label>
            <ul className="player-list">
                {filteredPlayers.map(player => <li>{player.name}</li>)}
            </ul>
        </div>
        
    );
}

export default PlayerList;
