import React, { ReactElement } from "react";
import "./Home.css";
import Button from "../../components/Button";

function Home(): ReactElement {
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
