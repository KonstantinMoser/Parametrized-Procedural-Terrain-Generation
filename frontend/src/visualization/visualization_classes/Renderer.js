import m4 from 'm4.js';
import { mat4 } from 'gl-matrix';
import * as twgl from 'twgl.js';
import TerrainGeneratorNew from './TerrainGeneratorNew.js';
import ShaderProgram from '../visualization_classes/ShaderProgram.js';
import store from '../../store/store';
import { getWebglArraysFromBackend, fetchTerrain } from '../../services/apiService.js';


export default class Renderer {
  /**
 * The Renderer class is designed to handle the visualization of terrain data within a WebGL context.
 * It is responsible for setting up the WebGL environment, including the shader program, and managing
 * the rendering loop that draws the terrain to a canvas element. This class leverages TWGL (a tiny WebGL helper library),
 * gl-matrix for mathematical operations, and custom shader programs for rendering.
 * 
 * Features include:
 * - Dynamic terrain rendering based on heightmap data.
 * - Adjustable terrain features such as height multiplier, texture toggling, and auto-rotation.
 * - Interactive controls for zoom, rotation, and parameter adjustments via UI elements.
 * - Efficient terrain data update mechanism to handle changes in terrain data without reinitializing the entire renderer.
 * 
 * Usage requires specifying a canvas selector, terrain data (heightmap), and dimensions (width and height) upon instantiation.
 * After creating an instance, the `initialize` method must be called to set up the necessary WebGL context, compile shader programs,
 * and prepare the terrain data for rendering. The renderer supports dynamic updates to the terrain data and visualization parameters,
 * enabling interactive exploration and visualization of terrain models.
 */

  constructor(canvasSelector, hashedParams) {
    this.renderRequested = false;
    this.isUpdatingTerrain = false;

    this.canvasSelector = canvasSelector;
    this.hashedParams = hashedParams;

    this.heightMultiplier = 20.0;
    this.isTextureEnabled = false;
    this.isAutoRotationEnabled = false;
    this.exponent = 1.0;

    // Mouse panning
    this.isDragging = false;
    this.isDraggingMiddle = false;
    this.isDraggingShiftLeft = false;
    this.mouseSensitivity = 0.002;
    this.panSensitivity = 0.02;
    this.panSpeed = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.angleY = 0;
    this.angleX = 0;
    this.panX = 0;
    this.panZ = 0;


    this.maxZoom = 10;

    // Camera
    this.fov = 80 * Math.PI / 180;
    this.near = 0.1;
    this.far = 5000;
    this.target = [0, 0, 0];
    this.up = [0, 1, 0];
    this.camera = m4.identity(); // Camera state

    // Autorotation
    this.lastIncrementTime = 0;
    this.incrementInterval = 1; // 1000 milliseconds = 1 second
    this.timedRotation = 0;
    this.autoRotationSpeed = 0.01;
    this.whichArraysFromBackend = ['normal']
    this.whichArraysFromFrontend = ['indices', 'position', 'texcoord']
    this.offsets = store.getState().offsets.offsets; // [0.1, 0.15, 0.18, 0.25, 0.45, 0.7, 0.85]
    this.colors = [  // Define colors of the terrain
      [0.0, 0.0, 0.4],  // Water
      [0.93, 0.83, 0.68], // Beach   
      [1.0, 1.0, 0.0],  // Sand
      [0.0, 0.8, 0.0],  // Grass   
      [0.0, 0.5, 0.0],  // Forest   
      [0.5, 0.5, 0.5], // Rock    
      [1.0, 1.0, 1.0] // Snow
    ];
  }

  initialize = async () => {
    // Fetch data 
    const data = await fetchTerrain({ hashedParams: this.hashedParams });
    this.terrainData = data;
    this.terrainHeight = data.length;
    this.terrainWidth = data[0].length;


    // zooming
    this.zoomSpeed = this.terrainWidth / 3000;
    this.minZoom = this.terrainWidth;
    this.zoomFactor = this.minZoom;


    // Initialization logic
    this.shaderProgram = new ShaderProgram(this.canvasSelector);
    await this.shaderProgram.initialize()
    this.gl = this.shaderProgram.getContext;
    this.programInfo = this.shaderProgram.getProgramInfo;
    this.aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
    this.arrays = await this.getWebglArrays();
    this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, this.arrays);

    // Setup UI controls and event listeners
    this.setupUIControls();
    this.setupEventListeners();

    this.flattenedColors = this.colors.flat();

    this.isWebGLContextReady = true;

