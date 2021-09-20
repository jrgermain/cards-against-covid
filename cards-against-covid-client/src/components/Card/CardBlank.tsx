import React, { ReactElement } from "react";

type CardBlankProps = {
    index: number | null;
}

function CardBlank({ index }: CardBlankProps): ReactElement {
    return (
        <span className="blank">
            <span>________</span>
            {index != null && <span className="card-blank-index">{index}</span>}
        </span>
    );
}

export default CardBlank;
