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

    useEffect(() => {
        // The page either loaded for the first time or refreshed. If it refreshed, rejoin the room.
        socket.emit("client reload", gameCode, username);
    }, []);

    if (!user) {
        history.push("/");
        return <></>;
    }

    const needsToAnswer = player => !player.isJudge && player.responses.length < cardsRequired;

    const JudgeControls = () => {
        if (players.some(needsToAnswer)) {
            return <List label="Still waiting on responses from:" items={players} filter={needsToAnswer} map={player => player.name} />
        } else {
            const responsePlayers = players.filter(player => !player.isJudge);
            const responseCards = responsePlayers.map(player => {
                const onClick = () => socket.emit("judge select", gameCode, player.name);
                return <Card onClick={onClick} isForJudge={true}>{player.responses}</Card>
            });
            return (
                <div className="judge-controls">
                    <h2>Select a winning response</h2>
                    <CardDeck>{responseCards}</CardDeck>
                </div>
            );
        }
    }
    const PlayerControls = () => {
        // Only enable controls if not all players have answered yet
        const isEnabled = players.some(needsToAnswer);
        const enabledClass = isEnabled ? "" : " disabled";
        const multiSelectClass = cardsRequired > 1 ? " multi-select" : "";
        return (
            <div className={"player-controls" + enabledClass + multiSelectClass}>
                <CardDeck>
                    {user.cards.map((text, index) => (
                        <Card selectedIndex={user.responses.indexOf(text)} onClick={() => socket.emit('answer select', gameCode, username, index)}>
                            {text}
                        </Card>
                    ))}
                </CardDeck>
            </div>
        );
    }

    return (
        <div className="view" id="play">
            <Leaderboard />
            <main>
                <h1>
                    {username}<span style={NORMAL_WEIGHT}>, you are </span>{user.isJudge ? "judging" : "answering"}<span style={NORMAL_WEIGHT}>.</span>
                </h1>
                <div className="game-controls">
                    <span>Your prompt:</span>
                    <Card isPrompt>{prompt}</Card>
                    {user.isJudge ? <JudgeControls /> : <PlayerControls />}
                </div>
            </main>
            <Chat gameCode={gameCode} name={user.name}></Chat>
        </div>
    );
}

export default Play;
