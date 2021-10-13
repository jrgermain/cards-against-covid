import React, { ReactElement, useState } from "react";
import ChatMessage from "./ChatMessage";
import "./Chat.css";
import ChatSubmit from "./ChatSubmit";
import { useApi } from "../../lib/api";
import { ChatMessageData } from "./ChatMessageData";
import { RestoreStateArgs } from "../../lib/commonTypes";

function Chat(): ReactElement {
    const [messages, setMessages] = useState<ChatMessageData[]>([]);

    const [numRead, setNumRead] = useState<number>(0);
    const [collapsed, setCollapsed] = useState<boolean>(true);
    const toggle = () => {
        setNumRead(messages.length);
        setCollapsed(!collapsed);
    };

    const hasUnread = collapsed && numRead < messages.length;

    useApi<RestoreStateArgs>("restoreState", (gameData) => {
        setMessages(gameData.chats);
    });

    useApi<ChatMessageData>("chatMessage", (message) => {
        setMessages([...messages, message]);
    }, [messages]);

    return (
        <aside className="panel chat" data-collapsed={collapsed}>
            <h1 className="sr-only">Chat</h1>
            <button type="button" className="panel-toggle" onClick={toggle} aria-label={collapsed ? "Open chat" : "Dismiss chat"}>Toggle Chat</button>
            {hasUnread && <span className="unread-count">{messages.length - numRead}</span>}
            <div className="chat-messages" aria-live="polite">
                <h2 className="sr-only">Messages</h2>
                {messages.map((messageData, i) => <ChatMessage {...messageData} key={i} />)}
                {messages.length === 0 && <span className="sr-only">No messages to display</span>}
            </div>
            <ChatSubmit />
        </aside>
    );
}

export default Chat;
