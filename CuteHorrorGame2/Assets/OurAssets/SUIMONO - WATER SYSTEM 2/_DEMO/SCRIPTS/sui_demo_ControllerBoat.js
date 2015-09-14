#pragma strict


//PUBLIC VARIABLES
var isActive : boolean = false;
var isControllable : boolean = true;
//var isTargeting : boolean = false;
var isExtraZoom : boolean = false;
private var cameraObject : Transform;
var cameraTarget : Transform;
var reverseYAxis : boolean = true;
var reverseXAxis : boolean = false;
var mouseSensitivity : Vector2 = Vector2(4.0,4.0);
var cameraFOV : float = 35.0;
var cameraOffset : Vector2 = Vector2(0.0,0.0);
var cameraLean : float = 0.0;
var walkSpeed : float = 0.02;
var runSpeed : float = 0.4;
var rotationLimits : Vector3 = Vector3(0.0,0.0,-30.0);
var minZoomAmount : float = 1.25;
var maxZoomAmount : float = 8.0;

private var axisSensitivity : Vector2 = Vector2(4.0,4.0);
private var followDistance : float = 5.0;
private var followHeight : float = 1.0;
private var followLat : float = 0.0;
private var camFOV : float = 35.0;
private var camRotation = 0.0;
private var camRot : Vector3;
private var camHeight = 0.0;
//var camYDamp : float;
//var targetDistance : float = 0.0;
//var targetingSkew :float = 7.0;
//var targetingSpeed : float = 5.0;
//var followTgt : boolean = true;

private var isInWater : boolean = false;
private var isInWaterDeep : boolean = false;
private var isUnderWater : boolean = false;
private var isAtSurface : boolean = false;
private var isFloating : boolean = false;
private var isFalling : boolean = false;
//var isInBoat : boolean = false;

//var keepUnderwater : boolean = true;

//var cameraLean : float = 1.0;
//var targetLean : float = 1.0;


//PUBLIC VARIABLES
private var targetPosition : Vector3;
private var MouseRotationDistance : float = 0.0;
private var MouseVerticalDistance : float = 0.0;


//PRIVATE VARIABLES
private var suimonoGameObject : GameObject;
private var suimonoModuleObject : SuimonoModule;

private var followTgtDistance : float = 0.0;

//private var cameraReset : boolean = false;
private var orbitView : boolean = false;
private var targetRotation : Quaternion;
private var MouseScrollDistance : float = 0.0;
private var playerObject : Transform;
//private var sfxShake : sui_demo_cameraShake;
private var projEmitTimer : float = 0.0;
private var camVRotation : float = 0.0;
private var firingTime : float = 0.0;
private var sightingTime : float = 0.0;
private var setFOV : float = 1.0;

private var targetUseLean : float = 0.0;
private var useSpeed : float = 0.0;
private var useSideSpeed : float = 0.0;
private var moveSpeed : float = 0.05;
private var moveForward : float = 0.0;
private var moveSideways : float = 0.0;
private var isRunning : boolean = false;
private var isMouseMove : boolean = false;

private var lastYPos : float = 0.0;
private var propSpd : float = 0.0;
private var engPos : float = 0.5;

private var vehiclePosition : Transform;
private var vehicleExitPosition : Transform;
//public var vehicleReset : boolean = true;

//editor variables
private var forwardAmt : float = 0.0;
private var sidewaysAmt : float = 0.0;
private var editorSensitivity : float = 1.0;
private var button3time : float = 0.0;
var targetAnimator : sui_demo_animBoat;
//private var vehicle_engine_object : sui_demo_boatAnim;

private var savePos : Vector3;
private var oldMouseRotation : float;
private var oldMouseVRotation : float;
private var xMove : float;
private var zMove : float;

private var MC : sui_demo_ControllerMaster;
private var IC : sui_demo_InputController;


function Awake() {

	//get Suimono Specific Objects
	suimonoGameObject = GameObject.Find("SUIMONO_Module");
	if (suimonoGameObject != null) suimonoModuleObject = suimonoGameObject.GetComponent(SuimonoModule);
	
	targetPosition = cameraTarget.position;
	targetRotation = cameraTarget.rotation;
	
	if (cameraTarget != null){
		targetAnimator = cameraTarget.gameObject.GetComponent(sui_demo_animBoat);
	}
	
	//if (vehicleTarget != null){
	//	vehiclePosition = vehicleTarget.gameObject.Find("PlayerPositionMarker").transform;
	//	vehicleExitPosition = vehicleTarget.gameObject.Find("PlayerExitMarker").transform;
	//	vehicle_engine_object = vehicleTarget.gameObject.GetComponent(sui_demo_boatAnim) as sui_demo_boatAnim;
	//}
	
	MC = this.gameObject.GetComponent("sui_demo_ControllerMaster") as sui_demo_ControllerMaster;
	IC = this.gameObject.GetComponent("sui_demo_InputController") as sui_demo_InputController;



}




