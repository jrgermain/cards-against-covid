import React from "react";
import "./List.css";

function List({ items, label, filter, map, mapKey }) {
    /* Provide defaults for parameters if not specified or not a function.
     * For map and filter, use a no-op. For mapKey, default to using the
     * same function as map.
     */
    const mapFunction = typeof map === "function" ? map : (x) => x;
    const filterFunction = typeof filter === "function" ? filter : () => true;
    const mapKeyFunction = typeof mapKey === "function" ? mapKey : mapFunction;

    // Generate an array of 2-tuples holding the key (used by React) and content for each list item
    const filteredItems = (items || [])
        .filter(filterFunction)
        .map((item, i, arr) => [mapKeyFunction(item, i, arr), mapFunction(item, i, arr)]);

    return (
        <div className="list">
            <span>{label}</span>
            <ul className="list">
                {filteredItems.map(([key, item]) => <li key={key}>{item}</li>)}
            </ul>
        </div>
    );
}

export default List;
