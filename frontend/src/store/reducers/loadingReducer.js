import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  loadingDesc: "",
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    enableLoading: (state) => {
      state.isLoading = true;
    },
    disableLoading: (state) => {
      state.isLoading = false;
    },
    setLoadingDesc: (state, action) => {
      state.loadingDesc = action.payload;
    },
    clearLoadingDesc: (state) => {
      state.loadingDesc = "";
    }
  },
});

export const {
  enableLoading,
  disableLoading,
  setLoadingDesc,
  clearLoadingDesc
} = loadingSlice.actions;

export default loadingSlice.reducer;
