import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '../components/Button';
import DeckMaker from '../components/DeckMaker';
import Ajax from '../lib/ajax';

function Expansions() {
    const history = useHistory();
    const [prompts, setPrompts] = useState([]);
    const [responses, setResponses] = useState([]);
    const [name, setName] = useState("Untitled Expansion Pack");

    async function submitPack() {
        // Perform pre-save validations
        if (!name) {
            window.alert("Please enter a name");
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
            history.push("..");
        } catch (e) {
            console.error(e)
            window.alert("There was an error saving your expansion pack. Please try again later.");
        }
    }
     
    return (
        <div className="view" id="expansions">
            <h1>Build an expansion pack</h1>
            <div>
                <label htmlFor="deck-name">Name: </label>
                <input id="deck-name" type="text" className="big-text" value={name} onChange={event => setName(event.target.value)}></input>
            </div>
            <DeckMaker label="Prompts" value={prompts} onChange={setPrompts}></DeckMaker>
            <DeckMaker label="Responses" value={responses} onChange={setResponses}></DeckMaker>
            <Button onClick={submitPack}>Save</Button>
        </div>
    )
}

export default Expansions;