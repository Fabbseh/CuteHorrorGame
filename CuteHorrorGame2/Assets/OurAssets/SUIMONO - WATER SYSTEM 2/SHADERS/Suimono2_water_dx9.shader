Shader "Suimono2/water_dx9" {



Properties {

	_OceanBlendTex("OceanBlendTex", 2D) = "white" {}
	_Tess ("Tessellation", Float) = 4.0
    _minDist ("TessMin", Range(-180.0, 0.0)) = 10.0
    _maxDist ("TessMax", Range(20.0, 500.0)) = 25.0
    _Displacement ("Displacement", Range(0, 8.0)) = 0.3
    _MaskAmt ("Mask Strength", Range(1, 8.0)) = 1.0

    _WaveLargeTex ("Wave Large", 2D) = "white" {}
   	_WaveHeight ("Wave Height", Range(0, 20.0)) = 0.0
   	_DetailHeight ("Detail Height", Range(0, 20.0)) = 0.0
   	_WaveShoreHeight ("Wave Shore Height", Range(0, 8.0)) = 0.0
   	_WaveScale ("Wave Scale", Range(0, 1.0)) = 0.25
	
	_CenterHeight ("Center Height", Float) = 0.0
	_MaxVariance ("Maximum Variance", Float) = 3.0

	_HighColor ("High Color", Color) = (1.0, 0.0, 0.0, 1.0)
	_LowColor ("Low Color", Color) = (0.0, 1.0, 0.0, 0.1)
		
	_Surface1 ("Surface Distortion 1", 2D) = "white" {}
	_Surface2 ("Surface Distortion 2", 2D) = "white" {}
	_WaveRamp ("Wave Ramp", 2D) = "white" {}
	
	_RefrStrength ("Refraction Strength (0.0 - 25.0)", Float) = 25.0
    _RefrSpeed ("Refraction Speed (0.0 - 0.5)", Float) = 0.5
    _RefrScale ("Refraction Scale", Float) = 0.5
	
	_SpecScatterWidth ("Specular Width", Range(1.0,10.0)) = 2.0
	_SpecScatterAmt ("Specular Scatter", Range(0.0,0.05)) = 0.02
	_SpecColorH ("Hot Specular Color", Color) = (0.5, 0.5, 0.5, 1)
	_SpecColorL ("Reflect Specular Color", Color) = (0.5, 0.5, 0.5, 1)
	
	_DynReflColor ("Reflection Dynamic", Color) = (1.0, 1.0, 1.0, 0.5)
	_ReflDist ("Reflection Distance", Float) = 1000.0
	_ReflBlend ("Reflection Blend", Range(0.002,0.1)) = 0.01
	_ReflBlur ("Reflection Blur", Range (0.0, 0.125)) = 0.01
	_ReflectionTex ("Reflection", 2D) = "white" {}

	_DepthAmt ("Depth Amount", Float) = 0.1
	
	_DepthColor ("Depth Over Tint", Color) = (0.25,0.25,0.5,1.0)
	_DepthColorR ("Depth Color 1(r)", Color) = (0.25,0.25,0.5,1.0)
	_DepthColorG ("Depth Color 2(g)", Color) = (0.25,0.25,0.5,1.0)
	_DepthColorB ("Depth Color 3(b)", Color) = (0.25,0.25,0.5,1.0)
	_DepthRamp ("Depth Color Ramp", 2D) = "white" {}
	
	_BlurSpread ("Blur Spread", Range (0.0, 0.125)) = 0.01
	_BlurRamp ("Blur Ramp", 2D) = "white" {}
	
	_FoamHeight ("Foam Height", Float) = 5.0
	_HeightFoamAmount ("Height Foam Amount", Range (0.0, 1.0)) = 1.0
	_HeightFoamSpread ("Height Foam Spread", Float) = 2.0
	
	_FoamSpread ("Foam Spread", Range (0.0, 1.0)) = 0.5
	_FoamColor ("Foam Color", Color) = (1,1,1,1)
	_FoamRamp ("Foam Ramp", 2D) = "white" {}
	_FoamTex ("Foam Texture (RGB)", 2D) = "white" {}

	_EdgeBlend ("Edge Spread", Range (0.04,5.0)) = 10.0
	_EdgeSpread ("Edge Spread", Range (0.04,5.0)) = 10.0
	_EdgeColor ("Edge Color", Color) = (1,1,1,1)
	
	_BumpStrength ("Normal Strength", Float) = 0.9
	_ReflectStrength ("Reflection Strength", Float) = 1.0
		
	_CubeTex ("Cubemap reflections", CUBE) = "white" {}
	_CubeBDRF ("Cubemap BDRF", CUBE) = "white" {}
    
	_MasterScale ("Master Scale", Float) = 1.0
	_UnderReflDist ("Under Reflection", Float) = 1.0
	_UnderColor ("Underwater Color", Color) = (0.25,0.25,0.5,1.0)
	
	_WaveTex ("_WaveTex", 2D) = "white" {}
	_FlowMap ("_FlowMap", 2D) = "white" {}
	_FlowScale ("Flowmap Scale", Range(0.1,10.0)) = 0.0

	_TideColor ("Tide Color", Color) = (0.0,0.0,0.2,1.0)
	_TideAmount ("Tide Amount", Range(0.0,1.0)) = 1.0
	_TideSpread ("Tide Amount", Range(0.02,1.0)) = 0.4

	_WaveMap ("_WaveMap", 2D) = "white" {}
	
	_Ramp2D ("_BRDF Ramp", 2D) = "white" {}
	_RimPower ("RimPower", Range(0.0,10.0)) = 1.0

	_castshadowEnabled ("shadow Enabled", Float) = 1.0
	_castshadowStrength ("shadow Strength", Float) = 1.0
	_castshadowFade ("shadow Fade", Float) = 1.0
	_castshadowColor ("Shadow Color", Color) = (0,0,0,1)

	_suimono_uvx ("uvx", Float) = 1.0
	_suimono_uvy ("uvy", Float) = 1.0
	_suimono_uv2x ("uvx2", Float) = 1.0
	_suimono_uv2y ("uvy2", Float) = 1.0

	_suimono_uv3x ("uvx3", Float) = 1.0
	_suimono_uv3y ("uvy3", Float) = 1.0
	_suimono_uv4x ("uvx4", Float) = 1.0
	_suimono_uv4y ("uvy4", Float) = 1.0

	_suimono_uv5x ("uvx5", Float) = 1.0
	_suimono_uv5y ("uvy5", Float) = 1.0
	_suimono_uv6x ("uvx6", Float) = 1.0
	_suimono_uv6y ("uvy6", Float) = 1.0

	_suimono_uv7x ("uvx7", Float) = 1.0
	_suimono_uv7y ("uvy7", Float) = 1.0
	_suimono_uv8x ("uvx8", Float) = 1.0
	_suimono_uv8y ("uvy8", Float) = 1.0
		
	_suimono_DeepWaveHeight ("Deep Wave Height", Float) = 1.0
	_suimono_DetailHeight ("Detail Wave Height", Float) = 1.0
	_suimono_detScale ("Detail Scale", Float) = 1.0

	_useDynamicReflections ("Use DynamicReflections", Float) = 1.0
	_reflecTerm ("Reflection Term", Range (0.0, 1.0)) = 0.255

	_ShallowFoamAmt ("Shallow Foam Amount", Float) = 1.0
	normalShore ("Normalize Shoreline", Float) = 1.0
	//_FlowShoreScale ("Shallow Wave Scale", Float) = 1.0
	//useTenkoku ("Use Tenkoku", Float) = 0.0
}



Subshader 
{ 







// ---------------------------------
//   WATER DEPTH RENDERING
// ---------------------------------
Tags {"RenderType"="Opaque" "Queue"="Geometry"}
Cull Back
ZWrite On

CGPROGRAM

#pragma target 3.0
#include "SuimonoFunctions.cginc"
#pragma surface surf SuimonoDepth addshadow vertex:vertexSuimonoDisplace nolightmap noambient
#pragma glsl



float4 _HighColor;
float4 _LowColor;
float4 _DepthColor;
float4 _DepthColorR;
float4 _DepthColorG;
float4 _DepthColorB;
float4 _DynReflColor;
float4 _FoamColor;
float _SpecScatterWidth;
float _SpecScatterAmt;
float _RimPower;
sampler2D _Ramp2D;
sampler2D _ReflectionTex;
float _OverallTrans;
float _OverallBright;

float _ReflectStrength;
float _ReflDist;
float _ReflBlend;

float4 origBGColor;
float4 depthColor;
float4 reflectColor;
float4 reflectCUBE;
//float4 reflectBDRF;
float4 reflectCubeColor;
float _RefrStrength;
float _RefrShift;
float4 refractColor;
float edgeFactor;
float foamFactor;
float _FoamSpread;
float4 _SpecColorH;
float4 _SpecColorL;
float _blurSamples;
float _BlurSpread;
float _HeightFoamAmount;
float _HeightFoamSpread;
float _FoamHeight;
float _ShadowAmt;
float highcolorFac;

float _useDynamicReflections;

//shadow variables
float _castshadowEnabled;
float _castshadowStrength;
float _castshadowFade;
float4 _castshadowColor;

float mask;
float mask1;
float mask2;
float mask3;
float maskcastshadow;
float4 _cameraBGColor;
float3 bNormal;
float _reflecTerm;

sampler2D _suimono_TransTex;
float4 bgLayer;
float4 bgLayerOrig;
float4 bgLayerTrans;
float4 depthMap;
float4 waveColor;

sampler2D _FoamTex;
float _ShallowFoamScale;
float4 depthRamp;
float _EdgeBlend;

sampler2D _CameraDepthTexture;
float foamSpreadDef;
float edgeSpreadDef;

float _isForward;
float _UVReversal;
float suimonoHeight;
float _ShallowFoamAmt;
//sampler2D _OceanBlendTex;



inline fixed4 LightingSuimonoDepth (SurfaceOutput s, fixed3 lightDir, half3 viewDir, fixed atten)
{


	fixed a;

	// PHYSICAL BASED RENDERING
	fixed4 cP;
	fixed _roughness = clamp(1.0-(_SpecScatterWidth/10.0),0.1,1.0);
	
	//------------------------------
	//##  WORLD LIGHT FUNCTIONS  ##
	//------------------------------
	// REMAP LIGHT
	// For all intents and purposes, this is a hax, and has
	// no place in a Physically-based syste, :D
	half4 inLight = _LightColor0;
	half4 outLight = inLight;
	half3 albedoColor = s.Albedo;

	
	//-------------------------------
	//##  LIGHT TERM CALCULATION  ##
	//-------------------------------
	//s.Normal = normalize(s.Normal);
	half NdotV = dot(s.Normal,viewDir);
	half cNdotV = max(0,dot(s.Normal,viewDir));
	half h = max(0,dot(s.Normal,normalize(lightDir+viewDir)));
	
	
	//---------------------------
	//##  INDEX OF REFRACTION  ##
	//---------------------------
	// set f0 of dielectrics to reflectance term.
	// (default value 0f 0.255 for water)
	half3 f0 = half3(_reflecTerm,_reflecTerm,_reflecTerm);

	
	//---------------------------
	//##  REFLECTANCE TERM  ##
	//---------------------------
	half3 reflectance = normalize(lightDir + viewDir)*(outLight.rgb*lightDir*max(0,dot(s.Normal,lightDir)));
	half3 b_reflectance = normalize(lightDir + viewDir)*(outLight.rgb*lightDir*min(0,dot(s.Normal,lightDir)));


	//---------------------------
	//##  FRESNEL CALULATION  ##
	//---------------------------
	half3 fresnel;
	
	// Schlick function
	half3 f_schlick = f0+(1.0-f0)*pow((dot(s.Normal,normalize(lightDir+viewDir))),5);
	f_schlick = f_schlick * (f0+(1.0-f0)*pow((1.0-NdotV),5));
	f_schlick = max(f_schlick,f0+(1.0-f0)*pow((1.0-NdotV),5));
	f_schlick = saturate(f_schlick);
	
	fresnel = f_schlick;


	//--------------------------------------
	//##  NORMAL DISTRIBUTION FUNCTIONS  ##
	//--------------------------------------
	half ndf = 1.0;

	// Phong
	// This is the closest match to the built-in NDF used in Unity 5 Standard Shader
	// Phong is best matched for hard/gloss plastics, rubber, and other man-made materials
	//float m = pow(8192.0,(1.0-_roughness));
	//half ndf_phong = ((m+2.0)/6.2837)*pow(max(0,dot(s.Normal,normalize(lightDir+viewDir))),m);
	//ndf = ndf_phong;

	// GGX (Trowbrige and Reitz)
	// This NDF has a longer falloff tail than Phong does, and
	// is more useful in natural environments, skin, wood, metal etc.
	float ms = pow(_roughness,2.5);
	half ndf_ggx = (ms*ms)/pow((h*h)*((ms*ms)-1.0)+1.0,2.0);
	ndf = ndf_ggx;


	//---------------------------
	//##  GEOMETRY FUNCTIONS  ##
	//---------------------------
	half gf = 1.0;
	half gf_implicit = max(0,dot(s.Normal,lightDir))*cNdotV;
	gf = gf_implicit;


	//-----------------------------
	//##  SUBSURFACE FUNCTIONS  ##
	//-----------------------------
	// note, this is a completely faked SSS "formula"
	// it ain't based on anything "scientific" sounding.
	half sss;
	sss = min(saturate(lerp(-0.02,0.05,dot(s.Normal,viewDir))),1.0-gf)*max(0.1,dot(s.Normal,-lightDir))*fresnel*2;
	//rim only scattering
	sss = sss * (0.1+saturate(lerp(1.0,-0.25,dot(s.Normal,viewDir))));


	//-----------------------------
	//##  FINAL COMBINATION  ##
	//-----------------------------
	ndf = ndf * _SpecColorH.a;
	fresnel = saturate(lerp(-0.5,1.0,fresnel));
	
	half3 Reflection = reflectCUBE.rgb;
	
	//Alpha
	a = saturate((fresnel*_DynReflColor.a));
	
	half3 background = bgLayer * lerp(0.5,0.4646,_SuimonoIsLinear);
	half3 backgroundO = bgLayerOrig * lerp(0.5,0.4646,_SuimonoIsLinear);

	//color blend
	background = lerp(background*2,background*_DepthColor.rgb*2,_DepthColor.a);
	backgroundO = lerp(backgroundO*2,backgroundO*_DepthColor.rgb*2,_DepthColor.a);

	//color overlay
	background = lerp(background,_LowColor.rgb,_LowColor.a);
	backgroundO = lerp(backgroundO,_LowColor.rgb,_LowColor.a);

	//enable transparency
	//background = lerp(_DepthColorB.rgb*outLight.rgb,background,_enableTransparency);
	//backgroundO = lerp(_DepthColorB.rgb*outLight.rgb,backgroundO,_enableTransparency);

	//Sub Surface Scattering
	background += sss*(1.0-gf)*200.0*(_SpecColorL.rgb*(outLight.rgb*2.0))*highcolorFac*_SpecColorL.a*(1.0-mask2);
	backgroundO += sss*(1.0-gf)*200.0*(_SpecColorL.rgb*(outLight.rgb*2.0))*highcolorFac*_SpecColorL.a*(1.0-mask2);

	//wave height tint
	background = lerp(background,_HighColor.rgb*_LightColor0.rgb,highcolorFac*_HighColor.a*(1.0-mask2));
	backgroundO = lerp(backgroundO,_HighColor.rgb*_LightColor0.rgb,highcolorFac*_HighColor.a*(1.0-mask2));

	//overall brightness shift
	background = background * (_OverallBright*2.0);
	backgroundO = backgroundO * (_OverallBright*2.0);

	//Mask refraction bleed errors
	half depthSwitch = saturate(lerp(-15.0,1.0,saturate(lerp(-10.0,0.9,bgLayer.a + (1.0-mask2))) + (bgLayer.a)));
	background = lerp(backgroundO,background,depthSwitch);

	//Edge Blend
	background = lerp(background,bgLayerTrans.rgb,depthMap.a*saturate((1.0-mask2)*2.0)*_EdgeBlend);
	
	//calculate shore wave
	half waveCurl = 1.0-saturate((waveColor.b+waveColor.g) * depthMap.r * 1.0 * _WaveShoreHeight);

	//set reflection fade color
	Reflection = lerp(Reflection,_DepthColorR.rgb*outLight.rgb,saturate(mask1*_DepthColorR.a));

	//FINAL COMBINE
	half atten2 = lerp(0.35,1.0,atten);
	cP.rgb = lerp(background,Reflection,a*mask*atten2*waveCurl);
	cP.rgb = lerp(cP.rgb,Reflection.rgb,mask1);
	cP.rgb = saturate(cP.rgb);

	//FINAL HOT SPECULAR
	cP.rgb += (ndf*_SpecColorH.rgb*outLight.rgb*atten) * waveCurl;

	//FINAL ATTEN
	cP.rgb = cP.rgb * atten;

	//ALPHA
	cP.a = s.Alpha;

	//add edge blend
	//cP.rgb = lerp(cP.rgb,bgLayerOrig.rgb,depthMap.a*saturate((1.0-mask2)*2.0)*_EdgeBlend);

	//add foam
	cP.rgb = lerp(cP.rgb,_FoamColor.rgb * atten * outLight,saturate(foamFactor*_FoamColor.a*saturate((1.0-mask2)*2.0)));

	//FINAL EDGE Blend
	cP.rgb = lerp(cP.rgb,bgLayerTrans.rgb,edgeSpreadDef);

	//debug shoreline depth map
	cP.rgb = lerp(cP.rgb,depthMap.rgb * saturate(0.35+gf),_enableShoreDebug);
	cP.a = lerp(cP.a,1.0,_enableShoreDebug);

	return cP;

}





struct Input {
	float4 screenPos;	
	float2 uv_Surface1;
	//float2 uv_FoamTex;
	float2 uv_WaveLargeTex;
	float2 uv_FlowMap;
	//float2 uv_OceanBlendTex;
	float3 worldPos;
	float3 worldRefl;
    INTERNAL_DATA
};



samplerCUBE _CubeTex;
//samplerCUBE _CubeBDRF;
//samplerCUBE Tenkoku_SpecularCube;
//samplerCUBE Tenkoku_DiffuseCube;
//sampler2D _CameraDepthTexture;
//sampler2D _GrabTexture;
sampler2D _DepthMap;
sampler2D _DepthRamp;



void surf (Input IN, inout SurfaceOutput o) {

	//Calculate Normal
	half3 waveFac;
	half3 wfa;
	half3 wfb;
	half wfMult = 0.15;
	float2 waveSpd = float2(_suimono_uv3x,_suimono_uv3y);
	float2 waveSpdb = float2(_suimono_uv4x,_suimono_uv4y);
	wfa = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_Surface1.x*wfMult+waveSpd.x,IN.uv_Surface1.y*wfMult+waveSpd.y))));
	wfb = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_Surface1.x*wfMult-waveSpdb.x-0.5,IN.uv_Surface1.y*wfMult-waveSpdb.y-0.5))));
	waveFac = normalize(float3(wfa.xy + wfb.xy, wfa.z*wfb.z)); //blend function

	half3 waveFac1;
	half wfMult1 = 1.0;
	float2 waveSpd1 = float2(_suimono_uvx,_suimono_uvy);
	float2 waveSpd1b = float2(_suimono_uv2x,_suimono_uv2y);
	wfa = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_WaveLargeTex.x*wfMult1+waveSpd1.x,IN.uv_WaveLargeTex.y*wfMult1+waveSpd1.y))));
	wfb = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_WaveLargeTex.x*wfMult1-waveSpd1b.x-0.5,IN.uv_WaveLargeTex.y*wfMult1-waveSpd1b.y-0.5))));
	waveFac1 = normalize(float3(wfa.xy + wfb.xy, wfa.z*wfb.z)); //blend function
	
	half3 waveFac2;
	half wf2Mult = 8.0;
	float2 waveSpd2 = float2(_suimono_uvx*8.0,_suimono_uvy*8.0);
	float2 waveSpd2b = float2(_suimono_uv2x*8.0,_suimono_uv2y*8.0);
	wfa = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_WaveLargeTex.x*wf2Mult+waveSpd2.x,IN.uv_WaveLargeTex.y*wf2Mult+waveSpd2.y))));
	wfb = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_WaveLargeTex.x*wf2Mult-waveSpd2b.x-0.5,IN.uv_WaveLargeTex.y*wf2Mult-waveSpd2b.y-0.5))));
	waveFac2 = normalize(float3(wfa.xy + wfb.xy, wfa.z*wfb.z)); //blend function

	half3 waveFac3;
	half wf3Mult = 20.0;
	float2 waveSpd3 = float2(_suimono_uvx*20.0,_suimono_uvy*20.0);
	float2 waveSpd3b = float2(_suimono_uv2x*20.0,_suimono_uv2y*20.0);
	wfa = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_WaveLargeTex.x*wf3Mult+waveSpd3.x,IN.uv_WaveLargeTex.y*wf3Mult+waveSpd3.y))));
	wfb = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_WaveLargeTex.x*wf3Mult-waveSpd3b.x-0.5,IN.uv_WaveLargeTex.y*wf3Mult-waveSpd3b.y-0.5))));
	waveFac3 = normalize(float3(wfa.xy + wfb.xy, wfa.z*wfb.z)); //blend function
	
	half3 waveFac4;
	half wf4Mult = 12.0;
	float2 waveSpd4 = float2(_suimono_uv5x,_suimono_uv5y);
	float2 waveSpd4b = float2(_suimono_uv6x,_suimono_uv6y);
	wfa = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_WaveLargeTex.x*wf4Mult+waveSpd4.x,IN.uv_WaveLargeTex.y*wf4Mult+waveSpd4.y))));
	wfb = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_WaveLargeTex.x*wf4Mult-waveSpd4b.x-0.5,IN.uv_WaveLargeTex.y*wf4Mult-waveSpd4b.y-0.5))));
	waveFac4 = normalize(float3(wfa.xy + wfb.xy, wfa.z*wfb.z)); //blend function

	
	
	//wrap normal to shore normalization
	//half3 flow = tex2D(_FlowMap, IN.uv_FlowMap).rgb;
	
	half3 norm1 = waveFac;
	norm1 = lerp(half3(0,0,1),norm1,_suimono_DeepWaveHeight/10.0);
	//norm1 = lerp(norm1,half3(0,0,1),flow.r*normalShore);

	half3 norm2 = waveFac1;
	wfb = lerp(half3(0,0,1),waveFac2,_BumpStrength);
	norm2 = normalize(float3(norm2.xy + wfb.xy, norm2.z*wfb.z)); //blend function
	wfb = lerp(half3(0,0,1),waveFac3,_BumpStrength);
	norm2 = normalize(float3(norm2.xy + wfb.xy, norm2.z*wfb.z)); //blend function
	norm2 = lerp(half3(0,0,1),norm2,_suimono_DetailHeight/3.0); //fade out with height setting
	

	norm1 = normalize(norm1);
	norm2 = normalize(norm2);
 	o.Normal = normalize(float3(norm1.xy + norm2.xy, norm1.z*norm2.z)); //blend function
 	o.Normal = lerp(o.Normal,half3(0,0,1),mask1); //fade out in distance
	o.Normal = lerp(o.Normal,half3(0,0,1),edgeFactor); //fade out edge
 	
	//wrap normal to shore calculations
	//float4 getflowmap = tex2D(_FlowMap, IN.uv_FlowMap);
 	//float2 flowmap = float2(saturate(getflowmap.r + getflowmap.g),getflowmap.b) * 2.0 - 1.0;
	//flowmap.x = lerp(0.0,flowmap.x,_FlowShoreScale);
	//flowmap.y = lerp(0.0,flowmap.y,_FlowShoreScale);
	//half4 waveTex = tex2D(_WaveTex, float2((IN.uv_FlowMap.x*shoreWaveScale)+flowOffX+flowmap.x,(IN.uv_FlowMap.y*shoreWaveScale)+flowOffY+flowmap.y));
	//o.Normal = lerp(o.Normal,half3(0,0,1),waveTex.g * _WaveShoreHeight * flow.g);
 	
	//wrap normal to shore calculations
	//float4 getflowmap = tex2Dlod(_FlowMap, float4(1.0-IN.uv_FlowMap.x,1.0-IN.uv_FlowMap.y,0,0));
 	//float2 flowmap = float2(saturate(getflowmap.r + getflowmap.g),getflowmap.b) * 2.0 - 1.0;
	//flowmap.x = lerp(0.0,flowmap.x,_FlowShoreScale);
	//flowmap.y = lerp(0.0,flowmap.y,_FlowShoreScale);
	//half4 waveTex = tex2D(_WaveTex, float2((IN.uv_FlowMap.x*shoreWaveScale)+flowOffX+flowmap.x,(IN.uv_FlowMap.y*shoreWaveScale)+flowOffY+flowmap.y));
	//o.Normal = lerp(o.Normal,half3(0,0,1),waveTex.g * _WaveShoreHeight * flow.g);
	
	
	
	
	//set UVs
	float4 uv0 = IN.screenPos; uv0.xy;
	float4 uv2 = IN.screenPos; uv2.xy;
	uv0.x -= (0.05*_RefrStrength*o.Normal.x)*(1.0-edgeFactor);
	uv0.z -= (0.05*_RefrStrength*o.Normal.z)*(1.0-edgeFactor);
	uv0.y += (0.2*_RefrStrength*o.Normal.y)*(1.0-edgeFactor);


	//calculate distance mask
	mask = saturate((uv0.w - lerp(60.0,20.0,(_ReflDist/50.0)))*_ReflBlend);
	mask1 = saturate((uv0.w - lerp(160.0,20.0,(5.0/25.0)))*0.0015);
	mask2 = saturate((uv0.w - lerp(0.0,20.0,(5.0/25.0)))*0.01);
	mask3 = saturate((uv0.w - lerp(-150.0,60.0,(10.0/25.0)))*0.01);
	maskcastshadow = saturate((uv0.w - lerp(0.0,60.0,(_castshadowFade/100.0)))*0.01);
	
	o.Normal = lerp(o.Normal,lerp(o.Normal,half3(0,0,1),0.7),mask1);




	//calculate height color factor
	highcolorFac = saturate(IN.worldPos.y-(suimonoHeight+((_suimono_DeepWaveHeight+_suimono_DetailHeight)*0.15)));


	// decode dynamic reflection
	float4 uv1 = IN.screenPos; uv1.xy;
	uv1.x -= (0.025*_ReflectStrength)*o.Normal.x;
	uv1.z -= (0.025*_ReflectStrength)*o.Normal.z;
	uv1.y += (0.1*_ReflectStrength)*o.Normal.y;


	reflectColor = tex2Dproj( _ReflectionTex, UNITY_PROJ_COORD(uv1));
	reflectColor.rgb = reflectColor.rgb * _DynReflColor.rgb;

	// decode cube / mobile reflection
	half3 cubeRef = texCUBE(_CubeTex, WorldReflectionVector(IN, o.Normal)).rgb;
	reflectCUBE.rgb = cubeRef.rgb;
	//half3 cubeBDRF = texCUBE(_CubeBDRF, WorldReflectionVector(IN, o.Normal)).rgb;
	//reflectBDRF.rgb = cubeBDRF.rgb;

	half refCol = max(reflectColor.r,reflectColor.g);
	refCol = max(refCol,reflectColor.b);
	refCol = 1.0-clamp(-1.0,1.0,refCol*3.0);

	//record smooth normal
	bNormal = o.Normal;
		
	//add final detail normal (preferred blend function)
	float3 AddNDet = lerp(lerp(waveFac4*2.0,half3(0,0,1),1.0-_BumpStrength*2.0),half3(0,0,1),mask3);
 	o.Normal = normalize(float3(o.Normal.xy + AddNDet.xy, o.Normal.z*AddNDet.z)); //whiteout function

	//dynamic reflection blend
	reflectCUBE.rgb = saturate(reflectCUBE.rgb);
	reflectCUBE.rgb = lerp(reflectCUBE.rgb,reflectColor.rgb,_useDynamicReflections);	
	

