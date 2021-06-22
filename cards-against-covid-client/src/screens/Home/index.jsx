import React, { useEffect } from "react";
import "./Home.css";
import Button from "../../components/Button";
import * as socketListener from "../../redux/socket";

function Home() {
    useEffect(() => {
        // If a user leaves a game, they might be brought here. This means we should reset the app.
        socketListener.stop(); // Stop listening for state updates
        socketListener.reset(); // Clear local app state and trigger a disconnect on the server
    }, []);
    return (
        <div className="view" id="start" role="main">
            <h1 id="game-logo">
                Cards
                <br />
                Against
                <br />
                COVID
            </h1>
            <nav className="button-group">
                <Button link="/start">Start New Game</Button>
                <Button link="/join">Join Existing Game</Button>
                <Button link="/expansions">Create Expansion Pack</Button>
            </nav>
        </div>
    );
}

export default Home;
