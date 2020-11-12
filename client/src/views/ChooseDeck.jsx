import React from 'react';
import Button from '../components/Button';
import Ajax from '../lib/ajax';
import { useHistory } from "react-router-dom";
import { useState } from 'react';
import { useEffect } from 'react';

function ChooseDeck() {
    const history = useHistory();
    const [errorCode, setErrorCode] = useState(0);
    const [name, setName] = useState(localStorage.getItem("player-name"));
    const [text, setText] = React.useState('');

    async function initGame() {
        console.log("NEW GAME")
        try {
            // Generate a game code and navigate to the "Waiting for players" screen
            const gameCode = await Ajax.post("./api/startGame");
            history.push("/waiting/" + gameCode);
        } catch (e) {
            console.error(e);
        }
    }


   

    function handleChange(event){
        console.log(event.target.value);
        if (event.deckId == 0){
            console.log("Player chose adult deck");
        
        }
        if(event.deckId == 1){
            console.log("Player chose kid/child deck");
        }   
    }
 
    return (
        <div className="view" id="choose-deck">
            <h1>Choose a deck</h1>


            <label htmlFor="player-name">Enter your name: </label>
                    <input id="player-name" type="text" placeholder="Your name" className={"big-text"} data-error={errorCode === 1}  value={name} onChange={e => setName(e.target.value)}></input>
                    <span className="error-text">Please enter a name.</span>

            <select>
            <option  deckId="0" onChange= {handleChange} onClick={handleChange}> Adult (18+)</option>
            <option deckId="1" onChange={handleChange} onClick={handleChange} >Child</option>
            </select>  


            <Button onClick={initGame}>Continue</Button>
        </div>
        
    );
    
}
  
export default ChooseDeck;