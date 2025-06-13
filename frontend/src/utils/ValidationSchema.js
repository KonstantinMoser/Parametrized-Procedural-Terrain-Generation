// validationSchema.js
import * as yup from "yup";

export const createValidationSchema = (algorithms, selectedAlgorithm) => {
  let schemaFields = {};
  if (selectedAlgorithm) {
    algorithms[selectedAlgorithm].parameters.forEach((param) => {
      switch (param.parameterType) {
        case "int":
            schemaFields[param.name] = yup
              .number()
              .integer()
              .typeError(`${param.displayParameterName} must be an integer number`);
          break;
        case "float":
          schemaFields[param.name] = yup
            .number()
            .typeError(`${param.displayParameterName} must be a float number`);
          break;
        case "boolean":
          schemaFields[param.name] = yup
            .boolean()
            .typeError(`${param.displayParameterName} must be true or false`);
          break;
        case "string":
          schemaFields[param.name] = yup
            .string()
            .typeError(`${param.displayParameterName} must be text`);
          break;
        default:
          break;
      }
    });
  }
  return yup.object().shape(schemaFields);
};
