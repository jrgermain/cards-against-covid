import React, { ReactElement } from "react";
import { ChatMessageData } from "./ChatMessageData";

type ChatMessageProps = ChatMessageData;

function ChatMessage({ sender, content }: ChatMessageProps): ReactElement {
    return (
        <div className="chat-message" aria-label={`${sender} says: ${content}`}>
            <strong aria-hidden="true">{sender}</strong>
            <span aria-hidden="true">{content}</span>
        </div>
    );
}

export default ChatMessage;
