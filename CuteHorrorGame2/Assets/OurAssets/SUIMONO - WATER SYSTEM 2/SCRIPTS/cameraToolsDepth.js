#pragma strict

var updateFPS : float = 1.0;
var resolution : int = 256;

var renderTexDepth : RenderTexture;

private var suimonoModuleObject : SuimonoModule;
private var suimonoObject : SuimonoObject;
private var suimonoSurface : Transform;
private var surfaceRenderer : Renderer;
private var cam : Camera;
private var copyCam : Camera;
private var camMatrix : Matrix4x4;

private var updateTimer : float = 0.0;
private var currResolution : int = 256;
private var doUpdate : boolean = false;
private var useFPS : int = 16;

private var savedPos : Vector3 = Vector3(0,0,0);



function Awake(){
	UpdateRenderTex();
	doUpdate = true;
}


function Start () {

	suimonoModuleObject = GameObject.Find("SUIMONO_Module").gameObject.GetComponent(SuimonoModule);
	suimonoObject = transform.parent.gameObject.GetComponent(SuimonoObject);
	suimonoSurface = transform.parent.transform;

	savedPos = suimonoSurface.transform.position;

	cam = gameObject.GetComponent(Camera) as Camera;
	if (suimonoModuleObject != null){
		copyCam = suimonoModuleObject.setCamera.GetComponent(Camera);
	}


}




function LateUpdate () {
//function OnWillRenderObject(){


	if (useFPS > 0){
		//if (cam.transform.position != copyCam.transform.position){
		//	//useFPS = 60;
		//	doUpdate = true;
		//} else if (cam.transform.rotation != copyCam.transform.rotation){
		//	//useFPS = 60;
		//	doUpdate = true;
		//} else {
		//	useFPS = updateFPS;
		//}

		if (updateTimer >= (1.0/useFPS)){
			updateTimer = 0.0;
			doUpdate = true;
		}
		updateTimer += Time.deltaTime;


		if (doUpdate){
			doUpdate = false;
			CameraUpdate();
		}


	}
}



function CameraUpdate () {


	//SET POSITIONS
	if (suimonoObject.typeIndex == 0){
		if (Time.time > 1.0){
			if (savedPos != suimonoSurface.transform.position){
				if (savedPos.x > suimonoSurface.transform.position.x){
					transform.localPosition.x = 4.0;
				}
				if (savedPos.x < suimonoSurface.transform.position.x){
					transform.localPosition.x = -4.0;
				}
				if (savedPos.z > suimonoSurface.transform.position.z){
					transform.localPosition.z = 4.0;
				}
				if (savedPos.z < suimonoSurface.transform.position.z){
					transform.localPosition.z = -4.0;
				}
				savedPos = suimonoSurface.transform.position;
			}
		} else {
			savedPos = suimonoSurface.transform.position;
		}
	}


	if (cam != null){

		//set camera settings
		//cam.transform.position = suimonoObject.transform.position;
		//cam.transform.rotation.z = suimonoObject.transform.rotation.z;
		//cam.projectionMatrix = copyCam.projectionMatrix;;
		//cam.fieldOfView = copyCam.fieldOfView;
		//cam.renderingPath = copyCam.actualRenderingPath;
		cam.aspect = 1.0;
		if (suimonoObject.typeIndex == 0){
			cam.orthographicSize = (100.0 * suimonoObject.overallScale);///(10.0/0.65);
		} else {
			//cam.orthographicSize = (100.0 / (transform.parent.localScale.x * 11.8));
			cam.orthographicSize = (20.0 * transform.parent.localScale.x);
		}


		if (renderTexDepth != null){
			
			//update texture resolution
			if (resolution != currResolution){
				currResolution = resolution;
				UpdateRenderTex();
			}

			//render texture
			cam.enabled = false;
			cam.targetTexture = renderTexDepth;
			cam.Render();

			//cam.enabled = false;
			
			//pass texture to shader
			if (surfaceRenderer != null){
				surfaceRenderer.material.SetTexture("_FlowMap",renderTexDepth);
			} else {
				if (suimonoObject != null){
					surfaceRenderer = suimonoObject.thisrendererComponent;
				}
			}
		}

	}

}




function UpdateRenderTex(){

	if (resolution < 4) resolution = 4;
		
	if (renderTexDepth != null) DestroyImmediate(renderTexDepth);
	renderTexDepth = new RenderTexture(resolution,resolution,16,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear);
	renderTexDepth.isCubemap = false;
	renderTexDepth.generateMips = false;
	//renderTexDepth.useMipMap = true;
	//renderTexDepth.mipMapBias = 8.0;
	renderTexDepth.anisoLevel = 1;
	renderTexDepth.filterMode = FilterMode.Trilinear;
	renderTexDepth.wrapMode = TextureWrapMode.Clamp;
		
}
