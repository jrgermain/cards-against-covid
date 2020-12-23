import React from 'react';

function TextBox({ errorMessage, errorCondition, ...inputProps }) {
    return (
        <span className="text-box">
            <input {...inputProps } type="text" className="big-text" data-error={errorCondition} />
            {errorCondition && <span className="error-text">{errorMessage}</span>}
        </span>
    );
}

export default TextBox;
