#pragma strict

@script ExecuteInEditMode()

//enum Sui_FX_Type{
//		particle,audio
//		}
enum Sui_FX_Rules{
		none,isUnderWater,isAboveWater,isAtWaterSurface,speedIsGreater,speedIsLess,
		waterDepthGreater,waterDepthLess
		}
enum Sui_FX_RuleModifiers{
		and,or
		}
enum Sui_FX_System{
		none,bubbles,rings,ringfoam,splash,splashdrops
		}
enum Sui_FX_ActionType{
		none,once,repeat
		}

//particle
//var effectType : Sui_FX_Type[];
var fxObject : SuimonoModuleFX;			
var effectRule : Sui_FX_Rules[];
//var effectRuleModifier : Sui_FX_RuleModifiers[];
var effectData : float[];
var resetRule : Sui_FX_Rules[];
var effectSystemName : String[];
var effectSystem : Sui_FX_System[];
var actionType : Sui_FX_ActionType = Sui_FX_ActionType.none;
var effectDelay : Vector2 = Vector2(1.0,1.0);
var emitTime : Vector2 = Vector2(1.0,1.0);
var emitNum : Vector2 = Vector2(1.0,1.0);
var effectSize : Vector2 = Vector2(1.0,1.0);
var emitSpeed : float;
var speedThreshold : float;
var directionMultiplier : float;
//var linkSizeToSpeed : boolean = false;
//var linkDirections : boolean = false;
var emitAtWaterLevel : boolean = false;
var effectDistance : float = 100.0;

//audio
var audioObj : AudioClip;
var audioVol : Vector2 = Vector2(0.9,1.0);
var audioPit : Vector2 = Vector2(0.8,1.2);
var audioSpeed : float;

//color
var tintCol : Color = Color(1,1,1,1);
var clampRot : boolean = false;


// for custom editor
var typeIndex : int = 0;
var ruleIndex : int[];
var ruleOptions = new Array("None","Object Is Underwater","Object Is Above Water","Object Is At Surface",
	"Object Speed Is Greater Than","Object Speed Is Less Than","Water Depth Is Greater Than",
	"Water Depth Is Less Than"
	);


	

var systemIndex : int = 0;
var sysNames = new Array();
//var systemOptions = new Array("splash","bubbles");

//

var useDarkUI : boolean = true;

var currentSpeed : float;
private var savePos : Vector3 = Vector3(0,0,0);
private var moduleObject : SuimonoModule;
//private var suimonoCamera : sui_demo_Controller2;
private var delayTimer : float;
private var emitTimer : float;
private var delayPass : boolean = true;
private var useEffectDelay : float;
private var useEmitTime : float;
private var numEmissions : int = 0;
private var useSpd : float;
private var useAudioSpd : float;
private var isOverWater : float;
private var currentWaterPos : float;
private var emitPos : Vector3;
private var rulepass : boolean = false;

private var timerAudio : float = 0.0;
private var timerParticle : float = 0.0;

private var checkTime : float = 0.0;

private var currentCamDistance : float = 0.0;

//collect for GC
private var gizPos : Vector3;
private var sN : int;
private var setName : String;
private var s : int;
private var ruleCheck : boolean[];
private var ruleCKNum : int = 0;
private var resetCheck : boolean[];
private var resetCKNum : int = 0;
private var rCK : int;
private var emitN : int;
private var emitS : float;
private var emitV : Vector3;
private var emitR : float;
private var emitAR : float;
private var rp : boolean;
private var ruleData : float;
private var depth : float;
private var tempRules : Sui_FX_Rules[];
private var tempIndex : int[];
private var tempData : float[];
private var aR : int;	
private var endLP : int;
private var setInt : int;
		
private var heightValues : float[];
		

				
// create a simple cheap "smear" effect on the InvokeRepeating processor load.
// by shifting the work into rough groups via a simple static int, that we loop over.
 
// our global counter
static var staggerOffset:int = 0;
 
// our loop, we chose groups of roughly 20
static var staggerModulus:int = 20;
 
// to scale back our int to a usable "skip value in seconds"; 
// roughly 1 over the modulus, to even the spread, or "smear", over the second;
static var staggerMultiplier:float = 0.05f; 

// our actual stagger value 
private var stagger:float;



