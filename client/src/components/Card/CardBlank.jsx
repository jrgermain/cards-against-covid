import React from 'react';

function CardBlank({ index }) {
    return (
        <span className="blank">
            <span>________</span>
            {index != null && <label className="card-blank-index">{index}</label>}
        </span>
    );
}

export default CardBlank;
