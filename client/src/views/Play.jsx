import React, { Component } from 'react';
import AnsweringControls from '../components/AnsweringControls';
import Chat from '../components/Chat';
import JudgingControls from '../components/JudgingControls';
import './Play.css';

class Play extends Component {
    constructor() {
        super();
        this.state = { name: "Joey", role: "answering"}
    }
    render() {
        return (
            <div className="view" id="play">
                <main>
                    <h1>
                        {this.state.name}<span style={{fontWeight: "normal"}}>, you are </span><span>{this.state.role}</span><span style={{fontWeight: "normal"}}>.</span>
                    </h1>
                    {this.state.role === "judging" ? <JudgingControls></JudgingControls> : <AnsweringControls></AnsweringControls>}
                    <button className="panel-toggle">Show Chat</button>
                </main>
                <Chat></Chat>
            </div>
          );
    }
}

export default Play;
