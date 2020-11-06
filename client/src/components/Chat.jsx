import React, { useState } from 'react';
import ChatMessage from './ChatMessage';
import './Chat.css';

const DEMO_STATE = [
    { sender: "joey", content: "This is a test message"},
    { sender: "joey", content: "This is another test message"},
    { sender: "amanda", content: "Stop spamming"}
];

function Chat() {
    // const [messages, setMessages] = useState([]);
    const [messages, setMessages] = useState(DEMO_STATE);
    
    return (
        <div className="panel chat">
            <button className="panel-toggle">Hide Chat</button>
            <div className="chat-messages">
                {messages.map(ChatMessage)}
            </div>
            <input type="text" placeholder="Type a message" className="big-text"></input>
        </div>
    );
}

export default Chat;
