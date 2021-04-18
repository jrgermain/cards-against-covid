/* Socket.io + Redux integration
 * 
 * All game state information is stored on the server. Clients keep a local cache of this data in redux. 
 * This file uses grabs messages from the socket.io connection and uses them to update the redux store.
 */

import { socket } from '../index';
import { showInfo } from '../lib/message';
import { store } from './store';

let isListening = false;

function initialize() {
    socket.on("redux action", action => {
        if (isListening) {
            store.dispatch(action);
        }
    });
    socket.on("disconnect", reason => {
        if (isListening) {
            console.warn("Socket connection lost. Reason: " + reason);
            showInfo("Connection lost");
        }
    });
}

function start() {
    isListening = true;
}

function stop() {
    isListening = false;
}

function resetConnection() {
    if (socket.connected) {
        socket.close();
    }
    socket.open();
}

function resetState() {
    store.dispatch({ type: "RESET_STATE" });
}

function reset() {
    resetState();
    resetConnection();
}

export { initialize, start, stop, resetConnection, resetState, reset };