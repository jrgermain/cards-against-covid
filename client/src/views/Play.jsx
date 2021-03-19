import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { socket } from '..';
import Card from '../components/Card';
import CardDeck from '../components/CardDeck';
import Chat from '../components/Chat';
import List from '../components/List';
import './Table.css';
import './Play.css';
import Leaderboard from '../components/Leaderboard';

const NORMAL_WEIGHT = { fontWeight: "normal" };

function Play() {
    const history = useHistory();

    const gameCode = useSelector(state => state.gameCode);
    const players = useSelector(state => state.players);
    const prompt = useSelector(state => state.prompt);
    const cardsRequired = useSelector(state => state.prompt.match(/_+/g)?.length ?? 1 );
    const username = useSelector(state => state.user.name);
    const user = useSelector(state => state.players.find(player => player.name === username));
    const isLeaderboardVisible = useSelector(state => state.status.isLeaderboardVisible);
   /*  const round = useSelector(state => state.game.find(game => game.round))
 */


    useEffect(() => {
        // The page either loaded for the first time or refreshed. If it refreshed, rejoin the room.
        socket.emit("client reload", gameCode, username);

        // When the client is disconnected, add a css style to show a visual hint
        socket.on("connect", () => document.getElementById("play").classList.remove("disconnected"));
        socket.on("reconnect", () => document.getElementById("play").classList.remove("disconnected"));
        socket.on("disconnect", () => document.getElementById("play").classList.add("disconnected"));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!user) {
        history.push("/");
        return <></>;
    }

    // Given a player, test if they need to submit at least one card. This is true if they are not a judge and they haven't selected the required number of cards.
    const needsToAnswer = player => !player.isJudge && player.responses.length < cardsRequired;

    // The game controls unique to a player who is judging
    const JudgeControls = () => {
        if (players.some(needsToAnswer)) {
            return <List label="Still waiting on responses from:" items={players} filter={needsToAnswer} map={player => player.name} />
        } else {
            const responsePlayers = players.filter(player => !player.isJudge);

            // Get an array of <Card> elements displaying each player's responses
            const responseCards = responsePlayers.map(player => {
                // When a card is clicked, send a socket event saying the judge selected a card
                const onClick = () => socket.emit("judge select", gameCode, player.name);
                return <Card type="response" onClick={onClick}>{player.responses}</Card>
            });
            return (
                <div className="judge-controls">
                    <h2>Select a winning response</h2>
                    <CardDeck>{responseCards}</CardDeck>
                </div>
            );
        }
    }

    // The game controls unique to a player who is answering
    const PlayerControls = () => {
        // Only enable controls if not all players have answered yet
        const isEnabled = players.some(needsToAnswer);
        const enabledClass = isEnabled ? "" : " disabled";

        // If more than one card is required, add a multi-select class to the element
        const multiSelectClass = cardsRequired > 1 ? " multi-select" : "";
        return (
            <div className={"player-controls" + enabledClass + multiSelectClass}>
                <CardDeck>
                    {user.cards.map((text, index) => (
                        // Create a <Card> element for each of the user's cards. When clicked, a socket event is sent to the server, where the selection logic takes place.
                        <Card type="response" selectedIndex={user.responses.indexOf(text)} onClick={() => socket.emit('answer select', gameCode, username, index)}>
                            {text}
                        </Card>
                    ))}
                </CardDeck>
            </div>
        );
    }

    return (
        <div className="view" id="play">
            {/* Show leaderboard when all players have answered */}
            {isLeaderboardVisible && <Leaderboard />}
            
            <main>
                {/* <head> <span style= {NORMAL_WEIGHT}> Round: </span> {round}  </head> */}
                <h1>
                    {username}<span style={NORMAL_WEIGHT}>, you are </span>{user.isJudge ? "judging" : "answering"}<span style={NORMAL_WEIGHT}>.</span>
                </h1>
                <div className="game-controls">
                    <span>Your prompt:</span>
                    <Card type="prompt">{prompt}</Card>
                    {user.isJudge ? <JudgeControls /> : <PlayerControls />}
                </div>
            </main>
            <Chat gameCode={gameCode} name={user.name}></Chat>
        </div>
    );
}

export default Play;
