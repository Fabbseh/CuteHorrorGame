#pragma strict

import System.Collections.Generic;
@script ExecuteInEditMode()

enum Sui_FX_ClampType{
		none,atSurface,belowSurface,aboveSurface
		}
	
		
//PUBLIC VARIABLES
var effectsLabels : String[];
var effectsSystems : Transform[];
var systemClampType : Sui_FX_ClampType[];
var fxObjects : Transform[];


//editor
var clampIndex : int[];
var clampOptions = new Array("No Clamp","Clamp to Surface","Keep Below Surface","Keep Above Surface"
	);
	
//PRIVATE VARIABLES
private var fxParentObject : Transform;
private var moduleObject : SuimonoModule;

private var updateTimer : float = 0.0;
private var resetSystems : boolean = false;

var particleReserve : List.<ParticleSystem.Particle> = new List.<ParticleSystem.Particle>();

//collect for GC
private var fx : int;
private var px : int;
private var currPXWaterPos : float;
private var useParticleComponent : ParticleSystem;
private var setParticles : ParticleSystem.Particle[];
private var tempSystems : Transform[];
private var tempClamp : int[];
private var aR : int;
private var efx : int;
private var epx : int;
private var sx : int;
private var endLP : int;
private var setInt : int;

public var sysNames = new Array();
public var sN : int;
public var s: int;
public var setName : String;



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



function Start () {
	
	//set objects
	fxParentObject = this.transform.Find("_particle_effects");
	moduleObject = this.transform.GetComponent(SuimonoModule) as SuimonoModule;
	
	
	//instantiate systems
	if (Application.isPlaying){
	if (effectsSystems.Length > 0 && fxParentObject != null){
		var instPos : Vector3 = transform.position;
		instPos.y = -10000.0;
		fxObjects = new Transform[effectsSystems.Length];

		for (var fx=0; fx < (effectsSystems.Length); fx++){
			var fxObjectPrefab = Instantiate(effectsSystems[fx], instPos, transform.rotation);
			fxObjectPrefab.transform.parent = fxParentObject.transform;
			fxObjects[fx] = (fxObjectPrefab);
		}
	}
	}
	
	//do clamp checks at 6fps
    staggerOffset++;
    stagger = (staggerOffset+0f) *0.05f  ;
    staggerOffset = staggerOffset % staggerModulus;
    
    
	var clampSpeed = 1.0/4.0;
	InvokeRepeating("ClampSystems",0.15+stagger,clampSpeed);
	InvokeRepeating("UpdateSystems",0.2+stagger,1.0);
}




function Update () {

	//get objects while in editor mode
	#if UNITY_EDITOR
	if (!Application.isPlaying){
		if (moduleObject == null){
		if (GameObject.Find("SUIMONO_Module")){
			moduleObject = GameObject.Find("SUIMONO_Module").GetComponent(SuimonoModule) as SuimonoModule;
		}
		}
	}
	#endif
	


	if (!Application.isPlaying){	
		sysNames.Push("None");
		for (sN = 0; sN < effectsSystems.Length; sN++){
			setName = "---";
			if (effectsSystems[sN] != null) setName = effectsSystems[sN].transform.name;
				for (s = 0; s < sN; s++){
					setName += " ";
				}
			sysNames.Push(setName);
		}
	}
	
	
}



function UpdateSystems(){

	if (Application.isPlaying){	
		sysNames.Push("None");
		for (sN = 0; sN < effectsSystems.Length; sN++){
			setName = "---";
			if (effectsSystems[sN] != null) setName = effectsSystems[sN].transform.name;
				for (s = 0; s < sN; s++){
					setName += " ";
				}
			sysNames.Push(setName);
		}
	}

}





