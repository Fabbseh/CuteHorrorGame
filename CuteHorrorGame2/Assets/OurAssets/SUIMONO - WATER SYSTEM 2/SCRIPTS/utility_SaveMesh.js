#pragma strict

@script ExecuteInEditMode()

var saveAsset : boolean = false;
var useName : String = "";

function Start () {

}



function Update () {
#if UNITY_EDITOR
	if (saveAsset && useName != ""){
		saveAsset = false;
		SaveAsset();
	}
#endif
}


function SaveAsset () {
#if UNITY_EDITOR
	var mesh : Mesh = new Mesh();
	mesh = GetComponent(MeshFilter).sharedMesh;
	mesh.name = useName;
	mesh.RecalculateNormals();
	mesh.Optimize();

	if (mesh != null){ 
		//AssetDatabase.CreateAsset(mesh, Application.dataPath+"/Test/Mesh/"+useName+".asset");
		AssetDatabase.CreateAsset(mesh, "Assets/SUIMONO - WATER SYSTEM 2/MESH/"+useName+".asset");
		Debug.Log("Asset Created at: "+AssetDatabase.GetAssetPath(mesh)+"!");
	}

#endif
}