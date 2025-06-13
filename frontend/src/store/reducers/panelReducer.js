import { createSlice } from "@reduxjs/toolkit";

const panelSlice = createSlice({
  name: "panels",
  initialState: {
    isHistoryPanelOpen: false,
    isControlPanelOpen: true,
  },
  reducers: {
    openHistoryPanel: (state) => {
      state.isHistoryPanelOpen = true;
      state.isControlPanelOpen = false;
    },
    hideHistoryPanel: (state) => {
      state.isHistoryPanelOpen = false;
    },
    openControlPanel: (state) => {
      state.isControlPanelOpen = true;
      state.isHistoryPanelOpen = false;
    },
    hideControlPanel: (state) => {
      state.isControlPanelOpen = false;
    },
    toggleHistoryPanel: (state) => {
      state.isHistoryPanelOpen = !state.isHistoryPanelOpen;
      state.isControlPanelOpen = state.isHistoryPanelOpen ? false : state.isControlPanelOpen;
    },
    toggleControlPanel: (state) => {
      state.isControlPanelOpen = !state.isControlPanelOpen;
      state.isHistoryPanelOpen = state.isControlPanelOpen ? false : state.isHistoryPanelOpen;
    },
  },
});

export const {
  openHistoryPanel, hideHistoryPanel,
  openControlPanel, hideControlPanel,
  toggleHistoryPanel, toggleControlPanel
} = panelSlice.actions;

export default panelSlice.reducer;
