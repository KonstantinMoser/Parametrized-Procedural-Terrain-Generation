import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	comparisonEnabled: false,
	comparisonMode: null,
};

const comparisonSlice = createSlice({
	name: 'comparison',
	initialState,
	reducers: {
		enableComparison: (state) => {
			state.comparisonEnabled = true;
			state.comparisonMode = 'sideBySide';
		},
		disableComparison: (state) => {
			state.comparisonEnabled = false;

		},
		toggleComparison: (state) => {
			state.comparisonEnabled = !state.comparisonEnabled;

		},
		setComparisonMode: (state, action) => {
			state.comparisonMode = action.payload;
		},
	},
});

export const { enableComparison, disableComparison, toggleComparison, setComparisonMode } = comparisonSlice.actions;
export default comparisonSlice.reducer;
