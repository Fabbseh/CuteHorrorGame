#pragma strict

//PUBLIC VARIABLES
var isWalking : boolean = false;
var isRunning : boolean = false;
var isSprinting : boolean = false;
var isInWater : boolean = false;
var isInWaterDeep : boolean = false;
var isUnderWater : boolean = false;
var isAtSurface : boolean = false;
var isFloating : boolean = false;
var isFalling : boolean = false;
var isInBoat : boolean = false;
var moveSideways : float = 0.0;
var moveForward : float = 0.0;
var moveVertical : float = 0.0;

var wetAmount : float = 0.0;
var gSlope : float = 0.0;
var useSlope : float = 0.0;


//PRIVATE VARIABLES
private var cameraObject : GameObject;
//private var cameraControl : sui_demo_Controller2;
//private var gunControl : Object_Gun;
private var currClip : String;
private var useClip : String;
private var defaultClip : String;
private var fadeSpeed : float = 0.0;
private var playSpeed : float = 1.0;
private var animTime : float = 0.0;
private var blinkTime : float = 0.0;
private var doBlink : boolean = false;
private var eyelidTime : float = 0.0;
private var randBlinkNum : float = 2.0;

private var eyeRand : float;
private var headRand : float;
private var headTgt : float;
private var headTime : float = 0.0;
private var doHeadAmb : boolean = false;
private var randHeadNum : float = 4.0;
private var randHeadSpd : float = 4.0;

private var lastYPos : float = 0.0;

//bone objects
private var boneRoot : Transform;
private var boneLEye : Transform;
private var boneREye : Transform;
private var boneLEyelid : Transform;
private var boneREyelid : Transform;
private var boneRHand : Transform;
private var boneHead : Transform;
private var boneNeck : Transform;
private var boneRFoot : Transform;
private var boneLFoot : Transform;




function Start () {

	//start animations
	useClip = "anim_miho_idle_normal";
	defaultClip = useClip;
	
	//set important bones
	SetBoneTransforms();
	
}







