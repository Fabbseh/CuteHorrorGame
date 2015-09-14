#pragma strict

var cameraObject : Transform;
enum Sui_Demo_ControllerType{
		none,character, boat
		}
var currentControllerType : Sui_Demo_ControllerType =  Sui_Demo_ControllerType.character;
private var characterController : sui_demo_ControllerCharacter;
private var boatController : sui_demo_ControllerBoat;
private var resetController : boolean = false;
private var useController : Sui_Demo_ControllerType = currentControllerType;

function Start () {

	characterController = this.gameObject.GetComponent("sui_demo_ControllerCharacter") as sui_demo_ControllerCharacter;
	boatController = this.gameObject.GetComponent("sui_demo_ControllerBoat") as sui_demo_ControllerBoat;
	
}




function LateUpdate () {

	//check for reset
	if (currentControllerType != useController){
		resetController = true;
	} else {
		resetController = false;
	}
	
	
	//set controller to none
	if (currentControllerType == Sui_Demo_ControllerType.none){
		if (characterController != null) characterController.isActive = false;
		if (boatController != null) boatController.isActive = false;
	}
	
	//set controller to character
	if (currentControllerType == Sui_Demo_ControllerType.character){
		if (boatController != null) boatController.isActive = false;
		if (characterController != null) characterController.isActive = true;
	}

	//set controller to boat
	if (currentControllerType == Sui_Demo_ControllerType.boat){
		if (characterController != null) characterController.isActive = false;
		if (boatController != null) boatController.isActive = true;
	}




	//Place Charcter in Boat Object
	if (characterController != null){
		if (currentControllerType == Sui_Demo_ControllerType.boat){
			characterController.isInBoat = true;
			//characterController.cameraTarget.transform.parent = boatController.cameraTarget.transform;
			characterController.cameraTarget.transform.position = boatController.targetAnimator.playerPosition.transform.position;
			characterController.cameraTarget.transform.rotation = boatController.targetAnimator.playerPosition.transform.rotation;
			characterController.cameraTarget.gameObject.GetComponent(Collider).enabled = false;
			characterController.cameraTarget.gameObject.GetComponent(Rigidbody).isKinematic = true;
		}
		if (currentControllerType == Sui_Demo_ControllerType.character && resetController){
			characterController.isInBoat = false;
			//characterController.cameraTarget.transform.parent = null;
			characterController.cameraTarget.transform.position = boatController.targetAnimator.playerExit.transform.position;
			characterController.cameraTarget.gameObject.GetComponent(Collider).enabled = true;
			characterController.cameraTarget.gameObject.GetComponent(Rigidbody).useGravity = true;
			characterController.cameraTarget.gameObject.GetComponent(Rigidbody).isKinematic = false;
		}
	}
	
	//reset
	if (resetController){
		resetController = false;
		useController = currentControllerType;
	}
}
