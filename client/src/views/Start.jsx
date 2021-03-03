import React, { useEffect } from 'react';
import './Start.css';
import Button from '../components/Button';
import { store } from '../redux/store';

function Start() {
    useEffect(() => {
        store.dispatch({ type: "RESET_STATE" });
    }, []);
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
