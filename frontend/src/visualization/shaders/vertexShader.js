export const vertexShader = /*glsl*/`#version 300 es

in vec4 position;
in vec3 normal;
in vec2 texcoord;

uniform mat4 mvp;
// uniform mat4 world;
uniform mat4 model;
// uniform mat4 view;
// uniform mat4 projection;
uniform float offsets[8];
uniform float heightMultiplier;
uniform float multiplierExponent;


out vec3 v_normal;
out vec2 v_texcoord;
out float v_interpolatedHeight;
out vec3 v_viewDirection;
out vec3 v_fragPosition;

void main() {
  vec4 stretchedPosition = position; // Create a new variable
  stretchedPosition.y = pow(stretchedPosition.y*heightMultiplier, multiplierExponent);

  // gl_Position = projection * view * world * model * stretchedPosition;
  gl_Position = mvp * stretchedPosition;

  v_normal = mat3(model) * normal;
  // v_normal = mat3(mvp) * normal;

  v_texcoord = texcoord;
  v_viewDirection = normalize(-stretchedPosition.xyz);

  // if (stretchedPosition.y > offsets[0]){
  //   v_interpolatedHeight = position.y;
  // }
  // else {
  //   //Water Surface Level
  //   v_interpolatedHeight = offsets[0] * 0.99;
  // }

  v_interpolatedHeight = position.y;

  v_fragPosition = (model * stretchedPosition).xyz; // Calculate and pass the world position
  // v_fragPosition = (mvp * stretchedPosition).xyz; // Calculate and pass the world position
}`