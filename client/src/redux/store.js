import { combineReducers, configureStore } from '@reduxjs/toolkit';
import persistReducer from 'redux-persist/es/persistReducer';
import gameCode from './slices/gameCode';
import players from './slices/players';
import prompt from './slices/prompt';
import status from './slices/status';
import user from './slices/user';
import messages from './slices/messages';
import session from 'redux-persist/lib/storage/session';
import persistStore from 'redux-persist/es/persistStore';

/* Specify how the redux store is persisted. We use the browser's sessionStorage so
 * app state survives a refresh, but is cleared when opening a new tab.
 */
const persistConfig = {
    key: 'root',
    storage: session,
}

// Create a single reducer for the store by combining the slices and adding a "RESET_STATE" action
const sliceReducers = combineReducers({ gameCode, messages, players, prompt, status, user });
const rootReducer = (state, action) => {
    if (action.type === "RESET_STATE") {
        // Instead of sending app state, send undefined to the slice reducers to reset them
        state = undefined;
    }
    return sliceReducers(state, action);
}

// Create a redux store from the root reduer that is saved to sessionStorage
const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
    reducer: persistedReducer
});
const persistor = persistStore(store);

export { store, persistor }