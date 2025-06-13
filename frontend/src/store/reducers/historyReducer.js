//src/store/reducers/historyReducer.js

import { createSlice, current } from "@reduxjs/toolkit";

// Helper function to generate unique identifier
const generateUniqueId = (history) => {
  if (!history.length) return 1;
  // Find the highest identifier in the current history
  const highestId = history.reduce(
    (maxId, item) => Math.max(maxId, item.identifier || 0),
    0
  );
  return highestId + 1;
};

// Helper function to check if two entries are equal
const areEntriesEqual = (existingEntry, newEntry) => {
  const paramEquality =
    JSON.stringify(existingEntry.parameters) ===
    JSON.stringify(newEntry.parameters);
  const erosionParamEquality =
    JSON.stringify(existingEntry.erosionParameters) ===
    JSON.stringify(newEntry.erosionParameters);
  return (
    existingEntry.algorithm === newEntry.algorithm &&
    paramEquality &&
    erosionParamEquality
  );
};

const initialState = {
  history: [],
  currentIndex: 0,
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    addToHistory: (state, action) => {
      const newEntry = action.payload;
      const history = current(state.history); // Use `current` to get a snapshot of the current state

      // Check for an existing entry that matches the new one
      const existingIndex = history.findIndex((item) =>
        areEntriesEqual(item, newEntry)
      );

      // If found, remove the existing entry
      if (existingIndex !== -1) {
        state.history.splice(existingIndex, 1);
      }

      // Generate a unique identifier for the new entry
      newEntry.identifier = generateUniqueId(history);

      // Prepend the new entry with the unique identifier to the history
      state.history.unshift(newEntry);
    },
    removeFromHistory: (state, action) => {
      state.history = state.history.filter(
        (_, index) => index !== action.payload
      );
    },
    selectFromHistory: (state, action) => {
      state.currentIndex = action.payload;
    },
    clearHistory: (state) => {
      state.history = [];
    },
    updateHistoryEntry: (state, action) => {
      const { identifier, updates } = action.payload;
      const entryIndex = state.history.findIndex(item => item.identifier === identifier);
      if (entryIndex !== -1) {
        state.history[entryIndex] = { ...state.history[entryIndex], ...updates };
      }
    },
  },
});

export const {
  addToHistory,
  removeFromHistory,
  selectFromHistory,
  clearHistory,
  updateHistoryEntry,
} = historySlice.actions;

export default historySlice.reducer;
