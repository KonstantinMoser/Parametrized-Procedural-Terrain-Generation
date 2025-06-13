//ParameterSection.js

import React from "react";
import InputField from "./InputField";
import { FaExclamationCircle } from "react-icons/fa";

const ParameterSection = ({ title, parameters, formik }) => {
  return (
    <div className="column">
      <h4>{title}</h4>
      {parameters.map((parameter, index) => (
        <div key={index} className="parameter">
          <label
            htmlFor={parameter.name}
            title={parameter.parameterDescription}>
            {parameter.displayParameterName}
          </label>
          <InputField parameter={parameter} />
          {formik.touched[parameter.name] && formik.errors[parameter.name] && (
            <div className="error">
              <FaExclamationCircle className="error-icon" />
              {formik.errors[parameter.name]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ParameterSection;
