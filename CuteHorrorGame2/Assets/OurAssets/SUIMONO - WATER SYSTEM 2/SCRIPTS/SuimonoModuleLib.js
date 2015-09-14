#pragma strict

var texDisplace : Texture2D;
var texHeight1 : Texture2D;
var texHeight2 : Texture2D;
var texFoam : Texture2D;
var texRampWave : Texture2D;
var texRampDepth : Texture2D;
var texRampBlur : Texture2D;
var texRampFoam : Texture2D;
var texWave : Texture2D;
var texCube1 : Cubemap;
var texBlank : Texture2D;

var shader1 : Shader;
var shader2 : Shader;
var shader3 : Shader;
var shader4 : Shader;

var materialSurface : Material;
var materialSurfaceScale : Material;
var materialSurfaceShadow : Material;

var meshLevel : Mesh[];

var shaderRepository : Shader[];
var presetRepository : TextAsset[];


