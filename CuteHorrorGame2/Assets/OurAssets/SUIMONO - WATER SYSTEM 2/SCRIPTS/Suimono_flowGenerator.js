#pragma strict

var generateOnStart : boolean = true;
var generateMap : boolean = false;

var autoGenerateFPS : float = 0.0;

var resolutionScale : int = 50;

var shoreRange : float = 3.0;
var waveRange : float = 10.0;
var detectLayers : LayerMask;

var shoreMapTex : Texture2D;
var parentMesh : Mesh;

private var autoTimer : float = 0.0;
//private var waveObject : Suimono_waveGenerator;

private var parentObject : SuimonoObject;
private var renderObject : GameObject;
private var rendererComponent : Renderer;

//collect for GC
private var vertices : Vector3[];
private var ppos : Vector2[];
private var wcolors : float[];
private var scolors : float[];
private var bounds : Bounds;
private var sideLength :int;
private var meshWidth : int;
private var meshHeight : int;
private var ht : RaycastHit;
private var setDistance : float;
private var setDistance2 : float;	
private var i : int;
private var startPos : Vector3;
private var scaleAmtX : float;
private var scaleAmtY : float;
private var xP : int;
private var yP : int;
private var testPos : Vector3;
private var useInf : float;
private var tstpos : Vector3;
private var tstpos2 : Vector3;
private var isFXObject : boolean;
private var useWaveInfluencer : fx_waveInfluencer;
private var useOutward : boolean;

private var isGenerating : boolean = false;



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
	
	//get parent object and mesh
	parentObject = this.transform.parent.GetComponent("SuimonoObject") as SuimonoObject;
	renderObject = this.transform.parent.gameObject.Find("Suimono_Object").gameObject;
	if (renderObject.gameObject.GetComponent(MeshFilter)){
		parentMesh = renderObject.gameObject.GetComponent(MeshFilter).sharedMesh;
	}
	rendererComponent = renderObject.GetComponent(Renderer);
	if (generateOnStart) Generate2();


    staggerOffset++;
    stagger = (staggerOffset+0f) *0.05f  ;
    staggerOffset = staggerOffset % staggerModulus;
    
	InvokeRepeating("SetUpdate",0.1+stagger,0.1);
	
}



function SetUpdate() {

	if (autoGenerateFPS > 0.0){
		autoTimer += Time.deltaTime;
		if (autoTimer >= autoGenerateFPS){
			autoTimer = 0.0;
			generateMap = true;
		}
	}
	
	if (generateMap){
		shoreRange = Mathf.Clamp(shoreRange,-0.0,1000.0);
		waveRange = Mathf.Clamp(waveRange,0.0,1000.0);
		generateMap = false;
		
		if (parentObject != null){
			if (parentObject.typeIndex == 0 && this.transform.parent.transform.eulerAngles.y != 183.2475){
				this.transform.parent.transform.eulerAngles.y = 183.2475;
			}
		}
		
		Generate2();
	}
	
	//set texture to renderer position
	if (rendererComponent != null && !isGenerating){
	if (shoreMapTex != null){
		shoreMapTex.wrapMode = TextureWrapMode.Clamp;
		rendererComponent.sharedMaterial.SetTexture("_FlowMap",shoreMapTex);
		rendererComponent.sharedMaterial.SetTextureScale("_FlowMap",Vector2(1.0,1.0));
	}
	}
		
}




function ReGenerate(){
	generateMap = true;
}



function Generate2(){

	if (parentMesh){
	
		isGenerating = true;
		vertices = parentMesh.vertices;
		if (ppos == null) ppos = new Vector2[vertices.Length];
		//if (wcolors == null) wcolors = new Color[resolutionScale*resolutionScale];
		//if (scolors == null) scolors = new float[vertices.Length];
		bounds = parentMesh.bounds;

		sideLength = Mathf.Floor(Mathf.Sqrt(vertices.Length));
		meshWidth = sideLength;
		meshHeight = sideLength;
	
		shoreMapTex = null;
		shoreMapTex = new Texture2D(resolutionScale, resolutionScale);
		
		//get pixel positions
		setDistance = 0.0;
		setDistance2 = 0.0;	
		i = 0;
		startPos.x = transform.parent.transform.position.x - (transform.parent.localScale.x*20.0);
		startPos.z = transform.parent.transform.position.z - (transform.parent.localScale.z*20.0);
		
		scaleAmtX = (transform.parent.localScale.x*40.0)/resolutionScale;
		scaleAmtY = (transform.parent.localScale.z*40.0)/resolutionScale;
			
		for (xP = 0; xP <= resolutionScale; xP++){
		for (yP = 0; yP <= resolutionScale; yP++){
		
			testPos.x = startPos.x + (xP * scaleAmtX);
			testPos.z = startPos.z + (yP * scaleAmtY);
			testPos.y = transform.parent.transform.localPosition.y;

			setDistance = 0.0;
			setDistance2 = 1.0;
						
			if (Physics.Raycast (testPos, -Vector3.up, ht,1000.0, detectLayers)) {

				setDistance = ht.distance/waveRange;
				setDistance = Mathf.Clamp(setDistance,0.0,1.0);
				setDistance = 1.0-setDistance;

				setDistance2 = ht.distance/shoreRange;
				setDistance2 = Mathf.Clamp(setDistance2,0.0,1.0);
				setDistance2 = 1.0-setDistance2;
				
			}
			
			//shoreMapTex.SetPixel(resolutionScale-xP,resolutionScale-yP, Color(setDistance,setDistance2,0,1));
			shoreMapTex.SetPixel(resolutionScale-xP,resolutionScale-yP, Color(setDistance,setDistance2,0,1));
			i += 1;
			
			if (i >= 5000){
				//yield;
				i=0;
			}
		}
		}

		//apply all SetPixel calls
		shoreMapTex.Apply(true,false);
		isGenerating = false;
	}
	
	
}





//function UnloadTex(){
	//unloads unused textures to conserve memory
	//EditorUtility.UnloadUnusedAssetsIgnoreManagedReferences();
//}