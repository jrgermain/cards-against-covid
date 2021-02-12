import { createSlice } from '@reduxjs/toolkit'

const validStatusNames = new Set(["WAITING", "IN_PROGRESS", "ENDED"]);

const statusSlice = createSlice({
    name: "status",
    initialState: "",
    reducers: {
        set(state, action) {
            if (validStatusNames.has(action.payload)) {
                return action.payload;
            }
        }
    }
});

export const { set } = statusSlice.actions;
export default statusSlice.reducer;