import React from 'react';
import './Table.css';

function Table({ head, body, ...props}) {
    return (
        <table {...props}>
            <thead>
                <tr>{head.map(title => <th>{title}</th>)}</tr>
            </thead>
            <tbody>
                {body.map(row => <tr>{row.map(cell => <td>{cell}</td>)}</tr>)}
            </tbody>
        </table>
    )
}

export default Table;
