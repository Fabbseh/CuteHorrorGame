#pragma strict

var requireLineOfSight : boolean = true;

enum Sui_Demo_TriggerType{
		switchtovehicle,
		watersurface
		}
var triggerType : Sui_Demo_TriggerType =  Sui_Demo_TriggerType.switchtovehicle;


var showDot : Texture2D;
var showIcon : Texture2D;
var backgroundImage : Texture2D;
var label : String = "";
var labelColor : Color = Color(0,0,0,1);
var dotOffset : Vector2 = Vector2(0.5,0.5);
var labelOffset : Vector2 = Vector2(0.5,0.5);
var actionKey : String = "f";
var requireReset : boolean = true;
var trackObject : Transform;
var fadeSpeed : float = 0.0;
var checkDistance : float = 200.0;

private var CM : sui_demo_ControllerMaster;
private var moduleObject : SuimonoModule;
//private var suimonoCamera : sui_demo_Controller2;
private var isInRange : boolean = false;
private var onLabel : boolean = false;
private var onAction = false;
private var resetTrigger : boolean = false;
private var useLabel : String = "";
private var style : GUISkin;
private var fadeTimer : float = 0.0;
private var isInSight : boolean = false;
private var enableAction : boolean = false;
private var savedPos : Vector3 = Vector3(0,0,0);


function Start () {

	// Object References
	if (GameObject.Find("SUIMONO_Module")){
		moduleObject = GameObject.Find("SUIMONO_Module").GetComponent(SuimonoModule) as SuimonoModule;
		//suimonoCamera = moduleObject.setCamera.gameObject.GetComponent(sui_demo_Controller2) as sui_demo_Controller2;
		//trackObject = suimonoCamera.characterTarget;
	}

	CM = GameObject.Find("_CONTROLLER").GetComponent("sui_demo_ControllerMaster") as sui_demo_ControllerMaster;
	
}



function FixedUpdate () {
	
	
	//if (!resetTrigger){
	
	//set default label
	useLabel = label;

	//CHECK LINE OF SIGHT
	if (savedPos != GetComponent.<Camera>().main.transform.position){
		savedPos = GetComponent.<Camera>().main.transform.position;
		isInSight = CheckLineOfSight();
	}
	
	//CHECK RANGE
	isInRange = false;
	if (Vector3.Distance(this.transform.position,trackObject.transform.position) <= (checkDistance*0.75)) isInRange = true;
	
	//ENABLE ACTION
	enableAction = false;
	if (isInRange && !requireLineOfSight){
		enableAction = true;
	} else if (isInRange && requireLineOfSight && isInSight){
		enableAction = true;
	}
		
	//CHECK FOR ACTION KEY
	onAction = false;
	if (Input.GetKeyUp(actionKey) && enableAction){
		onAction = true;
	}
	
	
	//PERFORM TRIGGER ACTIONS
	if (onAction){
		useLabel = "";
		onAction= false;
		//enableAction = false;
		if (requireReset) resetTrigger = true;

		//switch controller type
		if (triggerType == Sui_Demo_TriggerType.switchtovehicle){
		if (CM != null){
			if (CM.currentControllerType == Sui_Demo_ControllerType.character){
				CM.currentControllerType = Sui_Demo_ControllerType.boat;
			} else if (CM.currentControllerType == Sui_Demo_ControllerType.boat){
				CM.currentControllerType = Sui_Demo_ControllerType.character;
			}
		}
		}
		
		
		
	}
	

	if (enableAction == true){
		fadeTimer = Mathf.Lerp(fadeTimer,0.8,Time.deltaTime * fadeSpeed * 1.0);
	} else {
		fadeTimer = Mathf.Lerp(fadeTimer,0.0,Time.deltaTime * fadeSpeed * 1.0);
	}
		
	if (isInRange == true){
		if (GetComponent.<Renderer>()) GetComponent.<Renderer>().material.SetColor("_TintColor",Color(0,1,0,0.1));
	} else {
		if (GetComponent.<Renderer>()) GetComponent.<Renderer>().material.SetColor("_TintColor",Color(0.5,0,0,0.1));
	}


}






