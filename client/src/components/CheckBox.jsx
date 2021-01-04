import React from 'react';

let checkboxCount = 0;

function CheckBox({ label = "", ...others }) {
    const id = "checkbox-auto-id-" + checkboxCount++;
    return (
        <>
        <input type="checkbox" id={id} {...others} />
        <label htmlFor={id}>{label}</label>
        </>
    );
}

export default CheckBox;
