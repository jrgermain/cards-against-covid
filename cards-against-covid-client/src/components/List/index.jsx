import React from "react";
import "./List.css";

function List({ items, label, filter, map }) {
    const mapFunction = typeof map === "function" ? map : (x) => x;
    const filterFunction = typeof filter === "function" ? filter : () => true;
    const filteredItems = (items || []).filter(filterFunction).map(mapFunction);
    return (
        <div className="list">
            <span>{label}</span>
            <ul className="list">
                {filteredItems.map((item) => <li>{item}</li>)}
            </ul>
        </div>
    );
}

export default List;
