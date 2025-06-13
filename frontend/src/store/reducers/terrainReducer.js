//terrainReducer.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mainTerrainHashedParams: null,
  comparisonTerrainHashedParams: null,
  mainTerrainSize: null,
  comparisonTerrainSize: null,
};

const terrainSlice = createSlice({
  name: 'terrain',
  initialState,
  reducers: {
    setTerrainHashedParams: (state, action) => {
      state.mainTerrainHashedParams = action.payload;
    },
    setComparisonHashedParams: (state, action) => {
      state.comparisonTerrainHashedParams = action.payload;
    },
    setTerrainSize: (state, action) => {
      state.mainTerrainSize = action.payload;
    },
    setComparisonSize: (state, action) => {
      state.comparisonTerrainSize = action.payload;
    },
    clearTerrainHashedParams: (state) => {
      state.mainTerrainHashedParams = null;
    },
    clearComparisonHashedParams: (state) => {
      state.comparisonTerrainHashedParams = null;
    },
    clearTerrainSize: (state) => {
      state.mainTerrainSize = null;
    },
    clearComparisonSize: (state) => {
      state.comparisonTerrainSize = null;
    },
  },
});

export const {
  setTerrainHashedParams,
  setTerrainSize,
  setComparisonSize,
  setComparisonHashedParams,
  clearMainTerrainHashedParams,
  clearComparisonHashedParams,
  clearTerrainSize,
  clearComparisonSize,
} = terrainSlice.actions;


export default terrainSlice.reducer;
