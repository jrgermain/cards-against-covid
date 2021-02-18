import { createSlice } from '@reduxjs/toolkit'

const playersSlice = createSlice({
    name: "players",
    initialState: [],
    reducers: {
        add(state, action) {
            state.push(action.payload);
        },
        remove(state, action) {
            return state.players.filter(player => player.name !== action.payload);
        },
        set(state, action) {
            return action.payload;
        },
        // updateName(state, action) {
        //     state.find(player => player.name === action.payload.oldName).name = action.payload.newName;
        // }
        updateScore(state,action){
            return action.payload;
        }
    }
});

export const { add, remove, updateName, updateScore } = playersSlice.actions;
export default playersSlice.reducer;