import { createSlice } from '@reduxjs/toolkit'

const validStatusNames = new Set(["WAITING", "IN_PROGRESS", "ENDED"]);

const statusSlice = createSlice({
    name: "status",
    initialState: {
        name: "",
        round: 1,
        maxRounds: 1,
        isLeaderboardVisible: false
    },
    reducers: {
        setName(state, action) {
            if (validStatusNames.has(action.payload)) {
                state.name = action.payload;
            }
        },
        nextRound(state) {
            state.round++;
            state.isLeaderboardVisible = false;
        },
        setMaxRounds(state, action) {
            state.maxRounds = action.payload;
        },
        showLeaderboard(state) {
            state.isLeaderboardVisible = true;
        }
    }
});

export const { set } = statusSlice.actions;
export default statusSlice.reducer;