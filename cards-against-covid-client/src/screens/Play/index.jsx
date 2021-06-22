import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { socket } from "../../serverConfig";
import Card from "../../components/Card";
import Chat from "../../components/Chat";
import List from "../../components/List";
import "./Play.css";
import Leaderboard from "../../components/Leaderboard";
import * as socketListener from "../../redux/socket";

const NORMAL_WEIGHT = { fontWeight: "normal" };

function Play() {
    const history = useHistory();

    const gameCode = useSelector((state) => state.gameCode);
    const players = useSelector((state) => state.players.filter((player) => player.isConnected));
    const prompt = useSelector((state) => state.prompt);
    const cardsRequired = useSelector((state) => state.prompt.match(/_+/g)?.length ?? 1);
    const username = useSelector((state) => state.user.name);
    const user = useSelector((state) => state.players.find((player) => player.name === username));
    const isLeaderboardVisible = useSelector((state) => state.status.isLeaderboardVisible);
    const judgeName = useSelector((state) => state.players.find((player) => player.isJudge)?.name);
    const status = useSelector((state) => state.status.name);
    const round = useSelector((state) => state.status.round);
    const roundMax = useSelector((state) => state.status.maxRounds);

    useEffect(() => {
        // Make sure we are listening for state updates
        socketListener.start();

        // The page either loaded for the first time or refreshed. If it refreshed, rejoin the room.
        socket.emit("client reload", gameCode, username);

        // When the client is disconnected, add a css style to show a visual hint
        socket.on("connect", () => document.getElementById("play")?.classList.remove("disconnected"));
        socket.on("reconnect", () => document.getElementById("play")?.classList.remove("disconnected"));
        socket.on("disconnect", () => document.getElementById("play")?.classList.add("disconnected"));
    }, []);

    useEffect(() => {
        if (status === "ENDED") {
            history.replace("/game-over");
        }
    }, [status]);

    if (!user) {
        history.replace("/");
        return <></>;
    }

    /* Given a player, test if they need to submit at least one card. This is true if they are not a
     * judge and they haven't selected the required number of cards.
     */
    const needsToAnswer = (player) => !player.isJudge && player.responses.length < cardsRequired;

    // The game controls unique to a player who is judging
    const JudgeControls = () => {
        if (players.some(needsToAnswer)) {
            return <List label="Still waiting on responses from:" items={players} filter={needsToAnswer} map={(player) => player.name} />;
        }
        const responsePlayers = players.filter((player) => !player.isJudge);

        // Get an array of <Card> elements displaying each player's responses
        const responseCards = responsePlayers.map((player) => {
            // When a card is clicked, send a socket event saying the judge selected a card
            const onClick = !isLeaderboardVisible && (() => socket.emit("judge select", gameCode, player.name));
            return <Card type="response" onClick={onClick}>{player.responses}</Card>;
        });
        return (
            <div className="judge-controls">
                <h2>Select a winning response</h2>
                <div className="deck" aria-label="Player responses; select a favorite">{responseCards}</div>
            </div>
        );
    };

    // The game controls unique to a player who is answering
    const PlayerControls = () => {
        // Only enable controls if not all players have answered yet
        const isEnabled = players.some(needsToAnswer);
        const enabledClass = isEnabled ? "" : " disabled";

        // If more than one card is required, add a multi-select class to the element
        return (
            <div className={`player-controls${enabledClass}`} aria-disabled={!isEnabled}>
                <div className="deck" aria-label={`Your response cards; select ${cardsRequired}`}>
                    {user.cards.map((text, index) => (
                        /* Create a <Card> element for each of the user's cards. When clicked, a
                         * socket event is sent to the server, where the selection logic takes
                         * place.
                         */
                        <Card type="response" showIndex={cardsRequired > 1} selectedIndex={user.responses.indexOf(text)} onClick={!isLeaderboardVisible && (() => socket.emit("answer select", gameCode, username, index))}>
                            {text}
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="view" id="play">
            {/* Show leaderboard when all players have answered */}
            {isLeaderboardVisible && <Leaderboard />}

            <main>
                <div className="round" aria-label={`Round ${round} of ${roundMax}`}>
                    Round
                    {round}
                    /
                    {roundMax}
                </div>
                <h1>
                    {username}
                    <span style={NORMAL_WEIGHT}>, you are </span>
                    {user.isJudge ? "judging" : "answering"}
                    <span style={NORMAL_WEIGHT}>.</span>
                </h1>
                {/* If player is not the judge, show who is */}
                {!user.isJudge && (
                    <div className="judge-name">
                        <strong>{judgeName}</strong>
                        {" "}
                        is judging.
                    </div>
                )}

                <div className="game-controls">
                    <h2>Your prompt:</h2>
                    <Card type="prompt">{prompt}</Card>
                    {user.isJudge ? <JudgeControls /> : <PlayerControls />}
                </div>
            </main>
            <Chat gameCode={gameCode} name={user.name} />
        </div>
    );
}

export default Play;