function OnDrawGizmos (){
	gizPos = transform.position;
	gizPos.y += 0.03;
	Gizmos.DrawIcon(gizPos, "gui_icon_fxobj.psd", true);
}

 
function Start () {

	// Object References
	if (GameObject.Find("SUIMONO_Module")){
		moduleObject = GameObject.Find("SUIMONO_Module").GetComponent(SuimonoModule) as SuimonoModule;
		fxObject = moduleObject.fxObject;
	}


	//populate system names
	if (fxObject != null){
		sysNames = fxObject.sysNames;
	}	
	
	//set starting variables
	useEmitTime = Random.Range(emitTime.x,emitTime.y);
	useEffectDelay = Random.Range(effectDelay.x,effectDelay.y);
	
	//run update loop at set FPS interval
    staggerOffset++;
    stagger = (staggerOffset+0f) *0.05f  ;
    staggerOffset = staggerOffset % staggerModulus;
    
	InvokeRepeating("SetUpdate",0.1+stagger,(1.0/30.0));
	
}



//function Update(){
	//populate system names
//	if (fxObject != null){
//		sysNames = fxObject.sysNames;
//	}	
//}


function SetUpdate(){

	//populate system names
	//if (fxObject != null){
	//	sysNames = fxObject.sysNames;
	//}	
	
	
	if (moduleObject != null){

		//get objects while in editor mode
		#if UNITY_EDITOR
		if (!Application.isPlaying){
			if (moduleObject == null){	
			if (GameObject.Find("SUIMONO_Module")){
				moduleObject = GameObject.Find("SUIMONO_Module").GetComponent(SuimonoModule) as SuimonoModule;
				fxObject = moduleObject.fxObject;
			}
			}
		}
		#endif
		
		//set ui
		//if (moduleObject != null)
			//useDarkUI = moduleObject.useDarkUI;
		






		if (Application.isPlaying){	
		
		//calculate camera distance
		currentCamDistance = Vector3.Distance(this.transform.position,moduleObject.setTrack.transform.position);
		if (currentCamDistance <= effectDistance){
		
			//track position / speed
			if (savePos != this.transform.position){
				currentSpeed = Vector3.Distance(savePos,Vector3(this.transform.position.x,this.transform.position.y,this.transform.position.z))/Time.deltaTime;
			}
			savePos = this.transform.position;


			// track timers and emit
			timerParticle += Time.deltaTime;
			timerAudio += Time.deltaTime;
			
			EmitFX();
			if (timerAudio > audioSpeed){
				timerAudio = 0.0;
				EmitSoundFX();
			}
			
		}
		
		}

	}
}




function EmitSoundFX(){

	if (audioObj != null && moduleObject != null){
	if (moduleObject.gameObject.active){
	if (rulepass){
		moduleObject.AddSoundFX(audioObj,emitPos,Vector3(0,Random.Range(audioPit.x,audioPit.y),Random.Range(audioVol.x,audioVol.y)));
	}
	}
	}
}




function EmitFX () {
if (Application.isPlaying){	
if (moduleObject != null){
if (moduleObject.gameObject.active){

	//######################################
	//##    CALCULATE TIMING and DELAYS   ##
	//######################################
	delayPass = false;

	emitTimer += Time.deltaTime;
	if (emitTimer >= emitSpeed){
		emitTimer = 0.0;
		delayTimer = 0.0;
		useEffectDelay = Random.Range(effectDelay.x,effectDelay.y);
		delayPass = true;
	}

	
	
	//####################################
	//##    CALCULATE WATER RELATION   ##
	//####################################
	//if (heightValues == null) heightValues = new float[];
	heightValues = moduleObject.SuimonoGetHeightAll(this.transform.position);
		currentWaterPos = heightValues[3];
		isOverWater = heightValues[4];


	//##########################
	//##    CALCULATE RULES   ##
	//##########################
	rulepass = false;
	if (ruleCheck == null) ruleCheck = new boolean[effectRule.Length];
	ruleCKNum = 0;
	if (resetCheck == null) resetCheck = new boolean[resetRule.Length];
	resetCKNum  = 0;
	
	for (rCK = 0; rCK < effectRule.Length; rCK++){
		ruleCheck[rCK] = CheckRules(ruleIndex[rCK],rCK);
	}
	
	//determine if all rules are passed
	for (rCK = 0; rCK < effectRule.Length; rCK++){
		if (ruleCheck[rCK]) ruleCKNum += 1;
	}
	if (ruleCKNum == effectRule.Length) rulepass = true;
	
	//no rules
	if (effectRule.Length == 0){
		rulepass = true;
	}
	
	
	//######################
	//##    INITIATE FX   ##
	//######################
	if (delayPass && rulepass){
	
		emitN = Mathf.Floor(Random.Range(emitNum.x,emitNum.y));
		emitS = Random.Range(effectSize.x,effectSize.y);
		emitV = Vector3(0,0,0);
		emitPos = transform.position;
		
		//#if UNITY_3_5
		//	emitR = 135.0+transform.eulerAngles.y;
		//#else
		emitR = transform.eulerAngles.y-180;
		//#endif
		//emitR = 0.0;
		if (!clampRot){
			emitR = Random.Range(-30,10.0);
		}
		emitAR = Random.Range(-360.0,360.0);
		
		//get water level
		if (emitAtWaterLevel){
			emitPos.y = (transform.position.y + currentWaterPos)-0.2;
		}
		
		if (directionMultiplier > 0.0){
			emitV = transform.up * (directionMultiplier * Mathf.Clamp((currentSpeed/speedThreshold),0.0,1.0));
		}
		
		//EMIT PARTICLE SYSTEM
		if (timerParticle > emitSpeed){
			timerParticle = 0.0;

		if (systemIndex-1 >= 0){
			emitPos.y += (emitS*0.4);
			emitPos.x += Random.Range(-0.2,0.2);
			emitPos.z += Random.Range(-0.2,0.2);
			moduleObject.AddFX(systemIndex-1, emitPos, emitN, Random.Range(0.5,0.75)*emitS, emitR, emitAR, emitV, tintCol);
		}
		}
	}
}
}
}
}




