/* Socket.io + Redux integration
 * 
 * All game state information is stored on the server. Clients keep a local cache of this data in redux. 
 * This file uses grabs messages from the socket.io connection and uses them to update the redux store.
 */

import { socket } from '../index';
import { showInfo } from '../lib/message';
import { store } from './store';

let isListening = false;

const dispatchAction = action => {
    store.dispatch(action);
}

const handleDisconnect = (reason) => {
    console.warn("Socket connection lost. Reason: " + reason);
    showInfo("Connection lost");
}

function start() {
    if (!isListening) {
        socket.on("redux action", dispatchAction);
        socket.on("disconnect", handleDisconnect);
        isListening = true;
    }
}

function stop() {
    if (isListening) {
        socket.off("redux action", dispatchAction);
        socket.off("disconnect", handleDisconnect);
        isListening = false;
    }
}

export { start, stop };