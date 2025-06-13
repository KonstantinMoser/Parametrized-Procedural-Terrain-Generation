//ComparisonSelector.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { disableComparison, setComparisonMode } from "../store/reducers/comparisonReducer";
import './ComparisonSelector.css';
import { clearComparisonHashedParams } from "../store/reducers/terrainReducer";

const ComparisonSelector = () => {
  const dispatch = useDispatch();
  const comparisonEnabled = useSelector((state) => state.comparison.comparisonEnabled);
  const comparisonMode = useSelector((state) => state.comparison.comparisonMode);
  const terrainSize = useSelector((state) => state.terrain.mainTerrainSize);
  const comparisonSize = useSelector((state) => state.terrain.comparisonTerrainSize);

  const handleChange = (event) => {
    dispatch(setComparisonMode(event.target.value));
  };

  const handleExitComparison = () => {
    dispatch(disableComparison());
    dispatch(setComparisonMode(null));
    dispatch(clearComparisonHashedParams());
  };

  return (
    comparisonEnabled && (
      <div className="selector">
        <select className="select" id="comparisonMode" value={comparisonMode} onChange={handleChange}>
          <option value="sideBySide">Side by Side</option>
          <option value="overlay" disabled={terrainSize !== comparisonSize}>
            Color Comparison
          </option>
          <option value="mainTerrain">Main Terrain Only</option>
          <option value="comparisonTerrain">Second Terrain Only</option>
        </select>
        <button className="exit-button" onClick={handleExitComparison}>Exit Comparison</button>
      </div>
    )
  );
};

export default ComparisonSelector;