function LateUpdate () {


	//UNDERWATER status get's sent to this
	//component by the camera controller component.
	if (!isInWater){
		wetAmount -= (Time.deltaTime * 0.05);
		wetAmount = Mathf.Clamp(wetAmount,0.0,1.0);
	} else {
		wetAmount = 1.0;
	}
	
	
	//set animation clips
	useClip = defaultClip;
	playSpeed = 1.0;
	
	if (!isInBoat){
	
		useClip = "anim_miho_idle_normal";
		fadeSpeed = 1.2;
		playSpeed = 1.0;

		if (isWalking){
			useClip = "anim_miho_walk_normal";
			fadeSpeed = 0.5;
			playSpeed = 1.1;
			if (moveForward != 0.0 && moveSideways != 0.0){
				fadeSpeed = 0.5;
				playSpeed = 1.1;
			}
		}
		
		if (isRunning){
			useClip = "anim_miho_run_normal";
			fadeSpeed = 0.8;
			playSpeed = 0.9;
			if (moveForward != 0.0 && moveSideways != 0.0){
				fadeSpeed = 0.8;
				playSpeed = 0.9;
			}
		}

		if (isSprinting){
			useClip = "anim_miho_sprint_normal";
			fadeSpeed = 1.3;
			playSpeed = 1.1;
			if (moveForward != 0.0 && moveSideways != 0.0){
				fadeSpeed = 0.3;
				playSpeed = 1.1;
			}
		}

		
		//if (isFalling){
		//	useClip = "anim_miho_fall_normal";
		//	fadeSpeed = 0.4;
		//	playSpeed = 1.0;
		//}	
		
		if (isInWater){
			wetAmount = 1.0;
			//useClip = "anim_miho_run_normal";
			//fadeSpeed = 0.3;
			//playSpeed = 1.0;
		}
		
		if (isInWaterDeep){
			wetAmount = 1.0;
			if (isWalking){
				useClip = "anim_miho_walk_water";
				fadeSpeed = 0.8;
				playSpeed = 0.8;
			}
		}	
		
		if (isUnderWater){
			wetAmount = 1.0;
			useClip = "anim_miho_swim_idle";
			fadeSpeed = 1.2;
			playSpeed = 1.0;
			if (isWalking || isRunning){
				useClip = "anim_miho_swim_forward";
				fadeSpeed = 1.8;
				playSpeed = 1.0;
				if (isRunning) playSpeed = 1.4;
			}
			this.GetComponent.<Rigidbody>().useGravity = false;
		}


		if (isAtSurface){
			useClip = "anim_miho_swim_surface_idle";
			fadeSpeed = 0.8;
			playSpeed = 1.0;
			this.GetComponent.<Rigidbody>().useGravity = true;
		}
	
	
	} else if (isInBoat){
		useClip = "anim_miho_boat_sit_idle";
		fadeSpeed = 0.4;
		playSpeed = 1.0;
	}	
	
	
	//useClip = "anim_miho_swim_idle";
	animTime += Time.deltaTime;
	
	
	//play animations
	//if (currClip != useClip){

		//normalize animation clips
		if (GetComponent.<Animation>()[useClip] != null && GetComponent.<Animation>()[currClip] != null){
			GetComponent.<Animation>()[useClip].time = GetComponent.<Animation>()[currClip].time;
		}
		
		//set new clip
		currClip = useClip;
		animTime = 0.0;
		if (GetComponent.<Animation>()[currClip] != null){
			this.GetComponent.<Animation>().CrossFade(currClip,fadeSpeed);
			GetComponent.<Animation>()[currClip].speed = playSpeed;


			//ANIMATION BLENDS

			//cross fade slope walk
			if (gSlope > 0.0){
				if (useSlope > 15.0 && useSlope < 90.0 && (isWalking || isRunning || isSprinting)){
					this.GetComponent.<Animation>().Blend("anim_miho_walk_water",((useSlope / 90.0))*2.0,0.1);
				}
			}

			//falling animation
			if (isFalling){
				this.GetComponent.<Animation>().Blend("anim_miho_fall_normal",1.0,0.1);
			}
				

		} else {
			Debug.Log("animation "+currClip+" cannot be found!");
		}
	//}




	//BLINK
	//check for blinking eyes
	if (!doBlink){
		blinkTime += Time.smoothDeltaTime;
		if (blinkTime > randBlinkNum){
			blinkTime=0.0;
			randBlinkNum = Random.Range(2.0,4.0);
			doBlink = true;
		}
	}


	//HEAD AMBIENT
	//check for blinking eyes
	//if (!doHeadAmb){
		headTime += Time.smoothDeltaTime;
		if (headTime > randHeadNum){
			headTime=0.0;
			var checkHeadMove : float = Random.Range(0.0,5.0);
			if (checkHeadMove > 0.3){
				headTgt = 0.0;
			} else {
				headTgt = Random.Range(-80.0,80.0);
			}
			randHeadNum = Random.Range(2.0,7.0);
			randHeadSpd = Random.Range(1.0,5.0);
			
			
			//doHeadAmb = true;
		}
		
		if (isRunning || isSprinting){
			headTgt = 0.0;
			randHeadSpd = 5.0;
		}
		
		headRand = Mathf.SmoothStep(headRand, headTgt, Time.deltaTime*randHeadSpd);
		eyeRand = Mathf.SmoothStep(eyeRand, (headTgt*0.75), Time.deltaTime*(randHeadSpd*2.0));
		if (eyeRand >= 35.0) eyeRand = 35.0;
		if (eyeRand <= -35.0) eyeRand = -35.0;
	//}






	
//}




//function LateUpdate(){

	//----------------------------
	// PROCEDURAL ANIMATIONS
	//----------------------------
	
	//blink
	if (doBlink){
	var eyeAnimTime = 0.5;
		eyelidTime += Time.deltaTime; 
		if (eyelidTime <= eyeAnimTime){
			boneLEyelid.transform.localEulerAngles.z = Mathf.SmoothStep(265.0,295.0,eyelidTime*5.0);
			boneREyelid.transform.localEulerAngles.z = Mathf.SmoothStep(265.0,295.0,eyelidTime*5.0);
		}
		if (eyelidTime > eyeAnimTime){
			eyelidTime = 0.0;
			doBlink = false;
		}
	} else {
		boneLEyelid.transform.localEulerAngles.z = 295.0;
		boneREyelid.transform.localEulerAngles.z = 295.0;
	}



	//head ambient movement
	boneHead.transform.localEulerAngles.x = headRand;
	boneNeck.transform.localEulerAngles.x = (headRand * 0.5);
	boneLEye.transform.localEulerAngles.x = eyeRand;
	boneREye.transform.localEulerAngles.x = eyeRand;
	

}




