import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '../components/Button';
import DeckMaker from '../components/DeckMaker';
import TextBox from '../components/TextBox';
import Ajax from '../lib/ajax';
import './Expansions.css';
import { showSuccess } from '../lib/message';

function Expansions() {
    const history = useHistory();
    const [name, setName] = useState("Untitled Expansion Pack");
    const [prompts, setPrompts] = useState([]);
    const [responses, setResponses] = useState([]);

    async function submitPack() {
        if (!name) {
            return;
        }

        // Filter out empty cards
        const filteredPrompts = prompts.filter(x => x);
        const filteredResponses = responses.filter(x => x);

        if (filteredPrompts.length === 0 && filteredResponses.length === 0) {
            window.alert("Please add at least one non-empty card");
            return;
        }

        const pack = { name, prompts: filteredPrompts, responses: filteredResponses }
        try {
            await Ajax.postJSON("/api/expansionPack", JSON.stringify(pack));
            showSuccess("Successfully saved expansion pack: " + name);
            history.goBack();
        } catch (e) {
            window.alert("There was an error saving your expansion pack. Please try again later.");
        }
    }

    const handleNameChange = e => setName(e.target.value);
    return (
        <div className="view" id="expansions">
            <h1>Build an expansion pack</h1>
            <div>
                <label htmlFor="pack-name">Name: </label>
                <TextBox
                    id="pack-name"
                    placeholder="Expansion pack name"
                    value={name}
                    onChange={handleNameChange}
                    errorCondition={!name}
                    errorMessage={"Please enter a name."}
                />
            </div>
            <div id="deck-maker-wrapper">
                <DeckMaker label="Prompts" value={prompts} onChange={setPrompts} />
                <DeckMaker label="Responses" value={responses} onChange={setResponses} />
            </div>
            <Button onClick={submitPack}>Save</Button>
        </div>
    )
}

export default Expansions;