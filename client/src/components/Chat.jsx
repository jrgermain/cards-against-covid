import React, { Component } from 'react';
import './Chat.css';

class Chat extends Component {
    constructor() {
        super();
        this.state = {
            messages: [
                {sender: "Joey", content: "Peepeepoopoo"}
            ]
        }
    }

    render() {
        return (
            <div className="panel chat">
                <button className="panel-toggle">Hide Chat</button>
                <div className="chat-messages">
                    {this.state.messages.map(ChatMessage)}
                </div>
                <input type="text" placeholder="Type a message" className="big-text"></input>
            </div>
        );
    }
}

function ChatMessage({sender, content}) {
    return (
        <div className="chat-message">
            <strong>{sender}</strong>
            <span>{content}</span>
        </div>
    );
}

export default Chat;
