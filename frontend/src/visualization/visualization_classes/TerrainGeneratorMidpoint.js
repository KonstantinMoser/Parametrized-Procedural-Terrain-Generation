import { vec3 } from 'gl-matrix';

// Handling terrain data generation, including calculating normals, generating terrain arrays (positions, texcoords, indices), and normalizing offsets.
export default class TerrainGeneratorMidpoint {
  constructor(terrainData, terrainWidth, terrainHeight, angleMultiplier = 0.5) {
    this.terrainData = terrainData;
    this.terrainWidth = terrainWidth;
    this.terrainHeight = terrainHeight;
    this.angleMultiplier = angleMultiplier;
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
    this.arrays = null;
  }

  getHeight(x, z) {
    if (x < 0 || x >= this.terrainWidth || z < 0 || z >= this.terrainHeight) {
      return 0;
    }
    let height = this.terrainData[z][x];
    return height < this.offsets[0] ? this.offsets[0] : height;
  }

  generateNormals(arrays, maxAngle) {
    function makeIndexedIndicesFn(arrays) {
      const indices = arrays.indices;
      let ndx = 0;
      const fn = function () {
        return indices[ndx++];
      };
      fn.reset = function () {
        ndx = 0;
      };
      fn.numElements = indices.length;
      return fn;
    }

    function makeUnindexedIndicesFn(arrays) {
      let ndx = 0;
      const fn = function () {
        return ndx++;
      };
      fn.reset = function () {
        ndx = 0;
      }
      fn.numElements = arrays.positions.length / 3;
      return fn;
    }

    function makeIndiceIterator(arrays) {
      return arrays.indices
        ? makeIndexedIndicesFn(arrays)
        : makeUnindexedIndicesFn(arrays);
    }

    const positions = arrays.position;
    const texcoords = arrays.texcoord;

    // first compute the normal of each face
    let getNextIndex = makeIndiceIterator(arrays);
    const numFaceVerts = getNextIndex.numElements;
    const numVerts = arrays.position.length;
    const numFaces = numFaceVerts / 3;
    const faceNormals = [];

    // Compute the normal for every face.
    // While doing that, create a new vertex for every face vertex
    for (let i = 0; i < numFaces; ++i) {
      const n1 = getNextIndex() * 3;
      const n2 = getNextIndex() * 3;
      const n3 = getNextIndex() * 3;

      const v1 = vec3.fromValues(positions[n1], positions[n1 + 1], positions[n1 + 2]);
      const v2 = vec3.fromValues(positions[n2], positions[n2 + 1], positions[n2 + 2]);
      const v3 = vec3.fromValues(positions[n3], positions[n3 + 1], positions[n3 + 2]);

      const edge1 = vec3.create();
      const edge2 = vec3.create();
      vec3.subtract(edge1, v2, v1);
      vec3.subtract(edge2, v3, v2);

      const normal = vec3.create();
      vec3.cross(normal, edge1, edge2);
      vec3.normalize(normal, normal);

      faceNormals.push(normal);
    }

    let tempVerts = {};
    let tempVertNdx = 0;

    // this assumes vertex positions are an exact match

    // This function is responsible for generating normals for a terrain mesh. This implementation focuses on smoothing normals for vertices that share the same position,
    // which is crucial for accurate lighting calculations.
    function getVertIndex(x, y, z) {

      const vertId = x + "," + y + "," + z;
      const ndx = tempVerts[vertId];
      if (ndx !== undefined) {
        return ndx;
      }
      const newNdx = tempVertNdx++;
      tempVerts[vertId] = newNdx;
      return newNdx;
    }

    const vertIndices = [];
    for (let i = 0; i < numVerts; ++i) {
      const offset = i * 3;
      const vert = positions.slice(offset, offset + 3);
      vertIndices.push(getVertIndex(vert));
    }

    // go through every vertex and record which faces it's on
    const vertFaces = [];
    getNextIndex.reset();
    for (let i = 0; i < numFaces; ++i) {
      for (let j = 0; j < 3; ++j) {
        const ndx = getNextIndex();
        const sharedNdx = vertIndices[ndx];
        let faces = vertFaces[sharedNdx];
        if (!faces) {
          faces = [];
          vertFaces[sharedNdx] = faces;
        }
        faces.push(i);
      }
    }

    tempVerts = {};
    tempVertNdx = 0;
    const newPositions = [];
    const newTexcoords = [];
    const newNormals = [];

    function getNewVertIndex(x, y, z, nx, ny, nz, u, v) {
      const vertId =
        x + "," + y + "," + z + "," +
        nx + "," + ny + "," + nz + "," +
        u + "," + v;

      const ndx = tempVerts[vertId];
      if (ndx !== undefined) {
        return ndx;
      }
      const newNdx = tempVertNdx++;
      tempVerts[vertId] = newNdx;
      newPositions.push(x, y, z);
      newNormals.push(nx, ny, nz);
      newTexcoords.push(u, v);
      return newNdx;
    }

    const newVertIndices = [];
    getNextIndex.reset();
    const maxAngleCos = Math.cos(maxAngle);
    // for each face
    for (let i = 0; i < numFaces; ++i) {
      // get the normal for this face
      const thisFaceNormal = faceNormals[i];
      // for each vertex on the face
      for (let j = 0; j < 3; ++j) {
        const ndx = getNextIndex();
        const sharedNdx = vertIndices[ndx];
        const faces = vertFaces[sharedNdx];
        const norm = vec3.create();
        faces.forEach(faceNdx => {
          // is this face facing the same way
          const otherFaceNormal = faceNormals[faceNdx];
          const dot = vec3.dot(thisFaceNormal, otherFaceNormal);
          if (dot > maxAngleCos) {
            vec3.add(norm, norm, otherFaceNormal);
          }
        });
        vec3.normalize(norm, norm);
        const poffset = ndx * 3;
        const toffset = ndx * 2;
        newVertIndices.push(getNewVertIndex(
          positions[poffset + 0], positions[poffset + 1], positions[poffset + 2],
          norm[0], norm[1], norm[2],
          texcoords[toffset + 0], texcoords[toffset + 1]));
      }
    }

    return {
      position: newPositions,
      texcoord: newTexcoords,
      normal: newNormals,
      indices: new Uint32Array(newVertIndices),
    };
  }