    // Start the render loop
    this.requestRender();
  }

  requestRender = () => {
    if (!this.renderRequested) {
      requestAnimationFrame(this.render.bind(this));
      this.renderRequested = true;
    }
  };

  setComparisonTexture(comparisonCanvas) {
    // Method to set a comparison texture
    if (comparisonCanvas) {
      this.shaderProgram.setComparisonTexture(comparisonCanvas);
      this.shaderProgram.setComparisonTextureEnabled(true);
    } else {
      this.shaderProgram.setComparisonTextureEnabled(false);
    }
  }


  // async updateTerrainData(newTerrainData, newTerrainHeight, newTerrainWidth, newHashedParams) {
  async updateTerrainData(newHashedParams) {

    const newTerrainData = await fetchTerrain({ hashedParams: newHashedParams });

    // Check if an update is already in progress
    if (this.isUpdatingTerrain) {
      console.log('Update is already in progress, skipping...');
      return;
    }
    this.isUpdatingTerrain = true; // Set the lock

    // Method to update terrain data and re-render
    this.terrainData = newTerrainData;
    this.terrainHeight = this.terrainData.length;
    this.terrainWidth = this.terrainData[0].length;
    this.hashedParams = newHashedParams;
    this.resetCamera();
    this.arrays = await this.getWebglArrays()
    this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, this.arrays);

    // Assuming requestRender does not return a promise, otherwise await it
    this.requestRender();

    this.isUpdatingTerrain = false; // Release the lock after rendering is scheduled
  }

  resetCamera() {
    // Reset camera after a terrain change
    this.camera = m4.identity();
    this.zoomSpeed = this.terrainWidth / 3000;
    this.minZoom = this.terrainWidth;
    this.zoomFactor = this.minZoom;
  }


  async getWebglArrays() {
    // Get terrain arrays from backend 
    let requestData = {
      hashedParams: this.hashedParams,
      whichArraysFromBackend: this.whichArraysFromBackend
    };
    const arrays = await getWebglArraysFromBackend(requestData);
    let frontArrays = {}

    // Generate mesh in frontend
    if (!this.arrays || this.whichArraysFromFrontend.length > 0) {
      const terrainGenerator = new TerrainGeneratorNew(this.terrainData, this.terrainHeight, this.terrainWidth);
      frontArrays = terrainGenerator.generateTerrainArrays();
    }

    // console.log('backend arrays: ', arrays);
    // console.log('frontend arrays: ', frontArrays);

    this.whichArraysFromFrontend.forEach(
      (arrayName) => arrays[arrayName] = frontArrays[arrayName]
    );

    return arrays;
  }



  setComparisonTexture(comparisonCanvas) {
    // Method to set a comparison texture
    if (comparisonCanvas) {
      this.shaderProgram.setComparisonTexture(comparisonCanvas);
      this.shaderProgram.setComparisonTextureEnabled(true);
    } else {
      this.shaderProgram.setComparisonTextureEnabled(false);
    }
  }

  setupUIControls() {
    // Setup UI controls for interactive adjustments
    // Height Multiplier Slider
    const heightMultiplierSlider = document.getElementById("heightMultiplierSlider");
    heightMultiplierSlider.value = this.heightMultiplier; // Set the slider's default value
    heightMultiplierSlider.addEventListener("input", () => {
      const heightMultiplier = parseFloat(heightMultiplierSlider.value);
      this.shaderProgram.setHeightMultiplier(heightMultiplier);
      this.requestRender();
    });

    // Texture Toggle
    const textureToggle = document.getElementById('texture-toggle');
    textureToggle.checked = this.isTextureEnabled; // Set the toggle's default state
    textureToggle.addEventListener('change', () => {
      this.isTextureEnabled = textureToggle.checked;
      this.shaderProgram.setTextureToggle(this.isTextureEnabled);
      this.requestRender();
    });

    // Rotation Toggle
    const rotationToggle = document.getElementById('rotation-toggle');
    rotationToggle.checked = this.isAutoRotationEnabled; // Set the toggle's default state
    rotationToggle.addEventListener('change', () => {
      this.isAutoRotationEnabled = rotationToggle.checked;
      this.requestRender();
    });

    // Exponent Input
    const exponentInput = document.getElementById("exponent-input");
    exponentInput.value = this.exponent; // Set the input's default value
    exponentInput.addEventListener("input", () => {
      this.exponent = parseFloat(exponentInput.value);
      this.shaderProgram.setExponent(this.exponent);
      this.requestRender();
    });
  }


  setupEventListeners() {
    // Setup event listeners for interactive canvas manipulation
    const pressedKeys = {};

    window.addEventListener('resize', () => {
      this.aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
      this.requestRender();
    });

    window.addEventListener('keydown', (event) => {
      pressedKeys[event.key] = true;
    });

    window.addEventListener('keyup', (event) => {
      pressedKeys[event.key] = false;
    });

    this.gl.canvas.addEventListener('mousedown', (event) => {
      this.isDragging = event.button === 0 && !event.shiftKey;
      this.isDraggingMiddle = event.button === 1; // Middle mouse button
      this.isDraggingShiftLeft = event.button === 0 && event.shiftKey; // Shift + Left mouse button  
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    });

    this.gl.canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.isDraggingMiddle = false;
      this.isDraggingShiftLeft = false;
    });

    this.gl.canvas.addEventListener('mouseleave', (e) => {
      this.isDragging = false;
      this.isDraggingMiddle = false;
      this.isDraggingShiftLeft = false;
    });

    this.gl.canvas.addEventListener('mousemove', (event) => {
      const deltaX = this.lastMouseX - event.clientX;
      const deltaY = this.lastMouseY - event.clientY;

      // Camera panning
      if (this.isDragging) {
        // this.updateViewAngle(deltaX, deltaY);
        this.panSpeed = Math.max(this.terrainWidth / 2500, this.panSensitivity * this.zoomFactor / 10);
        this.panX = deltaX * this.panSpeed;
        this.panZ = deltaY * this.panSpeed;
        this.camera = m4.translate(this.camera, this.panX, 0, this.panZ);
        this.requestRender();
      }
      // Horizontal (turntable) and vertical rotation 
      else if (this.isDraggingMiddle || this.isDraggingShiftLeft) {
        this.angleY = deltaX * this.mouseSensitivity;
        this.angleX += deltaY * this.mouseSensitivity;
        this.camera = m4.yRotate(this.camera, this.angleY);
        this.requestRender();
      }
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    });

    this.gl.canvas.addEventListener('wheel', (event) => {
      // Handle camera zoom
      event.preventDefault();

      // Adjust the zoom factor based on the scroll event
      this.zoomFactor += event.deltaY * this.zoomSpeed;

      // Ensure the zoom factor stays within the defined limits
      this.zoomFactor = Math.max(this.maxZoom, Math.min(this.minZoom, this.zoomFactor));

      this.requestRender();
    });
  }

  updateViewAngle(deltaX, deltaY) {
    // Update horizontal and vertical angles based on mouse movement
    this.angleY -= deltaX * this.mouseSensitivity;
    this.angleX -= deltaY * this.mouseSensitivity;
  }



  render(time) {
    // The main render loop
    const gl = this.gl;

    // Clear the color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Check if enough time has passed since the last increment
    if (time - this.lastIncrementTime >= this.incrementInterval) {
      if (this.isAutoRotationEnabled) {
        // this.timedRotation += this.autoRotationSpeed;
        this.camera = m4.yRotate(this.camera, this.autoRotationSpeed);
      }
      this.lastIncrementTime = time;
    }

    // Resize the canvas
    twgl.resizeCanvasToDisplaySize(gl.canvas);

    // Set the viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    // Setup projection matrix
    const projection = mat4.perspective(mat4.create(), this.fov, this.aspect, this.near, this.far);

    // Setup final camera view matrix
    let finalCamera = this.camera;

    // Apply cumulative x rotation here to keep it independent from camera y rotation 
    // and keep camera always upright
    finalCamera = m4.xRotate(finalCamera, this.angleX);

    // Rotate finalCamera down by 45° (not using lookAt() to avoid 
    // fixating on center of terrain or some other point)
    finalCamera = m4.xRotate(finalCamera, -45 * Math.PI / 180)

    // Apply zoom to finalCamera
    finalCamera = m4.translate(finalCamera, 0, 0, this.zoomFactor);

    const view = m4.inverse(finalCamera);

    // Setup model matrix
    let modelMatrix = m4.identity();

    // Center the terrain
    modelMatrix = m4.translate(modelMatrix, -(this.terrainWidth / 2), 0, -(this.terrainHeight / 2));

    // Calculate MVP matrix
    const mvp = m4.multiply(m4.multiply(projection, view), modelMatrix);


    // Use shader program and set uniforms
    gl.useProgram(this.programInfo.program);
    twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo);

    // Set uniforms for the shader program
    twgl.setUniforms(this.programInfo, {
      model: modelMatrix,
      mvp: mvp,
      colors: this.flattenedColors,
      offsets: this.offsets,
    });

    // Draw the terrain
    twgl.drawBufferInfo(gl, this.bufferInfo);


    this.renderRequested = false;

    // Request the next frame, if needed
    if (this.isAutoRotationEnabled) {
      this.requestRender();
    }
  }

}