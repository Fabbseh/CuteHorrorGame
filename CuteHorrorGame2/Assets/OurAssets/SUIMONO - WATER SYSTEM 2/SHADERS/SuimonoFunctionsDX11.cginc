#ifndef CUSTOM_LIGHTING_INCLUDED
#define CUSTOM_LIGHTING_INCLUDED


		
float _Tess;
float _minDist;
float _maxDist;

sampler2D _WaveMaskTex;
sampler2D _Surface1;
sampler2D _Surface2;
sampler2D _WaveLargeTex;
sampler2D _OceanBlendTex;

float _Displacement;
float _BumpStrength;
float _dScaleX;
float _dScaleY;
float _Phase;
float _WaveHeight;
float _WaveShoreHeight;
float _WaveScale;
float _WaveShoreScale;
float _MaskAmt;
float _ShoreAmt;
float _TimeX;
float _TimeY;
float _DTimeX;
float _DTimeY;
float _DTimeX2;
float _DTimeY2;
float _DetailHeight;
float _suimono_DeepWaveHeight;
float _suimono_DetailHeight;

float _SuimonoIsLinear;

sampler2D _WaveMap;
sampler2D _WaveTex;
sampler2D _FlowMap;
float _MasterScale;
float _FlowScale;
float _FlowShoreScale;
float halfCycle;
float flowMapOffset0;
float flowMapOffset1;
float flowOffX;
float flowOffY;
float shoreOffX;
float shoreOffY;
float shoreWaveOffX;
float shoreWaveOffY;
float detailScale;
float waveScale;
float normalShore;
float shoreWaveScale;
float _DepthAmt;


float _suimono_uvx;
float _suimono_uvy;
float _suimono_uv2x;
float _suimono_uv2y;
float _suimono_uv3x;
float _suimono_uv3y;
float _suimono_uv4x;
float _suimono_uv4y;

float _suimono_uv5x;
float _suimono_uv5y;
float _suimono_uv6x;
float _suimono_uv6y;

float _suimono_uv7x;
float _suimono_uv7y;
float _suimono_uv8x;
float _suimono_uv8y;	


float _temp;
float maskWave;
float _suimono_HeightProjection;

float _enableShoreline;
float _enableShoreDebug;
float _enableTransparency;

