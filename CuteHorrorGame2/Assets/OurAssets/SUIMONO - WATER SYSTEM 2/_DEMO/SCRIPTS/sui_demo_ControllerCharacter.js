#pragma strict


//PUBLIC VARIABLES
var isActive : boolean = false;
var isControllable : boolean = true;
//var isTargeting : boolean = false;
var isExtraZoom : boolean = false;
private var cameraObject : Transform;
var cameraTarget : Transform;
var buoyancyTarget : Transform;
var reverseYAxis : boolean = true;
var reverseXAxis : boolean = false;
var mouseSensitivity : Vector2 = Vector2(4.0,4.0);
var cameraFOV : float = 35.0;
var cameraOffset : Vector2 = Vector2(0.0,0.0);
var cameraLean : float = 0.0;
var walkSpeed : float = 0.02;
var runSpeed : float = 0.4;
var sprintSpeed : float = 0.4;
var rotationSensitivity : float = 6.0;
var rotationLimits : Vector3 = Vector3(0.0,0.0,0.0);
var minZoomAmount : float = 1.25;
var maxZoomAmount : float = 8.0;
var showDebug : boolean = false;

private var buoyancyObject : fx_buoyancy;

private var rotSense : float = 0.0;
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
public var isInBoat : boolean = false;

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
private var useVertSpeed : float = 0.0;
private var moveSpeed : float = 0.05;
private var moveForward : float = 0.0;
private var moveSideways : float = 0.0;
private var moveForwardTgt : float = 0.0;
private var moveSidewaysTgt : float = 0.0;
private var moveVert : float = 0.0;
private var isWalking : boolean = false;
private var isRunning : boolean = false;
private var isSprinting : boolean = false;
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
//private var targetAnimator : sui_demo_characterAnim;
var targetAnimator : sui_demo_animCharacter;
//private var vehicle_engine_object : sui_demo_boatAnim;

private var savePos : Vector3;
private var oldMouseRotation : float;
private var oldMouseVRotation : float;

private var MC : sui_demo_ControllerMaster;
private var IC : sui_demo_InputController;

private var xMove : float = 0.0;
private var runButtonTime : float = 0.0;
private var toggleRun : boolean = false;

private var gSlope : float = 0.0;
private var useSlope : float = 0.0;



function Awake() {

	//get Suimono Specific Objects
	suimonoGameObject = GameObject.Find("SUIMONO_Module");
	if (suimonoGameObject != null) suimonoModuleObject = suimonoGameObject.GetComponent(SuimonoModule);
	
	targetPosition = cameraTarget.position;
	targetRotation = cameraTarget.rotation;
	
	if (cameraTarget != null){
		targetAnimator = cameraTarget.gameObject.GetComponent(sui_demo_animCharacter);
	}
	
	//if (vehicleTarget != null){
	//	vehiclePosition = vehicleTarget.gameObject.Find("PlayerPositionMarker").transform;
	//	vehicleExitPosition = vehicleTarget.gameObject.Find("PlayerExitMarker").transform;
	//	vehicle_engine_object = vehicleTarget.gameObject.GetComponent(sui_demo_boatAnim) as sui_demo_boatAnim;
	//}
	
	if (buoyancyTarget != null){
		buoyancyObject = buoyancyTarget.GetComponent("fx_buoyancy") as fx_buoyancy;
	}
	
	MC = this.gameObject.GetComponent("sui_demo_ControllerMaster") as sui_demo_ControllerMaster;
	IC = this.gameObject.GetComponent("sui_demo_InputController") as sui_demo_InputController;



}




