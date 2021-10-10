import React, { ReactElement, useState } from "react";
import { send } from "../../lib/api";
import Button from "../Button";
import TextBox from "../TextBox";

function ChatSubmit(): ReactElement {
    const [value, setValue] = useState<string>("");
    const submit = () => {
        if (value) {
            send("sendChat", value);
            setValue("");
        }
    };
    return (
        <div className="chat-submit">
            <TextBox
                aria-label="Compose chat message"
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
