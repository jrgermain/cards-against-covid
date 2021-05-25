import { createSlice } from '@reduxjs/toolkit'

const gameCodeSlice = createSlice({
    name: "gameCode",
    initialState: localStorage.getItem("last-game-code") || "",
    reducers: {
        set(state, action) {
            return action.payload;
        }
    }
});

export const { set } = gameCodeSlice.actions;
export default gameCodeSlice.reducer;