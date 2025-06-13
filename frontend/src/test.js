// Vertex Shader
const vs = 
`#version 300 es

in vec4 position;
in vec3 normal;
in vec2 texcoord;

uniform mat4 projection;
uniform mat4 modelView;
uniform float offsets[8];
uniform float heightMultiplier;


out vec3 v_normal;
out vec2 v_texcoord;
out float v_interpolatedHeight;
out vec3 v_viewDirection; 
out vec3 v_fragPosition; 

void main() {
  vec4 stretchedPosition = position; // Create a new variable
  stretchedPosition.y *= heightMultiplier;

  gl_Position = projection * modelView * stretchedPosition;
  v_normal = mat3(modelView) * normal;
  v_texcoord = texcoord;
  v_viewDirection = normalize(-stretchedPosition.xyz);
  if (stretchedPosition.y > offsets[0]){
    v_interpolatedHeight = position.y;
  } else {
    //Water Surface Level
    v_interpolatedHeight = offsets[0] * 0.99;
  }
  
  v_fragPosition = (modelView * stretchedPosition).xyz; // Calculate and pass the world position
  }
`;

// Fragment Shader
const fs = `
#version 300 es
precision highp float;

in vec3 v_normal;
in vec2 v_texcoord;
in float v_interpolatedHeight;
in vec3 v_viewDirection;
in vec3 v_fragPosition;

uniform vec3 lightDirection;

uniform vec3 colors[8];
uniform float offsets[8];


out vec4 fragColor;


void main() {
    vec3 lightDirection = normalize(vec3(1, 2, -3));
    
    float l = dot(lightDirection, normalize(v_normal)) * 0.5 + 0.5;

    // Apply the terrain color to the fragment
    fragColor = vec4(vec3(0.0,1.0,0.0) * l, 1.0);

    // }
  }
}`;