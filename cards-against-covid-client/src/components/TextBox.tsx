import React, { InputHTMLAttributes, ReactElement } from "react";

type TextBoxProps = InputHTMLAttributes<HTMLInputElement> & {
    errorMessage?: string;
    errorCondition?: boolean;
}

let errorCount = 0;

function TextBox({ errorMessage, errorCondition, ...others }: TextBoxProps): ReactElement {
    const errorId = `error-auto-id-${errorCount++}`;
    return (
        <span className="text-box">
            <input {...others} type="text" className="big-text" aria-invalid={errorCondition} aria-errormessage={errorId} />
            {errorCondition && <span className="error-text" id={errorId}>{errorMessage}</span>}
        </span>
    );
}

export default TextBox;