function LateUpdate() {

	//clamp rotations
	if (rotationLimits.x != 0.0){
		if (cameraTarget.transform.eulerAngles.x < 360.0-rotationLimits.x && cameraTarget.transform.eulerAngles.x > rotationLimits.x+10){
			cameraTarget.transform.eulerAngles.x = cameraTarget.transform.eulerAngles.x = 360.0-rotationLimits.x;
		} else if (cameraTarget.transform.eulerAngles.x > rotationLimits.x && cameraTarget.transform.eulerAngles.x < 360.0-rotationLimits.x){
			cameraTarget.transform.eulerAngles.x = rotationLimits.x;
		}
	}	
	if (rotationLimits.y != 0.0){
		if (cameraTarget.transform.eulerAngles.y < 360.0-rotationLimits.y && cameraTarget.transform.eulerAngles.y > rotationLimits.y+10){
			cameraTarget.transform.eulerAngles.y = cameraTarget.transform.eulerAngles.y = 360.0-rotationLimits.y;
		} else if (cameraTarget.transform.eulerAngles.y > rotationLimits.y && cameraTarget.transform.eulerAngles.y < 360.0-rotationLimits.y){
			cameraTarget.transform.eulerAngles.y = rotationLimits.y;
		}
	}	
	if (rotationLimits.z != 0.0){
		if (cameraTarget.transform.eulerAngles.z < 360.0-rotationLimits.z && cameraTarget.transform.eulerAngles.z > rotationLimits.z+10){
			cameraTarget.transform.eulerAngles.z = cameraTarget.transform.eulerAngles.z = 360.0-rotationLimits.z;
		} else if (cameraTarget.transform.eulerAngles.z > rotationLimits.z && cameraTarget.transform.eulerAngles.z < 360.0-rotationLimits.z){
			cameraTarget.transform.eulerAngles.z = rotationLimits.z;
		}
	}	

}





