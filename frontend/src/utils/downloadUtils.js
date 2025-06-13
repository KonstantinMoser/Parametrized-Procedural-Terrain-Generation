import store from '../store/store';
import { fetchTerrain } from '../services/apiService';

const convertToAsciiEsri = (terrainData) => {
    const numRows = terrainData.length;
    const numCols = terrainData[0].length;

    let asciiData = `NCOLS ${numCols}\n`;
    asciiData += `NROWS ${numRows}\n`;
    asciiData += "XLLCENTER 0.0\n";
    asciiData += "YLLCENTER 0.0\n";
    asciiData += "CELLSIZE 1.0\n";
    asciiData += "NODATA_VALUE -9999\n";

    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            asciiData += terrainData[i][j] + " ";
        }
        asciiData += "\n";
    }
    return asciiData;
};

const downloadTerrainData = (terrainData) => {
    var exponent = document.getElementById("exponent-input").value;
    var heightMultiplier = document.getElementById("heightMultiplierSlider").value;
    var kilometers = parseFloat(localStorage.getItem('kilometers') || '1');
    var terrainSize = terrainData.length;

    terrainData = terrainData.map(row => {
        return row.map(value => {
            return parseFloat((((Math.pow(value * heightMultiplier, exponent) * kilometers) / (terrainSize - 1)) *
                1000).toFixed(2));

        });
    });

    // Normalize the offsets based on maxOriginalValue
    const offsets = store.getState().offsets.offsets;

    // Get the water level and multiply it with the heightMultiplier and then apply exponent
    const waterLevel = parseFloat(Math.pow(heightMultiplier * offsets[0], exponent).toFixed(4));

    // Adjust terrain data based on the water level
    terrainData = terrainData.map(row => {
        return row.map(value => {
            // If the value is below the water level, set it to exactly the water level
            return value < waterLevel ? waterLevel : value;
        });
    });

    var highestPoint = parseFloat((((Math.pow(heightMultiplier, exponent) * kilometers) / (terrainSize - 1)) * 1000).toFixed(1));

    const asciiData = convertToAsciiEsri(terrainData);
    const blob = new Blob([asciiData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${terrainSize}x${terrainSize}_${kilometers}km_${highestPoint}m.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const downloadConfiguration = (algorithm, parameters) => {
    //TODO add erosion parameters
    const configurationData = JSON.stringify({ algorithm, parameters });
    const blob = new Blob([configurationData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "configuration.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const handleDownload = async (event, type, data) => {
    event.stopPropagation();
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
}




