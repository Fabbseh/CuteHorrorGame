#pragma strict

@script ExecuteInEditMode()


//Underwater Effects variables
var suimonoVersionNumber : String = "";

var unityVersionIndex : int;// = 1;
var unityVersionUseIndex : int;//;
var unityVersionOptions = new Array("Unity DX9","Unity DX11");


var useUVReversal : boolean = false;
var unityVersion : String = "---";
var setCamera : Transform;
var setTrack : Transform;
var enableUnderwaterPhysics : boolean = true;
var enableUnderwaterFX : boolean = true;
var enableUnderwaterDeferred : boolean = true;
var enableInteraction : boolean = true;
var objectEnableUnderwaterFX : float = 1.0;

var enableRefraction : boolean = true;
var enableDynamicReflections : boolean = true;
var enableCaustics : boolean = true;
var enableTenkoku : boolean = false;

var showPerformance : boolean = false;
var showGeneral : boolean = false;

var etherealScroll : float = 0.1; 

var enableBlur : boolean = true;
var underwaterColor : Color = Color(0.58,0.61,0.61,0.0);
var enableTransition : boolean = true;
var blurAmount : float = 0.005;
var refractionAmount : float = 20.0;
var cameraPlane_offset : float = 0.1;
var transition_offset : float = 0.1;

var showDebug : boolean = false;
var blurSamples : int = 20;

var causticObjectNum : int = 25;
//private var camRendering : RenderingPath;

var shaderSurface : Shader;
var shaderUnderwater : Shader;
var shaderUnderwaterFX : Shader;
private var shaderDropletsFX : Shader;
private var debrisShaderFX : Shader;

private var underwaterLevel = 0.0;
private var underwaterRefractPlane : GameObject;
private var waterTransitionPlane : GameObject;
private var waterTransitionPlane2 : GameObject;
private var underwaterDebris : ParticleSystem;

private var underLightAmt : float = 0.0;
private var underFogDist : float = 0.0;
private var underFogSpread : float = 0.0;
private var reflectColor : Color;
private var causticsColor : Color;
private var causticsSizing : float;
private var hitAmt : float = 1.0;
private var origDepthAmt : float = 1.0;
private var origReflColr : Color;

private var refractAmt : float = 0.0;
private var refractSpd : float = 0.0;
private var refractScl : float = 0.0;

private var targetSurface : GameObject;
private var targetObject : SuimonoObject;
private var doTransitionTimer : float = 0.0;
 
static var isUnderwater : boolean = false;
static var doWaterTransition : boolean = false;


//transparency
var enableTransparency : boolean = true;
var transResolution : int = 3;
var transLayer : int = 0;
var transLayerMask : LayerMask;
var suiLayerMasks : Array;
var resOptions = new Array("4096","2048","1024","512","256","128","64","32","16","8");
var resolutions = new Array(4096,2048,1024,512,256,128,64,32,16,8);
private var transToolsObject : cameraTools;
private var transCamObject : Camera;


//splash effects variables
var alwaysEmitRipples : boolean = false;
var maxEmission = 5000;
var playSounds : boolean = true;
var maxVolume = 1.0;
var maxSounds = 10;
var defaultSplashSound : AudioClip[];
var soundObject : Transform;

var fxObject : SuimonoModuleFX;

private var isinwater : boolean = false;
private var atDepth : float = 0.0;

private var splash_rings : Transform;
private var splash_small : Transform;
private var splash_med : Transform;
private var splash_dirt : Transform;
private var splash_drops : Transform;

private var isPlayingTimer = 0.0;

private var setvolumetarget = 0.65;
private var setvolume = 0.65;

private var ringsSystem : Renderer;
//private var ringsParticles : ParticleSystem.Particle[];

//private var ringFoamSystem : ParticleSystem;
//private var ringFoamParticles : ParticleSystem.Particle[];
//private var ringFoamParticlesNum : int = 1;

//private var splashSystem : ParticleSystem;
//private var splashParticles : ParticleSystem.Particle[];
//private var splashParticlesNum : int = 1;

//private var splashDropSystem : ParticleSystem;
//private var splashDropParticles : ParticleSystem.Particle[];
//private var splashDropParticlesNum : int = 1;

private var sndparentobj : fx_soundModule;
private var underSoundObject : Transform;
private var sndObject = new Array();
private var sndObjects : Transform[];
private var currentSound = 0;

var currentObjectIsOver : float = 0.0;
var currentObjectDepth : float = 0.0;
var currentTransitionDepth : float = 0.0;
var currentSurfaceLevel : float = 0.0;
var suimonoObject : SuimonoObject;

private var effectBubbleSystem : ParticleSystem;
private var effectBubbles : ParticleSystem.Particle[];
private var effectBubblesNum : int = 1;

private var planeIsSet : boolean = false;

var suimonoModuleLibrary : SuimonoModuleLib;


private var waterTransitionRendererComponent : Renderer;
private var waterTransitionParticleComponent : ParticleSystem;
private var waterTransitionParticleRenderComponent : Renderer;
private var waterTransition2RendererComponent : Renderer;
private var waterTransition2ParticleComponent : ParticleSystem;
private var waterTransition2ParticleRenderComponent : Renderer;
private var underwaterDebrisRendererComponent : Renderer;
public var underwaterRefractRendererComponent : Renderer;
public var setCameraComponent : Camera;

private var underTrans : float = 0.0;

//tenkoku specific variables
public var useTenkoku : float = 0.0;
public var tenkokuWindDir : float = 0.0;
public var tenkokuWindAmt : float = 0.0;
public var tenkokuUseWind : boolean = true;
private var tenObject : GameObject;
private var showTenkoku : boolean = true;
private var tenkokuUseReflect : boolean = true;
private var tenkokuWindModule : WindZone;

//collect for GC
private var lx : int;
private var fx : int;
private var px : int;
private var setParticles : ParticleSystem.Particle[];
private var setstep : AudioClip;
private var setpitch : float;
private var waitTime : float;
private var useSoundAudioComponent : AudioSource;
private var useRefract : float;  	
private var flow_dir : Vector2;
private var tempAngle : Vector3;
private var getmap : Color ;
private var getheight : float;
private var getheightW : float;
private var getheightD1 : float;
private var getheightD2 : float;
private var getheight1 : float;
private var getheight2 : float;
private var getheight3 : float;
private var isOverWater : boolean;
private var surfaceLevel : float;
private var groundLevel : float;
private var layer : int;
private var layermask : int;
private var hitRender : Renderer;
private var testpos : Vector3;
private var hits : RaycastHit[];
private var i : int;
private var hit : RaycastHit;
private var pixelUV : Vector2;
private var pixelUV2 : Vector2;
private var pixelUV3 : Vector2;
private var checktex : Texture2D;
private var flowtex : Texture2D;
private var flowtexR : RenderTexture;
private var wavetex : Texture2D;	
private var twfMult : float;
private var waveSpd : Vector2;
private var waveSpdb : Vector2;
private var tscaleN : Vector2;	
private var getwavetex : Color;
private var returnValue : float;
private var returnValueAll : float[];
private var h1 : float;
private var setDegrees : float = 0.0;

