Shader "Suimono2/water_under_dx9" {



Properties {

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
//   UNDERWATER VIEW
// ---------------------------------
Tags {"RenderType"="Opaque" "Queue"="Geometry"}
Cull Front
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
float mask4;
float maskcastshadow;

float suimono_isUnity5;
sampler2D _suimono_TransTex;



inline fixed4 LightingSuimonoDepth (SurfaceOutput s, fixed3 lightDir, half3 viewDir, fixed atten)
{
	//calculate final color
	fixed4 c;

	half lightalpha = saturate(lerp(0.2,1.0,dot(s.Normal,lightDir)));
	half wavealpha = 1.0 * saturate(lerp(1.0,5.0,dot(s.Normal,viewDir)));
	half depthalpha = 1.0 * saturate(lerp(2.4,8.0,dot(s.Normal,viewDir)));

	c.rgb = lerp(reflectColor.rgb,_DepthColorB.rgb,wavealpha)*_LightColor0.rgb;

	half3 overColor = origBGColor.rgb;

	c.rgb = lerp(overColor,c.rgb,saturate(depthalpha*saturate(lerp(5.0,-3.0,dot(viewDir,half3(0,-1,0))))));

	c.rgb = c.rgb * lightalpha;

	//linear conversion
	half linearFac = lerp(2.2,1.0,_SuimonoIsLinear);
	c.rgb = c.rgb * linearFac;
	
	c.a = 1.0;


	c = saturate(c);
	return c;
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


float _EdgeBlend;
samplerCUBE _CubeTex;
//samplerCUBE _CubeBDRF;
//sampler2D _CameraDepthTexture;
//sampler2D _CameraNormalsTexture;
//sampler2D _GrabTexture;
sampler2D _DepthRamp;
sampler2D _FoamTex;
float _isForward;
float _UVReversal;
float suimonoHeight;

//float _ShallowFoamAmt;

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
	half wf2Mult = 5.0;
	float2 waveSpd2 = float2(_suimono_uvx,_suimono_uvy);
	float2 waveSpd2b = float2(_suimono_uv2x,_suimono_uv2y);
	wfa = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_WaveLargeTex.x*wf2Mult+waveSpd2.x,IN.uv_WaveLargeTex.y*wf2Mult+waveSpd2.y))));
	wfb = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_WaveLargeTex.x*wf2Mult-waveSpd2b.x-0.5,IN.uv_WaveLargeTex.y*wf2Mult-waveSpd2b.y-0.5))));
	waveFac2 = normalize(float3(wfa.xy + wfb.xy, wfa.z*wfb.z)); //blend function

	half3 waveFac3;
	half wf3Mult = 10.0;
	float2 waveSpd3 = float2(_suimono_uvx,_suimono_uvy);
	float2 waveSpd3b = float2(_suimono_uv2x,_suimono_uv2y);
	wfa = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_WaveLargeTex.x*wf3Mult+waveSpd3.x,IN.uv_WaveLargeTex.y*wf3Mult+waveSpd3.y))));
	wfb = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_WaveLargeTex.x*wf3Mult-waveSpd3b.x-0.5,IN.uv_WaveLargeTex.y*wf3Mult-waveSpd3b.y-0.5))));
	waveFac3 = normalize(float3(wfa.xy + wfb.xy, wfa.z*wfb.z)); //blend function
	
	half3 waveFac4;
	half wf4Mult = 12.0;
	float2 waveSpd4 = float2(_suimono_uvx*4.0,_suimono_uvy*4.0);
	float2 waveSpd4b = float2(_suimono_uv2x*4.0,_suimono_uv2y*4.0);
	wfa = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_WaveLargeTex.x*wf4Mult+waveSpd4.x,IN.uv_WaveLargeTex.y*wf4Mult+waveSpd4.y))));
	wfb = normalize(UnpackNormal(tex2D(_WaveLargeTex,float2(IN.uv_WaveLargeTex.x*wf4Mult-waveSpd4b.x-0.5,IN.uv_WaveLargeTex.y*wf4Mult-waveSpd4b.y-0.5))));
	waveFac4 = normalize(float3(wfa.xy + wfb.xy, wfa.z*wfb.z)); //blend function
	
	
	
	//wrap normal to shore normalization
	half3 flow = tex2D(_FlowMap, IN.uv_FlowMap).rgb;
	
	half3 norm1 = waveFac;
	norm1 = lerp(half3(0,0,1),norm1,_suimono_DeepWaveHeight/10.0);
	norm1 = lerp(norm1,half3(0,0,1),flow.r*normalShore);

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
	float4 getflowmap = tex2Dlod(_FlowMap, float4(1.0-IN.uv_FlowMap.x,1.0-IN.uv_FlowMap.y,0,0));
 	float2 flowmap = float2(saturate(getflowmap.r + getflowmap.g),getflowmap.b) * 2.0 - 1.0;
	flowmap.x = lerp(0.0,flowmap.x,_FlowShoreScale);
	flowmap.y = lerp(0.0,flowmap.y,_FlowShoreScale);
	half4 waveTex = tex2D(_WaveTex, float2((IN.uv_FlowMap.x*shoreWaveScale)+flowOffX+flowmap.x,(IN.uv_FlowMap.y*shoreWaveScale)+flowOffY+flowmap.y));
	o.Normal = lerp(o.Normal,half3(0,0,1),waveTex.g * _WaveShoreHeight * flow.g);
	
	
	
	//set UVs
	float4 uv0 = IN.screenPos; uv0.xy;
	uv0.x -= (0.05*_RefrStrength*o.Normal.x)*(1.0-edgeFactor);
	uv0.z -= (0.05*_RefrStrength*o.Normal.z)*(1.0-edgeFactor);
	uv0.y += (0.2*_RefrStrength*o.Normal.y)*(1.0-edgeFactor);
	
	//calculate distance mask
	//mask = saturate((uv0.w - lerp(60.0,20.0,(_ReflDist/50.0)))*_ReflBlend);
	//mask1 = saturate((uv0.w - lerp(160.0,20.0,(5.0/25.0)))*0.002);
	mask2 = saturate((uv0.w - lerp(0.0,20.0,(5.0/25.0)))*0.01);
	mask3 = saturate((uv0.w - lerp(-150.0,60.0,(10.0/25.0)))*0.01);
	//mask4 = saturate((uv0.w - lerp(0.0,60.0,(2.0/25.0)))*0.5);
	//maskcastshadow = saturate((uv0.w - lerp(0.0,60.0,(_castshadowFade/100.0)))*0.01);
	
	
	// decode dynamic reflection
	float4 uv1 = IN.screenPos; uv1.xy;
	float4 uv2 = IN.screenPos; uv2.xy;
	float disAmt = (_ReflectStrength);
	uv1.x -= (0.05*disAmt)*o.Normal.x;
	//uv1.z -= (0.1*disAmt)*o.Normal.z;
	uv1.y -= (0.1*disAmt)*o.Normal.y;
	uv2.y -= (0.065*disAmt)*o.Normal.y;
	half4 refl = tex2Dproj( _ReflectionTex, UNITY_PROJ_COORD(uv1));
	reflectColor.rgb = refl.rgb;//half3(cDepth,cDepth,cDepth);
	reflectColor.a = refl.a;//(1.0-refl.a)*mask2;
	reflectColor = reflectColor * 2.0;
	

	// decode cube / mobile reflection
	half3 cubeRef = texCUBE(_CubeTex, WorldReflectionVector(IN, o.Normal)).rgb;
	reflectCUBE.rgb = cubeRef.rgb;


	//get transparency
	origBGColor = tex2Dproj(_suimono_TransTex, UNITY_PROJ_COORD(uv0))*2.0;

	//add final detail normal (preferred blend function)
	float3 AddNDet = lerp(lerp(waveFac4*2.0,half3(0,0,1),1.0-_BumpStrength),half3(0,0,1),mask3);
 	o.Normal = normalize(float3(o.Normal.xy + AddNDet.xy, o.Normal.z*AddNDet.z)); //whiteout function
	
}

ENDCG








}
//FallBack "Diffuse"
}
