import React from "react";

function CardBlank({ index }) {
    return (
        <span className="blank">
            <span>________</span>
            {index != null && <span className="card-blank-index">{index}</span>}
        </span>
    );
}

export default CardBlank;
