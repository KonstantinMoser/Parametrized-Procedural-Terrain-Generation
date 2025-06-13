//useTerrainGenerator.js
import { useDispatch, useSelector } from "react-redux";
import { addToHistory } from "../store/reducers/historyReducer";
import { generateTerrainData, renderMinimapToPngUrl } from "../services/apiService";
import { setTerrainHashedParams, setComparisonHashedParams, setTerrainSize, setComparisonSize } from "../store/reducers/terrainReducer";
import { enableLoading, disableLoading, setLoadingDesc } from "../store/reducers/loadingReducer";
import { prepareTerrainRequestData } from "../services/dataPreparationService";
import { resetTerrainDOM } from "../utils/domUtils.js";
import { extractCombinations } from "../utils/terrainUtils";

export const useTerrainGenerator = () => {
	const dispatch = useDispatch();
	const loading = useSelector((state) => state.terrain.isLoading);

	const setData = (id, requestData) => {

		if (id.id === "comparison") {
			dispatch(setComparisonHashedParams(requestData.hashedParams));
			dispatch(setComparisonSize(requestData.terrainParameters.size));
		} else {
			dispatch(setTerrainHashedParams(requestData.hashedParams));
			dispatch(setTerrainSize(requestData.terrainParameters.size));
		}
	};

	const storeGeneratedTerrain = async (formValues, requestData, isGenerated) => {
		// const staking("No terrain stacked")
		const downsizedMap = isGenerated ? await
			renderMinimapToPngUrl(requestData.hashedParams).catch(console.error) :
			null;

		const currentDateTime = new Date().toLocaleString('de-DE', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});

		const historyEntry = {
			isGenerated: isGenerated,
			requestData: requestData,
			algorithm: requestData.selectedAlgorithm,
			parameters: requestData.terrainParameters,
			hashedParams: requestData.hashedParams,
			isEroded: formValues.applyErosion,
			erosionParameters: formValues.applyErosion ? formValues.erosionParameters : {},
			imageURL: downsizedMap ? downsizedMap : null,
			stacking_time: (requestData.terrainParameters.terrain_data) ? currentDateTime : "No terrain stacked" 
		};
		dispatch(addToHistory(historyEntry));
	}

	const generateAndProcessTerrain = async (formValues, id) => {
		resetTerrainDOM();
		dispatch(enableLoading());
		dispatch(setLoadingDesc("Generating terrain"));
		try {
			if (id.id === "multiple") {
				const combinations = extractCombinations(formValues.terrainParameters);
				for (const [index, combination] of combinations.entries()) {
					const requestData = prepareTerrainRequestData({
						...formValues,
						terrainParameters: combination
					})
					if (index === 0) {
						await generateTerrainData(requestData);
						setData(id, requestData);
						storeGeneratedTerrain(formValues, requestData, true);
					}
					else {
						storeGeneratedTerrain(formValues, requestData, false);
					}
				}
			}
			else {
				const requestData = prepareTerrainRequestData(formValues);
				await generateTerrainData(requestData);
				setData(id, requestData);
				storeGeneratedTerrain(formValues, requestData, true);
			}
		} catch (error) {
			console.error("Error processing terrain:", error);
			dispatch(disableLoading());
		} finally { dispatch(disableLoading()); }
	};


	return { loading, generateAndProcessTerrain };
};


