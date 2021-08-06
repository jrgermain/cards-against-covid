/* eslint-disable react/no-array-index-key -- data is of unspecified type, not necessarily unique */
import React from "react";
import "./Table.css";

function Table({ head, body, ...props }) {
    return (
        <table {...props}>
            <thead>
                <tr>{head.map((title, i) => <th key={i}>{title}</th>)}</tr>
            </thead>
            <tbody>
                {body.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default Table;