private var isUnity5 : float = 0.0;

private var enabledUFX : float = 1.0;
private var enabledCaustics : float = 1.0;


var heightValues : float[];

//cache shader assignments
private var shader_particle : Shader;
private var shader_effectPlaneDX11 : Shader;
private var shader_effectRefract : Shader;
private var shader_effectPlane : Shader;
private var setUnderBright : float;

private var causticObject : fx_causticModule;
private var enTrans : float = 0.0;


function Awake(){

	//###  SET CURRENT SUIMONO NUMBER   ###
	suimonoVersionNumber = "2.1.0a";
	

	StoreSurfaceHeight();

}



function Start(){

	#if UNITY_EDITOR
		PrefabUtility.DisconnectPrefabInstance(this.gameObject);
	#endif
    
	//get unity version
	unityVersion = Application.unityVersion.ToString().Substring(0,1);
	


	//SET PHYSICS LAYER INTERACTIONS
	//This is introduced because Unity 5 no longer handles mesh colliders and triggers without throwing an error.
	//thanks a whole lot guys O_o (for nuthin').  The below physics setup should workaround this problem for everyone.
	for (lx = 0; lx < 20; lx++){
		//loop through and decouple layer collisions for all layers(up to 20).
		//layer 4 is the built-in water layer.
		Physics.IgnoreLayerCollision(lx,4);
	}

	//INITIATE DEFAULT SHADERS
	//shaderSurface = Shader.Find("Suimono2/water_pro_final");
	//shaderUnderwater = Shader.Find("Suimono2/water_under_pro_final");
	//shaderUnderwaterFX = Shader.Find("Suimono2/effect_refractPlane_final");
	//shaderDropletsFX = Shader.Find("Suimono2/effect_refraction");
	//debrisShaderFX = Shader.Find("Suimono2/particle_Alpha");


	//INITIATE OBJECTS
    suimonoModuleLibrary = this.gameObject.GetComponent(SuimonoModuleLib);
    if (this.gameObject.Find("_caustic_effects") != null) causticObject = this.gameObject.Find("_caustic_effects").GetComponent(fx_causticModule);
    if (this.gameObject.Find("effect_refract_plane") != null) underwaterRefractPlane = this.gameObject.Find("effect_refract_plane");
    if (this.gameObject.Find("effect_dropletsParticle") != null) waterTransitionPlane = this.gameObject.Find("effect_dropletsParticle");
    if (this.gameObject.Find("effect_water_fade") != null) waterTransitionPlane2 = this.gameObject.Find("effect_water_fade");
    
	//transparency objects
	transToolsObject = this.transform.Find("cam_SuimonoTrans").gameObject.GetComponent(cameraTools);
	transCamObject = this.transform.Find("cam_SuimonoTrans").gameObject.GetComponent(Camera) as Camera;

    //Effects Initialization
    fxObject = this.gameObject.GetComponent(SuimonoModuleFX) as SuimonoModuleFX;
	if (this.gameObject.Find("_sound_effects") != null) sndparentobj = this.gameObject.Find("_sound_effects").gameObject.GetComponent(fx_soundModule);
    if (this.gameObject.Find("effect_underwater_debris") != null) underwaterDebris = this.gameObject.Find("effect_underwater_debris").gameObject.GetComponent(ParticleSystem);
    if (this.gameObject.Find("effect_fx_bubbles") != null) effectBubbleSystem = this.gameObject.Find("effect_fx_bubbles").gameObject.GetComponent(ParticleSystem);
       

	//Store Cached Shader References
	//shader_particle = Shader.Find("Suimono2/particle_Alpha_4");
	shader_effectPlaneDX11 = Shader.Find("Suimono2/effect_refractPlane_dx11");
	shader_effectPlane = Shader.Find("Suimono2/effect_refractPlane_dx9");
	shader_effectRefract = Shader.Find("Suimono2/effect_refraction");
	
	//store component references
	waterTransitionRendererComponent = waterTransitionPlane.GetComponent(Renderer);
	waterTransitionParticleComponent = waterTransitionPlane.GetComponent(ParticleSystem);
	waterTransitionParticleRenderComponent = waterTransitionPlane.GetComponent(ParticleSystem).GetComponent(Renderer);
	waterTransition2RendererComponent = waterTransitionPlane2.GetComponent(Renderer);
	waterTransition2ParticleComponent = waterTransitionPlane2.GetComponent(ParticleSystem);
	waterTransition2ParticleRenderComponent = waterTransitionPlane2.GetComponent(ParticleSystem).GetComponent(Renderer);
	underwaterDebrisRendererComponent = underwaterDebris.GetComponent(Renderer);
	underwaterRefractRendererComponent = underwaterRefractPlane.GetComponent(Renderer);

	if (underwaterRefractPlane != null) underwaterRefractPlane.SetActive(true);

	#if UNITY_EDITOR
	if (EditorApplication.isPlaying){
	#endif
	if (soundObject != null && sndparentobj != null){
		maxSounds = sndparentobj.maxSounds;
		sndObjects = new Transform[maxSounds];
		
		//init sound object pool
		for (var sx=0; sx < (maxSounds); sx++){
			var soundObjectPrefab = Instantiate(soundObject, transform.position, transform.rotation);
			soundObjectPrefab.transform.parent = sndparentobj.transform;
			sndObjects[sx] = (soundObjectPrefab);
		}
		
		//init underwater sound
		if(sndparentobj.underwaterSound != null){
			underSoundObject = Instantiate(soundObject, transform.position, transform.rotation);
			underSoundObject.transform.name = "Underwater Sound";
			underSoundObject.transform.parent = sndparentobj.transform;
		}
	}

	#if UNITY_EDITOR
	}
	#endif



	//set camera
	if (setCamera == null){
		if (Camera.main != null){
			setCamera = Camera.main.transform;
			setCameraComponent = setCamera.GetComponent(Camera);
		}
	}
	
	//set track object
	if (setTrack == null && setCamera != null){
		setTrack = setCamera.transform;
	}


	//store surface data
	InvokeRepeating("StoreSurfaceHeight",0.01,0.1);

	//set tenkoku flag
	tenObject = GameObject.Find("Tenkoku DynamicSky");
	Shader.SetGlobalFloat("_useTenkoku",0.0);

}




