// src/hooks/useTerrainDownload.js
import { fetchTerrain } from "../services/apiService";
import { downloadConfiguration, downloadTerrainData } from "../utils/downloadUtils";

export const useDownload = () => {
	const handleDownload = async (type, data) => {
		try {
			if (type === "terrain") {
				const response = await fetchTerrain({ hashedParams: data });
				downloadTerrainData(await response);
			} else if (type === "configuration") {
				const { algorithm, parameters } = data;
				downloadConfiguration(algorithm, parameters);
			}
		} catch (error) {
			console.error(`Error downloading ${type}:`, error);
		}
	};

	return { handleDownload };
};