  generateTerrainArrays() {
    console.log("generateTerrainArrays")

    const positions = [];
    const texcoords = [];
    const indices = [];

    // Calculate the number of cells across (horizontally) and cells deep (vertically) in the terrain
    const cellsAcross = this.terrainWidth - 1;
    const cellsDeep = this.terrainHeight - 1;

    // This loop is responsible for generating vertex data for rendering a terrain mesh using a grid of vertices
    // Loop through each cell in the terrain grid
    for (let z = 0; z < cellsDeep; ++z) {
      for (let x = 0; x < cellsAcross; ++x) {
        const base0 = z * this.terrainWidth + x;
        const base1 = base0 + this.terrainWidth;

        // Calculate heights of the vertices of the current cell
        // Using the get height function four corners of the cell are calculated
        const h00 = this.getHeight(x, z);
        const h01 = this.getHeight(x + 1, z);
        const h10 = this.getHeight(x, z + 1);
        const h11 = this.getHeight(x + 1, z + 1);
        const hm = (h00 + h01 + h10 + h11) / 4; // Calculate midpoint height

        // Calculate x, z coordinates of the vertices of the current cell
        const x0 = x;
        const x1 = x + 1;
        const z0 = z;
        const z1 = z + 1;

        // Calculate the current index in the positions array
        const ndx = (positions.length / 3) >>> 0;

        // Push vertex positions for the cell vertices and midpoint
        positions.push(
          x0, h00, z0,
          x1, h01, z0,
          x0, h10, z1,
          x1, h11, z1,
          (x0 + x1) / 2, hm, (z0 + z1) / 2,
        );

        // Calculate texture coordinates for the vertices
        const u0 = x / cellsAcross;
        const v0 = z / cellsDeep;
        const u1 = (x + 1) / cellsAcross;
        const v1 = (z + 1) / cellsDeep;
        texcoords.push(
          u0, v0,
          u1, v0,
          u0, v1,
          u1, v1,
          (u0 + u1) / 2, (v0 + v1) / 2,
        );

        // Define indices for the triangles of the current cell
        indices.push(
          ndx, ndx + 4, ndx + 1,
          ndx, ndx + 2, ndx + 4,
          ndx + 2, ndx + 3, ndx + 4,
          ndx + 1, ndx + 4, ndx + 3,
        );
      }
    }

    // Define the maximum angle for normal smoothing
    const maxAngle = (2 * Math.PI / 180) * this.angleMultiplier;

    // Generate normals and vertex arrays
    const terrain_arrays = this.generateNormals({
      position: positions,
      texcoord: texcoords,
      indices,
    }, maxAngle);

    return terrain_arrays;
  }
}


//Links
//https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-import-a-heightmap-in-webgl.html
//