//ControlPanel.js
import { FaTimes } from "react-icons/fa";
import Draggable from "react-draggable";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { hideControlPanel } from "../../store/reducers/panelReducer";
import { setMode } from "../../store/reducers/generationModeReducer";

import { Form } from "./Form";
import "./ControlPanel.css";

export function ControlPanel() {
    const dispatch = useDispatch();
    const isControlPanelOpen = useSelector((state) => state.panels.isControlPanelOpen);
    const mode = useSelector((state) => state.mode.mode);

    const handleSetMode = (newMode) => {
        dispatch(setMode(newMode));
    };

    const handlehideControlPanel = () => {
        dispatch(hideControlPanel());
    };


    return (
        isControlPanelOpen && (
            <Draggable handle=".drag-handle">
                <div className="floating-panel">
                    <div className="drag-handle">
                        <FaTimes
                            className="fa-close"
                            onClick={handlehideControlPanel}
                        />
                    </div>
                    <div className="segmented-control">
                        <button className={mode === 'single' ? 'active' : ''} onClick={() =>
                            handleSetMode('single')}>
                            Single
                        </button>
                        <button className={mode === 'comparison' ? 'active' : ''} onClick={() =>
                            handleSetMode('comparison')}>
                            Comparison
                        </button>
                        <button className={mode === 'multiple' ? 'active' : ''} onClick={() =>
                            handleSetMode('multiple')}>
                            Multiple
                        </button>
                    </div>
                    <div className="columns-container">

                        {(mode === 'single' || mode === 'comparison') && (
                            <Form
                                id="main"
                            />
                        )}
                        {mode === 'multiple' && (
                            <Form
                                id="multiple"
                            />
                        )}
                        {mode === 'comparison' && (
                            <Form
                                id="comparison"
                            />
                        )}
                    </div>
                </div>
            </Draggable>
        )
    );
}