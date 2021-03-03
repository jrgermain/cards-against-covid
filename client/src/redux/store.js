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

const persistConfig = {
    key: 'root',
    storage: session,
}

const sliceReducers = combineReducers({ gameCode, messages, players, prompt, status, user });
const rootReducer = (state, action) => {
    if (action.type === "RESET_STATE") {
        state = undefined;
    }
    return sliceReducers(state, action);
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer
});

const persistor = persistStore(store);

export { store, persistor }