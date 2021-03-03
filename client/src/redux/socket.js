import { socket } from '../index';
import { showInfo } from '../lib/message';
import { store } from './store';

let isListening = false;

const dispatchAction = action => {
    store.dispatch(action);
}

const handleDisconnect = () => {
    dispatchAction({ type: "RESET_STATE" });
    window.history.replaceState(null, "", "/");
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