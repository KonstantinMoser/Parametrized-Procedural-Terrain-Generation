// hooks/useControlPanelForm.js
import { useFormik } from 'formik';
import { getSuggestedValues, getSuggestedErosionValues, parseParameterValues } from '../utils/formUtils';
import { createValidationSchema } from "../utils/ValidationSchema";
import { useEffect } from 'react';
import { useTerrainGenerator } from './useTerrainGenerator';
import { enableComparison, disableComparison } from "../store/reducers/comparisonReducer";
import { setComparisonMode } from '../store/reducers/comparisonReducer';
import { useDispatch, useSelector } from 'react-redux';


export const useControlPanelForm = (selectedAlgorithm, algorithms, erosionParameters, applyErosion, id) => {

	const dispatch = useDispatch();
	const mode = useSelector((state) => state.mode.mode);

	const { generateAndProcessTerrain } = useTerrainGenerator();
	const formik = useFormik({
		initialValues: {
			...getSuggestedValues(selectedAlgorithm, algorithms),
			...getSuggestedErosionValues(erosionParameters),
		},

		validationSchema: createValidationSchema(algorithms, selectedAlgorithm),


		onSubmit: (values) => {
			const terrainParams = {};
			const erosionParams = {};
			Object.entries(values).forEach(([key, value]) => {
				if (erosionParameters.parameters.some((param) => param.name === key)) {
					erosionParams[key] = value;
				}
				if (algorithms[selectedAlgorithm].parameters.some(param => param.name === key)) {
					terrainParams[key] = value;
				}
			});

			const submissionValues = {
				applyErosion,
				selectedAlgorithm,
				terrainParameters: parseParameterValues(terrainParams),
				erosionParameters: applyErosion ? parseParameterValues(erosionParams) : {},
			};

			if (mode === 'comparison') {
				dispatch(enableComparison());
				dispatch(setComparisonMode('sideBySide'));
			}
			else {
				dispatch(disableComparison());
				dispatch(setComparisonMode(null));
			}


			generateAndProcessTerrain(submissionValues, id);
		},
	});

	// Update form values when dependencies change
	// useEffect(() => {
	// 	formik.setValues({
	// 		...getSuggestedValues(selectedAlgorithm, algorithms),
	// 		...getSuggestedErosionValues(erosionParameters),
	// 	});
	// }, [selectedAlgorithm, applyErosion]);

	return formik;
};
