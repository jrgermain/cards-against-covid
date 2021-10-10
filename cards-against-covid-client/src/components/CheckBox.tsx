import React, { ReactElement, InputHTMLAttributes } from "react";

type CheckBoxProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
}

let checkboxCount = 0;

function CheckBox({ label = "", ...others }: CheckBoxProps): ReactElement {
    const id = `checkbox-auto-id-${checkboxCount++}`;
    return (
        <span className="CheckBox">
            <input type="checkbox" id={id} {...others} />
            <label htmlFor={id}>{label}</label>
        </span>
    );
}

export default CheckBox;
