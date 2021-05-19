import React, { useState } from 'react';
import ChatMessage from './ChatMessage';
import './Chat.css';
import ChatSubmit from './ChatSubmit';
import { useSelector } from 'react-redux';

function Chat({ gameCode, name }) {
    const messages = useSelector(state => state.messages);

    const [numRead, setNumRead] = useState(0);
    const [collapsed, setCollapsed] = useState(true);
    const toggle = () => {
        setNumRead(messages.length);
        setCollapsed(!collapsed);
    }

    const hasUnread = collapsed && numRead < messages.length;

    return (
        <aside className="panel chat" data-collapsed={collapsed}>
            <button className="panel-toggle" onClick={toggle} aria-label={collapsed ? "Open chat" : "Dismiss chat"}>Toggle Chat</button>
            {hasUnread && <span className="unread-count">{messages.length - numRead}</span>}
            <div className="chat-messages" aria-live="polite">
                {messages.map(ChatMessage)}
            </div>
            <ChatSubmit gameCode={gameCode} name={name}/>            
        </aside>
    );
}

export default Chat;
