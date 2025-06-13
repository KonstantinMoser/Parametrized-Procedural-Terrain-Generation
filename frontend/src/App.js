import React, { useState, useEffect } from "react";
import { FaMoon, FaSun, FaSlidersH } from "react-icons/fa";
import { ControlPanel } from "./components/controlPanel/ControlPanel";
import { TerrainRenderer } from "./components/terrainRenderer/DoubleTerrainRenderer";
import { GeneratedTerrainHistory } from "./components/GeneratedTerrainHistory";
import { Loader } from "./components/Loader";
import { fetchAlgorithms } from "./store/reducers/algorithmsReducer";
import { fetchErosionParameters } from "./store/reducers/erosionReducer";
import { toggleHistoryPanel, toggleControlPanel } from "./store/reducers/panelReducer";
import { useDispatch, useSelector } from "react-redux";
import ComparisonSelector from "./components/ComparisonSelector";
import { SingleRenderer } from "./components/terrainRenderer/SingleTerrainRenderer";

import "./App.css";

function App() {
  const dispatch = useDispatch();
  const { isHistoryPanelOpen, isControlPanelOpen } = useSelector(state => ({
    isHistoryPanelOpen: state.panels.isHistoryPanelOpen,
    isControlPanelOpen: state.panels.isControlPanelOpen,
  }));
  const isLoading = useSelector((state) => state.loading.isLoading);
  const loadingDesc = useSelector((state) => state.loading.loadingDesc);
  const comparisonMode = useSelector((state) => state.comparison.comparisonMode);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    dispatch(fetchAlgorithms());
    dispatch(fetchErosionParameters());
  }, []);


  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('dark');
    }
    document.body.className = theme === 'dark' ? '' : 'light-theme';
  }, [theme]);


  return (
    <div className="app">

      <main className="main-content">

        <button
          className="theme-switch"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>

        <button
          className={`toggle-panel-button ${isControlPanelOpen ? 'active' : ''}`}
          onClick={() => dispatch(toggleControlPanel())}
          aria-label="Toggle control panel"
        >
          <FaSlidersH />
        </button>

        <button
          className={`show-history-button ${isHistoryPanelOpen ? 'active' : ''}`}
          onClick={() => dispatch(toggleHistoryPanel())}>
          History
        </button>

        <GeneratedTerrainHistory />
        <ControlPanel />
        <ComparisonSelector />

      </main>

      {(comparisonMode === "sideBySide" || comparisonMode === "overlay") &&
        <TerrainRenderer />
      }
      {(comparisonMode === null || comparisonMode === "mainTerrain" || comparisonMode === "comparisonTerrain") &&
        <SingleRenderer />
      }
      {isLoading && <Loader loadingDesc={loadingDesc} />}
    </div>
  );
}
export default App;
