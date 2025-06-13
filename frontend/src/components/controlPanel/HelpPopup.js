// Helppopup.js
import React from "react";
import ReactDOM from "react-dom";
import "./HelpPopup.css";
import { extractDefaultValue } from "../../utils/formUtils";

export function HelpPopup({
  description,
  parameters,
  onClose,
}) {
  return ReactDOM.createPortal(
    <div className="help-popup" onClick={onClose}>
      <div className="help-popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <p>{description}</p>
        <h3>Parameters</h3>
        <ul>
          {parameters.map((param, index) => (
            <li key={index}>
              <strong>{param.displayParameterName}</strong>:{" "}
              {param.parameterDescription}
              <div>
                <em>
                  Suggested value:{" "}
                  {JSON.stringify(extractDefaultValue(param))}
                </em>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body
  );
}