inline void vertexSuimonoDisplaceDX11 (inout appdata v){


	//calculate waves
	half2 tex = v.texcoord;
	half2 tex1 = v.texcoord * waveScale;
	half2 tex2 = v.texcoord * detailScale;
	half2 tex3 = v.texcoord * shoreWaveScale;
	
	half2 _offset = half2(_TimeX,_TimeY)*1.0;
	half2 _Doffset = half2(_DTimeX,_DTimeY)*1.0;
	half2 _Doffset2 = half2(_DTimeX2,_DTimeY2)*14.0;
	
	//calculate flowmap wvalues
	half2 _offsetFlow = half2(flowOffX,flowOffY);
	half2 _offsetShore = half2(shoreOffX,shoreOffY);
	
	float4 getflowmap = tex2Dlod(_FlowMap, float4(1.0-tex.x, 1.0-tex.y,0.0,0.0));
 	float2 flowmap = float2(saturate(getflowmap.r + getflowmap.g),getflowmap.b) * 2.0f - 1.0f;
	flowmap.x = lerp(0.0,flowmap.x,_FlowShoreScale);
	flowmap.y = lerp(0.0,flowmap.y,_FlowShoreScale);

	
	//flowmap values
	//float fr = tex2Dlod(_FlowMap, float4((1.0-tex.x)+_offsetShore.x,(1.0-tex.y)+_offsetShore.y,0.0,0.0)).r;
	float4 f = tex2Dlod(_FlowMap, float4(tex.x + _offsetShore.x,(tex.y)+_offsetShore.y,0.0,0.0));

	
	//offsetShoreWave
	//half4 waveTex = tex2Dlod(_WaveTex, float4((tex3.xy+_offsetFlow+flowmap),0.0,0.0));
	half4 waveTex = tex2Dlod(_WaveTex, float4((tex3.xy*f.r+_offsetFlow),0.0,0.0));

	// calculate maps
	float texwaveRedChannel = tex2Dlod(_WaveMap, float4(tex.x, tex.y,0,0)).r;
	float texwaveGreenChannel = tex2Dlod(_WaveMap, float4(tex.x, tex.y,0,0)).g;
	
	// Distance Mask
	//calculate the distance mask and apply later to fade the wave height
	float4 pos = mul(UNITY_MATRIX_MVP, v.vertex);
	float4 projpos = ComputeScreenPos(pos);
	float mask1 = saturate((projpos.w - lerp(60.0,20.0,(_DepthAmt/25.0)))*0.009);
	
	
	// calculate edge falloff
	float texfalloff = tex2Dlod(_OceanBlendTex, float4(tex.x, tex.y,0,0)).r;

	// calculate waves
	float texwaveFac;
	//float twfMult = 1.0;
	float twfMult = 0.15;
	fixed2 waveSpd = fixed2(_suimono_uv3x,_suimono_uv3y);
	fixed2 waveSpdb = fixed2(_suimono_uv4x,_suimono_uv4y);
	texwaveFac = tex2Dlod(_Surface1, float4(tex1.x*twfMult+waveSpd.x, tex1.y*twfMult+waveSpd.y,0,0)).r;
	texwaveFac += tex2Dlod(_Surface1, float4(tex1.x*twfMult-waveSpdb.x-0.5, tex1.y*twfMult-waveSpdb.y-0.5,0,0)).r;
	//texwaveFac += tex2Dlod(_Surface1, float4(tex1.x*twfMult-waveSpd.x-0.25, tex1.y*twfMult,0,0)).r;

	float texwaveFac1;
	float twfMult1 = 1.0;
	fixed2 waveSpd1 = fixed2(_suimono_uvx,_suimono_uvy); 
	fixed2 waveSpd1b = fixed2(_suimono_uv2x,_suimono_uv2y); 
	texwaveFac1 = tex2Dlod(_Surface1, float4(tex2.x*twfMult1+waveSpd1.x, tex2.y*twfMult1+waveSpd1.y,0,0)).r;
//texwaveFac1 += tex2Dlod(_Surface1, float4(tex2.x*twfMult1+waveSpd1b.x*0.5+0.5, tex2.y*twfMult1+waveSpd1b.y*0.5+0.5,0,0)).r;
	texwaveFac1 += tex2Dlod(_Surface1, float4(tex2.x*twfMult1-waveSpd1b.x-0.5, tex2.y*twfMult1-waveSpd1b.y-0.5,0,0)).r;
	//texwaveFac1 += tex2Dlod(_Surface1, float4(tex2.x-waveSpd1.x-0.25, tex2.y,0,0)).r;

	float texwaveFac2;
	float twf2Mult = 8.0;
	fixed2 waveSpd2 = fixed2(_suimono_uvx,_suimono_uvy); 
	fixed2 waveSpd2b = fixed2(_suimono_uv2x,_suimono_uv2y); 
	texwaveFac2 = tex2Dlod(_Surface1, float4(tex2.x*twf2Mult+waveSpd2.x, tex2.y*twf2Mult+waveSpd2.y,0,0)).r;
	texwaveFac2 += tex2Dlod(_Surface1, float4(tex2.x*twf2Mult-waveSpd2b.x-0.5, tex2.y*twf2Mult-waveSpd2b.y-0.5,0,0)).r;
	//texwaveFac2 += tex2Dlod(_Surface1, float4(tex2.x*twf2Mult-waveSpd2.x-0.25, tex2.y*twf2Mult,0,0)).r;

	float texwaveFac3;
	float twf3Mult = 20.0;
	fixed2 waveSpd3 = fixed2(_suimono_uvx,_suimono_uvy); 
	fixed2 waveSpd3b = fixed2(_suimono_uv2x,_suimono_uv2y); 
	texwaveFac3 = tex2Dlod(_Surface1, float4(tex2.x*twf3Mult+waveSpd3.x, tex2.y*twf3Mult+waveSpd3.y,0,0)).r;
	texwaveFac3 += tex2Dlod(_Surface1, float4(tex2.x*twf3Mult-waveSpd3b.x-0.5, tex2.y*twf3Mult-waveSpd3b.y-0.5,0,0)).r;
	//texwaveFac3 += tex2Dlod(_Surface1, float4(tex2.x*twf3Mult-waveSpd3.x-0.25, tex2.y*twf3Mult,0,0)).r;
	
	



	//gamma conversion if needed
	_suimono_DeepWaveHeight = _suimono_DeepWaveHeight * lerp((0.4545),1.0,_SuimonoIsLinear);	
	_suimono_DetailHeight = _suimono_DetailHeight * lerp((0.4545),1.0,_SuimonoIsLinear);
	_WaveShoreHeight = _WaveShoreHeight * lerp((0.4545),1.0,_SuimonoIsLinear);
		
	//SET VERTICES
	//vertical wave
	fixed origY = v.vertex.y; //save original vertex height
	float deepFac = texwaveFac;
	float waveFac = texwaveFac1 + (texwaveFac2*0.1);// + (texwaveFac3*0.02); //calculate wave height

	//v.vertex.y += lerp(0.0,_suimono_DeepWaveHeight,deepFac); //add deep wave height to vertex
	//v.vertex.y += lerp(0.0,_suimono_DetailHeight,waveFac); //add wave height to vertex

	//smooth vertex falloff
	_suimono_HeightProjection = _suimono_HeightProjection * texfalloff;

	//v.vertex.xyz += (v.normal*lerp(0.0,_suimono_DeepWaveHeight,deepFac*_suimono_HeightProjection)); //add deep wave height to vertex
	//v.vertex.xyz += (v.normal*lerp(0.0,_suimono_DetailHeight,waveFac*_suimono_HeightProjection)); //add wave height to vertex
	v.vertex.y += (lerp(0.0,_suimono_DeepWaveHeight,deepFac*_suimono_HeightProjection)); //add deep wave height to vertex
	v.vertex.y += (lerp(0.0,_suimono_DetailHeight,waveFac*_suimono_HeightProjection)); //add wave height to vertex
	
	
	//v.vertex.y = lerp(v.vertex.y,0.0,mask1); //fade vertex height out in distance
	
	//detail texture
	//v.vertex.y += lerp(0.0,_DetailHeight, (texwaveFacDetail1 * (1.0-(z*0.25))));
	//v.vertex.y += lerp(0.0,_DetailHeight*0.25, (texwaveFacDetail2 * (1.0-(z*0.25))));
	

	//normalize shoreline
	v.vertex.y = lerp(v.vertex.y,origY, (f.r+f.g) * normalShore);
	
	
	//raise and warp wavetex at shoreline
	_suimono_HeightProjection = _suimono_HeightProjection * _enableShoreline;
	//v.vertex.y -= ((waveTex.b * _WaveShoreHeight) * saturate(f.g) * _suimono_HeightProjection) * 1.0;//lower wave trough near shore
	//v.vertex.x += ((waveTex.g * _WaveShoreHeight) * saturate(f.g) * _suimono_HeightProjection) * 0.5;//displace wave trough near shore
	//v.vertex.y += ((waveTex.r * _WaveShoreHeight) * saturate(f.r*1.4-f.g) * _suimono_HeightProjection) * 4.0;//raise wave crest
	v.vertex.y -= ((waveTex.b * _WaveShoreHeight) * saturate(f.g) * _suimono_HeightProjection) * 1.0;//lower wave trough near shore
	//v.vertex.x += ((waveTex.g * _WaveShoreHeight) * _suimono_HeightProjection) * 0.5;//displace wave trough near shore
	v.vertex.y += ((waveTex.r * _WaveShoreHeight) * saturate(f.r*1.4-f.g) * _suimono_HeightProjection) * 4.0;//raise wave crest
	v.vertex.y = max(v.vertex.y,origY);
	//v.vertex.y += (_WaveShoreHeight) * 20.0 * _suimono_HeightProjection * (f.r);
	//v.vertex.y += (waveTex * _WaveShoreHeight) * 20.0 * _suimono_HeightProjection * (f.r*2.0);



	//update normal
	//v.normal.y += v.vertex.y;//lerp(0.01,1.0,(v.vertex.y));
	//v.normal = normalize(v.vertex);

	

}

#endif