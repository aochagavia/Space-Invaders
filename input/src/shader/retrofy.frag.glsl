#version 400
layout (location = 0) out vec4 FragColor;
layout (location = 1) out vec4 BrightColor;
in vec2 TexCoords;

uniform float baseRand;
uniform sampler2D screenTexture;
uniform vec4 retroColorLeft;
uniform float linePosLeft;
float lineThickness = 0.002;

uniform vec4 retroColorRight;
uniform float linePosRight;

subroutine vec4 RenderPassType();
subroutine uniform RenderPassType RenderPass;

// psuedo random number generator
float rand(vec2 co)
{
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453 * baseRand);
}

vec4 getRetroColoring(vec2 texCoords, float linePos, vec4 retroColor)
{
  float u = texCoords.x;
  float v = texCoords.y;
  float amplitude = u*v*0.05 + 0.05;
  float distanceFromLine = abs(linePos - v);
  float lineAmp = 0.0;
  if(distanceFromLine < lineThickness) lineAmp = (lineThickness - distanceFromLine)/lineThickness;
  float darkLightDelta = 0.18;
  float dark = (darkLightDelta/2)*(3-linePos);
  amplitude += dark;
  if(v < linePos) amplitude += darkLightDelta;
  return (amplitude + lineAmp)*retroColor;
}

vec4 getLeftSideFragment(vec2 texCoords)
{
  return getRetroColoring(texCoords, linePosLeft, retroColorLeft);
}

vec4 getRightSideFragment(vec2 texCoords)
{
  return getRetroColoring(texCoords, linePosRight, retroColorRight);
}

vec4 getColoring(vec2 texCoords)
{
  if(texCoords.x < 0.5) return getLeftSideFragment(texCoords);
  else return getRightSideFragment(texCoords);
}

vec4 getScreenThingy()
{
  vec2 transformedCoords = (2*TexCoords - vec2(1));
  float transformed_xy = abs(transformedCoords.x*transformedCoords.y);
  float factor = 1.05*(1+0.1*pow(transformed_xy, 2));
  vec2 curved_screen_coords = factor*transformedCoords;
  vec2 curved_screen_uv = 0.5*(curved_screen_coords + vec2(1));
  if(curved_screen_uv.x > 0.0 && curved_screen_uv.y > 0.0 && curved_screen_uv.x < 1.0 && curved_screen_uv.y < 1.0) {
    float r =rand(curved_screen_uv); // rand(TexCoords);
    vec4 noise = vec4(vec3(0.05*r), 1);
    vec4 coloring = getColoring(curved_screen_uv); // getColoring(TexCoords);
    return texture(screenTexture, curved_screen_uv) + noise + coloring;
  }
  return vec4(0,0,0,1.0);
}

subroutine (RenderPassType)
vec4 noise()
{
  vec4 texCol = getScreenThingy();
  return texCol;
}

subroutine (RenderPassType)
vec4 extractBright()
{
  // todo
  // float brightness = dot(FragColor.rgb, vec3(0.2126, 0.7151, 0.0722));
  // if(brightness > 1.0) BrightColor = vec4(FragColor.rgb, 1.0);
  // else BrightColor = vec4(0.0, 0.0, 0.0, 1.0);
  return texture(screenTexture, TexCoords);
}

subroutine (RenderPassType)
vec4 blurVertically()
{
  // todo
  return vec4(0.0, 1.0, 0.0, 1.0);
}

subroutine (RenderPassType)
vec4 blurHorizontallyAndJoin()
{
  // todo
  return vec4(0.0, 0.0, 1.0, 1.0);
}

void main()
{
  FragColor = RenderPass();
}