import { configureStore } from '@reduxjs/toolkit';
import gameCode from './slices/gameCode';
import players from './slices/players';
import prompt from './slices/prompt';
import status from './slices/status';
import user from './slices/user';

const store = configureStore({
    reducer: { gameCode, players, prompt, status, user }
});

export default store;