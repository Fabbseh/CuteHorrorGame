#pragma strict



//PUBLIC VARIABLES
//var lightDir : Transform;
//var showEnvironmentGI : float = 1.0;
//var showGreyScale : float = 0.0;
//var showViewNormals : float = 0.0;
//var showWorldNormals : float = 0.0;
//var showDepthColors : float = 0.0;
//var showLightDir : float = 0.0;
//var showShadowMap : float = 0.0;

var _sceneDepth : float = 20.0;
var _shoreDepth : float = 45.0;
var _foamDepth : float = 46.0;
var _edgeDepth : float = 46.0;

//var skyColor : Color = Color(0.78,0.94,1.0,0.33);
//var groundColor : Color = Color(1.0,0.43,0.0,0.23);


//PRIVATE VARIABLES
private var useMat : Material;
private var reflTex : Texture;
private var envTex : Texture;
private var MV : Matrix4x4;
private var CamInfo : Camera;
	
private var curr_sceneDepth : float;
private var curr_shoreDepth : float;
private var curr_foamDepth : float;
private var curr_edgeDepth : float;


function Start () {
	//setup material
	useMat = new Material (Shader.Find("Suimono2/SuimonoDepth"));
	reflTex = Resources.Load("ReflectTex_Specular");
	envTex = Resources.Load("ReflectTex_Normals");
	useMat.SetTexture("_sGI_ReflectionCube",reflTex);
	useMat.SetTexture("_sGI_EnvironmentCube",envTex);
	
	//setup camera
	CamInfo = this.GetComponent(Camera);
	CamInfo.depthTextureMode = DepthTextureMode.DepthNormals;

}



function LateUpdate () {
	
	
	//clamp values
	_sceneDepth = Mathf.Clamp(_sceneDepth,0.0,100.0);
	_shoreDepth = Mathf.Clamp(_shoreDepth,0.0,100.0);
	_foamDepth = Mathf.Clamp(_foamDepth,0.0,100.0);
	_edgeDepth = Mathf.Clamp(_edgeDepth,0.0,100.0);
	//showEnvironmentGI = Mathf.Clamp01(showEnvironmentGI);
	//showGreyScale = Mathf.Clamp01(showGreyScale);
	//showViewNormals = Mathf.Clamp01(showViewNormals);
	//showWorldNormals = Mathf.Clamp01(showWorldNormals);
	//showDepthColors = Mathf.Clamp01(showDepthColors);
	//showLightDir = Mathf.Clamp01(showLightDir);
	//showShadowMap = Mathf.Clamp01(showShadowMap);

	//Matrix
	//MV = CamInfo.worldToCameraMatrix.inverse;
	//Shader.SetGlobalMatrix("_sGI_CameraMV",MV);

	//Get Light Position
	//if (lightDir != null){
	//	var lightD : Vector3 = lightDir.eulerAngles;
	//	lightD.x = ((lightD.x / 360.0f)*2.0f)-1.0f;
	//	lightD.y = ((lightD.y / 360.0f)*2.0f)-1.0f;
	//	lightD.z = ((lightD.z / 360.0f)*2.0f)-1.0f;

	//	useMat.SetFloat("_sGI_lX", lightD.x);
	//	useMat.SetFloat("_sGI_lY", lightD.y);
	//	useMat.SetFloat("_sGI_lZ", lightD.z);
	//}

	//set shader variables
	//useMat.SetFloat("_sGI_showEnvironmentGI", showEnvironmentGI);
	//useMat.SetFloat("_sGI_showGreyScale", showGreyScale);
	//useMat.SetFloat("_sGI_showLightDir", showLightDir);
	//useMat.SetFloat("_sGI_showShadowMap", showShadowMap);
	//useMat.SetFloat("_sGI_showViewNormals", showViewNormals);
	//useMat.SetFloat("_sGI_showWorldNormals", showWorldNormals);
	//useMat.SetFloat("_sGI_showDepthColors", showDepthColors);
	//useMat.SetColor("_sGI_skyColor", skyColor);
	//useMat.SetColor("_sGI_grndColor", groundColor);

	if (curr_sceneDepth != _sceneDepth){
		curr_sceneDepth = _sceneDepth;
		useMat.SetFloat("_sceneDepth", _sceneDepth);
	}
	if (curr_shoreDepth != _shoreDepth){
		curr_shoreDepth = _shoreDepth;
		useMat.SetFloat("_shoreDepth", _shoreDepth);
	}
	if (curr_foamDepth != _foamDepth){
		curr_foamDepth = _foamDepth;
		useMat.SetFloat("_foamDepth", _foamDepth);
	}
	if (curr_edgeDepth != _edgeDepth){
		curr_edgeDepth = _edgeDepth;
		useMat.SetFloat("_edgeDepth", _edgeDepth);
	}
}
	


function OnRenderImage (source : RenderTexture, destination : RenderTexture){
	Graphics.Blit(source,destination,useMat);
}


