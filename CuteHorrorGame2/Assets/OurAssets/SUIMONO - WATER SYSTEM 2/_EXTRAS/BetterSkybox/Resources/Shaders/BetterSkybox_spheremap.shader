Shader "BetterSkybox/BetterSkybox_spheremap" {
Properties {
	_Color ("Main Color", Color) = (1,1,1,1)
	_Tex ("Base (RGB) RefStrength (A)", 2D) = "white" {} 
}
SubShader {

	//Tags { "Queue"="Background" "RenderType"="Background" }
	Tags { "RenderType"="Background" }
	Cull Front
	//ZWrite Off
	ZWrite On
	Fog { Mode Off }
    //offset 1,9000000
    
    ColorMask RGBA
    
	Pass {
		
		CGPROGRAM
		#pragma vertex vert
		#pragma fragment frag
		#pragma fragmentoption ARB_precision_hint_fastest

		#include "UnityCG.cginc"

		sampler2D _Tex;
		fixed4 _Color;
		
		struct appdata_t {
			float4 vertex : POSITION;
			float3 texcoord : TEXCOORD0;
		};

		struct v2f {
			float4 vertex : POSITION;
			float3 texcoord : TEXCOORD0;
		};

		v2f vert (appdata_t v)
		{
			v2f o;
			o.vertex = mul(UNITY_MATRIX_MVP, v.vertex);
			o.texcoord = v.texcoord;
			return o;
		}

		fixed4 frag (v2f i) : COLOR
		{
			fixed4 tex = tex2D (_Tex, i.texcoord.xy);
			fixed4 col;
			col.rgb = lerp(tex.rgb,tex.rgb*_Color.rgb,_Color.a);// - unity_ColorSpaceGrey;
			//col.rgb = half3(tex.a,tex.a,tex.a);
			col.a = 1.0;//tex.a;
			//clip(tex.a-0.01);
			return col;
		}
		ENDCG 
	}
} 

Fallback Off

}