function Update(){

	//Force dx9 when dx11 isn't available
	//if (!PlayerSettings.useDirect3D11){
	//	unityVersionIndex = 0;
	//}
	#if UNITY_STANDALONE_OSX
		unityVersionIndex = 0;
	#endif

}


function LateUpdate(){


	//set project layer masks
	suiLayerMasks = new Array();
	for (var i : int = 0; i < 32; i++){
		var layerName : String = LayerMask.LayerToName(i);
		suiLayerMasks.Add(layerName);
	}


	//GET TENKOKU SPECIFIC VARIABLES
	useTenkoku = 0.0;
	if (tenObject != null){
		if (tenObject.activeInHierarchy){
			useTenkoku = 1.0;
		}

		if (useTenkoku == 1.0){
			tenkokuWindModule = GameObject.Find("Tenkoku_WindZone").GetComponent(WindZone);
			tenkokuWindDir = tenkokuWindModule.transform.eulerAngles.y;
			tenkokuWindAmt = tenkokuWindModule.windMain;
		}
	}
	Shader.SetGlobalFloat("_useTenkoku",useTenkoku);



	//HANDLE COMPONENTS

	//Tranparency
	if (transCamObject != null){
		transLayer = (transLayer & ~(1 << 4)); //remove water layer from transparent mask
		transCamObject.cullingMask = transLayer; 
	} else {
		transCamObject = this.transform.Find("cam_SuimonoTrans").gameObject.GetComponent(Camera) as Camera;
	}

	if (transToolsObject != null){
		transToolsObject.gameObject.SetActive(enableTransparency);
		transToolsObject.resolution = System.Convert.ToInt32(resolutions[transResolution]);
	} else {
		transToolsObject = this.transform.Find("cam_SuimonoTrans").gameObject.GetComponent(cameraTools);
	}
	enTrans = 0.0;
	if (enableTransparency) enTrans = 1.0;
	Shader.SetGlobalFloat("_enableTransparency",enTrans);

}






function FixedUpdate () {

	//SET PHYSICS LAYER INTERACTIONS
	//This is introduced because Unity 5 no longer handles mesh colliders and triggers without throwing an error.
	//thanks a whole lot guys O_o (for nuthin').  The below physics setup should workaround this problem for everyone.
	for (lx = 0; lx < 20; lx++){
		//loop through and decouple layer collisions for all layers(up to 20).
		//layer 4 is the built-in water layer.
		Physics.IgnoreLayerCollision(lx,4);
	}


	//set caustics
	if (enableCaustics){

		causticObject.enableCaustics = true;

	} else {

		causticObject.enableCaustics = false;
	}


	
	//play underwater sounds
	PlayUnderwaterSound();
	
	
		//UPDATE CURRENT CAMERA WITH CORRECT DEPTH BUFFER (forward rendering)
		//if (setCamera != null && setCameraComponent == null){
			//setCameraComponent = setCamera.GetComponent(Camera);
			//if (setCameraComponent.renderingPath == RenderingPath.Forward){
				//setCameraComponent.depthTextureMode = DepthTextureMode.DepthNormals;
			//}
		//}



		//UNITY DX11 VERSION SPECIFIC
		if (unityVersionIndex == 1){//dx11
			#if !UNITY_STANDALONE_OSX
			shaderUnderwaterFX = shader_effectPlaneDX11;
			shaderDropletsFX = shader_effectRefract;
			//debrisShaderFX = shader_particle;
			#endif
		}
		
		//UNITY DX9 VERSION SPECIFIC
		else if (unityVersionIndex == 0){//pro
			shaderUnderwaterFX = shader_effectPlane;
			shaderDropletsFX = shader_effectRefract;
			//debrisShaderFX = shader_particle;
		}

		//set special ring ripple system shader
		if (ringsSystem == null) ringsSystem = GameObject.Find("fx_ripples(Clone)").gameObject.GetComponent(Renderer);
		if (ringsSystem != null) ringsSystem.sharedMaterial.shader = shaderDropletsFX;


	




	//set camera
	if (setCamera == null){
		if (Camera.main != null){
			setCamera = Camera.main.transform;
		}
	}

	if (setCamera != null && setCameraComponent == null){
		setCameraComponent = Camera.main.GetComponent(Camera);
	}
	
	//set track object
	if (setTrack == null && setCamera != null){
		setTrack = setCamera.transform;
	}


	//######## HANDLE FORWARD RENDERING SWITCH #######
	if (setCamera != null){
	if (setCameraComponent.actualRenderingPath == RenderingPath.Forward){
		Shader.SetGlobalFloat("_isForward",1.0);
	} else {
		Shader.SetGlobalFloat("_isForward",0.0);
	}
	}
	
	//
	Shader.SetGlobalColor("_cameraBGColor",setCameraComponent.backgroundColor);
	
	
	//######## SET UNITY 5 SHADER TAG #######
	isUnity5 = 0.0;
		#if UNITY_5_0
		isUnity5 = 1.0;
		#endif
	Shader.SetGlobalFloat("suimono_isUnity5",isUnity5);
}








//#############################
//	CUSTOM FUNCTIONS
//#############################
function OnDisable(){
	CancelInvoke("StoreSurfaceHeight");
}

function OnEnable(){
	InvokeRepeating("StoreSurfaceHeight",0.01,0.1);
}

function StoreSurfaceHeight(){
	if (this.enabled){
		if (setCamera != null){

			//if (heightValues == null) heightValues = new float[9];
			heightValues = SuimonoGetHeightAll(setCamera.transform.position);
				currentSurfaceLevel = heightValues[1];
				currentObjectDepth = heightValues[3];
				currentObjectIsOver = heightValues[4];
				currentTransitionDepth = heightValues[9];
				objectEnableUnderwaterFX = heightValues[10];

			checkUnderwaterEffects();
			checkWaterTransition();
		}
	}
}





function PlayUnderwaterSound(){
if (Application.isPlaying){
	if (underSoundObject != null){
		underSoundObject.transform.position = setTrack.transform.position;

			if (currentTransitionDepth > 0.0){
				underSoundObject.gameObject.GetComponent(AudioSource).clip = sndparentobj.underwaterSound;
				underSoundObject.gameObject.GetComponent(AudioSource).volume = maxVolume;
			} else {
				if (sndparentobj.underwaterSound != null){
					underSoundObject.gameObject.GetComponent(AudioSource).clip = sndparentobj.abovewaterSound;
					underSoundObject.gameObject.GetComponent(AudioSource).volume = 0.35*maxVolume;
				}
			}
		
		if (!underSoundObject.gameObject.GetComponent(AudioSource).isPlaying && playSounds){	
			underSoundObject.gameObject.GetComponent(AudioSource).loop = true;
			underSoundObject.gameObject.GetComponent(AudioSource).Play();
		}
			
		if (!playSounds){
			underSoundObject.gameObject.GetComponent(AudioSource).Stop();
		}
	}
}
}




