import React from 'react';
import './List.css';

function List({ items, filter, label, jsxMapping }) {
    const mapping = typeof jsxMapping === "function" ? jsxMapping : item => <li>{item}</li>;
    const filterFunction = typeof filter === "function" ? filter : () => true;
    const filteredItems = (items || []).filter(filterFunction);
    return (
        <div className="list">
            <label>{label}</label>
            <ul className="list">
                {filteredItems.map(mapping)}
            </ul>
        </div>
    );
}

export default List;