function ClampSystems(){

	for (fx = 0; fx < fxObjects.Length; fx++){
		if (fxObjects[fx] != null){
		if (clampIndex[fx] != 0){

			currPXWaterPos = 0.0;
			
			//get particles
			useParticleComponent = fxObjects[fx].GetComponent(ParticleSystem);
			if (setParticles == null) setParticles = new ParticleSystem.Particle[useParticleComponent.particleCount];
			useParticleComponent.GetParticles(setParticles);
			//set particles
			if (useParticleComponent.particleCount > 0.0){
			for (px = 0; px < useParticleComponent.particleCount; px++){
				//Clamp to Surface
				if (clampIndex[fx] == 1){
					currPXWaterPos = moduleObject.SuimonoGetHeight(setParticles[px].position,"surfaceLevel");
					setParticles[px].position.y = currPXWaterPos+0.2;
				}
				//Clamp Under Water
				if (clampIndex[fx] == 2){
					currPXWaterPos = moduleObject.SuimonoGetHeight(setParticles[px].position,"surfaceLevel");
					if (setParticles[px].position.y > currPXWaterPos-0.2) setParticles[px].position.y = currPXWaterPos-0.2;
				}
				//Clamp Above Water
				if (clampIndex[fx] == 3){
					currPXWaterPos = moduleObject.SuimonoGetHeight(setParticles[px].position,"surfaceLevel");
					if (setParticles[px].position.y < currPXWaterPos+0.2) setParticles[px].position.y = currPXWaterPos+0.2;
				}
			}
			useParticleComponent.SetParticles(setParticles,setParticles.length);
			useParticleComponent.Play();
			}	
		}
		}

	}
	
	
}






function AddSystem(){
	tempSystems  = effectsSystems;
	tempClamp  = clampIndex;
	
	//if (effectsSystems == null) effectsSystems = new Transform[tempSystems.Length+1];
	//if (clampIndex == null) clampIndex = new int[tempClamp.Length+1];
	effectsSystems = new Transform[tempSystems.Length+1];
	clampIndex = new int[tempClamp.Length+1];
		
	for (aR = 0; aR < tempSystems.Length; aR++){
		effectsSystems[aR] = tempSystems[aR];
		clampIndex[aR] = tempClamp[aR];
	}
	effectsSystems[tempSystems.Length] = null;
	clampIndex[tempClamp.Length] = 0;
}





function AddParticle( particleData : ParticleSystem.Particle){

	particleReserve.Add(particleData);
	//fxObjects[Mathf.Floor(particleData.angularVelocity)].GetComponent(ParticleSystem).Emit(1);
	
}


function updateFX(){
	
	//EMIT New Particles
	for (efx = 0; efx < effectsSystems.length; efx++){
		for (epx = 0; epx < particleReserve.Count; epx++){
			if (Mathf.Floor(particleReserve[epx].angularVelocity) == efx){
				fxObjects[efx].GetComponent(ParticleSystem).Emit(1);
			}
		}				
	}
	
	
	//YIELD Systems till end of frame
	//This is a Unity particels system behavior fudge... maybe someday they fix this?(hope)
	//yield new WaitForEndOfFrame();

	//SET NEW Particle position and behaviors
	for (fx = 0; fx < effectsSystems.length; fx++){
		for (px = 0; px < particleReserve.Count; px++){
			if (Mathf.Floor(particleReserve[px].angularVelocity) == fx){

				//get particles
				useParticleComponent = fxObjects[fx].GetComponent(ParticleSystem);
				if (setParticles == null) setParticles = new ParticleSystem.Particle[useParticleComponent.particleCount];
				useParticleComponent.GetParticles(setParticles);
				//set particles
				for (sx = (useParticleComponent.particleCount-1); sx < useParticleComponent.particleCount; sx++){
					//set position
					setParticles[px].position = particleReserve[px].position;
					//set variables
					setParticles[px].size = particleReserve[px].size;
					setParticles[px].rotation = particleReserve[px].rotation;
					setParticles[px].velocity = particleReserve[px].velocity;
				}

				useParticleComponent.SetParticles(setParticles,setParticles.length);
			}
		}						
	}

	yield;
	if (particleReserve == null) particleReserve = new List.<ParticleSystem.Particle>();
	
}








function DeleteSystem(sysNum : int){

	tempSystems  = effectsSystems;
 	tempClamp  = clampIndex;
 	
	endLP = tempSystems.Length-1;
	if (endLP <= 0){
		endLP = 0;
		
		if (effectsSystems == null) effectsSystems = new Transform[tempSystems.Length+1];
		if (clampIndex == null) clampIndex = new int[tempSystems.Length+1];
		
	} else {

		if (effectsSystems == null) effectsSystems = new Transform[endLP];
		if (clampIndex == null) clampIndex = new int[endLP];

		setInt = -1;
		for (aR = 0; aR < endLP; aR++){
			if (aR != sysNum){
				setInt += 1;
			} else {
				setInt += 2;
			}
			
			if (setInt < tempSystems.Length){
				effectsSystems[aR] = tempSystems[setInt];
				clampIndex[aR] = tempClamp[setInt];

			}
		}
	}
}


function OnApplicationQuit(){

	for (fx=0; fx < (effectsSystems.Length); fx++){
		Destroy(fxObjects[fx]);
	}

}




