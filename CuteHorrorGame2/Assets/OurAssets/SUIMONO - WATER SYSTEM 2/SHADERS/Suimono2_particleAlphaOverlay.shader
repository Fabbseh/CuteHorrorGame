Shader "Suimono2/particle_AlphaOverlay" {

Properties {
	_TintColor ("Tint Color", Color) = (0.5,0.5,0.5,0.5)
	_MainTex ("Particle Texture", 2D) = "white" {}
	_InvFade ("Soft Particles Factor", Range(0.01,3.0)) = 1.0
}

Category {
	Tags { "Queue"="Overlay+13" "IgnoreProjector"="True"}
	//Tags { "Queue"="Transparent-102" "IgnoreProjector"="True"}
	Blend SrcAlpha OneMinusSrcAlpha
	//AlphaTest Greater .01
	//ColorMask RGB
	//ZTest LEqual
	Cull Back Lighting Off ZWrite Off Fog{Mode Off}
	//BindChannels {
	//	Bind "Color", color
	//	Bind "Vertex", vertex
	//	Bind "TexCoord", texcoord
	//}
	

	SubShader {
		//Pass {
		
			CGPROGRAM
			#pragma surface surf SuimonoNoLight vertex:vert alpha
			//#pragma vertex vert
			//#pragma fragment frag
			//#pragma fragmentoption ARB_precision_hint_fastest
			//#pragma multi_compile_particles
			
			//#include "UnityCG.cginc"

			sampler2D _MainTex;
			float4 _TintColor;
			
			//struct appdata_t {
			//	float4 vertex : POSITION;
			//	float4 color : COLOR;
			//	float2 texcoord : TEXCOORD0;
			//};

			//struct v2f {
			//	float4 vertex : POSITION;
			//	float4 color : COLOR;
			//	float2 texcoord : TEXCOORD0;
			//};
			
			//float4 _MainTex_ST;


void vert (inout appdata_full v){
	//UNITY_INITIALIZE_OUTPUT(Input,o);
	//o.customColor = abs(v.normal);
	v.vertex = v.vertex;//mul(UNITY_MATRIX_MVP, v.vertex);
	//o.color = v.color;
	//v.texcoord = TRANSFORM_TEX(v.texcoord,_MainTex);
	//return o;
}
			
			//v2f vert (appdata_t v)
			//{
			//	v2f o;
			//	o.vertex = mul(UNITY_MATRIX_MVP, v.vertex);
			//	o.color = v.color;
			//	o.texcoord = TRANSFORM_TEX(v.texcoord,_MainTex);
			//	return o;
			//}

			//sampler2D _CameraDepthTexture;
			//float _InvFade;
			
			//half4 frag (v2f i) : COLOR
			//{

			//	return 3.0f * _TintColor * i.color * tex2D(_MainTex, i.texcoord);
			//}
			
struct Input {
	float2 uv_MainTex;
};

			
fixed4 LightingSuimonoNoLight (SurfaceOutput s, fixed3 lightDir, half3 viewDir, fixed atten)
{
	fixed4 col;
	col.rgb = (s.Albedo+s.Alpha)*_LightColor0.rgb*2.0*atten;
	col.a = lerp(0.0,2.0,s.Alpha);
	col.a = saturate(col.a);
	
	return col;
}

void surf (Input IN, inout SurfaceOutput o) {
	//o.Gloss = 1.0;
	//o.Specular = 1.0;
	half4 col = tex2D(_MainTex, IN.uv_MainTex);
	o.Albedo = col.rgb * _TintColor.rgb;
	o.Alpha = col.a;// * _TintColor.a;
}
			
			
			
			ENDCG 
			

		//}
	} 	
	
	
	
	
	
}
}
