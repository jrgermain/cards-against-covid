import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import DeckMaker from "../../components/DeckMaker";
import TextBox from "../../components/TextBox";
import * as api from "../../lib/api";
import "./Expansions.css";

function Expansions() {
    const history = useHistory();

    const [name, setName] = useState("Untitled Expansion Pack");
    const [prompts, setPrompts] = useState([]);
    const [responses, setResponses] = useState([]);

    // Perform basic validations, then send to the server and process response
    async function submitPack() {
        if (!name) {
            // The pack needs a name. This will display an error with no further action required.
            return;
        }

        // Filter out empty cards
        const filteredPrompts = prompts.filter((x) => x);
        const filteredResponses = responses.filter((x) => x);

        // Validate pack size
        if (filteredPrompts.length === 0 && filteredResponses.length === 0) {
            toast.error("Please add at least one non-empty card");
            return;
        }

        const pack = { name, prompts: filteredPrompts, responses: filteredResponses };
        try {
            await api.post("expansionPack", pack);
        } catch (e) {
            /* An error response was received. If it was a known error, display it.
             * Otherwise, log it and display a generic message.
             */
            if (e === "Bad Request") {
                toast.error("A pack with this name already exists. Please choose a new name.");
            } else {
                toast.error("An unexpected error occurred.");
            }
            return;
        }

        /* We got a success response, so the pack must have been saved.
         * Bring the user back to the previous page.
         */
        toast.success(`Successfully saved expansion pack: ${name}`);
        history.push("/");
    }

    const handleNameChange = (e) => setName(e.target.value);
    return (
        <main className="view" id="expansions">
            <h1>Build an expansion pack</h1>
            <section aria-label="Name your expansion pack">
                <label htmlFor="pack-name">Name: </label>
                <TextBox
                    id="pack-name"
                    placeholder="Expansion pack name"
                    value={name}
                    onChange={handleNameChange}
                    errorCondition={!name}
                    errorMessage="Please enter a name."
                />
            </section>
            <div className="deck-maker-wrapper">
                <section aria-label="Add prompt cards">
                    <DeckMaker label="Prompts" cards={prompts} setCards={setPrompts} />
                </section>
                <section aria-label="Add response cards">
                    <DeckMaker label="Responses" cards={responses} setCards={setResponses} />
                </section>
            </div>
            <Button onClick={submitPack}>Save</Button>
        </main>
    );
}

export default Expansions;
