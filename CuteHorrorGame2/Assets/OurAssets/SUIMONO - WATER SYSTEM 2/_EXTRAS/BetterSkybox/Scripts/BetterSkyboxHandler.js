#pragma strict

var BSVersionNumber : String="0.1";
//
var skyIndex : int;
var skyUseIndex : int;
var skyOptions = new Array(" OFF ","Horizon Fix","Custom SphereMap (2D)","Custom ShereMap (CUBE)");
//
var lockRotation = false;
var yRotation : float = 0.0;
var customSpheremap2D : Texture2D;

//
var useMat : Material;
var alphaMat : Material;
private var useCamera : Camera;
private var thisRender : Renderer;
private var setScale : float = 200.0;
private var saveCamFlag : CameraClearFlags;
//



function Start() {
	useCamera = this.transform.parent.transform.gameObject.GetComponent(Camera) as Camera;
	thisRender = this.transform.Find("BS_SkyObject").gameObject.GetComponent(Renderer);
	saveCamFlag = useCamera.clearFlags;
	
	if (thisRender != null){
		//useMat = new Material(Shader.Find("BetterSkybox/BetterSkybox_spheremap"));
		//alphaMat = Material.Find("mat_betterSkyboxHorizon");
		//alphaMat = Resources.Load("mat_betterSkyboxHorizon", typeof(Material));
		//alphaMat = new Material(Shader.Find("BetterSkybox/BetterSkybox_spheremap"));
	}
}



function LateUpdate () {

	//CALCULATE DATA
	setScale = useCamera.farClipPlane*2.0;
	
	//MANIPULATE CAMERA
	//useCamera.clearFlags = CameraClearFlags.Depth;
	
	// UPDATE POSITION AND SCALE
	this.transform.localScale = Vector3(setScale,setScale,setScale);
	this.transform.localPosition = Vector3(0,0,0);

	//UPDATE ROTATION
	if (!lockRotation){
		this.transform.eulerAngles = Vector3(-90,271+yRotation,0);
	}
	

	
	
	//UPDATE SKYBOX MODES
	if (skyIndex != skyUseIndex){	
	

		//SET SKYBOX (Alpha Horizon Fix)
		if (skyIndex==1){
			//useMat = Material(Shader.Find("BetterSkybox/BetterSkybox_alphahorizon"));
			//Shader.Find("BetterSkybox/BetterSkybox_spheremap")
			if (thisRender != null){
				thisRender.material = alphaMat;
				thisRender.enabled = true;
				//thisRender.sharedMaterial = Material(Shader.Find("BetterSkybox/BetterSkybox_alphahorizon"));
				//thisRender.material.SetTexture("_Tex",G);
				thisRender.material.renderQueue = 1998;
			}
		}
		
		//SET SKYBOX (SphereMap 2D)
		if (skyIndex==2){

			// do some init stuff
			if (skyIndex != skyUseIndex){
				thisRender.sharedMaterial = useMat;
				thisRender.enabled = true;
			}
			
			if (customSpheremap2D != null){
				if (thisRender != null){
					thisRender.sharedMaterial.SetTexture("_Tex",customSpheremap2D);
					thisRender.sharedMaterial.renderQueue = 1998;
				}
			} else {
				//thisRender.material.SetTexture("_Tex",RenderSettings.skybox.GetTexture("_Tex"));
			}
		}

		skyUseIndex = skyIndex;
	}

	
	
}




function OnEnable(){
	if (useCamera != null) saveCamFlag = useCamera.clearFlags;
}

function OnDisable(){
	if (useCamera != null) useCamera.clearFlags = saveCamFlag;
}

function OnApplicationQuit() {
	if (thisRender != null) thisRender.enabled = false;
}