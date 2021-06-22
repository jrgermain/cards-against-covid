/* Socket.io + Redux integration
 *
 * All game state information is stored on the server. Clients keep a local cache of this data in
 * redux. This file uses grabs messages from the socket.io connection and uses them to update the
 * redux store.
 */

import { toast } from "react-toastify";
import { socket } from "../serverConfig";
import { store } from "./store";

let isListening = false;

// function initialize() {
socket.on("redux action", (action) => {
    if (isListening) {
        store.dispatch(action);
    }
});
socket.on("disconnect", () => {
    if (isListening) {
        toast.info("Connection lost");
    }
});
// }

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

export { start, stop, resetConnection, resetState, reset };
