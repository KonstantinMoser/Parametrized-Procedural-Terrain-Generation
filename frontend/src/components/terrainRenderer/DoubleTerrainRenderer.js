//DoubleTerrainRenderer.js
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import "./TerrainRenderer.css";
import { handleRenderer, handleTerrainForComparison } from '../../utils/terrainUtils.js';
import HeightCalculator from './HeightCalculator';
import { disableLoading, enableLoading } from "../../store/reducers/loadingReducer";

export function TerrainRenderer() {
  const dispatch = useDispatch();
  const comparisonMode = useSelector((state) => state.comparison.comparisonMode);
  const hashedParams = useSelector((state) => state.terrain.mainTerrainHashedParams);
  const comparisonHashedParams = useSelector((state) => state.terrain.comparisonTerrainHashedParams);
  const [comparisonCanvas, setComparisonCanvas] = useState(false);
  const [comparisonCanvasInverse, setComparisonCanvasInverse] = useState(false);
  const terrainSize = useSelector((state) => state.terrain.mainTerrainSize);
  const comparisonSize = useSelector((state) => state.terrain.comparisonTerrainSize);

  const firstRendererRef = useRef(null);
  const secondRendererRef = useRef(null);

  const asyncHandleRenderer = async (hashedParams, rendererRef, canvasId, dispatch, comparisonCanvasInverse) => {
    enableLoading();
    if (hashedParams) {
      await handleRenderer(hashedParams, rendererRef, canvasId, dispatch, comparisonCanvasInverse);
    }
    disableLoading();
  }


  useEffect(() => {
    if (terrainSize == comparisonSize) {
      handleTerrainForComparison(hashedParams, comparisonHashedParams, comparisonMode)
        .then(({ compareTextureCanvas, compareTextureCanvasInverse }) => {
          setComparisonCanvas(compareTextureCanvas);
          setComparisonCanvasInverse(compareTextureCanvasInverse);
        })
    }
  }, [hashedParams, comparisonHashedParams, comparisonMode]);


  useEffect(() => {
    asyncHandleRenderer(hashedParams, firstRendererRef, "#webgl-canvas", dispatch, comparisonCanvasInverse);
  }, [hashedParams, comparisonCanvasInverse, dispatch, comparisonMode]);

  useEffect(() => {
    asyncHandleRenderer(comparisonHashedParams, secondRendererRef, "#webgl-canvas-2", dispatch, comparisonCanvas);
  }, [comparisonHashedParams, comparisonCanvasInverse, dispatch]);

  return (
    <div className="sideBySide-container">
      <div className="terrain-container">
        <canvas id="webgl-canvas"></canvas>
        <HeightCalculator
          size={terrainSize} />
      </div>

      <div className="terrain-container">
        <canvas id="webgl-canvas-2"></canvas>
        <HeightCalculator
          size={comparisonSize} />
      </div>
    </div >
  );
}
