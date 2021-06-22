import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import * as api from "../../lib/api";
import TextBox from "../../components/TextBox";
import CheckBox from "../../components/CheckBox";
import "./StartGame.css";
import Dropdown from "../../components/Dropdown";

function StartGame() {
    const history = useHistory();
    const dispatch = useDispatch();

    const user = useSelector((state) => state.user);

    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [decks, setDecks] = useState([]);
    const [expansions, setExpansions] = useState([]);
    const [isRoundLimitEnabled, setRoundLimitEnabled] = useState(false);
    const [roundLimit, setRoundLimit] = useState(1);

    /* On page load, get list of available cards. Use a useEffect so this doesn't happen every time
     * the user selects something.
     */
    useEffect(() => {
        api.getJson("deckList").then((deckList) => {
            // Set isSelected to true for the first deck and false for the others
            deckList.forEach((deck, i) => {
                deck.isSelected = i === 0;
            });
            setDecks(deckList);
        });
        api.getJson("expansionList").then((expansionPackList) => {
            // Initialize all expansion packs to not selected
            expansionPackList.forEach((expansionPack) => {
                expansionPack.isSelected = false;
            });
            setExpansions(expansionPackList);
        });
    }, []);

    const handleDeckChange = (e) => {
        /* Set isSelected to true for the deck whose name matches e.target.value and false for the
         * others
         */
        setDecks(decks.map((deck) => ({
            ...deck,
            isSelected: deck.name === e.target.value,
        })));
    };
    const handlePackChange = (selectedPack) => {
        // Toggle the value of the input that was clicked, leaving others as-is
        setExpansions(expansions.map((pack) => ({
            ...pack,
            isSelected: pack === selectedPack ? !pack.isSelected : pack.isSelected,
        })));
    };
    const handleToggleRoundLimit = (event) => {
        setRoundLimitEnabled(event.target.checked);
    };
    const handleChangeNumRounds = (event) => {
        setRoundLimit(event.target.value);
    };
    const handleBlurNumRounds = () => {
        // Make sure number is a positive integer, in case the user typed in a bad value
        setRoundLimit(Math.max(Math.floor(roundLimit), 1));
    };

    const handleSubmit = async () => {
        setHasSubmitted(true);

        // Make sure the user entered a name
        if (!user.name) {
            // No name was entered, so abort the process
            return;
        }

        /* If the user has a game where there are not enough cards selected, show an error and
         * prevent them from continuing.
         */
        const deckName = decks.find((deck) => deck.isSelected).name;
        const expansionPacks = expansions.filter((pack) => pack.isSelected);
        if (deckName === "None (expansion packs only)" && expansionPacks.length === 0) {
            toast.error("Please choose a deck or select at least one expansion pack");
            return;
        } if (deckName === "None (expansion packs only)") {
            // Make sure there's a reasonable number of cards selected
            const numPrompts = expansionPacks.reduce((acc, curr) => acc + curr.numPrompts, 0);
            const numResponses = expansionPacks.reduce((acc, curr) => acc + curr.numResponses, 0);
            if (numPrompts < 7 || numResponses < 21) {
                toast.error("Please include at least 7 prompt and 21 response cards");
                return;
            }
        }

        // Create a game, then join it
        let gameCode;
        try {
            const gameDetails = {
                deckName,
                expansionPacks: expansionPacks.map((pack) => pack.name),
            };
            if (isRoundLimitEnabled) {
                gameDetails.roundLimit = roundLimit;
            }
            gameCode = await api.post("startGame", gameDetails);
            await api.post("joinGame", { code: gameCode, name: user.name });
        } catch (e) {
            toast.error("There was an error creating your game. Please try again later.");
            return;
        }

        // Save the last good game code and name for future games (or if user gets disconnected)
        localStorage.setItem("last-username", user.name);
        localStorage.setItem("last-game-code", gameCode);

        // Everything went ok. Set the new game code, then move to the wait screen.
        dispatch({ type: "gameCode/set", payload: gameCode });
        history.replace("/waiting");
    };

    return (
        <main className="view" id="start-game">
            <div className="view-content">
                <h1>Start a game</h1>

                <div>
                    <label htmlFor="player-name">Enter your name: </label>
                    <TextBox
                        id="player-name"
                        placeholder="Your name"
                        value={useSelector((state) => state.user.name)}
                        onChange={(e) => dispatch({ type: "user/setName", payload: e.target.value })}
                        errorCondition={hasSubmitted && !user.name}
                        errorMessage="Please enter a name."
                    />
                </div>

                <h2 className="header-css" id="choose-deck">Choose a deck:</h2>
                <Dropdown
                    items={decks.map((d) => d.name)}
                    selectedItem={decks.find((deck) => deck.isSelected)?.name}
                    emptyMessage="Loading decks..."
                    onChange={handleDeckChange}
                    aria-labelledby="choose-deck"
                />

                <h2 className="header-css" id="choose-expansion-pack">Choose expansion pack(s):</h2>
                <div className="expansion-packs">
                    {/* Header */}
                    <strong>Select</strong>
                    <strong>Name</strong>
                    <strong>Prompts</strong>
                    <strong>Responses</strong>

                    {/* Content */}
                    {expansions.map((pack) => (
                        <>
                            <CheckBox
                                key={`${pack.name}_checkBox`}
                                label={pack.name}
                                onChange={() => handlePackChange(pack)}
                                checked={pack.isSelected}
                            />
                            <span key={`${pack.name}_numPrompts`} className="pack-num-prompts" title="Prompt cards">{pack.numPrompts}</span>
                            <span key={`${pack.name}_numResponses`} className="pack-num-responses" title="Response cards">{pack.numResponses}</span>
                        </>
                    ))}
                </div>

                <h2 className="header-css" id="choose-game-settings">Choose game settings:</h2>
                <div className="game-settings">
                    <CheckBox label="Limit the number of rounds" checked={isRoundLimitEnabled} onChange={handleToggleRoundLimit} />
                    {isRoundLimitEnabled
                        && (
                            <>
                                <input
                                    className="round-limit"
                                    type="number"
                                    min="1"
                                    max="999"
                                    step="1"
                                    value={roundLimit}
                                    onChange={handleChangeNumRounds}
                                    onBlur={handleBlurNumRounds}
                                />
                                <div className="round-limit-disclaimer">
                                    NOTE: if there are not enough cards to play this many rounds,
                                    this value is ignored.
                                </div>
                            </>
                        )}
                </div>
            </div>
            <Button onClick={handleSubmit}>Continue</Button>
        </main>
    );
}

export default StartGame;