function AddFX(fxSystem : int, effectPos : Vector3, addRate : int, addSize : float, addRot : float, addARot : float, addVeloc : Vector3, addCol : Color){
	if (fxObject != null){
		fx = fxSystem;

		if (fxObject.fxObjects[fx] != null){

			fxObject.fxObjects[fx].GetComponent(ParticleSystem).Emit(addRate);
			//get particles
			if (setParticles != null) setParticles = null;
			setParticles = new ParticleSystem.Particle[fxObject.fxObjects[fx].GetComponent(ParticleSystem).particleCount];
			fxObject.fxObjects[fx].GetComponent(ParticleSystem).GetParticles(setParticles);
			//set particles
			if (fxObject.fxObjects[fx].GetComponent(ParticleSystem).particleCount > 0.0){
			for (px = (fxObject.fxObjects[fx].GetComponent(ParticleSystem).particleCount-addRate); px < fxObject.fxObjects[fx].GetComponent(ParticleSystem).particleCount; px++){
					
					//set position
					setParticles[px].position.x = effectPos.x;
					setParticles[px].position.y = effectPos.y;
					setParticles[px].position.z = effectPos.z;
					
					//set variables
					setParticles[px].size = addSize;
					
					setParticles[px].rotation = addRot;
					setParticles[px].angularVelocity = addARot;
					
					setParticles[px].velocity.x = addVeloc.x;
					setParticles[px].velocity.y = addVeloc.y;
					setParticles[px].velocity.z = addVeloc.z;
					
					setParticles[px].color *= addCol;
					
			}
			fxObject.fxObjects[fx].GetComponent(ParticleSystem).SetParticles(setParticles,setParticles.length);
			fxObject.fxObjects[fx].GetComponent(ParticleSystem).Play();
			}

		}
	}
}




function AddSoundFX(sndClip : AudioClip, soundPos : Vector3, sndVelocity:Vector3){

	setpitch = 1.0;
	waitTime = 0.4;
	setvolume = 1.0;
	
	if (playSounds && sndparentobj.defaultSplashSound.length >= 1 ){
		setstep = sndparentobj.defaultSplashSound[Random.Range(0,sndparentobj.defaultSplashSound.length-1)];
		waitTime = 0.4;
		setpitch = sndVelocity.y;
		setvolume = sndVelocity.z;
		setvolume = Mathf.Lerp(0.0,1.0,setvolume);

		//check depth and morph sounds if underwater
		if (currentObjectDepth > 0.0){
			setpitch *=0.25;
			setvolume *=0.5;
		}
		
		useSoundAudioComponent = sndObjects[currentSound].GetComponent(AudioSource);
		useSoundAudioComponent.clip = sndClip;
		if (!useSoundAudioComponent.isPlaying){
			useSoundAudioComponent.transform.position = soundPos;
			useSoundAudioComponent.volume = setvolume;
			useSoundAudioComponent.pitch = setpitch;
			useSoundAudioComponent.minDistance = 4.0;
			useSoundAudioComponent.maxDistance = 20.0;
			useSoundAudioComponent.clip = setstep;
			useSoundAudioComponent.loop = false;
			useSoundAudioComponent.Play();
		}

		currentSound += 1;
		if (currentSound >= (maxSounds-1)) currentSound = 0;
	}

}






function AddSound(sndMode : String, soundPos : Vector3, sndVelocity:Vector3){

if (enableInteraction){

	setpitch = 1.0;
	waitTime = 0.4;
	setvolume = 1.0;
	
	if (playSounds && sndparentobj.defaultSplashSound.length >= 1 ){
		setstep = sndparentobj.defaultSplashSound[Random.Range(0,sndparentobj.defaultSplashSound.length-1)];
		waitTime = 0.4;
		setpitch = sndVelocity.y;
		setvolume = sndVelocity.z;
		setvolume = Mathf.Lerp(0.0,10.0,setvolume);

		//check depth and morph sounds if underwater
		if (currentObjectDepth > 0.0){
			setpitch *=0.25;
			setvolume *=0.5;
		}
		
		useSoundAudioComponent = sndObjects[currentSound].GetComponent(AudioSource);
		if (!useSoundAudioComponent.isPlaying){
			useSoundAudioComponent.transform.position = soundPos;
			useSoundAudioComponent.volume = setvolume;
			useSoundAudioComponent.pitch = setpitch;
			useSoundAudioComponent.minDistance = 4.0;
			useSoundAudioComponent.maxDistance = 20.0;
			useSoundAudioComponent.clip = setstep;
			useSoundAudioComponent.loop = false;
			useSoundAudioComponent.Play();
		}

		currentSound += 1;
		if (currentSound >= (maxSounds-1)) currentSound = 0;
	}
}
}








function checkUnderwaterEffects(){


	//set blur
	if (enableBlur){
		underwaterRefractRendererComponent.sharedMaterial.SetFloat("_BlurSpread",blurAmount);
		underwaterRefractRendererComponent.sharedMaterial.SetFloat("_blurSamples",blurSamples);
	} else {
		underwaterRefractRendererComponent.sharedMaterial.SetFloat("_BlurSpread",0.0);
		underwaterRefractRendererComponent.sharedMaterial.SetFloat("_blurSamples",blurSamples);
	}


	
	if (currentTransitionDepth > 0.0){
	
		if (enableUnderwaterFX && objectEnableUnderwaterFX==1.0 && currentObjectIsOver==1.0){
		
			//swap camera rendering to deferred for best underwater rendering!
			//note: this can be disabled in the module settings.
			//if (enableUnderwaterDeferred) setCamera.GetComponent(Camera).renderingPath = RenderingPath.DeferredLighting;
		
			//reposition refract plane
			underwaterRefractRendererComponent.sharedMaterial.SetFloat("_blurSamples",blurSamples);
			underwaterRefractRendererComponent.sharedMaterial.shader = shaderUnderwaterFX;
			underwaterRefractPlane.transform.parent = setCamera.transform;
			underwaterRefractPlane.transform.localScale = Vector3(0.4,1.0,0.3);
			underwaterRefractPlane.transform.localPosition = Vector3(0.0,0.0,(setCamera.GetComponent(Camera).nearClipPlane+(cameraPlane_offset)+0.05));
			underwaterRefractPlane.transform.localEulerAngles = Vector3(270.0,0.0,0.0);
	   		underwaterRefractRendererComponent.enabled = true;


		}
		
	} else {
		
		//swap camera rendering to back to default
   		underwaterRefractRendererComponent.enabled = false;

	}
}








