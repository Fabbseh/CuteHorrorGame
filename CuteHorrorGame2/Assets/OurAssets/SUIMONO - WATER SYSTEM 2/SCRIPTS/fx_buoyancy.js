#pragma strict

//PUBLIC VARIABLES
var applyToParent : boolean = false;
var engageBuoyancy : boolean = false;
var activationRange : float = 75.0;
var inheritForce : boolean = false;
var keepAtSurface : boolean = false;
var updateSpeed : float = 0.065;
var buoyancyOffset : float = 0.0;
var buoyancyStrength : float = 1.0;
var maxVerticalSpeed: float = 5.0;
var surfaceRange : float = 0.2;
var forceAmount : float = 1.0;
var forceHeightFactor : float = 0.0;

//var testHeightAmt : float = 1.0;

// PRIVATE VARIABLES
private var isUnder : boolean = false;
private var surfaceLevel : float = 0.0;
private var underwaterLevel : float = 0.0;

private var isUnderwater : boolean = false;
private var isOverWater : boolean = false;

private var physTarget : Transform;
private var moduleObject : SuimonoModule;
private var suimonoObject : SuimonoObject;

private var height : float = -1;
private var getScale : float = 1.0;
private var waveHeight : float = 0.0;

private var modTime : float = 0.0;
private var splitFac : float = 1.0;

private var rendererComponent : Renderer;
private var rigidbodyComponent : Rigidbody;
private var setUpdateSpeed : float = 0.065;

private var isOver : float = 0.0;
private var forceDir : float = 0.0;
private var forceAngles : Vector2 = Vector2(0.0,0.0);
private var forceSpeed : float = 0.0;
private var waveHt : float = 0.0;

//collect for GC
private var gizPos : Vector3;
private var testObjectHeight : float;
private var buoyancyFactor : float;
private var forceMod : float;
private var waveFac : float;

private var heightValues : float[];


private var isEnabled = true;
private var performHeight : boolean = false;
private var currRange : float = -1.0;
private var camRange : float = -1.0;
private var currCamPos : Vector3 = Vector3(-1,-1,-1);





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



function Awake() {

	moduleObject = GameObject.Find("SUIMONO_Module").gameObject.GetComponent(SuimonoModule);
	rendererComponent = GetComponent(Renderer);

}


function OnDrawGizmos (){
	gizPos = transform.position;
	gizPos.y += 0.03;
	Gizmos.DrawIcon(gizPos, "gui_icon_buoy.psd", true);
	gizPos.y -= 0.03;

	//Gizmos.color = Color(0.2,0.4,1.0,0.75);
	//Gizmos.DrawWireSphere(gizPos, 0.2);
	//Gizmos.DrawWireSphere(gizPos, 0.195);
	//Gizmos.DrawWireSphere(gizPos, 0.19);
}

function Start(){

	//get number of buoyant objects
	if (applyToParent){
		var buoyancyObjects : Component[];
		buoyancyObjects = transform.parent.gameObject.GetComponentsInChildren(fx_buoyancy);
		if (buoyancyObjects != null){
			splitFac = 1.0/buoyancyObjects.Length;
		}
	}


    staggerOffset++;
    stagger = (staggerOffset+0f) *0.05f  ;
    staggerOffset = staggerOffset % staggerModulus;
    
	InvokeRepeating("SetUpdate",0.1+stagger,updateSpeed);
	//InvokeRepeating("SetUpdate",0.1,1.0/12.0);
}


function Update(){

	//if (setUpdateSpeed != updateSpeed){
		//setUpdateSpeed = updateSpeed;
		//CancelInvoke("SetUpdate");
		//InvokeRepeating("SetUpdate",0.1,updateSpeed);
	//}

}