//set base surface
o.Alpha = 1.0;
o.Albedo = fixed3(0,0,0);


//DEPTH MAP
depthMap = tex2D(_FlowMap, IN.uv_FlowMap);

//WAVE MAP
float2 flowmap = float2(saturate(depthMap.r + depthMap.g),depthMap.b) * 2.0 - 1.0;
flowmap.x = lerp(0.0,flowmap.x,_FlowShoreScale);
flowmap.y = lerp(0.0,flowmap.y,_FlowShoreScale);
half2 tex3 = IN.uv_FlowMap * shoreWaveScale;
half2 _offsetFlow = half2(flowOffX,flowOffY);
waveColor = tex2D(_WaveTex, tex3*depthMap.r+_offsetFlow+flowmap);

//Decode Transparency
half depth = saturate(lerp(-15.0,1.2,saturate(lerp(-10.0,0.88,bgLayer.a + (1.0-mask2))) + (bgLayer.a*1)));
bgLayer = tex2Dproj(_suimono_TransTex, UNITY_PROJ_COORD(uv0));
bgLayerOrig = tex2Dproj(_suimono_TransTex, UNITY_PROJ_COORD(uv2));
bgLayerTrans = bgLayerOrig;

//layered depth fog
half edgeFac = 1.0;
//if (_isForward == 1.0){
	edgeFac = 1.0-(depthMap.g * 2.0);
