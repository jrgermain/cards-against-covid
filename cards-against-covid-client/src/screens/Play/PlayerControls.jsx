import classNames from "classnames";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Card from "../../components/Card";
import { useApi, send } from "../../lib/api";

function PlayerControls({ role }) {
    const location = useLocation();
    const [userCards, setUserCards] = useState(location.state?.userCards ?? []);
    const [userResponses, setUserResponses] = useState(location.state?.userResponses ?? []);
    const [numBlanks, setNumBlanks] = useState(location.state?.numBlanks ?? 1);
    const [disabled, setDisabled] = useState(false);

    // When the player selects a card, update the state with the currently selected cards
    useApi("cardSelected", (responses) => {
        setUserResponses(responses);
    });

    // When a new round starts, update the state
    useApi("newRound", (gameData) => {
        if (gameData.role === "answering") {
            setUserCards(gameData.userCards);
            setUserResponses(gameData.userResponses);
            setNumBlanks(gameData.numBlanks);
            setDisabled(false);
        }
    });

    // When the page is refreshed, load the correct data
    useApi("restoreState", (gameData) => {
        if (gameData.role === "answering") {
            setUserCards(gameData.userCards);
            setUserResponses(gameData.userResponses);
            setNumBlanks(gameData.numBlanks);
            setDisabled(gameData.isLocked);
        }
    });

    useApi("lockPlayerInputs", () => { setDisabled(true); });

    if (role !== "answering") {
        return <></>;
    }

    return (
        <div className={classNames("player-controls", { disabled })} aria-disabled={disabled}>
            <div className="deck" aria-label={`Your response cards; select ${numBlanks}`}>
                {userCards.map((text, index) => (
                    /* Create a <Card> element for each of the user's cards. When clicked, a
                     * message is sent to the server, where the selection logic takes place.
                     * The client does not handle this optimistically; the local state is only
                     * updated once the server processes the selection and sends a response.
                     */
                    <Card
                        type="response"
                        showIndex={numBlanks > 1}
                        selectedIndex={userResponses.indexOf(text)}
                        onClick={() => send("selectCard", index)}
                        disabled={disabled}
                    >
                        {text}
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default PlayerControls;
