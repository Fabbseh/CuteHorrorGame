#pragma strict

var propObject : GameObject;
//var engineObject : GameObject;
var rudderObject : GameObject;
var propellerSpeed : float = 0.0;
var engineRotation : float = 0.0;

var playerPosition : Transform;
var playerExit : Transform;

var audioEngineStart : AudioClip;
var audioEngineStop : AudioClip;
var audioEngineIdle : AudioClip;
var audioEngineRev : AudioClip;
var audioEngineRevHigh : AudioClip;
var audioEngineRevAbove : AudioClip;

var behaviorIsOn : boolean = false;
var behaviorIsInWater : boolean = false;
var behaviorIsRevving : boolean = false;
var behaviorIsRevvingBack : boolean = false;
var behaviorIsRevvingHigh : boolean = false;

private var audioObjectA : AudioSource;
private var audioObjectB : AudioSource;
private var useClip : AudioClip;
private var currentClip : AudioClip;
private var engineRot : float = 90.0;
private var isOn : boolean = false;
private var onTime : float = 0.0;
private var propSpd : float = 0.0;


function Awake () {
	
	//audioObjectA = this.transform.Find("BoatAudioObjectA").GetComponent(AudioSource) as AudioSource;
	//audioObjectB = this.transform.Find("BoatAudioObjectB").GetComponent(AudioSource) as AudioSource;

	//create audio objects
	var audioObja : GameObject = new GameObject();
	audioObja.name = "BoatAudioObjectA";
	audioObja.AddComponent.<AudioSource>();
	audioObja.transform.position = this.transform.position;
	audioObja.transform.parent = this.transform;
	audioObjectA = audioObja.GetComponent(AudioSource) as AudioSource;
	//audioObja = null;

	var audioObjb : GameObject = new GameObject();
	audioObjb.name = "BoatAudioObjectB";
	audioObjb.AddComponent.<AudioSource>();
	audioObjb.transform.position = this.transform.position;
	audioObjb.transform.parent = this.transform;
	audioObjectB = audioObjb.GetComponent(AudioSource) as AudioSource;

	//audioObjb = null;

}



function LateUpdate () {
		
		//Handle Rudder Rotation
		if (rudderObject != null){
			//engineRotation = Mathf.Clamp(engineRotation,0.0,1.0);
			//engineRot += Mathf.Lerp(30.0,150.0,engineRotation);
			if (engineRotation == 0.0){
				engineRot = Mathf.Lerp(engineRot,90.0,Time.deltaTime*2.5);
			} else {
				engineRot = Mathf.Lerp(engineRot,(90.0-(60.0*engineRotation)),Time.deltaTime);
			}
			rudderObject.transform.localEulerAngles.y = engineRot;
		}
		
	
		//Handle Propeller Rotation
		if (propObject != null){
			propSpd = 0.0;
			if (behaviorIsOn){
				propSpd = 200.0;
				if (behaviorIsRevving) propSpd = 1200.0;
				if (behaviorIsRevvingHigh) propSpd = 3000.0;
				if (behaviorIsRevvingBack) propSpd = -800.0;
			}
			propellerSpeed = Mathf.Lerp(propellerSpeed,propSpd,Time.deltaTime);
			propObject.transform.localEulerAngles.z += Time.deltaTime * propellerSpeed;
		}
		
		
		//Handle Audio
		if (audioObjectA != null && audioObjectB != null){
		
			//setup audio systems
			var fadeSpeed = 1.0;
			//audioObjectA.loop = true;
			//audioObjectB.loop = true;
			audioObjectA.minDistance = 10.0;
			audioObjectA.maxDistance = 30.0;
			audioObjectB.minDistance = 10.0;
			audioObjectB.maxDistance = 30.0;
			
			
			//HANDLE AUDIO CLIPS
			if (behaviorIsOn){
				
				//Select Clips based on behavior
				audioObjectA.loop = true;
				audioObjectB.loop = true;
				
				if (isOn){
					
					useClip = audioEngineIdle;
					
					if (behaviorIsRevving){
						
						fadeSpeed = 10.0;
						if (currentClip == audioEngineRevAbove) fadeSpeed = 10.0;
						if (currentClip == audioEngineRevHigh) fadeSpeed = 10.0;
						useClip = audioEngineRev;
						
						if (behaviorIsRevvingHigh){
							fadeSpeed = 10.0;
							useClip = audioEngineRevHigh;
						}
						
						//if (!behaviorIsInWater){
						//	fadeSpeed = 10.0;
						//	useClip = audioEngineRevAbove;
						//}
					
					}
				}
				if (!isOn){
					//handle turn on sequence
					onTime += Time.deltaTime;
					if (onTime >= 1.0) isOn = true;
					fadeSpeed = 10.0;
					useClip = audioEngineStart;
				}
				
			} else {
			
				//handle turn off sequence
				audioObjectA.loop = false;
				audioObjectB.loop = false;
				if (isOn){
					
					onTime -= Time.deltaTime;
					if (onTime <= -0.5) isOn = false;
					
					fadeSpeed = 10.0;
					useClip = audioEngineStop;
				} else {
					onTime = 0.0;
					isOn = false;
					if (audioObjectA.isPlaying) audioObjectA.Stop();
					if (audioObjectB.isPlaying) audioObjectB.Stop();
				}
			}

			//switch clips clip
			if (currentClip != useClip){
				audioObjectA.Stop();
				audioObjectA.clip = useClip;
				audioObjectA.volume = 0.0;
				audioObjectB.Stop();
				audioObjectB.clip = currentClip;
				audioObjectB.volume = 1.0;
				currentClip = useClip;
			}
			
			//fade clips
			audioObjectA.volume = Mathf.Lerp(audioObjectA.volume,1.0,Time.deltaTime * fadeSpeed);
			audioObjectB.volume = Mathf.Lerp(audioObjectB.volume,0.0,Time.deltaTime * fadeSpeed);
			
			//play clips
			if (behaviorIsOn || isOn){
				if (!audioObjectA.isPlaying) audioObjectA.Play();
				if (!audioObjectB.isPlaying) audioObjectB.Play();
			}
		}
		
	
}