#pragma strict

var updateFPS : int = 16;
var resolution : int = 256;

var renderTexDiff : RenderTexture;

private var suimonoModuleObject : SuimonoModule;
private var suimonoObject : SuimonoObject;
private var surfaceRenderer : Renderer;
private var cam : Camera;
private var copyCam : Camera;
private var camMatrix : Matrix4x4;

private var updateTimer : float = 0.0;
private var currResolution : int = 256;
private var doUpdate : boolean = false;
private var useFPS : int = 16;

function Start () {

	suimonoModuleObject = GameObject.Find("SUIMONO_Module").gameObject.GetComponent(SuimonoModule);
	suimonoObject = transform.parent.gameObject.GetComponent(SuimonoObject);



	cam = gameObject.GetComponent(Camera) as Camera;
	if (suimonoModuleObject != null){
		copyCam = suimonoModuleObject.setCamera.GetComponent(Camera);
	}

	UpdateRenderTex();
}


function LateUpdate () {

	if (suimonoModuleObject != null){
		if (suimonoModuleObject.setCamera != copyCam.transform){
			copyCam = suimonoModuleObject.setCamera.GetComponent(Camera);
		}
	}

	
	if (cam.transform.position != copyCam.transform.position){
		//useFPS = 60;
		doUpdate = true;
	} else if (cam.transform.rotation != copyCam.transform.rotation){
		//useFPS = 60;
		doUpdate = true;
	} else {
		useFPS = updateFPS;
	}

	if (updateTimer >= (1.0/(useFPS*1.0))){
		updateTimer = 0.0;
		doUpdate = true;
	}
	updateTimer += Time.deltaTime;

	if (doUpdate){
		doUpdate = false;
		CameraUpdate();
	}

	

}



function CameraUpdate () {

	if (copyCam != null && cam != null){

		//set camera settings
		cam.transform.position = copyCam.transform.position;
		cam.transform.rotation = copyCam.transform.rotation;
		cam.projectionMatrix = copyCam.projectionMatrix;;
		cam.fieldOfView = copyCam.fieldOfView;
		cam.renderingPath = copyCam.actualRenderingPath;

		if (renderTexDiff != null){

			//update texture resolution
			if (resolution != currResolution){
				currResolution = resolution;
				UpdateRenderTex();
			}

			//render texture
			cam.enabled = false;
			cam.targetTexture = renderTexDiff;
			cam.Render();

			//pass texture to shader
			//if (surfaceRenderer != null){
				//surfaceRenderer.material.SetTexture("_testTransTex",renderTexDiff);
				Shader.SetGlobalTexture("_suimono_TransTex",renderTexDiff);
			//} else {
			//	if (suimonoObject != null){
			//		surfaceRenderer = suimonoObject.thisrendererComponent;
			//	}
			//}
		}
		
	}

}




function UpdateRenderTex(){

	if (resolution < 4) resolution = 4;
		
	if (renderTexDiff != null) DestroyImmediate(renderTexDiff);
	renderTexDiff = new RenderTexture(resolution,resolution,16,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear);
	renderTexDiff.isCubemap = false;
	renderTexDiff.generateMips = false;
	//renderTexDiff.useMipMap = true;
	//renderTexDiff.mipMapBias = 8.0;
	renderTexDiff.anisoLevel = 1;
	renderTexDiff.filterMode = FilterMode.Trilinear;
	renderTexDiff.wrapMode = TextureWrapMode.Clamp;
		
}