function SetUpdate () {

	//check activations
	performHeight = true;
	if (physTarget != null && moduleObject.setCamera != null){
	
		//check for range activation
		currRange = Vector3.Distance(moduleObject.setCamera.transform.position, physTarget.transform.position);
		if (currRange >= activationRange){
			performHeight = false;
		}
		
		//check for frustrum activation
		camRange = 0.2;
		if (moduleObject != null){
		if (moduleObject.setCameraComponent != null){
			currCamPos = moduleObject.setCameraComponent.WorldToViewportPoint(physTarget.transform.position);
			if (currCamPos.x > (1.0+camRange) || currCamPos.y > (1.0+camRange)){
				performHeight = false;
			}
			if (currCamPos.x < (0.0-camRange) || currCamPos.y < (0.0-camRange)){
				performHeight = false;
			}
		}
		}
		//check for enable activation
		if (!isEnabled){
			performHeight = false;
		}
	}
	

	//perform height check
	if (performHeight){
		// Get all height variables from Suimono Module object
		heightValues = moduleObject.SuimonoGetHeightAll(this.transform.position);
		isOver = heightValues[4];
		waveHt = heightValues[8];
		surfaceLevel = heightValues[1];
		forceAngles = moduleObject.SuimonoConvertAngleToDegrees(heightValues[6]);
		forceSpeed = heightValues[7]*0.1;
	}


	//clamp variables
	forceHeightFactor = Mathf.Clamp(forceHeightFactor,0.0,1.0);
	
	//set debug visibility
	if (rendererComponent && applyToParent){
	if (moduleObject != null){
		if (moduleObject.showDebug){
			rendererComponent.enabled = true;
		}
	
		if (!moduleObject.showDebug && rendererComponent){
			rendererComponent.enabled = false;
		}
	}
	}


	//set physics target
	if (applyToParent){
		physTarget = this.transform.parent.transform;
		if (physTarget != null){
		if (rigidbodyComponent == null){
			rigidbodyComponent = physTarget.GetComponent(Rigidbody);
		}}
	} else {
		physTarget  = this.transform;
		if (physTarget != null){
		if (rigidbodyComponent == null){
			rigidbodyComponent = GetComponent(Rigidbody);
		}}
	}
	

	//Reset values
	isUnderwater = false;
	underwaterLevel = 0.0;


	//calculate scaling
	testObjectHeight = (transform.position.y+buoyancyOffset);
	
		waveHeight = surfaceLevel;
		if (testObjectHeight < waveHeight){
			isUnderwater = true;
		}
		underwaterLevel =  waveHeight-testObjectHeight;


	//set buoyancy
	if (engageBuoyancy && isOver == 1.0){
	if (rigidbodyComponent && !rigidbodyComponent.isKinematic){
			
			buoyancyFactor = 10.0;

			if (this.transform.position.y+buoyancyOffset < waveHeight-surfaceRange){
				
				// add vertical force to buoyancy while underwater
				isUnder = true;
				forceMod = (buoyancyFactor * (buoyancyStrength * rigidbodyComponent.mass) * (underwaterLevel) * splitFac);
				if (rigidbodyComponent.velocity.y < maxVerticalSpeed){
					rigidbodyComponent.AddForceAtPosition(Vector3(0,1,0) * forceMod, transform.position);
				}
				modTime = 0.0;
				
			} else {
				
				// slow down vertical velocity as it reaches water surface or wave zenith
				isUnder = false;
				modTime = (this.transform.position.y+buoyancyOffset) / (waveHeight+Random.Range(0.0,0.25));
				if (rigidbodyComponent.velocity.y > 0.0){
					rigidbodyComponent.velocity.y = Mathf.SmoothStep(rigidbodyComponent.velocity.y,0.0,modTime);
				}
			}
			
			
			//Add Water Force / Direction to Buoyancy Object
			if (inheritForce){
			if (this.transform.position.y+buoyancyOffset <= waveHeight){
				waveFac = Mathf.Lerp(0.0,forceHeightFactor,waveHt);
				if (forceHeightFactor == 0.0) waveFac = 1.0;
				rigidbodyComponent.AddForceAtPosition(Vector3(forceAngles.x,0,forceAngles.y) * (buoyancyFactor*2.0) * forceSpeed * waveFac * splitFac * forceAmount, transform.position);
			}
			}
			
	}
	}

}


// Turned off for now
//function LateUpdate(){
//	if (keepAtSurface){
		//rigidbodyComponent.isKinematic = true;
		//rigidbodyComponent.useGravity = false;
		//physTarget.transform.position.y = (waveHeight - (this.transform.localPosition.y));
//	}
//}



function OnDisable(){
	isEnabled = false;
	CancelInvoke("SetUpdate");
}

function OnEnable(){

	isEnabled = true;

    staggerOffset++;
    stagger = (staggerOffset+0f) *0.05f  ;
    staggerOffset = staggerOffset % staggerModulus;
    
	CancelInvoke("SetUpdate");
	InvokeRepeating("SetUpdate",0.1+stagger,updateSpeed);
}