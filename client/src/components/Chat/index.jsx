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
        <aside className="panel chat" data-collapsed={collapsed}>
            <button className="panel-toggle" onClick={toggle} aria-label={collapsed ? "Open chat" : "Dismiss chat"}>Toggle Chat</button>
            <div className="chat-messages" aria-live="polite">
                {messages.map(ChatMessage)}
            </div>
            <ChatSubmit gameCode={gameCode} name={name}/>            
        </aside>
    );
}

export default Chat;
