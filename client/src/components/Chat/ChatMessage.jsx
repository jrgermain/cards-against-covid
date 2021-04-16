import React from 'react';

function ChatMessage({ sender, content }) {
    return (
        <div className="chat-message">
            <strong>{sender}</strong>
            <span>{content}</span>
        </div>
    );
}

export default ChatMessage;