function checkWaterTransition () {

		doTransitionTimer += Time.deltaTime;
		
		//SET COLORS
		reflectColor = Color(0.827,0.941,1.0,1.0);

		if (enableUnderwaterFX && objectEnableUnderwaterFX==1.0){

		if (currentTransitionDepth > 0.0 && currentObjectIsOver==1.0){
		
			doWaterTransition = true;
			
			//play underwater transition
			if (underTrans >= 0.0){
				underwaterRefractRendererComponent.sharedMaterial.SetFloat("_transition",underTrans);
				//underTrans -= Time.deltaTime*6.0;
				underTrans = Mathf.SmoothStep(underTrans,0.0,Time.deltaTime*12.5);
			}
			
	       	//set underwater debris
	       	if (suimonoObject != null && setCamera != null){
		       	if (suimonoObject.enableUnderDebris && setCamera != null){

		       		//underwaterDebrisRendererComponent.sharedMaterial.shader = debrisShaderFX;
			       	underwaterDebris.transform.position = setCamera.transform.position;
			       	underwaterDebris.transform.rotation = setCamera.transform.rotation;
			       	underwaterDebris.transform.Translate(Vector3.forward * 40.0);
					underwaterDebrisRendererComponent.enabled=true;
					underwaterDebris.enableEmission=true;
					underwaterDebris.Play();
				}
			
				//get attributes from surface
				underwaterColor = suimonoObject.underwaterColor;
				refractionAmount = suimonoObject.underRefractionAmount;
		       	blurAmount = suimonoObject.underBlurAmount;
		       	underFogSpread = suimonoObject.underwaterFogSpread;
		       	underFogDist = suimonoObject.underwaterFogDist;
		       	
		       	underLightAmt = suimonoObject.reflectDistUnderAmt;
		       	refractAmt = suimonoObject.underRefractionAmount;
		       	refractSpd = suimonoObject.underRefractionSpeed*10;
		       	refractScl = suimonoObject.underRefractionScale;

				setUnderBright = underLightAmt;
					#if UNITY_5_0
					setUnderBright *= 0.5;
					#endif

		       	//set attributes to shader
		       	useRefract = 1.0;
		       	if (!enableRefraction) useRefract = 0.0;
		       	underwaterRefractRendererComponent.sharedMaterial.SetFloat("_UnderReflDist",setUnderBright);
		       	underwaterRefractRendererComponent.sharedMaterial.SetFloat("_blurSamples",blurSamples);
		       	underwaterRefractRendererComponent.sharedMaterial.SetFloat("_RefrStrength",refractAmt*useRefract);
		       	underwaterRefractRendererComponent.sharedMaterial.SetFloat("_RefrSpeed",refractSpd*useRefract);
		       	underwaterRefractRendererComponent.sharedMaterial.SetFloat("_AnimSpeed",refractSpd);
		       	underwaterRefractRendererComponent.sharedMaterial.SetFloat("_MasterScale",refractScl);
		       	underwaterRefractRendererComponent.sharedMaterial.SetFloat("_underFogStart",underFogDist);
		       	underwaterRefractRendererComponent.sharedMaterial.SetFloat("_underFogStretch",underFogSpread);
		       	underwaterRefractRendererComponent.sharedMaterial.SetFloat("_BlurSpread",blurAmount*useRefract);
				underwaterRefractRendererComponent.sharedMaterial.SetColor("_DepthColorB",underwaterColor);
				underwaterRefractRendererComponent.sharedMaterial.SetFloat("_DepthAmt",0.001);
				underwaterRefractRendererComponent.sharedMaterial.SetFloat("_Strength",refractionAmount);
				
				underwaterRefractPlane.transform.parent = setCamera.transform;
				underwaterRefractPlane.transform.localEulerAngles = Vector3(270.0,0.0,0.0);
			    underwaterRefractRendererComponent.enabled = true;
	  
	       	} else {
	       		underwaterRefractRendererComponent.enabled = false;
	       	}
	       	
	       	
	       	//hide water transition
	       	waterTransitionPlane.transform.parent = this.transform;
	     	waterTransitionParticleRenderComponent.enabled = false;
	     	waterTransitionParticleComponent.Clear();
	     	
	     	waterTransitionPlane2.transform.parent = this.transform;
			waterTransition2ParticleRenderComponent.enabled = false;
	        waterTransition2ParticleComponent.Clear();
			
	    } else {

	        //reset underwater debris
	        if (underwaterDebris != null){
	        	underwaterDebris.transform.parent = this.transform;
	       		underwaterDebrisRendererComponent.enabled=false;
	       	}

	       	//turn off water refraction plane
	       	if (underwaterRefractPlane != null){
	       		underwaterRefractPlane.transform.parent = this.transform;
	     		underwaterRefractRendererComponent.enabled = false;
			}

	     	//show water transition
	     	if (enableTransition){
	     	if (doWaterTransition && setCamera != null){
	     		
	     		doTransitionTimer = 0.0;
	     		//sets and emits random water "screen" droplets
	     		waterTransitionRendererComponent.sharedMaterial.shader = shaderDropletsFX;
	     		waterTransitionParticleRenderComponent.enabled = true;
	     		waterTransitionPlane.transform.parent = setCamera.transform;
	       		waterTransitionPlane.transform.localPosition = Vector3(0.0,0.0,setCamera.GetComponent(Camera).nearClipPlane+cameraPlane_offset+0.02);
	       		waterTransitionPlane.transform.localEulerAngles = Vector3(270.0,262.9,0.0);
	      		waterTransitionParticleComponent.Play();
	      		waterTransitionParticleComponent.Emit(Random.Range(60,120));
	      		
	      		//sets and plays water transition "screen" effect
	      		waterTransition2RendererComponent.sharedMaterial.shader = shaderDropletsFX;
	      		waterTransition2ParticleRenderComponent.enabled = true;
	     		waterTransitionPlane2.transform.parent = setCamera.transform;
	       		waterTransitionPlane2.transform.localPosition = Vector3(0.0,0.0,setCamera.GetComponent(Camera).nearClipPlane+cameraPlane_offset+0.01);
	       		waterTransitionPlane2.transform.localEulerAngles = Vector3(270.0,262.9,0.0);
	      		waterTransition2ParticleComponent.Emit(1);
	      		
	       		doWaterTransition = false;
	       		
	       		//reset component positions
	       		yield WaitForSeconds(12);
		       		if (doTransitionTimer >= 12.0){
			       		waterTransitionPlane.transform.parent = this.transform;
			       		waterTransitionPlane2.transform.parent = this.transform;
		       		}
		       		
		       		
	     	} else {
	     		
	     		underTrans = 1.0;
	     		
	     		if (waterTransitionRendererComponent != null) waterTransitionRendererComponent.sharedMaterial.shader = shaderDropletsFX;
	     		if (waterTransitionParticleRenderComponent != null){
	     			waterTransitionParticleRenderComponent.enabled = true;
	     			waterTransitionParticleComponent.Stop();
	     		}
	     		
	     		if (waterTransition2RendererComponent != null) waterTransition2RendererComponent.sharedMaterial.shader = shaderDropletsFX;
	     		if (waterTransition2ParticleRenderComponent != null) waterTransition2ParticleRenderComponent.enabled = true;
	     	}
	       	}

	     
	    }
    }
    
    
    if (!enableUnderwaterFX){
    	//reset underwater FX and Shaders
    	if (underwaterRefractPlane != null){
    		underwaterRefractPlane.transform.parent = this.transform;
    	}
    	if (underwaterRefractRendererComponent != null){
   			underwaterRefractRendererComponent.enabled = false;
			underwaterDebrisRendererComponent.enabled=false;
		}
    }

}







