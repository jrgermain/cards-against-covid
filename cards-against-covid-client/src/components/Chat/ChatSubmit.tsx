import React, { ChangeEvent, KeyboardEvent, ReactElement, useState } from "react";
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
                aria-label="Type a message"
                placeholder="Type a message"
                value={value}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
                onKeyPress={(event: KeyboardEvent<HTMLInputElement>) => event.key === "Enter" && submit()}
            />
            <Button onClick={submit} aria-label="Send message">Send</Button>
        </div>
    );
}

export default ChatSubmit;
