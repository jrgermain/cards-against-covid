import React from "react";

let checkboxCount = 0;

function CheckBox({ label = "", ...others }) {
    const id = `checkbox-auto-id-${checkboxCount++}`;
    return (
        <>
            <input type="checkbox" id={id} key={`${id}_input`} {...others} />
            <label htmlFor={id} key={`${id}_label`}>{label}</label>
        </>
    );
}

export default CheckBox;
