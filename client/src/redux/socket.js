import { socket } from '../index';
import store from './store';

let isListening = false;

const dispatchAction = action => {
    store.dispatch(action);
}

function start() {
    if (!isListening) {
        socket.on("redux action", dispatchAction);
        isListening = true;
    }
}

function stop() {
    if (isListening) {
        socket.off("redux action", dispatchAction);
        isListening = false;
    }
}

export { start, stop };