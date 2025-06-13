import { vec3 } from 'gl-matrix';

// Handling terrain data generation, including calculating normals, generating terrain arrays (positions, texcoords, indices), and normalizing offsets.
export default class TerrainGeneratorNew {
  constructor(terrainData, terrainWidth, terrainHeight) {
    this.terrainData = terrainData;
    this.terrainWidth = terrainWidth;
    this.terrainHeight = terrainHeight;
    this.offsets = [0.1, 0.15, 0.18, 0.25, 0.45, 0.7, 0.85]; // TODO get from state
    this.normalizedColors = [
      [0.0, 0.0, 0.4], // Water
      [0.93, 0.83, 0.68], // Beach
      [1.0, 1.0, 0.0], // Sand
      [0.0, 0.8, 0.0], // Grass
      [0.0, 0.5, 0.0], // Forest
      [0.5, 0.5, 0.5], // Rock
      [1.0, 1.0, 1.0] // Snow
    ];
  }

  generateTerrainArrays() {
    // Generate grid coordinates based on WebGL coordinates
    const position = [];
    const indices = [];
    const texcoord = [];
    var index = null;

    for (let z = 0; z < this.terrainHeight; z++) {
      for (let x = 0; x < this.terrainWidth; x++) {

        // Push vertex positions (x, height, z) for each point
        // height is set to a constant value (sea level) if under a threshold
        position.push(
          x,
          this.terrainData[z][x] < this.offsets[0] ? this.offsets[0] : this.terrainData[z][x],
          z
        );

        // Calculate and push texture coordinates (u, v) for each vertex
        const u = x / (this.terrainWidth - 1);
        const v = z / (this.terrainHeight - 1);
        texcoord.push(u, v);

        // Generate indices for 2 triangles per grid square
        if (z < this.terrainHeight - 1 && x < this.terrainWidth - 1) {
          index = z * this.terrainWidth + x;
          indices.push(index, index + this.terrainWidth, index + this.terrainWidth + 1);
          indices.push(index, index + this.terrainWidth + 1, index + 1);
        }
      }
    }

    // TODO check size of arrays and show a popup error if they're too large to be rendered
    return {
      indices: new Uint32Array(indices),
      position,
      texcoord,
    };
  }
}
