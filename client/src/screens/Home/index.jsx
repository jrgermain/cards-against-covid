import React, { useEffect } from 'react';
import './Home.css';
import Button from '../../components/Button';
import * as socketListener from '../../redux/socket';

function Home() {
    useEffect(() => {
        // If a user leaves a game, they are brought here. This means we should reset the app.
        socketListener.stop(); // Stop listening for state updates
        socketListener.resetState(); // Clear local app state
        socketListener.resetConnection(); // Close and reopen the socket to trigger the disconnect handler on the server
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

export default Home;
