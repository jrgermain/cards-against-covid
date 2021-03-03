import { createSlice } from '@reduxjs/toolkit'

const messagesSlice = createSlice({
    name: "messages",
    initialState: [],
    reducers: {
        add(state, action) {
            state.push(action.payload);
        }
    }
});

export const { add } = messagesSlice.actions;
export default messagesSlice.reducer;