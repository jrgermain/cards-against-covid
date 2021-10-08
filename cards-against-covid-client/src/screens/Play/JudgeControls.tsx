import React, { ReactElement, useState } from "react";
import { useLocation } from "react-router-dom";
import List from "../../components/List";
import Card from "../../components/Card";
import { useApi, send } from "../../lib/api";
import { NewRoundArgs, PlayerRole, RestoreStateArgs } from "../../lib/commonTypes";
import ButtonGroup from "../../components/ButtonGroup";

type JudgeControlsProps = {
    role: PlayerRole;
    disabled?: boolean;
}

type PlayerData = {
    name: string;
    responses: string[];
    isConnected: boolean;
}

interface JudgeControlsLocationState {
    players?: PlayerData[];
    numBlanks?: number;
}

function JudgeControls({ role, disabled }: JudgeControlsProps): ReactElement {
    const location = useLocation<JudgeControlsLocationState>();
    const [players, setPlayers] = useState<PlayerData[]>(location.state?.players ?? []);
    const [numBlanks, setNumBlanks] = useState<number>(location.state?.numBlanks ?? 1);

    // When a player selects a card, update the state
    useApi<PlayerData>("cardSelected", (updatedPlayer) => {
        // Replace the player who selected a card's info with the latest
        setPlayers(players.map((p) => (p.name === updatedPlayer.name ? updatedPlayer : p)));
    }, [players]);

    // When a new round starts, update the state
    useApi<NewRoundArgs>("newRound", (gameData) => {
        if (gameData.role === "judging") {
            setPlayers(gameData.players ?? []);
            setNumBlanks(gameData.numBlanks);
        }
    });

    // When the page is refreshed, load the correct data
    useApi<RestoreStateArgs>("restoreState", (gameData) => {
        if (gameData.role === "judging") {
            setPlayers(gameData.players ?? []);
            setNumBlanks(gameData.numBlanks);
        }
    });

    // When a player leaves, set isConnected to false for that player
    useApi<string>("playerDisconnected", (name) => {
        setPlayers(players.map((p) => (p.name === name ? { ...p, isConnected: false } : p)));
    }, [players]);

    // When a player returns, set isConnected to true for that player
    useApi<string>("playerReconnected", (name) => {
        setPlayers(players.map((p) => (p.name === name ? { ...p, isConnected: true } : p)));
    }, [players]);

    if (role !== "judging") {
        return <></>;
    }

    const needsToAnswer = (player: PlayerData) => (
        player.isConnected && player.responses.length < numBlanks
    );

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
    const responseCards = players.filter((p) => p.isConnected).map((player) => (
        <Card 
            type="multi-response"
            onClick={() => send("selectAnswer", player.name)}
            key={player.name}
            disabled={disabled}
        >
            {player.responses}
        </Card>
    ));

    return (
        <div className="judge-controls">
            <h2>Select a winning response</h2>
            <ButtonGroup
                className="deck"
                aria-label="Player responses; select a favorite"
                disabled={disabled}
            >
                {responseCards}
            </ButtonGroup>
        </div>
    );
}

export default JudgeControls;
