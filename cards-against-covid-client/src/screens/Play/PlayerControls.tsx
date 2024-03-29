import classNames from "classnames";
import React, { ReactElement, useState } from "react";
import { useLocation } from "react-router-dom";
import Card from "../../components/Card";
import { useApi, send } from "../../lib/api";
import { NewRoundArgs, PlayerRole, RestoreStateArgs } from "../../lib/commonTypes";
import ButtonGroup from "../../components/ButtonGroup";

type PlayerControlsProps = {
    role: PlayerRole;
    disabled?: boolean;
}

interface PlayerControlsLocationState {
    userCards?: string[];
    userResponses?: string[];
    numBlanks?: number;
}

function PlayerControls({ role, disabled }: PlayerControlsProps): ReactElement {
    const location = useLocation<PlayerControlsLocationState>();
    const [userCards, setUserCards] = useState<string[]>(location.state?.userCards ?? []);
    const [userResponses, setUserResponses] = useState<string[]>(location.state?.userResponses ?? []);
    const [numBlanks, setNumBlanks] = useState<number>(location.state?.numBlanks ?? 1);
    const [isLocked, setLocked] = useState<boolean>(false);
    const isDisabled = isLocked || disabled;

    // When the player selects a card, update the state with the currently selected cards
    useApi<string[]>("cardSelected", (responses) => {
        setUserResponses(responses);
    });

    // When a new round starts, update the state
    useApi<NewRoundArgs>("newRound", (gameData) => {
        if (gameData.role === "answering") {
            setUserCards(gameData.userCards ?? []);
            setUserResponses(gameData.userResponses ?? []);
            setNumBlanks(gameData.numBlanks);
            setLocked(false);
        }
    });

    // When the page is refreshed, load the correct data
    useApi<RestoreStateArgs>("restoreState", (gameData) => {
        if (gameData.role === "answering") {
            setUserCards(gameData.userCards ?? []);
            setUserResponses(gameData.userResponses ?? []);
            setNumBlanks(gameData.numBlanks);
            setLocked(gameData.isLocked);
        }
    });

    useApi("lockPlayerInputs", () => { setLocked(true); });

    if (role !== "answering") {
        return <></>;
    }

    return (
        <div className={classNames("player-controls", { disabled: isDisabled })} aria-disabled={isDisabled}>
            <ButtonGroup
                className="deck"
                aria-label={`Your response cards; select ${numBlanks}`}
                disabled={isDisabled}
            >
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
                        disabled={isDisabled}
                        key={index}
                    >
                        {text}
                    </Card>
                ))}
            </ButtonGroup>
        </div>
    );
}

export default PlayerControls;
