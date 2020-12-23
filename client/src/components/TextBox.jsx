import React from 'react';

function TextBox({ errorMessage, errorCondition, placeholder, id, onChange, onKeyPress, value, ...inputProps }) {
    return (
        <span className="text-box">
            <input {...{ id, placeholder, onChange, onKeyPress, value, ...inputProps }} type="text" className="big-text" data-error={errorCondition} />
            {errorCondition && <span className="error-text">{errorMessage}</span>}
        </span>

    );
}

export default TextBox;