function OnApplicationQuit(){

    if (underwaterRefractPlane != null) underwaterRefractPlane.transform.parent = this.transform;
	if (waterTransitionPlane != null) waterTransitionPlane.transform.parent = this.transform;
	if (waterTransitionPlane2 != null) waterTransitionPlane2.transform.parent = this.transform;

}




function SuimonoConvertAngleToDegrees(convertAngle : float) : Vector2{

	flow_dir = Vector3(0,0);
	tempAngle = Vector3(0,0,0);
	if (convertAngle <= 180.0){
		tempAngle = Vector3.Slerp(Vector3.forward,-Vector3.forward,(convertAngle)/180.0);
		flow_dir = Vector2(tempAngle.x,tempAngle.z);
	}
	if (convertAngle > 180.0){
		tempAngle = Vector3.Slerp(-Vector3.forward,Vector3.forward,(convertAngle-180.0)/180.0);
		flow_dir = Vector2(-tempAngle.x,tempAngle.z);
	}
	
	return flow_dir;
}



function SuimonoConvertAngleToVector(convertAngle : float) : Vector2{
	//Note this is the same function as above, but renamed for better clarity.
	//eventually the above function should be deprecated.
	flow_dir = Vector3(0,0);
	tempAngle = Vector3(0,0,0);
	if (convertAngle <= 180.0){
		tempAngle = Vector3.Slerp(Vector3.forward,-Vector3.forward,(convertAngle)/180.0);
		flow_dir = Vector2(tempAngle.x,tempAngle.z);
	}
	if (convertAngle > 180.0){
		tempAngle = Vector3.Slerp(-Vector3.forward,Vector3.forward,(convertAngle-180.0)/180.0);
		flow_dir = Vector2(-tempAngle.x,tempAngle.z);
	}
	
	return flow_dir;
}







function SuimonoGetHeight(testObject : Vector3, returnMode : String) : float {

	// Get Heights
	CalculateHeights(testObject);

	// Return values
	returnValue = 0.0;
	
	//if (returnMode == "depth") returnValue = (surfaceLevel+getheight)-groundLevel;
	if (returnMode == "height") returnValue = getheight;
	if (returnMode == "surfaceLevel") returnValue = surfaceLevel+getheight;
	if (returnMode == "baseLevel") returnValue = surfaceLevel;
	if (returnMode == "object depth") returnValue = (surfaceLevel+getheight)-testObject.y;
	if (returnMode == "isOverWater" && isOverWater) returnValue = 1.0;
	if (returnMode == "isOverWater" && !isOverWater) returnValue = 0.0;
	
	if (returnMode == "isAtSurface"){
		if (((surfaceLevel+getheight)-testObject.y) < 0.25 && ((surfaceLevel+getheight)-testObject.y) > -0.25)
			returnValue = 1.0;
	}
	
	if (suimonoObject != null){
		if (returnMode == "direction") returnValue = suimonoObject.flow_dir_degrees;
		if (returnMode == "speed") returnValue = suimonoObject.setflowSpeed;
			
		if (returnMode == "wave height"){
			h1 = (suimonoObject.detailHeight + suimonoObject.waveHeight);
		   	h1 = Mathf.Lerp(h1, 0.0, getmap.r * suimonoObject.normalShore);
			returnValue = getheight/h1;
		}
	}

	if (returnMode == "transitionDepth") returnValue = ((surfaceLevel+getheight)-(testObject.y-(transition_offset*underTrans)));

	//set local variables
	//if (returnMode == "store variables"){
	//	currentSurfaceLevel = surfaceLevel+getheight;
	//	currentObjectDepth = (surfaceLevel+getheight)-testObject.y;//-(transition_offset*underTrans));
	//	currentTransitionDepth = (surfaceLevel+getheight)-(testObject.y-(transition_offset*underTrans));
	//}


	if (returnMode == "underwaterEnabled"){
		enabledUFX = 1;
		if (!suimonoObject.enableUnderwaterFX) enabledUFX = 0;
		returnValue = enabledUFX;
	}

	if (returnMode == "causticsEnabled"){
		enabledCaustics = 1;
		if (!suimonoObject.enableCausticFX) enabledCaustics = 0;
		returnValue = enabledCaustics;
	}


	return returnValue;

	
}







function SuimonoGetHeightAll(testObject : Vector3) : float[] {

	// Get Heights
	CalculateHeights(testObject);

	// Return values
	if (returnValueAll == null) returnValueAll = new float[12];
	
	// 0 height
	returnValueAll[0]=(getheight);
	
	// 1 surface level
	returnValueAll[1]=(surfaceLevel+getheight);
	
	// 2 base level
	returnValueAll[2]=(surfaceLevel);
	
	// 3 object depth
	returnValueAll[3]=((surfaceLevel+getheight)-testObject.y);
	
	// 4 is Over Water
	if (isOverWater) returnValue = 1.0;
	if (!isOverWater) returnValue = 0.0;
	returnValueAll[4]=(returnValue);
	
	// 5 is at surface
	returnValue = 0.0;
	if (((surfaceLevel+getheight)-testObject.y) < 0.25 && ((surfaceLevel+getheight)-testObject.y) > -0.25) returnValue = 1.0;
	returnValueAll[5]=(returnValue);
	
	
	// 6 direction
	if (suimonoObject != null){
		setDegrees = suimonoObject.flow_dir_degrees + suimonoObject.transform.eulerAngles.y;
		if (setDegrees < 0.0) setDegrees = 365.0 + setDegrees;
		if (setDegrees > 365.0) setDegrees = setDegrees-365.0;
		if (suimonoObject != null) returnValueAll[6]= setDegrees;
		if (suimonoObject == null) returnValueAll[6]= 0.0;
		
		// 7 speed
		if (suimonoObject != null) returnValueAll[7]=(suimonoObject.waveFlowSpeed);
		if (suimonoObject == null) returnValueAll[7]=0.0;
		
		// 8 wave height
		if (suimonoObject != null) h1 = (suimonoObject.detailHeight + suimonoObject.waveHeight);
		if (suimonoObject != null) h1 = Mathf.Lerp(h1, 0.0, getmap.r * suimonoObject.normalShore);
		if (suimonoObject == null) h1 = 0.0;
		returnValueAll[8]=(getheight/h1);
	}
	
	// 9 transition depth
	returnValueAll[9] = ((surfaceLevel+getheight)-(testObject.y-(transition_offset*underTrans)));

	// 10 enabled Underwater FX
	enabledUFX = 1;
	if (suimonoObject != null){
		if (!suimonoObject.enableUnderwaterFX) enabledUFX = 0;
		returnValueAll[10] = enabledUFX;
	}
	// 11 enabled Underwater FX
	enabledCaustics = 1;
	if (suimonoObject != null){
		if (!suimonoObject.enableCausticFX) enabledCaustics = 0;
		returnValueAll[11] = enabledCaustics;
	}


	//set local variables
	//if (returnMode == "store variables"){
	//	currentSurfaceLevel = returnValueAll[1]
	//	currentObjectDepth = returnValueAll[3]
	//	currentTransitionDepth = returnValueAll[3]-(transition_offset*underTrans));
	//}
	

	return returnValueAll;

}



