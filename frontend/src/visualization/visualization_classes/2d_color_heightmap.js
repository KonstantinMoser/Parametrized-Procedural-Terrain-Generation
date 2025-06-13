export function run(terrainData, terrainHeight, terrainWidth, canvas) {
  // const canvas = document.getElementById(canvasId);
  const gl = canvas.getContext('webgl2');

  if (!gl) {
    alert('WebGL2 is not supported by your browser.');
    return;
  }

  const program = gl.createProgram();

  // Vertex shader
  const vertexShaderSource = `#version 300 es
  #pragma vscode_glsllint_stage: vert

  uniform vec2 uResolution;

  // Declare vertex attributes with static location
  // Thus, no need to look up or set locations in JS
  layout(location=0) in vec2 aPosition;
  layout(location=1) in float aPointSize;
  layout(location=2) in vec4 aColor;

  // Declare output 'varyings' for vertex shader 
  out vec4 vColor; 
  
  void main(){
    vColor = aColor;
    gl_PointSize = aPointSize;
    
    // Convert from screen space (pixels) to clip space ([-1,1])
    vec2 clipSpace = (aPosition / uResolution) * 2.0 - 1.0;
    
    gl_Position = vec4(clipSpace, 0, 1);
    // gl_Position = aPosition;
  }`;

  // Fragment shader
  const fragmentShaderSource = `#version 300 es
  #pragma vscode_glsllint_stage: frag
  
  precision mediump float;

  // Declare inputs from vertex shader
  in vec4 vColor; 

  // Declare outputs
  out vec4 fragColor;

  // Define the color ranges and offsets
  const vec3 colors[8] = vec3[8](
    vec3(0.0, 0.0, 0.8),                          // dark Blue for deep water
    vec3(0.3, 0.3, 1.0),                          // light blue for shallow water
    vec3(238.0/255.0, 214.0/255.0, 175.0/255.0),  // Light brown for beach
    vec3(0.0, 0.8, 0.0),                          // Light green for grass
    vec3(0.0, 0.5, 0.0),                         // Dark green for forest
    vec3(0.0, 0.3, 0.0),                          // Even darker green for pine forest
    vec3(0.6, 0.6, 0.6),                          // Grey-ish for rocks/mountain
    vec3(1.0, 1.0, 1.0)                           // White for snow
  );

  const float offsets[8] = float[8](0.0, 0.1, 0.2, 0.3, 0.35, 0.5, 0.8, 1.0);

  void main(){
    // Calculate the normalized height value
    // float height = (vColor[0] + 10.0) / 20.0; // Adjust the scale factor as needed
    float height = vColor[0];

    // Map height to nearest color
    int colorIndex = 0;
    for (int i = 1; i < 8; i++) {
      if (height < offsets[i]) {
        colorIndex = i - 1;
        break;
      }
    }

    // Interpolate between the two colors based on the height value
    vec3 color1 = colors[colorIndex];
    vec3 color2 = colors[colorIndex + 1];
    float t = (height - offsets[colorIndex]) / (offsets[colorIndex + 1] - offsets[colorIndex]);
    vec3 finalColor = mix(color1, color2, t);

    fragColor = vec4(finalColor, 1.0);
  }`;

  // Compile and attach shaders to program
  {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    gl.attachShader(program, vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log(gl.getShaderInfoLog(vertexShader));
      console.log(gl.getShaderInfoLog(fragmentShader));
    }
  }

  // Run program
  gl.useProgram(program);

  // Find uResolution gpu location
  const uResolutionLoc = gl.getUniformLocation(program, "uResolution");

  // pass canvas resolution to uniform
  // console.log("canvas res: ", gl.canvas.width, gl.canvas.height);
  gl.uniform2f(uResolutionLoc, gl.canvas.width, gl.canvas.height);

  // Get a random height map (2d array)
  const pointSize = Math.min(gl.canvas.width / terrainWidth, gl.canvas.height / terrainHeight);
  const halfPointSize = pointSize / 2;

  // Expand the heightmap into a VBO for the visualization
  let vertData = [];

  for (let y = terrainHeight - 1; y >= 0; y--) {
    for (let x = 0; x < terrainWidth; x++) {
      let point = [
        x * pointSize + halfPointSize, // x & y coords
        (terrainHeight - 1 - y) * pointSize + halfPointSize,
        pointSize,
        terrainData[y][x], // Colors
        terrainData[y][x],
        terrainData[y][x]
      ];

      vertData.push(...point);

      if (x > 10000 || y > 10000) {
        console.log("Error: infinite loop caught! ", x, y);
        break;
      }
    }
  }

  vertData = new Float32Array(vertData);
  // console.log('vertData: ', vertData);

  // Define same gpu locations as defined in vertex shader
  const aPositionLoc = 0;
  const aPointSizeLoc = 1;
  const aColorLoc = 2;

  // pass generic vertex attributes in numbered locations
  gl.vertexAttrib2f(aPositionLoc, 0, 0);
  gl.vertexAttrib1f(aPointSizeLoc, pointSize);
  gl.vertexAttrib4f(aColorLoc, 0, 0.7, 1, 1);

  const vertBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.STATIC_DRAW);

  gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 24, 0);
  gl.vertexAttribPointer(aPointSizeLoc, 1, gl.FLOAT, false, 24, 8);
  gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 24, 12);

  gl.enableVertexAttribArray(aPositionLoc);
  gl.enableVertexAttribArray(aPointSizeLoc);
  gl.enableVertexAttribArray(aColorLoc);

  // console.log(terrainData.length * terrainData[0].length);
  gl.drawArrays(gl.POINTS, 0, terrainWidth * terrainHeight);

};

