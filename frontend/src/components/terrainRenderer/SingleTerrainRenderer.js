//SingleTerrainRenderer.js
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import "./TerrainRenderer.css";
import { handleRenderer } from '../../utils/terrainUtils.js';
import HeightCalculator from './HeightCalculator';
import { disableLoading, enableLoading } from "../../store/reducers/loadingReducer";

export function SingleRenderer() {
  const dispatch = useDispatch();
  const comparisonMode = useSelector((state) => state.comparison.comparisonMode);
  const hashedParams = useSelector((state) => {
    if (comparisonMode === "comparisonTerrain") {
      return state.terrain.comparisonTerrainHashedParams;
    } else {
      return state.terrain.mainTerrainHashedParams;
    }
  });
  const size = useSelector((state) => {
    if (comparisonMode === "comparisonTerrain") {
      return state.terrain.comparisonTerrainSize;
    } else {
      return state.terrain.mainTerrainSize;
    }
  });
  const rendererRef = useRef(null);
  const canvasId = comparisonMode === "comparisonTerrain" ? "#webgl-canvas-2" : "#webgl-canvas";

  useEffect(() => {

    const asyncHandleRenderer = async () => {
      if (hashedParams) {
        await handleRenderer(hashedParams, rendererRef, canvasId, dispatch, false);
      }
    }
    asyncHandleRenderer()
    disableLoading();
  }, [hashedParams, dispatch, comparisonMode]);

  return (
    <div className="terrain-container">
      {comparisonMode === "comparisonTerrain" ? (
        <canvas id="webgl-canvas-2"></canvas>
      ) : (
          <canvas id="webgl-canvas"></canvas>
      )}
      <HeightCalculator
        size={size} />
    </div>
  );
}
