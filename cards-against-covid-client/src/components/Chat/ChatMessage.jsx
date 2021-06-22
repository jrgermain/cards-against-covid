import React from "react";

function ChatMessage({ sender, content }) {
    return (
        <div className="chat-message" aria-label={`${sender} says: ${content}`}>
            <strong aria-hidden="true">{sender}</strong>
            <span aria-hidden="true">{content}</span>
        </div>
    );
}

export default ChatMessage;
