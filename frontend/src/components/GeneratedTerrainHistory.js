//GeneratedTerrainHistory.js
import React, { useState } from "react";
import { FaDownload, FaTimes, FaHistory } from "react-icons/fa";
import { renderParameters } from "../utils/historyUtils.js";
import { handleDownload } from "../utils/downloadUtils";
import { removeFromHistory, selectFromHistory, clearHistory } from "../store/reducers/historyReducer";
import { generateTerrainData } from "../services/apiService";
import { useDispatch, useSelector } from "react-redux";
import useKeyboardNavigation from "../hooks/useKeyboardNavigation";
import { enableComparison, setComparisonMode } from "../store/reducers/comparisonReducer";
import { setTerrainHashedParams, setComparisonHashedParams, setTerrainSize, setComparisonSize } from "../store/reducers/terrainReducer";
import { updateHistoryEntry } from "../store/reducers/historyReducer";
import { renderMinimapToPngUrl } from "../services/apiService";
import "./GeneratedTerrainHistory.css";

export function GeneratedTerrainHistory() {
  const dispatch = useDispatch();
  const { history, currentIndex } = useSelector(state => state.history);
  const isHistoryPanelOpen = useSelector(state =>
    state.panels.isHistoryPanelOpen);
  const [showMoreParams, setShowMoreParams] = useState({});
  const handleShowMore = (identifier) => {
    setShowMoreParams((prev) => ({ ...prev, [identifier]: !prev[identifier] }));
  };

  const handleSelectTerrainFromHistory = async (hashedParams) => {
    const itemIndex = history.findIndex(item => item.hashedParams === hashedParams);
    if (itemIndex !== -1) {
      const item = history[itemIndex];
      if (!item.isGenerated) {
        await generateTerrainData(item.requestData);
        const minimapData = await renderMinimapToPngUrl(hashedParams).catch(console.error)
        dispatch(updateHistoryEntry({
          identifier: item.identifier,
          updates: {
            isGenerated: true,
            imageURL: minimapData,
          }
        }));
      }
      dispatch(setTerrainHashedParams(item.hashedParams));
      dispatch(setTerrainSize(item.size));
      dispatch(selectFromHistory(itemIndex));
    }
  };

  useKeyboardNavigation(currentIndex, history, handleSelectTerrainFromHistory, selectFromHistory);

  const handleComparison = async (event, hashedParams, size) => {
    event.stopPropagation();
    const itemIndex = history.findIndex(item => item.hashedParams === hashedParams);
    const item = history[itemIndex];
    if (!item.isGenerated) {
      await generateTerrainData(item.requestData);
      const minimapData = await renderMinimapToPngUrl(hashedParams).catch(console.error)
      dispatch(updateHistoryEntry({
        identifier: item.identifier,
        updates: {
          isGenerated: true,
          imageURL: minimapData,
        }
      }));
    }

    try {
      dispatch(enableComparison());
      dispatch(setComparisonMode("sideBySide"));
      dispatch(setComparisonHashedParams(hashedParams));
      dispatch(setComparisonSize(size));
    } catch (error) {
      console.error("Error fetching terrain data for comparison:", error);
    }
  };

  return (
    isHistoryPanelOpen && (
      <div className="generated-terrain-history-container">
        {history.length > 0 ? (
          <>
            <ul className="generated-terrain-history-list">
              {history.map((item, index) => (
                <li
                  key={item.identifier}
                  className={`generated-terrain-history-item ${index === currentIndex ? "selected-history-item" : ""
                    }`}
                  onClick={() =>
                    handleSelectTerrainFromHistory(item.hashedParams, index)
                  }>
                  <div className="history-item-header">
                    <FaHistory
                      className="select-terrain-button"
                    />
                    <div>
                      <div className="history-item-title">{item.algorithm}</div>
                    </div>
                    <FaTimes
                      className="remove-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(removeFromHistory(index));
                      }}
                    />
                  </div>
                  <div className="history-item-content">
                    <div className="canvas">
                      {item.isGenerated ? (
                        <img
                          src={item.imageURL}
                          className="canvas"
                          width="100%"
                          height="100%"
                        />
                      ) : (
                        <div className="placeholder">?</div>
                      )}
                    </div>

                    <div className="history-item-parameters">
                      <div className="parameter-group">
                        <div className="parameter-title">Parameters</div>
                        {renderParameters(
                          item.parameters,
                          handleShowMore,
                          showMoreParams,
                          item.identifier
                        )}
                      </div>

                      <div className="parameter-group">
                        <div className="parameter-title">Erosion Parameters</div>
                        {item.isEroded ? (
                          renderParameters(
                            item.erosionParameters,
                            handleShowMore,
                            showMoreParams,
                            `${item.identifier}-erosion`
                          )
                        ) : (
                          <span className="parameter-item">Not Applicable</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="history-item-buttons">
                    <button className="download-button" onClick={(e) => {
                      handleDownload(e, "terrain", item.hashedParams);
                    }}>
                      <FaDownload className="download-icon" />
                      Terrain Data
                    </button>
                    <button className="download-button" onClick={(e) => {
                      handleDownload(e, "configuration", item);
                    }}>
                      <FaDownload className="download-icon" />
                      Configuration
                    </button>
                    <button className="download-button" onClick={(e) => {
                      handleComparison(e, item.hashedParams, item.size);
                    }}>
                      Compare
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button className="clear-history-button" onClick={() =>
              dispatch(clearHistory())}>Clear</button>
          </>
        ) :
          (
            <div className="no-history-message">No terrains generated yet.</div>
          )
        }
      </div >
    )
  );
}
