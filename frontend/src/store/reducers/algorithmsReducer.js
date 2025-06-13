// reducers/algorithmReducer.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchAlgorithms = createAsyncThunk(
  "algorithms/fetchAlgorithms",
  async () => {
    const response = await fetch("http://localhost:5000/available_algorithms");
    const data = await response.json();
    return data.algorithms;
  }
);

const algorithmsSlice = createSlice({
  name: "algorithms",
  initialState: {
    entities: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlgorithms.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAlgorithms.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.entities = action.payload;
      })
      .addCase(fetchAlgorithms.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default algorithmsSlice.reducer;
