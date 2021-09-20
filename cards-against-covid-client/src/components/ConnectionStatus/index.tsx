import React, { ReactElement, useState } from "react";
import { useApi } from "../../lib/api";
import "./ConnectionStatus.css";

function ConnectionStatus(): ReactElement {
    const [isConnected, setConnected] = useState<boolean>(true);
    useApi<boolean>("_healthStatus", (healthy) => {
        setConnected(healthy);
    });

    return (
        <div className="connection-status" data-connected={Number(isConnected)}>
            {!isConnected && (
                <div className="spinner">
                    <div className="lds-dual-ring" />
                    <div className="reconnect-text">Trying to reconnect...</div>
                </div>
            )}
        </div>
    );
}

export default ConnectionStatus;
