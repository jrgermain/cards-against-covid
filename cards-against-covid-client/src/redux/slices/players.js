import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const playersSlice = createSlice({
    name: "players",
    initialState: [],
    reducers: {
        set(state, action) {
            return action.payload;
        },
        clear() {
            return [];
        },
        leave(state, action) {
            const player = state.find((p) => p.name === action.payload);
            if (player.isConnected) {
                toast.info(`${action.payload} disconnected`);
                player.isConnected = false;
            }
        },
        rejoin(state, action) {
            const player = state.find((p) => p.name === action.payload);
            if (!player.isConnected) {
                toast.info(`${action.payload} reconnected`);
                player.isConnected = true;
            }
        },
    },
});

export const { set, clear, leave, rejoin } = playersSlice.actions;
export default playersSlice.reducer;
