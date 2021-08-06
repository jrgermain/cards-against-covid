import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import { useApi, send } from "../../lib/api";
import TextBox from "../../components/TextBox";
import CheckBox from "../../components/CheckBox";
import "./StartGame.css";
import Dropdown from "../../components/Dropdown";

function StartGame() {
    const history = useHistory();
    const [username, setUsername] = useState(localStorage.getItem("last-username") ?? "");
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [decks, setDecks] = useState([]);
    const [expansions, setExpansions] = useState([]);
    const [isRoundLimitEnabled, setRoundLimitEnabled] = useState(false);
    const [roundLimit, setRoundLimit] = useState(1);
    const [hasDisplayedWarning, setDisplayedWarning] = useState(false);

    // When a game is created, join that game
    useApi("gameCreated", (gameCode) => {
        send("joinGame", { gameCode, playerName: username });
    }, [username]);

    // After creating and joining a game, proceed to the wait screen
    useApi("joinedGame", ({ gameCode, playerList }) => {
        // Save the last successfully used name for future games
        try {
            localStorage.setItem("last-username", username);
        } catch (e) {
            // Not allowed, but that's ok
        }

        // Navigate to the wait screen
        history.push("/waiting", { username, gameCode, playerList });
    }, [username]);

    useApi("deckList", (deckList) => {
        // Initialize 'isSelected' to true for the first deck and false for the others
        setDecks(deckList.map((deck, i) => ({ ...deck, isSelected: i === 0 })));
    });

    useApi("packList", (packList) => {
        // Initialize 'isSelected' to false for all packs
        setExpansions(packList.map((pack) => ({ ...pack, isSelected: false })));
    });

    // On page load, get list of available cards
    useEffect(() => {
        send("getDecks");
        send("getExpansionPacks");
    }, []);

    const handleDeckChange = (e) => {
        /* Set isSelected to true for the deck whose name matches e.target.value and false for the
         * others
         */
        setDecks(decks.map((deck) => ({
            ...deck,
            isSelected: deck.name === e.target.value,
        })));

        // Reset warning state so deck size is validated again before the user creates the game
        setDisplayedWarning(false);
    };
    const handlePackChange = (selectedPack) => {
        // Toggle the value of the input that was clicked, leaving others as-is
        setExpansions(expansions.map((pack) => ({
            ...pack,
            isSelected: pack === selectedPack ? !pack.isSelected : pack.isSelected,
        })));

        // Reset warning state so deck size is validated again before the user creates the game
        setDisplayedWarning(false);
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

    const handleSubmit = () => {
        setHasSubmitted(true);

        // Make sure the user entered a name
        if (!username) {
            // No name was entered, so abort the process
            return;
        }

        const deckName = decks.find((deck) => deck.isSelected).name;
        const expansionPacks = expansions.filter((pack) => pack.isSelected);

        if (deckName === "None (expansion packs only)") {
            // Don't let the user create a game with no cards
            if (expansionPacks.length === 0) {
                toast.error("Please choose a deck or select at least one expansion pack");
                return;
            }

            // Check that there's a reasonable number of cards selected
            const numPrompts = expansionPacks.reduce((acc, curr) => acc + curr.numPrompts, 0);
            const numResponses = expansionPacks.reduce((acc, curr) => acc + curr.numResponses, 0);
            if (numPrompts < 7 || numResponses < 21) {
                // The first time the user tries to proceed, show a warning
                if (!hasDisplayedWarning) {
                    /* Build a string that includes the prompt count if less than 7, and the
                     * response count if less than 21.
                     * Examples: '5 prompts', '3 responses', or '5 prompts and 3 responses'
                     */
                    const lowCounts = [];
                    if (numPrompts === 1) {
                        lowCounts.push("1 prompt");
                    } else if (numPrompts < 7) {
                        lowCounts.push(`${numPrompts} prompts`);
                    }
                    if (numResponses === 1) {
                        lowCounts.push("1 response");
                    } else if (numResponses < 21) {
                        lowCounts.push(`${numResponses} responses`);
                    }
                    const lowCountString = lowCounts.join(" and ");
                    toast.warn(`This game only has ${lowCountString}, which seems low. If this is intentional, hit Continue again.`);
                    setDisplayedWarning(true);
                    return;
                }
            }
        }

        send("createGame", {
            deckName,
            expansionPackNames: expansionPacks.map((pack) => pack.name),
            roundLimit: isRoundLimitEnabled ? roundLimit : undefined,
        });
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
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        errorCondition={hasSubmitted && !username}
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
