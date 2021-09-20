import React, { Key, ReactElement } from "react";
import PropTypes from "prop-types";
import "./List.css";

type ListItem = string | number;

type ListProps<T = ListItem> = {
    items: T[];
    label?: string;
    filter?: (e: T, index?: number, arr?: T[]) => boolean;
    map?: (e: T, index?: number, arr?: T[]) => ListItem;
    mapKey?: (e: T, index?: number, arr?: T[]) => Key;
}

function List<T>({ items, label = "", filter, map, mapKey }: ListProps<T>): ReactElement {
    /* Provide defaults for parameters if not specified or not a function.
     * For map and filter, use a no-op. For mapKey, default to using the
     * same function as map.
     */
    const filterFunction = filter ?? (() => true);
    const mapFunction = map ?? ((x) => String(x));
    const mapKeyFunction = mapKey ?? mapFunction;

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

List.propTypes = {
    items: PropTypes.array,
    label: PropTypes.string,
    filter: PropTypes.func,
    map: PropTypes.func,
    mapKey: PropTypes.func,
};

export default List;
