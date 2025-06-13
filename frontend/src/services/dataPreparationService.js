import MD5 from "crypto-js/md5";
//src/services/dataPreperationService.js

export const prepareTerrainRequestData = (formValues) => {
	const hashedParams = MD5(JSON.stringify(formValues)).toString();
	const requestData = {
		selectedAlgorithm: formValues.selectedAlgorithm,
		terrainParameters: formValues.terrainParameters,
		applyErosion: formValues.applyErosion,
		erosionParameters: formValues.erosionParameters,
		hashedParams: hashedParams
	};
	return requestData;
}