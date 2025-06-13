//src/services/apiService.js
import { run } from "../visualization/visualization_classes/2d_color_heightmap.js";

export const retrieveTerrainData = (requestData) => {
	const response = fetch(
		`http://localhost:5000/retrieve_terrain?hashedParams=${requestData.hashedParams}`,
		{
			method: "GET",
		}
	);
	return response;
};

export const fetchDownsampleTerrain = async (hashedParams, targetSize = 32) => {
	try {
		const response = await fetch(
			`http://localhost:5000/downsample_terrain?hashedParams=${hashedParams}&targetSize=${(targetSize)}`,
			{
				method: "GET",
				headers: {
					"Accept": "application/json",
				}
			}
		);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Could not fetch downsampled terrain:", error);
		throw error;
	}
};


export const renderMinimapToPngUrl = async (hashedParams) => {
	// Get a downsampled terrain, render it, and save render to a PNG
	// returns the URL of the PNG
	const downsizedMap = await fetchDownsampleTerrain(hashedParams).catch(console.error);
	// Save 2D minimap render to image
	const minimapCanvas = document.createElement('canvas');
	const minimapSize = 32; // Change this in fetchDownsampleTerrain() as well
	minimapCanvas.width = minimapSize * 10;
	minimapCanvas.height = minimapSize * 10;
	run(downsizedMap, minimapSize, minimapSize, minimapCanvas);
	return minimapCanvas.toDataURL("image/png");
}


export const generateTerrainData = async (requestData) => {
	try {
		const response = await fetch("http://localhost:5000/generate_terrain", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestData)
		});

		if (!response.ok) {

			throw new Error(`Request failed with status: ${response.status}`);
		}
		console.log('Terrain generated successfully');
		return true;
	} catch (error) {
		console.error('Error generating terrain:', error.message);
		throw error;
	}
};

export const fetchTerrain = async (requestData) => {
	try {
		let response;
		if (!requestData.hashedParams || !requestData.isGenerated) {
			await generateTerrainData(requestData);
			response = await retrieveTerrainData(requestData);
		}
		if (requestData.hashedParams && requestData.isGenerated) {
			response = await retrieveTerrainData(requestData);
		}
		if (!response.ok) {
			await generateTerrainData(requestData);
			response = await retrieveTerrainData(requestData);
		} else {
			if (!response.ok) {
				throw new Error(
					`Network response was not ok (status: ${response.status})`
				);
			}
		}
		return response.json();
	} catch (error) {
		console.error("Error fetching terrain:", error);
		throw error;
	}
};

export const getWebglArraysFromBackend = async (requestData) => {
	const response = await fetch(
		`http://localhost:5000/webgl_arrays`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestData),
		}
	)
	if (!response.ok) {
		throw new Error(
			`Network response was not ok (status: ${response.status})`
		);
	}
	let arrays = await response.json();
	arrays['indices'] = new Uint32Array(arrays['indices']);
	return arrays

};



