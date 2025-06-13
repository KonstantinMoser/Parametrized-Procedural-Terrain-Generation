import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	mode: 'single', // 'single', 'comparison', 'multiple'
};

export const modeSlice = createSlice({
	name: 'mode',
	initialState,
	reducers: {
		setMode: (state, action) => {
			state.mode = action.payload;
		},
	},
});

export const { setMode } = modeSlice.actions;
export default modeSlice.reducer;
