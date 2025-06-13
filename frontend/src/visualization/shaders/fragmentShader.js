export const fragmentShader = /*glsl*/`#version 300 es
precision highp float;

in vec3 v_normal;
in vec2 v_texcoord;
in float v_interpolatedHeight;
in vec3 v_viewDirection;
in vec3 v_fragPosition;

uniform vec3 lightDirection;
uniform vec3 lightPosition;
uniform vec3 lightAmbient;
uniform vec3 lightDiffuse;
uniform vec3 lightSpecular;
uniform float shininess;

uniform vec2 repeatFactor;
uniform vec2 rasterTexCoord;

uniform bool isTextureEnabled;
uniform int isComparisonTextureEnabled;

uniform vec3 colors[8];
uniform float offsets[8];

uniform sampler2D Tex_grass_diff;
uniform sampler2D Tex_snow_diff;
uniform sampler2D Tex_rock_diff;
uniform sampler2D Tex_sand_diff;
uniform sampler2D Tex_beach_diff;
uniform sampler2D Tex_forest_diff;
uniform sampler2D Tex_water_diff;

uniform sampler2D Tex_snow_spec;
uniform sampler2D Tex_rock_spec;
uniform sampler2D Tex_sand_spec;
uniform sampler2D Tex_water_spec;

uniform sampler2D Tex_comparison;


out vec4 fragColor;


// Define spotlight parameters
float spotlightOuterCutoff = 0.2; // Outer cutoff angle in radians (about 48.6 degrees)
float spotlightInnerCutoff = 0.18; // Inner cutoff angle in radians (about 45.9 degrees)


vec3 computeNormal() {
  vec3 dFdxPosition = dFdx(v_fragPosition); // Partial derivative in x direction
  vec3 dFdyPosition = dFdy(v_fragPosition); // Partial derivative in y direction

  // Calculate the normal using cross product
  vec3 normal = normalize(cross(dFdxPosition, dFdyPosition));

  return normal;
}

vec4 biomeDiff(float height, float steepness) {
  float steepThreshold = 120.0; // Threshold for steepness
  vec2 repeatFactor = vec2(5.0);
  vec2 rasterTexCoord = fract(v_texcoord * repeatFactor);
  // Sample textures for diffuse colors
  vec4 grassColor = texture(Tex_grass_diff, rasterTexCoord);
  vec4 snowColor = texture(Tex_snow_diff, rasterTexCoord);
  vec4 rockColor = texture(Tex_rock_diff, rasterTexCoord);
  vec4 sandColor = texture(Tex_sand_diff, rasterTexCoord);
  vec4 beachColor = texture(Tex_beach_diff, rasterTexCoord);
  vec4 forestColor = texture(Tex_forest_diff, rasterTexCoord);
  vec4 waterColor = texture(Tex_water_diff, rasterTexCoord);



  float steepFactor = smoothstep(0.0, steepThreshold, steepness);

  // Determine base texture based on height
  vec4 baseColor;
  if (height < offsets[0]) {
      baseColor = waterColor;
  } else if (height < offsets[1]) {
      baseColor = mix(waterColor, beachColor, smoothstep(offsets[0], offsets[1], height));
  } else if (height < offsets[2]) {
      baseColor = mix(beachColor, sandColor, smoothstep(offsets[1], offsets[2], height));
  } else if (height < offsets[3]) {
      baseColor = mix(sandColor, grassColor, smoothstep(offsets[2], offsets[3], height));
  } else if (height < offsets[4]) {
      baseColor = mix(grassColor, forestColor, smoothstep(offsets[3], offsets[4], height));
  } else if (height < offsets[5]) {
      baseColor = mix(forestColor, rockColor, smoothstep(offsets[4], offsets[5], height));
  } else {
      baseColor = mix(rockColor, snowColor, smoothstep(offsets[5], offsets[6], height));
  }

// Calculate blend factor for transition from rock to snow
  float snowTransitionFactor = smoothstep(offsets[5], offsets[6], height);

  // Determine color for the rock to snow transition
  vec4 rockToSnowColor = mix(rockColor, snowColor, snowTransitionFactor);

  // Blend with rock texture if steep
  vec4 finalColor = mix(baseColor, rockColor, steepFactor);

  // Override final color with rock to snow transition color if height is above offsets[5]
  if (height >= offsets[5]) {
      finalColor = rockToSnowColor;
  }

  return finalColor;
}

vec4 biomeSpec(float height) {
  vec2 repeatFactor = vec2(10.0);
  vec2 rasterTexCoord = fract(v_texcoord * repeatFactor);

  vec4 snowColor = texture(Tex_snow_spec, rasterTexCoord);
  vec4 rockColor = texture(Tex_rock_spec, rasterTexCoord);
  vec4 sandColor = texture(Tex_sand_spec, rasterTexCoord);
  vec4 waterColor = texture(Tex_water_spec, rasterTexCoord);
  vec4 otherColorSpec = vec4(0.0);

  

  if (v_interpolatedHeight <= offsets[0]) {
      return waterColor;
  } else if (v_interpolatedHeight < offsets[1]) {
      return mix(waterColor, otherColorSpec, smoothstep(offsets[0], offsets[1], v_interpolatedHeight));
  } else if (v_interpolatedHeight < offsets[2]) {
      return otherColorSpec;
  } else if (v_interpolatedHeight < offsets[3]) {
      return otherColorSpec;
  } else if (v_interpolatedHeight < offsets[4]) {
      return otherColorSpec;
  } else if (v_interpolatedHeight < offsets[5]) {
    return mix(otherColorSpec, rockColor, smoothstep(offsets[4], offsets[5], v_interpolatedHeight));
    } else if (v_interpolatedHeight < offsets[6]){
      return mix(rockColor, snowColor, smoothstep(offsets[5], offsets[6], v_interpolatedHeight));
  } else {
    return snowColor;
  }
}

// Function to adjust color saturation
vec3 adjustSaturation(vec3 color, float saturationFactor) {
    float luma = dot(color, vec3(0.299, 0.587, 0.114)); // Calculate luma (greyscale)
    return mix(vec3(luma), color, saturationFactor); // Mix grey with original color based on saturation factor
}

// Function to compute steepness
float computeSteepness(vec3 normal) {
    vec3 upVector = vec3(0.0, 1.0, 0.0);
    return degrees(acos(dot(normalize(normal), upVector)));
}

void main() {

if (isComparisonTextureEnabled == 1) {
      vec4 comparisonTexColor = texture(Tex_comparison, v_texcoord);
      fragColor = comparisonTexColor;
      return;
  }

vec3 normal = normalize(computeNormal());
float steepness = computeSteepness(normal);
vec3 lightDir = normalize(lightDirection); // Use a fixed light direction

if (isTextureEnabled) {
  // Lighting calculations
  float nDotL = max(dot(normal, lightDir), 0.0);
  vec3 reflectionDir = reflect(-lightDir, normal);
  float specIntensity = pow(max(dot(reflectionDir, normalize(v_viewDirection)), 0.0), shininess);

  // Texture sampling
  vec4 texelColorDiff = biomeDiff(v_interpolatedHeight, steepness);
  vec4 texelColorSpec = biomeSpec(v_interpolatedHeight);

  // Adjust texture color saturation
  texelColorDiff.rgb = adjustSaturation(texelColorDiff.rgb, 1.3); // Increase saturation

  // Adjust lighting contributions
  vec3 ambient = lightAmbient * texelColorDiff.rgb;
  vec3 diffuse = lightDiffuse * nDotL * texelColorDiff.rgb;
  vec3 specular = lightSpecular * specIntensity * texelColorSpec.rgb;

  // Final color
  vec3 finalColor = ambient + diffuse + specular;

  fragColor = vec4(finalColor, 1.0);

  } else{
    float l = dot(lightDir, normal) * 0.5 + 0.5;

    // Determine the color based on the interpolated height and color offsets
    float interpolatedHeight = v_interpolatedHeight;

    vec3 terrainColor = colors[6]; // Default color

    // If the height is smaller than the second offset it is colored dark blue (water)
    if (interpolatedHeight <= offsets[1]){
      fragColor=vec4(colors[0], 1.0);
    }
    else{
      // Loop through the offsets and mix colors accordingly
      for (int i = 1; i < 7; ++i) {
          if (interpolatedHeight >= offsets[i - 1] && interpolatedHeight < offsets[i]) {
              float t = (interpolatedHeight - offsets[i - 1]) / (offsets[i] - offsets[i - 1]);
              terrainColor = mix(colors[i - 1], colors[i], t);
              break;
          }
      }


    // Apply the terrain color to the fragment
    fragColor = vec4(terrainColor * l, 1.0); }
  }
}`