//}
depthRamp = tex2D(_DepthRamp, float2(saturate(lerp(bgLayer.a,saturate(bgLayer.a+bgLayerOrig.a),depth)*_DepthAmt*edgeFac), 0.5));
bgLayer.rgb = lerp(bgLayer.rgb,_DepthColorG.rgb*_LightColor0.rgb,(depthRamp.b-depthRamp.r)*_DepthColorG.a*_OverallTrans); //Mid
bgLayer.rgb = lerp(bgLayer.rgb,_DepthColorB.rgb*_LightColor0.rgb,saturate(lerp(bgLayer.a,saturate(bgLayer.a+bgLayerOrig.a),depth)*_DepthAmt+mask2)*(depthRamp.b)*_DepthColorB.a*_OverallTrans); //Deep

bgLayerOrig.rgb = lerp(bgLayerOrig.rgb,_DepthColorG.rgb*_LightColor0.rgb,(depthRamp.b-depthRamp.r)*_DepthColorG.a*_OverallTrans); //Mid
bgLayerOrig.rgb = lerp(bgLayerOrig.rgb,_DepthColorB.rgb*_LightColor0.rgb,saturate(bgLayerOrig.a*_DepthAmt+mask2)*(depthRamp.b)*_DepthColorB.a*_OverallTrans); //Deep

