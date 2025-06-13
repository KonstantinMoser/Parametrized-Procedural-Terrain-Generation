import Renderer from '../visualization/visualization_classes/Renderer.js';
import { compareTerrains } from "../utils/TerrainComparison.js";
import { enableLoading, disableLoading, setLoadingDesc, clearLoadingDesc } from "../store/reducers/loadingReducer";

export async function handleTerrainForComparison(terrainHasheParams, comparisonHashedParams, mode) {
	const { compareTextureCanvas, compareTextureCanvasInverse
	} = await compareTerrains(terrainHasheParams, comparisonHashedParams);

	if (mode === "overlay") {
		return {
			compareTextureCanvas: compareTextureCanvas,
			compareTextureCanvasInverse: compareTextureCanvasInverse
		};
	} else {
		return { compareTextureCanvas: false, compareTextureCanvasInverse: false };
	}
};

export const handleRenderer = async (hashedParams, rendererRef, canvasId, dispatch, comparisonCanvas) => {
	dispatch(setLoadingDesc("Generating terrain models"));
	if (rendererRef.current && rendererRef.current.isWebGLContextReady) {
		console.log("Update");
		await rendererRef.current.updateTerrainData(hashedParams);

	} else {
		console.log("Initialize");
		rendererRef.current = new Renderer(canvasId, hashedParams);
		await rendererRef.current.initialize();
	}
	rendererRef.current.setComparisonTexture(comparisonCanvas);
	dispatch(clearLoadingDesc());
	dispatch(disableLoading());

};


export function downsampleHeightMap(originalMap, targetSize) {
	const originalHeight = originalMap.length;
	const originalWidth = originalMap[0].length;

	const downsampledMap = new Array(targetSize).fill(0).map(() => new Array(targetSize).fill(0));

	const heightRatio = originalHeight / targetSize;
	const widthRatio = originalWidth / targetSize;

	for (let y = 0; y < targetSize; y++) {
		for (let x = 0; x < targetSize; x++) {
			let sum = 0;
			let count = 0;

			// Calculate the average of the area in the original map corresponding to this point
			for (let oy = Math.floor(y * heightRatio); oy < Math.ceil((y + 1) * heightRatio); oy++) {
				for (let ox = Math.floor(x * widthRatio); ox < Math.ceil((x + 1) * widthRatio); ox++) {
					sum += originalMap[oy][ox];
					count++;
				}
			}

			downsampledMap[y][x] = sum / count;
		}
	}

	return downsampledMap;
}

const cartesianProduct = (arr) => {
	return arr.reduce((a, b) => {
		return a.flatMap(d => b.map(e => [d, e].flat()));
	});
}

export const extractCombinations = (parameters) => {
	const parameterArrays = Object.entries(parameters).map(([key, value]) => {
		const valuesArray = Array.isArray(value) ? value : [value];
		return valuesArray.map(val => ({ [key]: val }));
	});
	const combinations = cartesianProduct(parameterArrays);
	const mergedCombinations = combinations.map(combination => {
		return combination.reduce((acc, cur) => {
			return { ...acc, ...cur };
		}, {});
	});
	return mergedCombinations;
}

