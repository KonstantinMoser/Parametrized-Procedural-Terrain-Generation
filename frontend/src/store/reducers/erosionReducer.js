// reducers/erosionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchErosionParameters = createAsyncThunk(
  "erosion/fetchErosionParameters",
  async () => {
    const response = await fetch("http://localhost:5000/erosion_parameters");
    const data = await response.json();
    return data;
  }
);

const erosionSlice = createSlice({
  name: "erosion",
  initialState: {
    parameters: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchErosionParameters.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchErosionParameters.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.parameters = action.payload;
      })
      .addCase(fetchErosionParameters.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default erosionSlice.reducer;
