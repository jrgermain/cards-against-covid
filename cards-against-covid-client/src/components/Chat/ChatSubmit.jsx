import React, { useState } from "react";
import { send } from "../../lib/api";
import Button from "../Button";
import TextBox from "../TextBox";

function ChatSubmit() {
    const [value, setValue] = useState("");
    const submit = () => {
        if (value) {
            send("sendChat", value);
            setValue("");
        }
    };
    return (
        <div className="chat-submit">
            <TextBox
                aria-label="Type a message"
                placeholder="Type a message"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyPress={(event) => event.key === "Enter" && submit()}
            />
            <Button onClick={submit} aria-label="Send message">Send</Button>
        </div>
    );
}

export default ChatSubmit;
