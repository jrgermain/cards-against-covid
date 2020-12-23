import React, { useState } from 'react';
import ChatMessage from './ChatMessage';
import './Chat.css';
import TextBox from './TextBox';

const DEMO_STATE = [
    { sender: "joey", content: "This is a test message"},
    { sender: "joey", content: "This is another test message"},
    { sender: "amanda", content: "Stop spamming"}
];

function Chat() {
    const [messages, setMessages] = useState(DEMO_STATE);
    
    return (
        <div className="panel chat">
            <button className="panel-toggle">Hide Chat</button>
            <div className="chat-messages">
                {messages.map(ChatMessage)}
            </div>
            <TextBox placeholder="Type a message" />
        </div>
    );
}

export default Chat;