function CheckLineOfSight(){
	var retBool : boolean = false;
	
	if (requireLineOfSight && Camera.main != null){
	
		//get character distance
		var charDistance : float = 0.0;
		var chits : RaycastHit[];
		var rand : Vector2 = Vector2(0,0);
		var cray : Ray;

			//rand.x += Random.Range(-0.4,0.4);
			//rand.y += Random.Range(-0.4,0.4);
			//cray = Camera.main.ViewportPointToRay(Vector3(0.5+rand.x,0.5+rand.y,0));
			
			cray.origin = Camera.main.transform.position;
			cray.direction = Camera.main.transform.forward;
			//cray.direction.x += rand.x;
			//cray.direction.y += rand.y;
			
			chits = Physics.RaycastAll(cray,1000.0);
			for (var c = 0;c < chits.Length; c++) {
				var chit : RaycastHit = chits[c];
				var ccoll =  chit.collider;
				if (ccoll) {
					if (ccoll == trackObject.GetComponent(Collider)) charDistance = chit.distance;
				}
			}
			
			//get trigger distance
			var hits : RaycastHit[];
			//var ray : Ray = Camera.main.ViewportPointToRay (Vector3(0.5,0.5,0));
			hits = Physics.RaycastAll(cray,checkDistance+charDistance);
			
			for (var i = 0;i < hits.Length; i++) {
				var hit : RaycastHit = hits[i];
				var coll =  hit.collider;
				if (coll) {
					if (coll == this.GetComponent.<Collider>()) retBool = true;
				}
			}
	}

	return retBool;
}



function OnGUI(){

	//if (onLabel && !resetTrigger){
	if (fadeTimer > 0.0){

	 	//GUI.color = Color(1.0,1.0,1.0,fadeTimer);
	 	if (useLabel != ""){
	 		if (backgroundImage != null){
	 		//	GUI.color = Color(0,0,0,fadeTimer);
	 		//	GUI.Label(Rect (0, Screen.height*labelOffset.y+12, backgroundImage.width,backgroundImage.height), backgroundImage);
	 		}
	 			
	 		var texLength : int = (useLabel.Length * 6)+5;
	 		GUI.color = Color(0,0,0,fadeTimer);
	 		GUI.Label(Rect ((Screen.width*labelOffset.x)-(texLength*0.5)+8, Screen.height*labelOffset.y+21, texLength, 20), useLabel);
	 		GUI.color = Color(labelColor.r,labelColor.g,labelColor.b,fadeTimer);
	 		GUI.Label(Rect ((Screen.width*labelOffset.x)-(texLength*0.5)+7, Screen.height*labelOffset.y+20, texLength, 20), useLabel);
	 		
	 		if (showIcon != null){
	 			GUI.color = Color(labelColor.r,labelColor.g,labelColor.b,fadeTimer);
	 			GUI.Label(Rect ((Screen.width*labelOffset.x)-(texLength*0.8)+7, Screen.height*labelOffset.y+16, showIcon.width,showIcon.height), showIcon);
	 			
	 			GUI.color = Color(0,0,0,fadeTimer);
	 			GUI.Label(Rect ((Screen.width*labelOffset.x)-(texLength*0.8)+16, Screen.height*labelOffset.y+20, 20, 30), actionKey.ToUpper());
	 		}
	 	
	 	}

	 	if (showDot != null){
			//GUI.color = Color(labelColor.r,labelColor.g,labelColor.b,fadeTimer);
	 		//GUI.Label(Rect (Screen.width*dotOffset.x, Screen.height*dotOffset.y, showIcon.width,showIcon.height), showDot);
	 	}
	
	}
	
}