function CalculateHeights(testObject : Vector3){

	getmap = Color(0.0,0.0,0.0,0.0);
	getheight = -1.0;
	getheightW = -1.0;
	getheightD1 = -1.0;
	getheightD2 = -1.0;
	getheight1 = 0.0;
	getheight2 = 0.0;
	getheight3 = 0.0;
	isOverWater = false;
	surfaceLevel = -1.0;
	groundLevel = 0.0;
	layer = 4;
	layermask = 1 << layer;
	testpos = Vector3(testObject.x,testObject.y+5000,testObject.z);

	
	if(Physics.Raycast(testpos, -Vector3.up,hit,10000,layermask)){
	//for (i = 0;i < hits.Length; i++) {

		//hit = hits[i];

		//if (hit.transform.gameObject.layer==4){ //hits object on water layer
			
			suimonoObject = hit.transform.parent.gameObject.GetComponent(SuimonoObject);
			if (suimonoObject != null && hit.collider != null){

				targetSurface = hit.transform.gameObject;
				isOverWater = true;
				surfaceLevel = hit.point.y;
				
				// default height to hit.point on flat water planes
			   	if (suimonoObject != null){


				if (Application.isPlaying){
				hitRender = hit.collider.GetComponent(Renderer);
				//if (hit.collider.GetComponent(Renderer).sharedMaterial.GetTexture("_Surface1") != null){
				if (hitRender.sharedMaterial.GetTexture("_Surface1") != null){
					pixelUV = hit.textureCoord;
					pixelUV2 = hit.textureCoord;
					pixelUV3 = hit.textureCoord;
					checktex = hitRender.sharedMaterial.GetTexture("_Surface1") as Texture2D;
					wavetex = hitRender.sharedMaterial.GetTexture("_WaveTex") as Texture2D;
					
		    		// CALCULATE DEEP WAVES
		    		twfMult = 0.15;
					waveSpd = Vector2(suimonoObject._suimono_uv3x,suimonoObject._suimono_uv3y);
					waveSpdb = Vector2(suimonoObject._suimono_uv4x,suimonoObject._suimono_uv4y);
					tscaleN = hitRender.sharedMaterial.GetTextureScale("_Surface1");
					
		   			pixelUV.x = (hit.textureCoord.x * tscaleN.x * twfMult + waveSpd.x);
		   			pixelUV.y = (hit.textureCoord.y * tscaleN.y * twfMult + waveSpd.y);
		   			if (checktex != null) pixelUV.x *= checktex.width;
		    		if (checktex != null) pixelUV.y *= checktex.height;
		    		if (checktex != null) getheight1 = checktex.GetPixel(pixelUV.x, pixelUV.y).r;
					//getheight1 = suimonoObject.pixels_Surface[Mathf.Abs(Mathf.FloorToInt((checktex.width*(pixelUV.y))+pixelUV.x))].r;

		  			
		  			pixelUV2.x = (hit.textureCoord.x * tscaleN.x * twfMult - waveSpdb.x - 0.5);
		   			pixelUV2.y = (hit.textureCoord.y * tscaleN.y * twfMult - waveSpdb.y - 0.5);
				   	if (checktex != null) pixelUV2.x *= checktex.width;
		    		if (checktex != null) pixelUV2.y *= checktex.height;
		    		if (checktex != null) getheight2 = checktex.GetPixel(pixelUV2.x, pixelUV2.y).r;
					//getheight2 = suimonoObject.pixels_Surface[Mathf.Abs(Mathf.FloorToInt((checktex.width*(pixelUV2.y))+pixelUV2.x))].r;

		    		if (QualitySettings.activeColorSpace == ColorSpace.Linear){
		    			getheight1 = Mathf.GammaToLinearSpace(getheight1);
						getheight2 = Mathf.GammaToLinearSpace(getheight2);
					} else {
		    			getheight1 *= (0.4545);
						getheight2 *= (0.4545);
					}
					
					getheightW = Mathf.Lerp(0.0,suimonoObject.useDpWvHt,Mathf.Clamp01(getheight1+getheight2));
		   				   			
		   			
		   			
		   			// CALCULATE DETAIL WAVES
		    		twfMult = 1.0;
					waveSpd = Vector2(suimonoObject._suimono_uvx,suimonoObject._suimono_uvy);
					waveSpdb = Vector2(suimonoObject._suimono_uv2x,suimonoObject._suimono_uv2y);
					tscaleN = hitRender.sharedMaterial.GetTextureScale("_WaveLargeTex");
					
		   			pixelUV.x = (hit.textureCoord.x * tscaleN.x * twfMult + waveSpd.x);
		   			pixelUV.y = (hit.textureCoord.y * tscaleN.y * twfMult + waveSpd.y);
		   			if (checktex != null) pixelUV.x *= checktex.width;
		    		if (checktex != null) pixelUV.y *= checktex.height;
		    		if (checktex != null) getheight1 = checktex.GetPixel(pixelUV.x, pixelUV.y).r;
		  
		  			pixelUV2.x = (hit.textureCoord.x * tscaleN.x * twfMult - waveSpdb.x - 0.5);
		   			pixelUV2.y = (hit.textureCoord.y * tscaleN.y * twfMult - waveSpdb.y - 0.5);
				   	if (checktex != null) pixelUV2.x *= checktex.width;
		    		if (checktex != null) pixelUV2.y *= checktex.height;
		    		if (checktex != null) getheight2 = checktex.GetPixel(pixelUV2.x, pixelUV2.y).r;   			

		    		if (QualitySettings.activeColorSpace == ColorSpace.Linear){
		    			getheight1 = Mathf.GammaToLinearSpace(getheight1);
						getheight2 = Mathf.GammaToLinearSpace(getheight2);
					} else {
						getheight1 *= (0.4545);
						getheight2 *= (0.4545);
					}
					getheightD1 = Mathf.Lerp(0.0,suimonoObject.useDtHt,Mathf.Clamp01(getheight1+getheight2));
		   				   			
		   			
		   			

					//shoreline calculation - Normalize
					/*
					flowtexR = hitRender.sharedMaterial.GetTexture("_FlowMap") as RenderTexture;
					RenderTexture.active = flowtexR;
					flowtex = null;
					flowtex = new Texture2D(flowtexR.width,flowtexR.height);
					flowtex.ReadPixels(new Rect(0, 0, flowtexR.width,flowtexR.height), 0, 0);
					flowtex.Apply();
					RenderTexture.active=null;

			    		twfMult = 1.0;
						waveSpd = Vector2(suimonoObject._suimono_uvx,suimonoObject._suimono_uvy); 
						tscaleN = hitRender.sharedMaterial.GetTextureScale("_FlowMap");
						
			   			pixelUV.x = (hit.textureCoord.x * tscaleN.x * twfMult);
			   			pixelUV.y = (hit.textureCoord.y * tscaleN.y * twfMult);
			   			if (flowtex != null) pixelUV.x *= flowtex.width;
			    		if (flowtex != null) pixelUV.y *= flowtex.height;
			    		if (flowtex != null) getmap.r = flowtex.GetPixel(pixelUV.x, pixelUV.y).r;
			    		
			    		if (QualitySettings.activeColorSpace == ColorSpace.Linear){
			    			getmap.r = Mathf.GammaToLinearSpace(getmap.r);
					   		getmap.g = Mathf.GammaToLinearSpace(getmap.g);
			    		} else {
			    			getmap.r *= (0.4545);
							getmap.g *= (0.4545);
						}

			    		if (flowtex != null) Debug.Log("I see you!");
					//RenderTexture.active=null;
		    		
		    		//shoreline calculation - Shore wave Height
			    	//twfMult = 1.0;// * suimonoObject.setDtScale;
					//waveSpd = Vector2(suimonoObject._suimono_uvx,suimonoObject._suimono_uvy); 
					//tscaleN = hit.collider.GetComponent(Renderer).sharedMaterial.GetTextureScale("_FlowMap");
					
					//var getflowmap : Color;
					//var getwavetex : Color;
		   			//pixelUV.x = (hit.textureCoord.x * tscaleN.x * twfMult);
		   			//pixelUV.y = (hit.textureCoord.y * tscaleN.y * twfMult);
		   			//if (flowtex != null) pixelUV.x *= flowtex.width;
		    		//if (flowtex != null) pixelUV.y *= flowtex.height;
		    		//if (flowtex != null) getflowmap = flowtex.GetPixel(pixelUV.x, pixelUV.y);
		    		
				 	//var flowmap : Vector2 = Vector2(Mathf.Clamp01(getflowmap.r + getflowmap.g),getflowmap.b);
				 	//flowmap.x *= 2.0 - 1.0;
				 	//flowmap.y *= 2.0 - 1.0;
					//flowmap.x = Mathf.Lerp(0.0,flowmap.x,suimonoObject.setFlowShoreScale);
					//flowmap.y = Mathf.Lerp(0.0,flowmap.y,suimonoObject.setFlowShoreScale);

			    	twfMult = suimonoObject.setFlowShoreScale;
					waveSpd = Vector2(suimonoObject._suimono_uvx,suimonoObject._suimono_uvy); 
					tscaleN = hitRender.sharedMaterial.GetTextureScale("_WaveMap");
		   			pixelUV.x = (hit.textureCoord.x * tscaleN.x * twfMult)+suimonoObject.setflowOffX;//+flowmap.x;
		   			pixelUV.y = (hit.textureCoord.y * tscaleN.y * twfMult)+suimonoObject.setflowOffY;//+flowmap.y;
		   			if (wavetex != null) pixelUV.x *= wavetex.width;
		    		if (wavetex != null) pixelUV.y *= wavetex.height;

					if (wavetex != null) getwavetex = wavetex.GetPixel(pixelUV.x,pixelUV.y);
					
		    		if (QualitySettings.activeColorSpace == ColorSpace.Linear){
			    		getwavetex.r = Mathf.GammaToLinearSpace(getwavetex.r);
			    		getwavetex.g = Mathf.GammaToLinearSpace(getwavetex.g);
			    		getwavetex.b = Mathf.GammaToLinearSpace(getwavetex.b);
		    		} else {
						getwavetex.r *= (0.4545);
						getwavetex.g *= (0.4545);
						getwavetex.b *= (0.4545);
					}

					//wrap normal to shore calculations
					//float4 getflowmap = tex2D(_FlowMap, IN.uv_FlowMap);
				 	//float2 flowmap = float2(saturate(getflowmap.r + getflowmap.g),getflowmap.b) * 2.0 - 1.0;
					//flowmap.x = lerp(0.0,flowmap.x,_FlowShoreScale);
					//flowmap.y = lerp(0.0,flowmap.y,_FlowShoreScale);
					//half4 waveTex = tex2D(_WaveTex, float2((IN.uv_FlowMap.x*shoreWaveScale)+flowOffX+flowmap.x,(IN.uv_FlowMap.y*shoreWaveScale)+flowOffY+flowmap.y));
					//o.Normal = lerp(o.Normal,half3(0,0,1),waveTex.g * _WaveShoreHeight * flow.g);

					*/




		    		//####   final Height calculation  #####
		    		getheight = getheightW + getheightD1;

		   			//getheight = (getheight1 * suimonoObject.detailHeight);
		   			//getheight += (getheight2 * suimonoObject.waveHeight);
		   				//normalize shore
		   				getheight = Mathf.Lerp(getheight,0.0, getmap.r * suimonoObject.normalShore);
		   				
		   				//add shore waves - turned off for now
		   				getheight += Mathf.Lerp(0.0,1.0, getwavetex.g * suimonoObject.usewaveShoreHt * getmap.r);
		   				
		   				//final projection calculation
		   				getheight *= suimonoObject.projectHeight;
		   				//suimonoObject.usewaveShoreHt
		   				//o.Normal = lerp(o.Normal,half3(0,0,1),getwavetex.g * _WaveShoreHeight * flow.g);
		   									
		   				//getheight += Mathf.Lerp(0.0,suimonoObject.usewaveShoreHt,waveTex.r)*getmap.r;

		   				//getheight = Mathf.Lerp(0,5.0, getmap.r);

		   		}
	    		}


	    		}
			}
	}

}

