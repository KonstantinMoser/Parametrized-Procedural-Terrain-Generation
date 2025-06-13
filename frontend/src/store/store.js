import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import panelReducer from "./reducers/panelReducer";
import historyReducer from "./reducers/historyReducer";
import algorithmsReducer from "./reducers/algorithmsReducer";
import erosionReducer from "./reducers/erosionReducer";
import comparisonReducer from "./reducers/comparisonReducer";
import terrainReducer from "./reducers/terrainReducer";
import generationModeReducer from "./reducers/generationModeReducer";
import offsetReducer from './reducers/offsetsReducer';
import loadingReducer from "./reducers/loadingReducer";

// Define the persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["comparison", "history", "algorithms", "erosion", "offsets", "terrain", "loading"],
};

// Combine all reducers into a single root reducer
const rootReducer = combineReducers({
  terrain: terrainReducer,
  comparison: comparisonReducer,
  panels: panelReducer,
  history: historyReducer,
  mode: generationModeReducer,
  algorithms: algorithmsReducer,
  erosion: erosionReducer,
  offsets: offsetReducer,
  loading: loadingReducer,
});

// Persist the root reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store with the persisted reducer
const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export default store;
