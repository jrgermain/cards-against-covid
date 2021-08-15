import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import List from "../../components/List";
import Card from "../../components/Card";
import { useApi, send } from "../../lib/api";

function JudgeControls({ role }) {
    const location = useLocation();
    const [players, setPlayers] = useState(location.state?.players ?? []); // {name, responses, isConnected}[]
    const [numBlanks, setNumBlanks] = useState(location.state?.numBlanks ?? 1);

    // When a player selects a card, update the state
    useApi("cardSelected", (updatedPlayer) => {
        // Replace the player who selected a card's info with the latest
        setPlayers(players.map((p) => (p.name === updatedPlayer.name ? updatedPlayer : p)));
    }, [players]);

    // When a new round starts, update the state
    useApi("newRound", (gameData) => {
        if (gameData.role === "judging") {
            setPlayers(gameData.players);
            setNumBlanks(gameData.numBlanks);
        }
    });

    // When the page is refreshed, load the correct data
    useApi("restoreState", (gameData) => {
        if (gameData.role === "judging") {
            setPlayers(gameData.players);
            setNumBlanks(gameData.numBlanks);
        }
    });

    // When a player leaves, set isConnected to false for that player
    useApi("playerDisconnected", (name) => {
        setPlayers(players.map((p) => (p.name === name ? { ...p, isConnected: false } : p)));
    }, [players]);

    // When a player returns, set isConnected to true for that player
    useApi("playerReconnected", (name) => {
        setPlayers(players.map((p) => (p.name === name ? { ...p, isConnected: true } : p)));
    }, [players]);

    if (role !== "judging") {
        return <></>;
    }

    const needsToAnswer = (player) => player.isConnected && player.responses.length < numBlanks;

    if (players.some(needsToAnswer)) {
        return (
            <List
                label="Still waiting on responses from:"
                items={players}
                filter={needsToAnswer}
                map={(player) => player.name}
            />
        );
    }

    // Get an array of <Card> elements displaying each player's responses
    const responseCards = players.filter((p) => p.isConnected).map((player) => {
        // When a card is clicked, send a socket event saying the judge selected a card
        const onClick = () => send("selectAnswer", player.name);
        return <Card type="multi-response" onClick={onClick}>{player.responses}</Card>;
    });

    return (
        <div className="judge-controls">
            <h2>Select a winning response</h2>
            <div className="deck" aria-label="Player responses; select a favorite">
                {responseCards}
            </div>
        </div>
    );
}

export default JudgeControls;
