import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: { name: localStorage.getItem("last-username") || "" },
    reducers: {
        setName(state, action) {
            state.name = action.payload;
            localStorage.setItem("last-username", action.payload);
        },
    },
});

export const { setName } = userSlice.actions;
export default userSlice.reducer;
