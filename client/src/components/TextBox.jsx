import React from 'react';

let errorCount = 0;

function TextBox({ errorMessage, errorCondition, ...inputProps }) {
    const errorId = "error-auto-id-" + errorCount++;
    return (
        <span className="text-box">
            <input {...inputProps } type="text" className="big-text" aria-invalid={errorCondition} aria-errormessage={errorId} />
            {errorCondition && <span className="error-text" id={errorId}>{errorMessage}</span>}
        </span>
    );
}

export default TextBox;
