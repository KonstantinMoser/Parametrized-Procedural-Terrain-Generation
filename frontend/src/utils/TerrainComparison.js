import { fetchTerrain } from '../services/apiService';

export async function compareTerrains(hashedParams, comparisonHashedParams) {
  const terrain1 = await fetchTerrain({ hashedParams: hashedParams });
  const terrain2 = await fetchTerrain({ hashedParams: comparisonHashedParams });
  // Calculate the height differences
  const differences = getHeightDifference(terrain1, terrain2);
  // Create the color texture from differences
  const { originalCanvas: compareTextureCanvas, inverseCanvas: compareTextureCanvasInverse } = createCanvasFromDifferences(differences); 
  console.log("compareTextureCanvas", compareTextureCanvas, "compareTextureCanvasInverse", compareTextureCanvasInverse)
  return { compareTextureCanvas, compareTextureCanvasInverse };
}


function getHeightDifference(terrain1, terrain2) {
  if (terrain1.length !== terrain2.length) {
    throw new Error('Arrays must have the same length');
  }

  return terrain1.map((subArr1, i) => {
    const subArr2 = terrain2[i];

    if (subArr1.length !== subArr2.length) {
      throw new Error('Sub-arrays must have the same length');
    }

    return subArr1.map((num1, j) => {
      const difference = num1 - subArr2[j];
      // Map the difference from [-1, 1] to [0, 1]
      // Negative differences are mapped to [0, 0.5] and positive to [0.5, 1]
      return difference * 0.5 + 0.5;
    });
  });
}

function createCanvasFromDifferences(differences) {
  // Setup for the original canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = differences[0].length;
  const height = differences.length;
  canvas.width = width;
  canvas.height = height;
  const imageData = ctx.getImageData(0, 0, width, height);

  // Setup for the inverse canvas
  const inverseCanvas = document.createElement('canvas');
  const inverseCtx = inverseCanvas.getContext('2d');
  inverseCanvas.width = width;
  inverseCanvas.height = height;
  const inverseImageData = inverseCtx.getImageData(0, 0, width, height);

  // Fill both image data arrays
  for (let i = 0; i < differences.length; i++) {
    for (let j = 0; j < differences[i].length; j++) {
      const value = differences[i][j];
      // Direct conversion to RGB, assuming value is normalized [0, 1]
      const r = value * 255;
      const b = 255 - r; // Inverse relationship for blue

      // Index for imageData arrays
      const index = (i * width + j) * 4;

      // Set colors for original
      imageData.data[index] = r;
      imageData.data[index + 1] = 0; // G is always 0
      imageData.data[index + 2] = b;
      imageData.data[index + 3] = 255; // Alpha

      // Set colors for inverse (simply swap r and b for inverse effect)
      inverseImageData.data[index] = b; // Swap R and B for inverse
      inverseImageData.data[index + 1] = 0; // G is always 0
      inverseImageData.data[index + 2] = r; // Swap B and R for inverse
      inverseImageData.data[index + 3] = 255; // Alpha
    }
  }

  // Place imageData back on canvases
  ctx.putImageData(imageData, 0, 0);
  inverseCtx.putImageData(inverseImageData, 0, 0);

  // Return both canvases
  return { originalCanvas: canvas, inverseCanvas: inverseCanvas };
}

// function createCanvasFromDifferences(differences) {
//   const canvas = document.createElement('canvas');
//   const ctx = canvas.getContext('2d');

//   const width = differences[0].length;
//   const height = differences.length;

//   canvas.width = width;
//   canvas.height = height;

//   const imageData = ctx.getImageData(0, 0, width, height);

//   for (let i = 0; i < differences.length; i++) {
//     for (let j = 0; j < differences[i].length; j++) {
//       const value = differences[i][j];
//       const [r, g, b] = valueToColor(value);

//       const index = (i * width + j) * 4;

//       imageData.data[index] = r;
//       imageData.data[index + 1] = g;
//       imageData.data[index + 2] = b;
//       imageData.data[index + 3] = 255; // Alpha value
//     }
//   }

//   ctx.putImageData(imageData, 0, 0);
//   return canvas;
// }

// function valueToColor(value) {
//   // Ensure the value is within the range [0, 1]
//   value = Math.max(0, Math.min(1, value));

//   // Interpolate from blue to red
//   const red = value; // Red increases with value
//   const blue = 1 - value; // Blue decreases with value

//   // Convert to 0-255 scale for RGB
//   const r = Math.round(red * 255);
//   const b = Math.round(blue * 255);

//   return [r, 0, b]; // RGB value, with green always 0
// }



