Shader "Suimono2/effect_reflect" {


Properties {

	_DynReflColor ("Reflection Dynamic", Color) = (1.0, 1.0, 1.0, 0.5)
	_ReflDist ("Reflection Distance", Float) = 1000
	_ReflBlend ("Reflection Blend", Range(0.003,0.5)) = 0.01
	_ReflectionTex ("Reflection", 2D) = "" {}

}



Subshader 
{ 








// ------------------------
//    MIRROR REFLECTION
//-------------------------
Tags { "RenderType"="Transparent" "Queue"= "Transparent-301"}
Cull Back
Blend SrcAlpha OneMinusSrcAlpha
ZWrite Off

ZTest Never
ColorMask Off



CGPROGRAM
#pragma target 3.0
#pragma surface surf Lambert vertex:vert noambient alpha
//#include "UnityCG.cginc"



struct Input {
    float4 pos;
    //float4 ref;
    //float3 viewDir;
};
     

void vert (inout appdata_full v, out Input o) {
	o.pos = -mul (UNITY_MATRIX_MVP, v.vertex);   
	//o.viewDir.xzy = ObjSpaceViewDir(v.vertex);
	//o.ref = ComputeScreenPos(o.pos);
}



//float4 _DynReflColor;
//float _ReflDist;
//float _ReflBlend;
sampler2D _ReflectionTex;

void surf (Input IN, inout SurfaceOutput o) {

	//float fogCalc2 = ((1.0-((IN.pos.z+(_ReflDist)))));
	//float mask = (fogCalc2 * _ReflBlend);
    //if (mask < 0.0) mask = 0.0;
    //if (mask > 1.0) mask = 1.0;


    //IN.viewDir = normalize(IN.viewDir);
	//float4 uv1 = IN.ref; uv1.xy;

	//half4 refl = tex2Dproj( _ReflectionTex, UNITY_PROJ_COORD(uv1));  
    //o.Albedo = refl.rgb*_DynReflColor.rgb*1.75;
    //half4 underLight = _LightColor0;
    //if (underLight.r > 1.0) underLight.r = 1.0;
    //if (underLight.r < 0.0) underLight.r = 0.0;
    
    o.Gloss = 0.0;
    o.Specular = 0.0;
    o.Emission = 0.0;
    o.Albedo = half3(0,0,0);
    o.Alpha = 0.0;//underLight.r;//mask * _DynReflColor.a;
}
ENDCG








}
FallBack ""
}



