function resetPos(){

	var saveY : float = this.transform.position.y;
	this.transform.position = boneRoot.transform.position;
	this.transform.position.y = saveY;

}




function SetBoneTransforms(){

	// Storing reference to some specific bone
	// objects so we can use them later in the code.
	
	boneRoot = transform.Find("Bip01");
	boneNeck = transform.Find("Bip01/Bip01 Pelvis/Bip01 Spine/Bip01 Spine1/Bip01 Spine2/Bip01 Spine3/Bip01 Neck");
	boneHead = transform.Find("Bip01/Bip01 Pelvis/Bip01 Spine/Bip01 Spine1/Bip01 Spine2/Bip01 Spine3/Bip01 Neck/Bip01 Head");
	boneLEye = transform.Find("Bip01/Bip01 Pelvis/Bip01 Spine/Bip01 Spine1/Bip01 Spine2/Bip01 Spine3/Bip01 Neck/Bip01 Head/Bip01 EyeLeft");
	boneREye = transform.Find("Bip01/Bip01 Pelvis/Bip01 Spine/Bip01 Spine1/Bip01 Spine2/Bip01 Spine3/Bip01 Neck/Bip01 Head/Bip01 EyeRight");
	boneLEyelid = transform.Find("Bip01/Bip01 Pelvis/Bip01 Spine/Bip01 Spine1/Bip01 Spine2/Bip01 Spine3/Bip01 Neck/Bip01 Head/Bip01 EyeLidLeft");
	boneREyelid = transform.Find("Bip01/Bip01 Pelvis/Bip01 Spine/Bip01 Spine1/Bip01 Spine2/Bip01 Spine3/Bip01 Neck/Bip01 Head/Bip01 EyeLidRight");
	boneRHand = transform.Find("Bip01/Bip01 Pelvis/Bip01 Spine/Bip01 Spine1/Bip01 Spine2/Bip01 Spine3/Bip01 Neck/Bip01 R Clavicle/Bip01 R UpperArm/Bip01 R Forearm/Bip01 R Hand");
	//boneprop = transform.Find("Bip01/Bip01 Pelvis/Bip01 Spine/Bip01 Spine1/Bip01 Spine2/Bip01 Spine3/Bip01 Neck/Bip01 R Clavicle/Bip01 R UpperArm/Bip01 R Forearm/Bip01 R Hand/Bip01 Prop");
	
	boneRFoot = transform.Find("Bip01/Bip01 Pelvis/Bip01 Spine/Bip01 R Thigh/Bip01 R Calf/Bip01 R Foot");
	boneLFoot = transform.Find("Bip01/Bip01 Pelvis/Bip01 Spine/Bip01 L Thigh/Bip01 L Calf/Bip01 L Foot");
	
	//head beginning position
	boneHead.transform.localEulerAngles.x = headRand;


}