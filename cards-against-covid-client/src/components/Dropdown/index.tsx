import React, { ReactElement, ReactText, SelectHTMLAttributes } from "react";
import "./Dropdown.css";

type DropdownProps = SelectHTMLAttributes<HTMLSelectElement> & {
    items?: ReactText[];
    selectedItem?: ReactText;
    emptyMessage?: string;
}

function Dropdown({ items = [], selectedItem, emptyMessage = "No items available", ...others }: DropdownProps): ReactElement {
    let content;
    if (items.length === 0) {
        content = <option disabled>{emptyMessage}</option>;
    } else {
        content = items.map((item) => <option key={item}>{item}</option>);
    }
    return (
        <span className="Dropdown">
            <select value={selectedItem} {...others}>{content}</select>
        </span>
    );
}

export default Dropdown;
