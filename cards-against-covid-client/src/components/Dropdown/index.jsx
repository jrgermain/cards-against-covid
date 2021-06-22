import React from "react";
import "./Dropdown.css";

function Dropdown({ items = [], selectedItem, emptyMessage = "No items available", ...props }) {
    let content;
    if (items.length === 0) {
        content = <option disabled>{emptyMessage}</option>;
    } else {
        content = items.map((item) => <option key={item}>{item}</option>);
    }
    return <select className="Dropdown" value={selectedItem} {...props}>{content}</select>;
}

export default Dropdown;
