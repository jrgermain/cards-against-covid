import React from 'react';
import './Start.css';
import Button from '../components/Button';

function Start() {
    return (
        <div className="view" id="start">
            <h1 id="game-logo">Cards<br/>Against<br/>COVID</h1>
            <section className="button-group">
                <Button link="/start">Start New Game</Button>
                <Button link="/join">Join Existing Game</Button>
                <Button link="/expansions">Create Expansion Pack</Button>
            </section>
        </div>
    );
}

export default Start;
