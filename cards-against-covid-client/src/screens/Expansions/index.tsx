import React, { ChangeEvent, ReactElement, useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import DeckMaker from "../../components/DeckMaker";
import TextBox from "../../components/TextBox";
import { useApi, send } from "../../lib/api";
import "./Expansions.css";

function Expansions(): ReactElement {
    const history = useHistory();

    const [name, setName] = useState<string>("Untitled Expansion Pack");
    const [prompts, setPrompts] = useState<string[]>([]);
    const [responses, setResponses] = useState<string[]>([]);

    // When a pack is created, show a message and move back to the home screen
    useApi("expansionPackCreated", (packName) => {
        toast.success(`Successfully saved expansion pack: ${packName}`);
        history.push("/");
    });

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

        send("createExpansionPack", {
            name,
            prompts: filteredPrompts,
            responses: filteredResponses,
        });
    }

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => setName(e.target.value);
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
                    <DeckMaker
                        label="Prompts"
                        description="Prompt cards"
                        cards={prompts}
                        setCards={setPrompts}
                    />
                </section>
                <section aria-label="Add response cards">
                    <DeckMaker
                        label="Responses"
                        description="Response cards"
                        cards={responses}
                        setCards={setResponses}
                    />
                </section>
            </div>
            <Button onClick={submitPack}>Save</Button>
        </main>
    );
}

export default Expansions;
