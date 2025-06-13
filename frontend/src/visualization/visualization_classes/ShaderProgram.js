import * as twgl from 'twgl.js';
import { fragmentShader } from '../shaders/fragmentShader';
import { vertexShader } from '../shaders/vertexShader';



export default class ShaderProgram {
  /**
 * The ShaderProgram class encapsulates the creation and management of a WebGL shader program,
 * including the compilation of shaders, linking them into a program, and managing uniform and attribute locations.
 * It is tailored for rendering operations that involve WebGL2 contexts, specifically targeting terrain visualization
 * by utilizing vertex and fragment shaders for detailed rendering effects.
 *
 * Responsibilities include:
 * - Establishing a WebGL2 context from a given canvas selector.
 * - Loading and compiling vertex and fragment shaders from external sources.
 * - Creating and managing textures, including loading images and setting texture parameters.
 * - Providing a uniform interface for setting shader program parameters such as light properties, texture toggles,
 *   and other material-related settings, allowing dynamic adjustments during runtime.
 * - Handling uniform location queries and setting uniform values for rendering operations.
 *
 * Usage involves instantiating the class with a specific canvas selector, followed by calling the `initialize` method
 * to load and compile the shaders, and prepare the program for rendering. This class is designed to be integrated
 * with a rendering loop where it manages the WebGL shader program's lifecycle and updates.
 */

  constructor(canvasSelector) {
    this.canvasSelector = canvasSelector;
    this.gl = document.querySelector(canvasSelector).getContext('webgl2');
    if (!this.gl) {
      console.error("WebGL2 is not supported by your browser.");
      return;
    }

    // Define light and material properties
    this.lightProperties = {
      lightDirection: [1.0, 2.0, -3.0],
      lightPosition: [0.0, 60.0, 0.0],
      lightAmbient: [0.4, 0.4, 0.4],
      lightDiffuse: [1.0, 1.0, 1.0],
      lightSpecular: [0.4, 0.4, 0.4],
      shininess: 5.0,
    };

    this.textureList = [
      { name: 'grass_diff', url: 'grass_diff.jpg' },
      { name: 'snow_diff', url: 'snow_diff.jpg' },
      { name: 'rock_diff', url: 'rock_diff.jpg' },
      { name: 'sand_diff', url: 'sand_diff.jpg' },
      { name: 'beach_diff', url: 'beach_diff.jpg' },
      { name: 'forest_diff', url: 'forest_diff.jpg' },
      { name: 'water_diff', url: 'water_diff.jpg' },
      { name: 'water_spec', url: 'water_spec.jpg' },
      { name: 'rock_spec', url: 'rock_spec.jpg' },
      { name: 'snow_spec', url: 'snow_spec.jpg' },

      // { name: 'grass_diff', url: '../textures/grass_diff.jpg' },
      // { name: 'snow_diff', url: '../textures/snow_diff.jpg' },
      // { name: 'rock_diff', url: '../textures/rock_diff.jpg' },
      // { name: 'sand_diff', url: '../textures/sand_diff.jpg' },
      // { name: 'beach_diff', url: '../textures/beach_diff.jpg' },
      // { name: 'forest_diff', url: '../textures/forest_diff.jpg' },
      // { name: 'water_diff', url: '../textures/water_diff.jpg' },
      // { name: 'water_spec', url: '../textures/water_spec.jpg' },
      // { name: 'rock_spec', url: '../textures/rock_spec.jpg' },
      // { name: 'snow_spec', url: '../textures/snow_spec.jpg' },
    ];
    this.programInfo = null;
    this.uniformLocations = {};
  }

  get getContext() {
    return this.gl;
  }

  get getProgramInfo() {
    return this.programInfo;
  }

  setHeightMultiplier(value) {
    this.gl.uniform1f(this.uniformLocations.heightMultiplier, value);
  }

  setTextureToggle(enabled) {
    this.gl.uniform1i(this.uniformLocations.textureToggle, enabled ? 1 : 0);
  }

  setExponent(value) {
    this.gl.uniform1f(this.uniformLocations.exponent, value);
  }

  setComparisonTextureEnabled(enabled) {
    this.gl.uniform1i(this.uniformLocations.comparisonTextureEnabled, enabled ? 1 : 0);
  }

