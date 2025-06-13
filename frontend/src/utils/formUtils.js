import React from "react";

export const renderAlgorithmOptions = (algorithms) => {
	return Object.entries(algorithms).map(
		([algorithmName, algorithmData], index) => (
			<option
				key={index}
				value={algorithmName}
				title={algorithmData.description}>
				{algorithmData.algorithmName}
			</option>
		)
	);
};

export const getSuggestedValues = (selectedAlgorithm, algorithms) => {
	const initialValues = {};
	if (selectedAlgorithm && algorithms && algorithms[selectedAlgorithm]) {
		algorithms[selectedAlgorithm].parameters.forEach((parameter) => {
			initialValues[parameter.name] = extractDefaultValue(parameter);
		});
	}
	return initialValues;
};

export const getSuggestedErosionValues = (erosionParameters) => {
	const initialValues = {};
	if (erosionParameters?.parameters?.length > 0) {
		erosionParameters.parameters.forEach((parameter) => {
			initialValues[parameter.name] = extractDefaultValue(parameter);
		});
	}
	return initialValues;
};

export const extractDefaultValue = (parameter) => {
	switch (parameter.parameterType) {
		case "int":
		case "float":
			return parameter.suggestedValue[parameter.parameterType] || 0;
		case "boolean":
			return parameter.suggestedValue.boolean ? "True" : "False";
		case "string":
			return parameter.suggestedValue.str || "";
		case "terrain":
			return null;
		case "dropdown":
			return parameter.suggestedValue.dropdown || "";
		default:
			return "";
	}
};

const parseParameterValue = (value) => {
	return /^\d*\.?\d+$/.test(value) ? parseFloat(value) : value;
}

export function parseParameterValues(parameters) {
	const parsedParameters = {};
	for (const [key, value] of Object.entries(parameters)) {
		parsedParameters[key] = parseParameterValue(value);
	}
	return parsedParameters;
}