function CheckRules( rule : Sui_FX_Rules, ruleNum : int){

	rp = false;
	
	if (Application.isPlaying){	
	
		ruleData = speedThreshold;
		
		//get depth
		depth = currentWaterPos;
		
		if (ruleNum < effectData.Length) ruleData = effectData[ruleNum];
		
		if (rule == Sui_FX_Rules.isUnderWater && isOverWater==1.0){
			if (depth > 0.0) rp = true;
		}
		if (rule == Sui_FX_Rules.isAboveWater && isOverWater==1.0){
			if (depth <= 0.0) rp = true;
		}
		if (rule == Sui_FX_Rules.isAtWaterSurface && isOverWater==1.0){
			if (depth < 0.15 && depth > -0.15) rp = true;
		}
		if (rule == Sui_FX_Rules.waterDepthGreater && isOverWater==1.0){
			if (depth > ruleData) rp = true;
		}
		if (rule == Sui_FX_Rules.waterDepthLess && isOverWater==1.0){
			if (depth < ruleData) rp = true;
		}
		if (rule == Sui_FX_Rules.speedIsGreater && isOverWater==1.0){
			if (currentSpeed > ruleData) rp = true;
		}
		if (rule == Sui_FX_Rules.speedIsLess && isOverWater==1.0){
			if (currentSpeed < ruleData) rp = true;
		}
		
		else if (rule == Sui_FX_Rules.none){
			rp = true;
		}
		
	}

return rp;

}



function AddRule(){

	tempRules  = effectRule;
	
	tempIndex  = ruleIndex;
	tempData = effectData;

	effectRule = new Sui_FX_Rules[tempRules.Length+1];
	ruleIndex = new int[tempRules.Length+1];
	effectData = new float[tempRules.Length+1];	

	for (aR = 0; aR < tempRules.Length; aR++){
		effectRule[aR] = tempRules[aR];
		ruleIndex[aR] = tempIndex[aR];
		effectData[aR] = tempData[aR];
	}
	effectRule[tempRules.Length] = Sui_FX_Rules.none;
	ruleIndex[tempRules.Length] = 0;
	effectData[tempRules.Length] = 0;
	
}




function DeleteRule(ruleNum : int){

 	tempRules = effectRule;
 	tempIndex = ruleIndex;
 	tempData = effectData;
 	
	endLP = tempRules.Length-1;
	
	if (endLP <= 0){
		endLP = 0;
		effectRule = new Sui_FX_Rules[0];
		ruleIndex = new int[0];
		effectData = new float[0];
		
	} else {

		effectRule = new Sui_FX_Rules[endLP];
		ruleIndex = new int[endLP];
		effectData = new float[endLP];	
		setInt = -1;
		
		for (aR = 0; aR <= endLP; aR++){
			
			if (aR != ruleNum){
				setInt += 1;
			} else {
				setInt += 2;
			}

			if (setInt <= endLP){
				effectRule[aR] = tempRules[setInt];
				ruleIndex[aR] = tempIndex[setInt];
				effectData[aR] = tempData[setInt];
			}
			
			
		}
	}	
	
}





function OnDisabled(){
	CancelInvoke("SetUpdate");
}

function OnEnabled(){

    staggerOffset++;
    stagger = (staggerOffset+0f) *0.05f  ;
    staggerOffset = staggerOffset % staggerModulus;
    
	CancelInvoke("SetUpdate");
	InvokeRepeating("SetUpdate",0.1+stagger,(1.0/30.0));
}
