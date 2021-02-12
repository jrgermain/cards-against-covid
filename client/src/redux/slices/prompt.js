import { createSlice } from '@reduxjs/toolkit'

const promptSlice = createSlice({
    name: "prompt",
    initialState: "",
    reducers: {
        set(state, action) {
            return action.payload;
        }
    }
});

export const { set } = promptSlice.actions;
export default promptSlice.reducer;