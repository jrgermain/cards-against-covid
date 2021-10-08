import React, { ReactElement } from "react";
import "./Home.css";
import Button from "../../components/Button";
import ButtonGroup from "../../components/ButtonGroup";

function Home(): ReactElement {
    return (
        <main className="view" id="start">
            <h1 id="game-logo">
                Cards
                <br />
                Against
                <br />
                COVID
            </h1>
            <ButtonGroup role="navigation">
                <Button link="/start">Start New Game</Button>
                <Button link="/join">Join Existing Game</Button>
                <Button link="/expansions">Create Expansion Pack</Button>
            </ButtonGroup>
        </main>
    );
}

export default Home;
