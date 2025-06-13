//inputField.js
import React from "react";
import { useFormikContext } from "formik";
import { extractDefaultValue } from "../../utils/formUtils.js";
import { useSelector } from "react-redux";

const InputField = ({ parameter }) => {
  const { values, handleChange, setFieldValue } = useFormikContext();
  const placeholder = extractDefaultValue(parameter);
  const mode = useSelector((state) => state.mode.mode);

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      // split by lines
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const data = [];
      // extract data lines
      for (let i = 6; i < lines.length; i++) {
        const nums = lines[i].trim().split(/\s+/).map(Number);
        data.push(nums);
      }
      const flatData = data.flat();
      const maxVal = Math.max(...flatData);
      const minVal = Math.min(...flatData);
      // Normalize data between 0 and 1
      const normalizedData = data.map(row =>
        row.map(value => (value - minVal) / (maxVal - minVal))
      );
      // console.log(normalizedData);
      setFieldValue(parameter.name, normalizedData);
    };
    reader.readAsText(file);
  };

  const parseValue = (value, type) => {
    switch (type) {
      case "int":
        return parseInt(value);
      case "float":
        return parseFloat(value);
      case "boolean":
        return value === "True";
      default:
        return value; // Keep as string for "string" type
    }
  };




  const handleArrayChange = (e) => {
    // Split the string by commas, trim whitespace, and filter out empty strings
    const newValues = e.target.value.split(",").map(val => val.trim()).filter(val => val !== "");
    // Parse the values based on the parameter type
    newValues.forEach((value, index) => {
      newValues[index] = parseValue(value, parameter.parameterType);
    });
    setFieldValue(parameter.name, newValues.length > 1 ? newValues : e.target.value);
  };


  if (mode === "multiple") {
    return (
      <input
        className="input-field"
        type="text"
        name={parameter.name}
        onChange={handleArrayChange}
        placeholder={placeholder}
      />
    );
  }
  else {

    switch (parameter.parameterType) {
      case "int":
        return (
          <input
            className="input-field"
            type="text"
            name={parameter.name}
            onChange={handleChange}
            placeholder={placeholder}
            pattern="\d*"
          />
        );
      case "float":
        return (
          <input
            className="input-field"
            type="text"
            name={parameter.name}
            onChange={handleChange}
            placeholder={placeholder}
            pattern="\d*(\.\d*)?"
            onInvalid={(e) => {
              e.target.setCustomValidity("Please enter a valid number");
            }}
          />
        );
      case "boolean":
        return (
          <input
            className="input-field"
            type="checkbox"
            name={parameter.name}
            onChange={(e) =>
              setFieldValue(parameter.name, e.target.checked ? "True" : "False")
            }
          />
        );
      case "string":
        return (
          <input
            className="input-field"
            type="text"
            name={parameter.name}
            onChange={handleChange}
            placeholder={placeholder}
          />
        );
      case 'dropdown':
        return (
          <select
            name={parameter.name}
            className="select-field"
            onChange={handleChange}
            placeholder={placeholder}
          >
            <option
              disabled>Select {parameter.displayParameterName} </option>
            {parameter.dropdownOptions.map((option, index) => (
              <option
                key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case "terrain":
        return (
          <>
            <input
              className="input-field"
              type="file"
              id={`file-${parameter.name}`}
              name={parameter.name}
              accept=".txt"
              onChange={(e) => {
                const file = e.currentTarget.files[0];
                setFieldValue(parameter.name, file);
                readFile(file);
              }}
            />
            <label htmlFor={`file-${parameter.name}`} className="file-upload">
              {values[parameter.name] ? 'Change Terrain' : 'Upload Terrain'}
            </label>
            {values[parameter.name] && (
              <span className="file-name">{values[parameter.name].name}</span>
            )}
          </>
        );

      default:
        return null;
    }
  }
};

export default InputField;
