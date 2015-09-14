#pragma strict
#pragma implicit
#pragma downcast

//PUBLIC VARIABLES
var enableCaustics : boolean = true;
var causticTint : Color = Color(1,1,1,1);
//var causticsOnMobile : boolean = false;
var causticRange : float = 50.0;
var sceneLightObject : Transform;
var causticObject : Transform;

var useTheseLayers : LayerMask = 0;
var causticFPS : int = 32;
var animationSpeed : float = 1.0;

var causticFrames : Texture2D[];

var manualUpdate : boolean = false;

//PUBLIC VARIABLES
public var useTex : Texture2D;


//PRIVATE VARIABLES
private var useCaustics : boolean = true;
private var maxCausticEffects : int = 30;
private var step = 40.0;
private var followObject : Transform;
private var useObject : Transform;
private var moduleObject : SuimonoModule;
private var frameIndex : int = 0;
private var currentSpeed : float = 1.0;
private var causticObjects : Transform[];
private var causticObjectsFX : fx_causticObject[];
private var hasStarted = false;

var savedPosition : Vector3;

//private var sceneLightComponent: Light;


//collect for GC
var checkPos : Vector3;
var setPX : float;
var setPY : float;
var lightPos : Vector3;
var lightDist : float;
var lx : int;
var ly : int;	
var xP : int;
var yP : int;
var posPass : boolean;
var cx : int;
var setPos : Vector3;
var causticObjectPrefab : Transform;



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
	
	//get master objects
	moduleObject = GameObject.Find("SUIMONO_Module").GetComponent(SuimonoModule);
}


	
	
function Start(){

	//use check
	useCaustics = true;

	if (moduleObject.causticObjectNum > 0){
		useCaustics = true;
	} else {
		useCaustics = false;
	}
	

	if (enableCaustics) useCaustics = true;

	
	if (useCaustics && enableCaustics){
		//instantiate caustic object pool
		if (causticObject != null){
			maxCausticEffects = moduleObject.causticObjectNum;
			causticObjects = new Transform[maxCausticEffects];
			causticObjectsFX = new fx_causticObject[maxCausticEffects];
			for (cx = 0; cx < maxCausticEffects; cx++){
				setPos = transform.position;
				setPos.y = -500.0;
				causticObjectPrefab = Instantiate(causticObject, setPos, transform.rotation);
				causticObjectPrefab.transform.parent = this.transform;
				causticObjects[cx] = (causticObjectPrefab);
				causticObjectsFX[cx] = causticObjects[cx].gameObject.GetComponent(fx_causticObject);
			}
		}
		
		//set animation scheduler
	    staggerOffset++;
	    stagger = (staggerOffset+0f) *0.05f  ;
	    staggerOffset = staggerOffset % staggerModulus;

		InvokeRepeating("CausticEffectUpdate", 0.15+stagger, (1.0 / causticFPS)); 

	}
}



//function LateUpdate () {



//}








function SetGridSpace(){	


	

	step = Mathf.Sqrt(causticRange) * (causticRange/maxCausticEffects);
	
	//reposition caustic objects from ppol
	if (useObject != null){
		checkPos = Vector3(useObject.transform.position.x,0.0,useObject.transform.position.z);
		if (Vector3.Distance(savedPosition,checkPos) >= 3.0 || !hasStarted || manualUpdate){
		
			savedPosition = checkPos;
		
			//move caustic lights into new positions
			for (xP = (savedPosition.x - causticRange); xP <= (savedPosition.x + causticRange); xP += step){
			for (yP = (savedPosition.z - causticRange); yP <= (savedPosition.z + causticRange); yP += step){
			

				for (lx = 0; lx < causticObjects.length; lx++){
				
				lightPos = Vector3(causticObjects[lx].transform.position.x,0.0,causticObjects[lx].transform.position.z);
				lightDist = Vector3.Distance(lightPos,checkPos);
				
					if (lightDist > (causticRange*0.5) || !hasStarted){
						//causticObjects[lx].transform.localEulerAngles = Vector3(90.0,0.0,0.0);
						//causticObjectsFX[lx].shiftTime = 3.0 + Random.Range(0.0,12.0);
						
						//check positions for other lights
						posPass = true;
						setPX = (Mathf.Round(xP/step))*step;
						setPY = (Mathf.Round(yP/step))*step;
						for (ly = 0; ly < causticObjects.length; ly++){
							if (causticObjects[ly].transform.position.x == setPX){
							if (causticObjects[ly].transform.position.z == setPY){
								posPass = false;
							}
							}
						}
						
						//set new position
						if (posPass || !hasStarted){
							causticObjects[lx].transform.position.x = setPX;
							causticObjects[lx].transform.position.z = setPY;
							causticObjects[lx].GetComponent(Light).intensity = 0.0;
						}

					}

				}
			
			}
			}

	
		}
	}
	
}












function CausticEffectUpdate() {
	
	if (this.enabled){
	if (animationSpeed > 0.0){
		
  		useTex = causticFrames[frameIndex];

		frameIndex += 1;
    	if (frameIndex == causticFrames.length) frameIndex = 0;

    }
    
    
    // Calculate Spacing Grid
	if (useCaustics){
		followObject = moduleObject.setTrack;
		animationSpeed = Mathf.Clamp(animationSpeed,0.001,3.0);

		//reset invoke
		//if (currentSpeed != animationSpeed){
		//	CancelInvoke();
		//	InvokeRepeating("CausticEffectUpdate", 0.0, (1.0 / (causticFPS*animationSpeed)));
		//	currentSpeed=animationSpeed;
		//}
		
		//get the current follow object from module
		if (followObject != null){
			useObject = followObject;
		} else {
			useObject = Camera.main.transform;
		}
		SetGridSpace();
		if (!hasStarted){
			//SetGridSpace();
			hasStarted = true;
			manualUpdate = true;
		}
		if (manualUpdate){
			SetGridSpace();
			manualUpdate = false;
		}
	}
	
	
    }
    
}





function OnDisabled(){
	CancelInvoke("CausticEffectUpdate");
}

function OnEnabled(){
    staggerOffset++;
    stagger = (staggerOffset+0f) *0.05f  ;
    staggerOffset = staggerOffset % staggerModulus;
    
	CancelInvoke("CausticEffectUpdate");
	InvokeRepeating("CausticEffectUpdate", 0.15+stagger, (1.0 / causticFPS)); 
}