  async loadShaderProgram() {
    try {
      const programInfo = twgl.createProgramInfo(this.gl, [vertexShader, fragmentShader]);
      this.programInfo = programInfo;
    } catch (error) {
      console.error('Error loading shader program:', error);
      this.programInfo = null;
    }
  }

  async loadTextures() {
    this.textures = [];

    for (const textureDef of this.textureList) {
      const texture = this.gl.createTexture();
      const image = new Image();

      await new Promise((resolve, reject) => {
        image.onload = () => {
          this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
          this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
          this.gl.generateMipmap(this.gl.TEXTURE_2D);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
          resolve();
        };
        image.onerror = reject;
        image.src = textureDef.url;
      });

      this.textures.push({ name: textureDef.name, texture });
    }
  }


  setTextureUniforms() {
    const maxTextureUnits = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);
    let currentTextureUnit = 1;

    for (const { name, texture } of this.textures) {
      if (currentTextureUnit >= maxTextureUnits) {
        console.warn('Exceeded maximum supported texture units.');
        break;
      }

      const textureName = 'Tex_' + name;
      const uniformLocation = this.gl.getUniformLocation(this.programInfo.program, textureName);

      this.gl.activeTexture(this.gl.TEXTURE0 + currentTextureUnit);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.uniform1i(uniformLocation, currentTextureUnit);

      currentTextureUnit++;
    }
  }

  getUniformLocations() {
    const { program } = this.programInfo;
    this.uniformLocations = {
      lightDirection: this.gl.getUniformLocation(program, "lightDirection"),
      lightPosition: this.gl.getUniformLocation(program, "lightPosition"),
      lightAmbient: this.gl.getUniformLocation(program, "lightAmbient"),
      lightDiffuse: this.gl.getUniformLocation(program, "lightDiffuse"),
      lightSpecular: this.gl.getUniformLocation(program, "lightSpecular"),
      shininess: this.gl.getUniformLocation(program, "shininess"),

      heightMultiplier: this.gl.getUniformLocation(program, "heightMultiplier"),
      textureToggle: this.gl.getUniformLocation(program, "isTextureEnabled"),
      exponent: this.gl.getUniformLocation(program, "multiplierExponent"),

      comparisonTextureEnabled: this.gl.getUniformLocation(program, "isComparisonTextureEnabled"),
      comparisonTexture: this.gl.getUniformLocation(program, "Tex_comparison"),
    };
  }

  setUniformValues() {
    const { lightDirection, lightPosition, lightAmbient, lightDiffuse, lightSpecular, shininess } = this.lightProperties;
    this.gl.uniform3fv(this.uniformLocations.lightDirection, lightDirection);
    this.gl.uniform3fv(this.uniformLocations.lightPosition, lightPosition);
    this.gl.uniform3fv(this.uniformLocations.lightAmbient, lightAmbient);
    this.gl.uniform3fv(this.uniformLocations.lightDiffuse, lightDiffuse);
    this.gl.uniform3fv(this.uniformLocations.lightSpecular, lightSpecular);
    this.gl.uniform1f(this.uniformLocations.shininess, shininess);
    this.gl.uniform1f(this.uniformLocations.heightMultiplier, 20.0);
    this.gl.uniform1i(this.uniformLocations.textureToggle, 0);
    this.gl.uniform1f(this.uniformLocations.exponent, 1.0);
    this.gl.uniform1i(this.uniformLocations.comparisonTextureEnabled, 0);

  }

  setComparisonTexture(canvas) {
    // Ensure the comparison texture is created
    if (!this.comparisonTexture) {
      this.comparisonTexture = this.gl.createTexture();
    }

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.comparisonTexture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    this.gl.uniform1i(this.uniformLocations.comparisonTexture, 0);
  }



  async initialize() {
    if (!this.initialized) {
      await this.loadShaderProgram();
      await this.loadTextures();
      console.log("Initialize Shader Program")
      this.getUniformLocations();
      this.gl.useProgram(this.programInfo.program);
      this.setUniformValues();
      this.setTextureUniforms();
      this.initialized = true;
    }
  }

}