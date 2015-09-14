Shader "Suimono2/SuimonoDepth" {
Properties {
   _MainTex ("", 2D) = "white" {}
}

SubShader {
Tags { "RenderType"="Opaque" }

Pass{
CGPROGRAM
#pragma target 3.0
#pragma vertex vert
#pragma fragment frag
#include "UnityCG.cginc"
#include "AutoLight.cginc"

sampler2D _MainTex;
sampler2D _CameraDepthTexture;

float _sceneDepth = 0;
float _shoreDepth = 0;
float _foamDepth = 0;
float _edgeDepth = 0;

struct v2f {
    float4 pos : SV_POSITION;
    half2 uv : TEXCOORD0;
    float4 screenPos: TEXCOORD1;
};




//Vertex
v2f vert (appdata_tan v){
    v2f o;
    o.pos = mul (UNITY_MATRIX_MVP, v.vertex);
    o.screenPos=ComputeScreenPos(o.pos);
    o.uv = v.texcoord;
    TRANSFER_VERTEX_TO_FRAGMENT(o);

    return o;
}



half4 frag (v2f i) : COLOR{
	float4 retValue;
	float4 origColor;


	//get textures
	origColor = tex2D(_MainTex, i.uv);


	//CALCULATE DEPTH
	float rawDepth = SAMPLE_DEPTH_TEXTURE(_CameraDepthTexture,i.screenPos.xyz);
	float dpth = Linear01Depth(rawDepth);

	//FOG
	retValue = fixed4(0,0,0,0);
	retValue.r = (1.0-saturate(lerp(0.0,_sceneDepth*1,rawDepth)));
	retValue.g = (1.0-saturate(lerp(0.0,_shoreDepth*1,rawDepth)))*3.0;
	retValue.b = (1.0-saturate(lerp(0.0,_foamDepth*1,rawDepth)))*3.0;
	retValue.a = (1.0-saturate(lerp(0.05,_edgeDepth*1.01,rawDepth)))*50.0;

//retValue.rgb = fixed3(1,0,0);

	return retValue;
}


ENDCG
}
}
FallBack "Diffuse"
}