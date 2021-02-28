import { createSlice } from '@reduxjs/toolkit'

const validStatusNames = new Set(["WAITING", "IN_PROGRESS", "ENDED"]);

const statusSlice = createSlice({
    name: "status",
    initialState: {
        name: "",
        round: 1,
        maxRounds: 1
    },
    reducers: {
        setName(state, action) {
            if (validStatusNames.has(action.payload)) {
                state.name = action.payload;
            }
        },
        nextRound(state) {
            state.round++;
        },
        setMaxRounds(state, action) {
            state.maxRounds = action.payload;
        }
    }
});

export const { set } = statusSlice.actions;
export default statusSlice.reducer;