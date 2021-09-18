import { useEffect } from "react";
import { toast } from "react-toastify";

const wsEndpoint = `ws://${window.location.hostname}:8080`;
let socket = new WebSocket(wsEndpoint);
let sendQueue = [];
const handlers = new Map(); // name: string => handlers: Set<function>
let isHealthy = true;

/**
 * Send a message to the server via WebSocket. If the WebSocket connection is not open, add it to a
 * queue to be sent once the connection becomes open.
 */
function send(event, payload) {
    const message = `CAC:${event}:${JSON.stringify(payload ?? null)}`;
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
    } else {
        sendQueue.push(message);
    }
}

window.setInterval(() => {
    if (sendQueue.length && socket.readyState === WebSocket.OPEN) {
        // Send the first message on the send queue
        socket.send(sendQueue.shift());
    }
}, 200);

// Add an event listener
function on(eventName, eventHandler) {
    // Make sure there is a set to hold handlers for this event
    if (!handlers.has(eventName)) {
        handlers.set(eventName, new Set());
    }
    handlers.get(eventName).add(eventHandler);
}

// Remove an event listener
function off(eventName, eventHandler) {
    handlers.get(eventName)?.delete(eventHandler);
}

/**
 * Defines an event handler that is active for the lifecycle of the calling component and
 * automatically unsubscribes when that component is removed. If dependencies are specified, the
 * handler is automatically removed and re-added with updated values when any of the dependencies
 * change.
 *
 * @param eventName The name of the event
 * @param handler A function that is called when the event occurs
 * @param deps Any outside values used by the function that are subject to change
 */
function useApi(eventName, handler, deps = []) {
    useEffect(() => {
        on(eventName, handler);
        return function cleanup() {
            off(eventName, handler);
        };
    }, deps);
}

function handleEvent(event, payload) {
    if (handlers.get(event)?.size) {
        Array.from(handlers.get(event)).forEach((handler) => {
            handler(payload);
        });
    }
}

function setHealthy(newValue) {
    handleEvent("_healthStatus", newValue);
    isHealthy = newValue;
}
function getHealthy() {
    return isHealthy && socket.readyState !== WebSocket.CLOSED;
}
function resetHealth() {
    isHealthy = false;
}

function onMessage(messageEvent) {
    if (!messageEvent) {
        return;
    }

    // If we receive a message, assume the connection is working
    setHealthy(true);
    try {
        const { event, payload } = JSON.parse(messageEvent.data);

        handleEvent(event, payload);
    } catch (e) {
        // Not an event we're interested in
    }
}
socket.onmessage = onMessage;

function resetConnection(sessionId = null) {
    // Close the old connection and establish a new session
    socket.close();
    sendQueue = [];
    socket = new WebSocket(wsEndpoint);
    socket.onmessage = onMessage;
    send("init", sessionId);
}

// Health check
// Set healthy=false. If it is not set back to true after some time, connection is unhealthy
function healthCheck() {
    if (!getHealthy()) {
        resetConnection(sessionStorage.getItem("sessionId"));
    }
    setHealthy(isHealthy);
    resetHealth();

    if (socket.readyState === WebSocket.OPEN) {
        socket.send("ping");
    }
    setTimeout(healthCheck, 1200);
}
// Wait a few seconds to start health checking
setTimeout(healthCheck, 2400);

// Add global event handlers
on("errorMessage", (e) => toast.error(e));
on("infoMessage", (e) => toast.info(e));
on("sessionEstablished", (sessionId) => sessionStorage.setItem("sessionId", sessionId));

// When the app is loaded, establish a session
send("init", sessionStorage.getItem("sessionId"));

export {
    send,
    useApi,
    resetConnection,
};
