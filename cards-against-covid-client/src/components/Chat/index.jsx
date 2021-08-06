import React, { useState } from "react";
import ChatMessage from "./ChatMessage";
import "./Chat.css";
import ChatSubmit from "./ChatSubmit";
import { useApi } from "../../lib/api";

function Chat() {
    const [messages, setMessages] = useState([]);

    const [numRead, setNumRead] = useState(0);
    const [collapsed, setCollapsed] = useState(true);
    const toggle = () => {
        setNumRead(messages.length);
        setCollapsed(!collapsed);
    };

    const hasUnread = collapsed && numRead < messages.length;

    useApi("chatMessage", (message) => {
        setMessages([...messages, message]);
    }, [messages]);

    return (
        <aside className="panel chat" data-collapsed={collapsed}>
            <button type="button" className="panel-toggle" onClick={toggle} aria-label={collapsed ? "Open chat" : "Dismiss chat"}>Toggle Chat</button>
            {hasUnread && <span className="unread-count">{messages.length - numRead}</span>}
            <div className="chat-messages" aria-live="polite">
                {messages.map(ChatMessage)}
            </div>
            <ChatSubmit />
        </aside>
    );
}

export default Chat;
