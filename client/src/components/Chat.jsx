import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../index';
import ChatMessage from './ChatMessage';
import './Chat.css';
import TextBox from './TextBox';
import Button from '../components/Button';

function Chat({ gameCode, name }) {
    const [messages, setMessages] = useState([]);
    const messagesRef = useRef(messages);
    const setMessagesRef = data => {
        messagesRef.current = data;
        setMessages(data);
    };
    useEffect(() => {
        socket.on("new message", message => {
            console.log(messages, message)
            setMessagesRef([...messagesRef.current, message]);
        });
    }, []);

    return (
        <div className="panel chat">
            <button className="panel-toggle">Hide Chat</button>
            <div className="chat-messages">
                {messages.map(ChatMessage)}
            </div>
            <TextBox id="chat-message" placeholder="Type a message" />
            <Button onClick={() => socket.emit("new message", gameCode, name, document.getElementById("chat-message").value)}>Send</Button>
        </div>
    );
}

export default Chat;
