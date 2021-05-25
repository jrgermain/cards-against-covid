import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
    name: "user",
    initialState: {
        name: localStorage.getItem("last-username") || ""
    },
    reducers: {
        setName(state, action) {
            state.name = action.payload;
        }
    }
});

export const { setName, setRole, setCards, setResponse } = userSlice.actions;
export default userSlice.reducer;