import React, { useState } from 'react';
import ChatMessage from './ChatMessage';
import './Chat.css';
import ChatSubmit from './ChatSubmit';
import { useSelector } from 'react-redux';

function Chat({ gameCode, name }) {
    const messages = useSelector(state => state.messages);

    const [collapsed, setCollapsed] = useState(true);
    const toggle = () => setCollapsed(!collapsed);

    return (
        <div className="panel chat" data-collapsed={+collapsed}>
            <button className="panel-toggle" onClick={toggle}>Toggle Chat</button>
            <div className="chat-messages">
                {messages.map(ChatMessage)}
                </div>
            <ChatSubmit gameCode={gameCode} name={name}/>            
        </div>
    );
}

export default Chat;