function FixedUpdate () {

if (isActive){

	//------------------------------------
	//  GET DATA FROM MASTER CONTROLLER
	//------------------------------------
	cameraObject = MC.cameraObject;
	
	
	//---------------------------------
	//  GET KEYBOARD AND MOUSE INPUTS
	//---------------------------------
	
	if (isControllable){

		//"WASD" MOVEMENT KEYS
		moveForward = 0.0;
		moveSideways = 0.0;
		if (IC.inputKeyW) moveForward = 1.0;
		if (IC.inputKeyS) moveForward = -1.0;
		if (IC.inputKeyA) moveSideways = -1.0;
		if (IC.inputKeyD) moveSideways = 1.0;
		
		//MOUSE BUTTON 0
		isMouseMove = IC.inputMouseKey0;
		
		//MOUSE BUTTON 1
		isExtraZoom = IC.inputMouseKey1;
		if (isExtraZoom){
			setFOV = 0.5;
		} else {
			setFOV = 1.0;
		}
		
		//SHIFT
		//isTargeting = false;
		isRunning = IC.inputKeySHIFTL;
		if (moveForward == -1.0) isRunning = false;
		
		//SPACE
		orbitView = IC.inputKeySPACE;


	}


		//CHECK FOR MOUSE INPUT
		targetPosition = cameraTarget.position;
		oldMouseRotation = MouseRotationDistance;
		oldMouseVRotation = MouseVerticalDistance;
		
		//GET MOUSE MOVEMENT
		MouseRotationDistance = IC.inputMouseX;
		MouseVerticalDistance = IC.inputMouseY;
		MouseScrollDistance = IC.inputMouseWheel;
		if (reverseXAxis) MouseRotationDistance = -IC.inputMouseX;
		if (reverseYAxis) MouseVerticalDistance = -IC.inputMouseY;
	
	


	//---------------------------------
	//  HANDLE CAMERA VIEWS
	//---------------------------------
	if (!isControllable){
		//Zoom Settings used for the intro screen
		camFOV = 63.2;
		followLat = Mathf.Lerp(followLat,-0.85,Time.deltaTime*4.0);
		followHeight = Mathf.Lerp(followHeight,1.8,Time.deltaTime*4.0);
		followDistance = Mathf.Lerp(followDistance,5.0,Time.deltaTime*4.0);
		axisSensitivity.x = Mathf.Lerp(axisSensitivity.x,mouseSensitivity.x,Time.deltaTime*4.0);
		axisSensitivity.y = Mathf.Lerp(axisSensitivity.y,mouseSensitivity.y,Time.deltaTime*4.0);
		cameraObject.GetComponent.<Camera>().fieldOfView = camFOV;
	}
	
	//IDLE SETTINGS lerp camera back
	camFOV = Mathf.Lerp(camFOV,cameraFOV*setFOV,Time.deltaTime*4.0);
	followLat = Mathf.Lerp(followLat,-0.4,Time.deltaTime*4.0);
	followHeight = Mathf.Lerp(followHeight,1.4,Time.deltaTime*2.0);
	axisSensitivity.x = Mathf.Lerp(axisSensitivity.x,mouseSensitivity.x,Time.deltaTime*4.0);
	axisSensitivity.y = Mathf.Lerp(axisSensitivity.y,mouseSensitivity.y,Time.deltaTime*4.0);

	//LOCK CURSOR
	#if UNITY_5_0
		Cursor.lockState = CursorLockMode.None;
	#else
		Screen.lockCursor = false;
	#endif
	
	//---------------------------------
	//  SUIMONO SPECIFIC HANDLING
	//---------------------------------
	// we use this to get the current Suimono plane water level (if applicable) from the
	// main Suimono Module object, then translate this into different walk / run speeds
	// based on water depth.
	//var waterLevel : float = suimonoModuleObject.GetWaterDepth(cameraTarget);
	if (suimonoModuleObject != null){
		var waterLevel : float = suimonoModuleObject.SuimonoGetHeight(cameraTarget.position,"object depth");

		isInWater = false;
		
		if (waterLevel < 0.0) waterLevel = 0.0;
		if (waterLevel > 0.0){
	
			isInWater = true;
			isInWaterDeep = false;
			isUnderWater = false;
			isFloating = false;
			isAtSurface = false;
			
			if (waterLevel >= 0.9 && waterLevel < 1.8) isInWaterDeep = true;
			if (waterLevel >= 1.8) isUnderWater = true;
			if (waterLevel >= 1.2 && waterLevel < 1.8) isAtSurface = true;
			if (isInWaterDeep && waterLevel > 2.0) isFloating = true;

		}
	}
	

	

	//---------------------------------
	// SET MOVEMENT SPEEDS
	//---------------------------------
	var spdLerp : float = 5.0;
	if (isRunning && moveForward > 0.0) spdLerp = 2.5;
	
	moveSpeed = walkSpeed;
	if (isInWaterDeep || isUnderWater) isRunning = false;
	if (isRunning) moveSpeed = runSpeed;
	
	if (moveForward != 0.0 && moveSideways != 0.0) moveSpeed *= 0.75;
	
	if (!isInWater) moveSpeed *= 0.0;

	
	//if (isAtSurface) moveSpeed = 0.01;


	useSpeed = Mathf.Lerp(useSpeed, (moveSpeed * moveForward), Time.deltaTime*spdLerp);
	useSideSpeed = Mathf.Lerp(useSideSpeed, (moveSpeed * moveSideways), Time.deltaTime*spdLerp);




	//---------------------------------
	//  CHARACTER POSITIONING
	//---------------------------------
	
	if (isControllable){

		//ROTATE BOAT
		//if (!orbitView){
		
			//boat rotation
			if (moveForward != 0.0){
				//if (Mathf.Abs(cameraTarget.eulerAngles.y - cameraObject.transform.eulerAngles.y) > 350.0){
					//cameraTarget.eulerAngles.y = cameraObject.transform.eulerAngles.y;
				//} else {
					//cameraTarget.eulerAngles.y = Mathf.Lerp(cameraTarget.eulerAngles.y,cameraObject.transform.eulerAngles.y,Time.deltaTime*6.0);
				//}
				xMove = Mathf.Lerp(xMove,useSpeed,Time.deltaTime);
				zMove = Mathf.Lerp(zMove,useSpeed,Time.deltaTime);
				cameraTarget.eulerAngles.y += Mathf.Lerp(0.0,20.0*moveSideways*moveForward,Time.deltaTime*(Mathf.Abs(xMove*10.0)));
				if (isInWater){
				cameraTarget.eulerAngles.z += Mathf.Lerp(0.0,-130.0*moveSideways*moveForward,Time.deltaTime*(Mathf.Abs(zMove*5.0)));
				}
			} else {
				xMove = Mathf.Lerp(xMove,0.0,Time.deltaTime);
			}
		//}

		//MOVE BOAT
		if (cameraTarget.GetComponent.<Rigidbody>()){
			//calculate forward / backward movement
			var setNewPos : Vector3;
			setNewPos = ((cameraTarget.transform.forward * (xMove)));
			
			//calculate vertical while underwater
			var setNewVertPos : Vector3;

			//calculate sideways movement
			//var setNewSidePos : Vector3;
			//setNewPos += ((cameraTarget.transform.right * (useSideSpeed)));
			
			//move sideways only when not moving forward
			//if (moveSideways != 0.0 && moveForward != 0.0){
			//	setNewSidePos = Vector3(0,0,0);
			//}
			
			//set final movement
			cameraTarget.GetComponent.<Rigidbody>().MovePosition(cameraTarget.GetComponent.<Rigidbody>().position + (setNewPos + setNewVertPos));
		}
		
		
		
		//---------------------------------
		//  CAMERA POSITIONING
		//---------------------------------

		//Calculate Follow Distance
		var followLerpSpeed : float = 2.0;
		followDistance -= (MouseScrollDistance*8.0);
		followDistance = Mathf.Clamp(followDistance,minZoomAmount,maxZoomAmount);
		followTgtDistance = Mathf.Lerp(followTgtDistance,followDistance,Time.deltaTime*followLerpSpeed);
		
		// Calculate Rotation
		camRotation = Mathf.Lerp(oldMouseRotation,MouseRotationDistance*axisSensitivity.x,Time.deltaTime);
		targetRotation.eulerAngles.y += camRotation;
		cameraObject.transform.eulerAngles.x = targetRotation.eulerAngles.x;
		cameraObject.transform.eulerAngles.y = targetRotation.eulerAngles.y;
		
		camHeight = Mathf.Lerp(camHeight,camHeight+MouseVerticalDistance*axisSensitivity.y,Time.deltaTime);
		camHeight = Mathf.Clamp(camHeight,-1.0,12.0);
		
		// SET CAMERA POSITION and ROTATIONS
		cameraObject.transform.position = cameraTarget.transform.position+(-cameraObject.transform.forward*followTgtDistance);
		cameraObject.transform.position.y += camHeight;
		cameraObject.transform.LookAt(Vector3(targetPosition.x,targetPosition.y + followHeight,targetPosition.z));
		
		//CHECK CAMERA OCCLUSION and REPOSITION
		var hits : RaycastHit[];
		var testPos : Vector3 = cameraTarget.transform.position;
		testPos.y += followHeight;
		var hit : RaycastHit;
	    if(Physics.Linecast(testPos,cameraObject.transform.position, hit)) {
		    if (hit.transform.gameObject.layer!=4){
				if (hit.transform == transform || hit.transform == cameraTarget){
					//do nothing
				} else {
					//check for triggers
					var trigCheck : boolean = false;
					if (hit.transform.GetComponent(Collider) != null){
						if (hit.transform.GetComponent(Collider).isTrigger) trigCheck = true;
					}
					
					if (!trigCheck){
		           	//calculate ray
		            var dirRay = new Ray(testPos, testPos - cameraObject.transform.position);
		           	 //move camera
		            cameraObject.transform.position = hit.point;
		            }
		        }
	        }
	    }

		//set camera offset
		cameraObject.transform.position.x += (cameraOffset.x);
		cameraObject.transform.position.y += (cameraOffset.y);
		
		//set camera leaning
		cameraObject.transform.rotation.eulerAngles.z = cameraLean;
	
	}
	
	
	
	
	//---------------------------------
	//  SET CAMERA SETTINGS and FX
	//---------------------------------
	if (isControllable){
		//SET CAMERA SETTINGS
		cameraObject.GetComponent.<Camera>().fieldOfView = camFOV;
	}




	//------------------------------------
	//  SEND MODES TO CHARACTER ANIMATOR
	//------------------------------------
	if (targetAnimator != null){
	

			//send normal animations
			if (moveForward > 0.0){
				targetAnimator.behaviorIsRevving = true;
				targetAnimator.behaviorIsRevvingHigh = isRunning;
				targetAnimator.behaviorIsRevvingBack = false;
			} else if (moveForward < 0.0){
				targetAnimator.behaviorIsRevving = false;
				targetAnimator.behaviorIsRevvingHigh = false;
				targetAnimator.behaviorIsRevvingBack = true;
			} else if (moveForward == 0.0){
				targetAnimator.behaviorIsRevving = false;
				targetAnimator.behaviorIsRevvingHigh = false;
				targetAnimator.behaviorIsRevvingBack = false;
			}
			targetAnimator.engineRotation = moveSideways;
			//targetAnimator.moveForward = moveForward;
			//targetAnimator.moveSideways = moveSideways;
			
			//targetAnimator.isInWater = isInWater;
			//targetAnimator.isInWaterDeep = isInWaterDeep;
			//targetAnimator.isUnderWater = isUnderWater;
			//targetAnimator.isFloating = isFloating;
			//targetAnimator.isAtSurface = isAtSurface;
			//targetAnimator.isFalling = isFalling;
			//targetAnimator.moveVertical = moveVertical;
			//targetAnimator.isInBoat = false;
			
	}



}

	if (targetAnimator != null){
			targetAnimator.behaviorIsOn = isActive;
	}
}