function LateUpdate() {

	//clamp rotations
	//if (!isInBoat){
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
	//}

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

		//RESET MOVEMENT
		moveForward = 0.0;
		moveSideways = 0.0;
		moveVert = 0.0;

		// GET WASD MOVEMENT KEYS
		if (IC.inputKeyW) moveForward = 1.0;
		if (IC.inputKeyS) moveForward = -1.0;
		if (IC.inputKeyA) moveSideways = -1.0;
		if (IC.inputKeyD) moveSideways = 1.0;

		//RESET MOVEMENT
		//coolTime += Time.deltaTime;
		//if (!IC.inputKeyW && !IC.inputKeyS) moveForward = Mathf.Lerp(moveForward,0.0,coolTime);
		//if (!IC.inputKeyA && !IC.inputKeyD) moveSideways = Mathf.Lerp(moveSideways,0.0,coolTime);
		//moveVert = lerp(moveForward,0.0,coolTime);

		if (IC.inputKeyQ) moveVert = -1.0;
		if (IC.inputKeyE) moveVert = 1.0;
			
		//MOUSE BUTTON 0
		isMouseMove = IC.inputMouseKey0;
		
		//MOUSE BUTTON 1
		isExtraZoom = IC.inputMouseKey1;
		if (isExtraZoom){
			setFOV = 0.5;
		} else {
			setFOV = 1.0;
		}
		
		//SHIFT RUN/SPRINT
		// Tap Shift to toggle
		// hold shift to sprint
		isWalking = false;
		if (moveForward != 0.0 || moveSideways != 0.0) isWalking = true;
		if (IC.inputKeySHIFTL){
			runButtonTime += Time.deltaTime;
				if (runButtonTime > 0.2){
					isSprinting = true;
				}
		} else {
			if (runButtonTime > 0.0){
				if (runButtonTime < 0.2){
					isRunning = !isRunning;
					if (isRunning) toggleRun = true;
				}
				if (runButtonTime > 0.2){
					isRunning = false;
				}
			}
			if (isSprinting && toggleRun) isRunning = true;
			isSprinting = false;
			runButtonTime = 0.0;
		}


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
		
		//turn off buoyancy when underwater (if object exists)
		if (isUnderWater){
			if (buoyancyObject != null) buoyancyObject.engageBuoyancy = false;
		} else {
			if (buoyancyObject != null) buoyancyObject.engageBuoyancy = true;
		}
		
	}
	

	



	
	if (isControllable){


		//---------------------------------
		//  CHARACTER ROTATION
		//---------------------------------

		//ROTATE CHARACTER
		if (!orbitView){

		//calculate rotation sensitivity
		rotSense = rotationSensitivity;
		if (isSprinting) rotSense *= 2.0;

		//calculate rotation  3-360 hedge
		var rotH : float = 0.0;
		var tgt : float = 0.0;
		//if (moveForward == 1.0){
		//	if ((cameraTarget.eulerAngles.y-cameraObject.transform.eulerAngles.y) > 180.0){
		//		rotH = -360.0;
		//	} else if ((cameraTarget.eulerAngles.y-cameraObject.transform.eulerAngles.y) < -180.0){
		//		rotH = 360.0;
		//	}
			
		//} else if (moveForward == -1.0){
			//if ((cameraTarget.eulerAngles.y-cameraObject.transform.eulerAngles.y) > 180.0){
				//rotH = -360.0;
			//} else if ((cameraTarget.eulerAngles.y-cameraObject.transform.eulerAngles.y) < -180.0){
			//	rotH = 360.0;
		//	}
		//}
		
		//Debug.Log(cameraTarget.eulerAngles.y+"  "+cameraObject.transform.eulerAngles.y);
			//move forward
			if (moveForward == 1.0 && moveSideways == 0.0){
				tgt = cameraObject.transform.eulerAngles.y;
				if ((cameraTarget.eulerAngles.y-tgt) > 180.0) rotH = -360.0;
				if ((cameraTarget.eulerAngles.y-tgt) < -180.0) rotH = 360.0;
				cameraTarget.eulerAngles.y = Mathf.Lerp(cameraTarget.eulerAngles.y+rotH,tgt,Time.deltaTime*rotSense);

			//move backward
			} else if (moveForward == -1.0 && moveSideways == 0.0){
				rotSense *= 1.0;
				tgt = cameraObject.transform.eulerAngles.y-180.0;
				if ((cameraTarget.eulerAngles.y-tgt) > 180.0) rotH = -360.0;
				if ((cameraTarget.eulerAngles.y-tgt) < -180.0) rotH = 360.0;
				cameraTarget.eulerAngles.y = Mathf.Lerp(cameraTarget.eulerAngles.y+rotH,tgt,Time.deltaTime*rotSense);

			//move sideways
			} else if (moveSideways != 0.0 && moveForward == 0.0){
				tgt = cameraObject.transform.eulerAngles.y+(90*moveSideways);
				if ((cameraTarget.eulerAngles.y-tgt) > 180.0) rotH = -360.0;
				if ((cameraTarget.eulerAngles.y-tgt) < -180.0) rotH = 360.0;
				cameraTarget.eulerAngles.y = Mathf.Lerp(cameraTarget.eulerAngles.y+rotH,tgt,Time.deltaTime*rotSense);

			//move forward side
			} else if (moveSideways != 0.0 && moveForward == 1.0){
				rotSense *= 1.4;
				tgt = cameraObject.transform.eulerAngles.y+(45*moveSideways);
				if ((cameraTarget.eulerAngles.y-tgt) > 180.0) rotH = -360.0;
				if ((cameraTarget.eulerAngles.y-tgt) < -180.0) rotH = 360.0;
				cameraTarget.eulerAngles.y = Mathf.Lerp(cameraTarget.eulerAngles.y+rotH,tgt,Time.deltaTime*rotSense);

			//move backward side
			} else if (moveSideways != 0.0 && moveForward == -1.0){
				rotSense *= 1.4;
				tgt = cameraObject.transform.eulerAngles.y-180.0-(45*moveSideways);
				if ((cameraTarget.eulerAngles.y-tgt) > 180.0) rotH = 360.0;
				if ((cameraTarget.eulerAngles.y-tgt) < -180.0) rotH = -360.0;
				cameraTarget.eulerAngles.y = Mathf.Lerp(cameraTarget.eulerAngles.y-rotH,tgt,Time.deltaTime*rotSense);

			} else {
			
				xMove = Mathf.Lerp(xMove,0.0,Time.deltaTime);
			}
			
			
				//if (moveVert != 0.0){
				//cameraTarget.eulerAngles.x = Mathf.Lerp(cameraTarget.eulerAngles.x,90.0*moveVert,Time.deltaTime);
				//}
			
			cameraTarget.eulerAngles.x = 0.0;
			cameraTarget.eulerAngles.z = 0.0;


		}



		//---------------------------------
		// CALCULATE GROUND SLOPE
		//---------------------------------
		gSlope = 0.0;
		useSlope = 0.0;
		var startPos : Vector3 = cameraTarget.position+Vector3(0,1.0,0);
		var endPos : Vector3 = cameraTarget.position+Vector3(0,-0.25,0);
	    var hitA : RaycastHit;
	    var hitB : RaycastHit;

		if(Physics.Linecast(startPos, endPos, hitA)){
			if (hitA.transform != cameraTarget.transform){
				if (showDebug) Debug.DrawLine (startPos, endPos, Color.red);

				if (Physics.Linecast(startPos+(cameraTarget.forward*0.25), endPos+(cameraTarget.forward*0.25), hitB)){
					if (showDebug) Debug.DrawLine (startPos+(cameraTarget.forward*0.25), endPos+(cameraTarget.forward*0.25), Color.green);
					if (showDebug) Debug.DrawLine (hitA.point,hitB.point, Color.black);

					//calculate angle
					var aFac1 : float = (hitB.point.y-hitA.point.y);
					var aFac2 : float = (hitB.point.x-hitA.point.x);
					gSlope = (Mathf.Atan2(aFac1,aFac2) * Mathf.Rad2Deg);
					useSlope = gSlope;
					if (gSlope < 0.0) useSlope = 90.0+((Mathf.Atan2(aFac1,aFac2) * Mathf.Rad2Deg) % 90.0);


				}
			}
		}

		//---------------------------------
		// ROTATE CHARACER BASED ON SLOPE
		//---------------------------------
		//var sF : float = 1.0;
		//if (gSlope < 0.0) sF = -1.0;
		//cameraTarget.eulerAngles.x = 0.0 - (useSlope*sF);


		//---------------------------------
		//  CALCULATE FALLING
		//---------------------------------
		//isFalling = false;
		//if (isFall == 1.0) isFalling = true;



		//---------------------------------
		// SET MOVEMENT SPEEDS
		//---------------------------------
		if (isUnderWater) moveSideways = 0.0;
		
		if (moveForward == 0.0 && moveSideways == 0.0){
			isWalking = false;
			isRunning = false;
			isSprinting = false;
		}

		var spdLerp : float = 1.7;
		if (isRunning) spdLerp = 2.5;
		if (isSprinting) spdLerp = 3.5;	

		moveSpeed = walkSpeed;
		//if (isInWaterDeep || isUnderWater) isRunning = false;
		if (isRunning) moveSpeed = runSpeed;
		if (isSprinting) moveSpeed = sprintSpeed;

		if (moveForward != 0.0 && moveSideways != 0.0) moveSpeed *= 0.5;
		if (isInWater) moveSpeed *= 0.9;
		if (isInWaterDeep) moveSpeed *= 0.95;
		if (isUnderWater) moveSpeed *= 0.85;
		
		//slowmovement based on slope
		if (gSlope > 0.0){
			if (useSlope > 0.25 && useSlope < 90.0){
				moveSpeed *= (1.25-(useSlope / 90.0));
			}
		}
		//Debug.Log(useSlope);

		useSpeed = Mathf.Lerp(useSpeed, (moveSpeed * moveForward), Time.deltaTime*spdLerp);
		useSideSpeed = Mathf.Lerp(useSideSpeed, (moveSpeed * moveSideways), Time.deltaTime*spdLerp);
		useVertSpeed = Mathf.Lerp(useVertSpeed, (moveSpeed * moveVert), Time.deltaTime*spdLerp);









		//---------------------------------
		//  CHARACTER MOVEMENT
		//---------------------------------
	
		if (cameraTarget.GetComponent.<Rigidbody>()){

			//calculate forward / backward movement
			var setNewPos : Vector3;
			setNewPos = ((cameraTarget.transform.forward * useSpeed * moveForwardTgt));
			if (moveForward != 0.0 && moveForwardTgt != moveForward) moveForwardTgt = moveForward;

			//calculate sideways movement
			var setNewSidePos : Vector3;
			setNewSidePos = ((cameraTarget.transform.forward * useSideSpeed * moveSidewaysTgt));
			if (moveSideways != 0.0 && moveSidewaysTgt != moveSideways) moveSidewaysTgt = moveSideways;

			//move sideways only when not moving forward
			//if (moveSideways != 0.0) && moveForward != 0.0){
			//	setNewSidePos = Vector3(0,0,0);
			//}

			//calculate vertical while underwater
			var setNewVertPos : Vector3;
			setNewVertPos = Vector3(0,useVertSpeed,0);


			//set final movement
			cameraTarget.GetComponent.<Rigidbody>().MovePosition(cameraTarget.GetComponent.<Rigidbody>().position + (setNewPos + setNewSidePos + setNewVertPos));
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
		//cameraObject.transform.position.x += (cameraOffset.x);
		//cameraObject.transform.position.z += (cameraOffset.y);
		
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


}


//------------------------------------
//  SEND MODES TO CHARACTER ANIMATOR
//------------------------------------
if (targetAnimator != null){



	targetAnimator.isWalking = isWalking;
	targetAnimator.isRunning = isRunning;
	targetAnimator.isSprinting = isSprinting;
	targetAnimator.moveForward = moveForward;
	targetAnimator.moveSideways = moveSideways;

	targetAnimator.gSlope = gSlope;
	targetAnimator.useSlope = useSlope;
	//targetAnimator.moveVertical = moveVertical;
	targetAnimator.isInWater = isInWater;
	targetAnimator.isInWaterDeep = isInWaterDeep;
	targetAnimator.isUnderWater = isUnderWater;
	targetAnimator.isFloating = isFloating;
	targetAnimator.isAtSurface = isAtSurface;
	targetAnimator.isFalling = isFalling;
	
	targetAnimator.isInBoat = isInBoat;


	
		
}

}