bgLayer = lerp(half4(_DepthColorB.rgb,1),bgLayer,_enableTransparency);
bgLayerOrig = lerp(half4(_DepthColorB.rgb,1),bgLayerOrig,_enableTransparency);
bgLayerTrans = lerp(half4(_DepthColorB.rgb,1),bgLayerTrans,_enableTransparency);



//FOAM
//calculate heights
half4 foamTex;
half fmMult = 1.0*_ShallowFoamScale;
float2 foamSpeed = float2(_suimono_uv7x*fmMult,_suimono_uv7y*fmMult);
foamTex = tex2D(_FoamTex,float2(IN.uv_WaveLargeTex.x*fmMult+foamSpeed.x,IN.uv_WaveLargeTex.y*fmMult+foamSpeed.y));
half fmMult2 = 0.3*_ShallowFoamScale;
float2 foamSpeed2 = float2(_suimono_uv7x*fmMult2,_suimono_uv7y*fmMult2);
half baseHeight = tex2D(_FoamTex,float2(IN.uv_WaveLargeTex.x*fmMult2+foamSpeed2.x,IN.uv_WaveLargeTex.y*fmMult2+foamSpeed2.y)).a*0.75;


//calculate shoreline foam tolerance
//half depth3 = UNITY_SAMPLE_DEPTH(tex2Dproj(_CameraDepthTexture, UNITY_PROJ_COORD(IN.screenPos)));
//depth3 = LinearEyeDepth(depth3); 
//foamSpreadDef = saturate(1.0-saturate(_FoamSpread * (depth3-IN.screenPos.w)));
//edgeSpreadDef = saturate(1.0-saturate((depth3-IN.screenPos.w)*2.0));
//if (_isForward == 1.0){
	edgeSpreadDef = 0.0;
//}

//calculate wave foam
baseHeight = baseHeight * lerp(0.4545,1.0,_SuimonoIsLinear);
half foamSpread = saturate(((IN.worldPos.y-(suimonoHeight+_HeightFoamAmount))*_HeightFoamSpread)*_FoamHeight * (1.0-mask1)*baseHeight);

//calculate shoreline foam
//if (_isForward == 1.0){
	foamSpread = foamSpread + saturate(lerp(-0.2,1.0,depthMap.b))*10.0*_FoamSpread*_enableShoreline;
//} else {
//	foamSpread = foamSpread + foamSpreadDef;//test
//}

//calculate shorewave foam
foamSpread += (waveColor.a*_ShallowFoamAmt)*(depthMap.r)*(_WaveShoreHeight)*_enableShoreline;

//calculate foam texture
foamFactor = foamTex.g * saturate(lerp(0.0,1.0,foamSpread));
foamFactor = lerp(foamFactor,foamTex.r,saturate(lerp(-1.0,1.0,foamSpread)));
foamFactor = lerp(foamFactor,foamTex.b,saturate(lerp(-3.0,0.75,foamSpread)));

	
}

ENDCG








}
//FallBack "Diffuse"
}
