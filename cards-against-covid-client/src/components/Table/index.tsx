/* eslint-disable react/no-array-index-key -- data is of unspecified type, not necessarily unique */
import React, { ReactChild, ReactElement, TableHTMLAttributes } from "react";
import "./Table.css";

type TableProps = TableHTMLAttributes<HTMLTableElement> & {
    head: ReactChild[];
    body: ReactChild[][];
}

function Table({ head, body, ...others }: TableProps): ReactElement {
    return (
        <table {...others}>
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
