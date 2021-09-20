import React, { ReactElement } from "react";
import { useHistory, useLocation } from "react-router";
import Button from "../../components/Button";
import "./GameOver.css";
import Table from "../../components/Table";

interface GameOverLocationState {
    players?: { name: string, score: number }[];
}

function GameOver(): ReactElement {
    const history = useHistory();
    const location = useLocation<GameOverLocationState>();
    const players = location.state?.players;

    // If user loaded this page directly without actually joining a game, kick them out
    if (!players) {
        history.replace("/");
    }

    return (
        <div className="view" id="game-over">
            <h1>Game Over</h1>
            <div className="final-score-wrapper">
                <h2>Final score</h2>
                <Table
                    head={["Player", "Points"]}
                    body={players?.map(({ name, score }) => [name, score]) ?? []}
                />
            </div>
            <Button link="/">Back to Home</Button>
        </div>
    );
}

export default GameOver;
