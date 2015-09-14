Shader "Obi/Particles" {
	SubShader { 
		Pass { 
			
			Blend SrcAlpha OneMinusSrcAlpha 
			ZWrite Off 
			ZTest always 
			Cull Off 
			Fog { Mode Off } 
			BindChannels {
			
				Bind "vertex", vertex 
				Bind "color", color 
			} 
		} 
	} 
}

