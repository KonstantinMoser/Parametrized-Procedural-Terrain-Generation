import { createSlice } from '@reduxjs/toolkit';

// You can change the Offsets here
// The first number is the water level
const initialState = {
    offsets: [0.1, 0.15, 0.18, 0.25, 0.45, 0.7, 0.85],
};

const offsetSlice = createSlice({
    name: 'offsets',
    initialState,
    reducers: {
        setOffsets: (state, action) => {
            state.offsets = action.payload;
        },
    },
});

export const { setOffsets } = offsetSlice.actions;

// Export the reducer
export default offsetSlice.reducer;