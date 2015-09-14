Shader "Suimono2/effect_refraction" {
Properties {
	_MaskMap ("MaskMap", 2D) = "" {}
	_HeightMap ("HeightMap", 2D) = "" {}
	_DepthColor ("Depth Color", Color) = (0.5, 0.5, 0.5, 1)
    _Strength ("Refraction Strength", range (0,150)) = 25.0
    _Overlay ("Overlay Strength", range (0.0,1.0)) = 1.0
    _Brightness ("Brightness Strength", range (1.0,1.8)) = 1.0
}



SubShader {



		
        
        
    

GrabPass {}
//	"_waterTex1"
	//Tags {"Queue" = "Overlay+222" "IgnoreProjector"="True" "RenderType"="Transparent"}
//	Name "ScreenGrab"
//}


//RENDER REFRACTION
Pass{
	Tags {"Queue"= "Overlay+222" "IgnoreProjector"="True" "RenderType"="Opaque"}
	Cull Back
	//Name "DropDistortion"
	Blend SrcAlpha OneMinusSrcAlpha
	ZWrite Off
	//ZTest Always

	//ZTest LEqual
	
	CGPROGRAM
	#pragma vertex vert
	#pragma fragment frag alpha
	#include "UnityCG.cginc"
	
	struct v2f {
		float4 pos          : POSITION;
		float4 uvgrab       : TEXCOORD0;
		float2 uv           : TEXCOORD1;
		float4 screenPos    : TEXCOORD2;
		float4 uvs          : TEXCOORD3;
		fixed4 color 		: COLOR;
	};
	
	
	
	v2f vert (appdata_full v)
	{
		v2f o;
		o.pos = mul(UNITY_MATRIX_MVP, v.vertex);   
		#if UNITY_UV_STARTS_AT_TOP
		float scale = -1.0;
		#else
		float scale = 1.0;
		#endif

		o.color = v.color;
		
		o.screenPos = ComputeScreenPos(o.pos);
		
		o.uv = v.texcoord.xy;
		
		o.uvgrab.xy = (float2(o.pos.x, o.pos.y * scale) + o.pos.w) * 0.5;
		o.uvgrab.zw = o.pos.zw;
		
		o.uvs.xy = (float2(o.pos.x, o.pos.y * scale) + (o.pos.w)) * 0.5;
		o.uvs.z = o.pos.z;
		o.uvs.w = o.pos.w;
		
		return o;
	}
	sampler2D _CameraDepthTexture;
	sampler2D _HeightMap;
	sampler2D _MaskMap;
    float _EffectSpeed, _EffectSpeed2, _Strength;
	float4 _DepthColor;
	sampler2D _GrabTexture;
	float4 _GrabTexture_TexelSize;
	float _Overlay;
	float _Brightness;
	
	
	half4 frag( v2f i ) : COLOR
	{
	
		_Strength = _Strength * 10.0;
		float2 effectUVs = i.uv;
		float3 normal1 = UnpackNormal(tex2D(_HeightMap, effectUVs));

		//distort
		float2 offset = normal1.xy * _Strength * _GrabTexture_TexelSize.xy * 1.25;  //5
		i.uvgrab.xy = (offset * i.uvgrab.z) + i.uvgrab.xy;
		half4 oCol = half4(tex2Dproj(_GrabTexture, UNITY_PROJ_COORD(i.uvgrab)).rgb, 1.0);
		
                    
        half3 MTex = tex2D(_MaskMap, effectUVs);

		
		oCol.rgb = oCol.rgb * ((1.0 + (0.05 * _Overlay)) + (_DepthColor.rgb * 0.25));
		oCol.rgb = lerp(oCol*0.25,oCol*(1.4*_Brightness),MTex.g);
		
		oCol.a = _Overlay*i.color.a*MTex.r;
		
		clip(MTex.r-0.1);
		
		return oCol;;
	}

	ENDCG
}





    
   
      
                

}

//FallBack ""
}
