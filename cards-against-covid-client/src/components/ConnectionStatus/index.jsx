import React, { useEffect, useState } from "react";
import { useApi } from "../../lib/api";
import "./ConnectionStatus.css";

function ConnectionStatus() {
    const [isConnected, setConnected] = useState(false);
    useApi("_healthStatus", (healthy) => {
        setConnected(healthy);
    });

    useEffect(() => {
        const spinner = document.querySelector(".connection-status .spinner");
        if (!spinner) {
            return;
        }
        if (isConnected) {
            spinner.style.animation = "";
        } else {
            spinner.style.animation = "show-spinner .2s ease forwards";
        }
    }, [isConnected]);

    return (
        <div className="connection-status" data-connected={Number(isConnected)}>
            <div className="spinner">
                <div className="lds-dual-ring" />
                <div className="reconnect-text">Trying to reconnect...</div>
            </div>
        </div>
    );
}

export default ConnectionStatus;
