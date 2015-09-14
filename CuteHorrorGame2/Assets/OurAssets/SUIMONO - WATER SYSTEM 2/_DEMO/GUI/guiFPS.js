#pragma strict

var showLabel : Texture2D;
var labelOffset : Vector2 = Vector2(0.5,0.5);
var labelColor : Color = Color(1,1,1,1);

private var updateInterval = 0.3;
private var GuiMsg : String = "---";
private var VerMsg : String = "---";
private var accum : float = 0.0; // FPS accumulated over the interval
private var frames : float  = 0; // Frames drawn over the interval
private var timeleft : float; // Left time for current interval

private var moduleObject : SuimonoModule;
private var oceanObject : SuimonoObject;

private var displayMode : String = "---";
private var inputKeyMode : boolean = false;
private var currentMode : int;
private var useMode : int;

private var displayPreset : String = "---";
private var inputKeyPreset : boolean = false;
private var currentPreset : int;
private var currentPresetFile : int;
private var usePreset : int;



function Awake(){
	moduleObject = GameObject.Find("SUIMONO_Module").gameObject.GetComponent("SuimonoModule") as SuimonoModule;
	oceanObject = GameObject.Find("SUIMONO_Surface_Ocean").gameObject.GetComponent("SuimonoObject") as SuimonoObject;
}

function Start () {
	useMode = moduleObject.unityVersionIndex;
	currentMode = useMode;
	currentPreset = oceanObject.presetIndex;
	currentPresetFile = oceanObject.presetFileIndex;
}




function Update () {

	//GET Version Number
	if (moduleObject != null){
		VerMsg = "|  Ver. "+moduleObject.suimonoVersionNumber;
	}


	// CALCULATE FPS
    timeleft -= Time.deltaTime;
    accum += Time.timeScale/Time.deltaTime;
    ++frames;
   
    // Interval ended - update GUI text and start new interval
    if( timeleft <= 0.0 )
    {
        // display two fractional digits (f2 format)
        GuiMsg = "FPS: "+(accum/frames).ToString("f0");
        timeleft = updateInterval;
        accum = 0.0;
        frames = 0;
        
    }



	//---------------------------
	//####  MODE SWITCHING  ####
	//---------------------------
	//Get Keys
	inputKeyMode = Input.GetKeyUp("1");
	
	if (moduleObject.unityVersionIndex == 0) displayMode = "Unity DX9";
	if (moduleObject.unityVersionIndex == 1) displayMode = "Unity DX11";

	
	//Handle Mode Switch
	if (inputKeyMode){
		currentMode += 1;
		if (currentMode > 1) currentMode = 0;
	}
	if (useMode != currentMode){
		useMode=currentMode;
		moduleObject.unityVersionIndex = useMode;
	}

	
	//----------------------------------
	//####  OCEAN PRESET SWITCHING  ####
	//----------------------------------
	//Get Keys
	inputKeyPreset = Input.GetKeyUp("2");

	if (usePreset == 0) displayPreset = "clear blue";
	if (usePreset == 1) displayPreset = "deep dark wave";
	if (usePreset == 2) displayPreset = "caribbean blue";
	if (usePreset == 3) displayPreset = "thick mud";
	if (usePreset == 4) displayPreset = "swimming pool";
		
	//Handle Mode Switch
	if (inputKeyPreset){
		currentPreset += 1;
		if (currentPreset > 4) currentPreset = 0;
	}
	if (usePreset != currentPreset){
		usePreset=currentPreset;
		if (usePreset == 0) oceanObject.SuimonoSetPreset(1,0);
		if (usePreset == 1) oceanObject.SuimonoSetPreset(1,1);
		if (usePreset == 2) oceanObject.SuimonoSetPreset(1,3);
		if (usePreset == 3) oceanObject.SuimonoSetPreset(0,6);
		if (usePreset == 4) oceanObject.SuimonoSetPreset(0,7);
	}
		
	
}



function OnGUI(){

	GUI.color = Color(0.0,0.0,0.0,1.0);
	GUI.Label (Rect (15, 10, 600, 20), "SUIMONO 2.0 - Interactive Water System for Unity");
	GUI.Label (Rect (323, 10, 200, 20), VerMsg);
	
	GUI.color = Color(1.0,0.45,0.0,1.0);
	GUI.Label (Rect (15, 26, 100, 20), GuiMsg);

	GUI.color = Color(1.0,0.45,0.0,1.0);
	GUI.Label (Rect (90, 26, 150, 20), "Mode: "+displayMode);

	GUI.color = Color(1.0,0.45,0.0,1.0);
	GUI.Label (Rect (250, 26, 250, 20), "Preset: "+displayPreset);

	
	if (showLabel != null){
		GUI.color = labelColor;
		GUI.Label(Rect (15,53, showLabel.width,showLabel.height), showLabel);
	}
	 		
	 		
}
