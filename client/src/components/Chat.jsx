import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../index';
import ChatMessage from './ChatMessage';
import './Chat.css';
import ChatSubmit from './ChatSubmit';

function Chat({ gameCode, name }) {
    const [messages, setMessages] = useState([]);
    const messagesRef = useRef(messages);
    const addMessage = message => {
        const allMessages = messagesRef.current.concat(message);
        messagesRef.current = allMessages;
        setMessages(allMessages);
    };
    useEffect(() => {
        socket.on("new message", addMessage);
    }, []);

    return (
        <div className="panel chat">
            <button className="panel-toggle">Hide Chat</button>
            <div className="chat-messages">
                {messages.map(ChatMessage)}
            </div>
            <ChatSubmit gameCode={gameCode} name={name}/>
        </div>
    );
}

export default Chat;
