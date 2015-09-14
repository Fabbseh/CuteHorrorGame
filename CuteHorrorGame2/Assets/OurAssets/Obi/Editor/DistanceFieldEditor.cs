using UnityEngine;
using UnityEditor;
using System.IO;
using System.Collections;

namespace Obi{
	[CustomEditor(typeof(DistanceField))] 
	public class DistanceFieldEditor : Editor
	{

		DistanceField distanceField;
		PreviewHelpers previewHelper;
		Vector2 previewDir;
		Material previewMaterial;
		Mesh previewMesh;
		Texture3D volumeTexture;

		/**
	 	* This makes it easy to create, name and place unique new ScriptableObject asset files.
		*/
		public static void CreateAsset<T> () where T : ScriptableObject
		{
			T asset = ScriptableObject.CreateInstance<T> ();
			
			string path = AssetDatabase.GetAssetPath (Selection.activeObject);
			if (path == "") 
			{
				path = "Assets";
			} 
			else if (Path.GetExtension (path) != "") 
			{
				path = path.Replace (Path.GetFileName (AssetDatabase.GetAssetPath (Selection.activeObject)), "");
			}
			
			string assetPathAndName = AssetDatabase.GenerateUniqueAssetPath (path + "/New " + typeof(T).ToString() + ".asset");
			
			AssetDatabase.CreateAsset (asset, assetPathAndName);
			
			AssetDatabase.SaveAssets ();
			EditorUtility.FocusProjectWindow ();
			Selection.activeObject = asset;
		}

		[MenuItem("Assets/Create/Obi/Obi Distance Field")]
		public static void CreateDistanceField ()
		{
			CreateAsset<DistanceField> ();
		}

		private void UpdatePreview(){

			CleanupPreview();

			if (distanceField.Root != null){
				
				previewMesh = CreateMeshForBounds(distanceField.Root.bounds);
				previewMesh.hideFlags = HideFlags.HideAndDontSave;
				
				volumeTexture = distanceField.GetVolumeTexture(32);
				volumeTexture.hideFlags = HideFlags.HideAndDontSave;
				
				previewMaterial = EditorGUIUtility.LoadRequired("DistanceFieldPreview.mat") as Material;
				previewMaterial.SetTexture("_Volume",volumeTexture);
				previewMaterial.SetVector("_AABBMin",-distanceField.Root.bounds.extents);
                previewMaterial.SetVector("_AABBMax",distanceField.Root.bounds.extents);
			}

		}

		private void CleanupPreview(){
			GameObject.DestroyImmediate(previewMesh);
			GameObject.DestroyImmediate(volumeTexture);
		}

		public void OnEnable(){
			distanceField = (DistanceField) target;
			previewHelper = new PreviewHelpers();
			UpdatePreview();
		}
		
		public void OnDisable(){
			EditorUtility.ClearProgressBar();
			previewHelper.Cleanup();
			CleanupPreview();
		}

		public override void OnInspectorGUI() {
			
			Editor.DrawPropertiesExcluding(serializedObject,"m_Script");
			
			if (GUILayout.Button("Generate")){
				// Start a coroutine job in the editor.
				CoroutineJob job = new CoroutineJob();
				distanceField.generationRoutine = EditorCoroutine.StartCoroutine( job.Start( distanceField.Generate()));
			}

			// Show job progress:
			EditorCoroutine.ShowCoroutineProgressBar("Generating distance field",distanceField.generationRoutine);

			//If the generation routine has been completed, release it and update volumetric preview:
			if (distanceField.generationRoutine != null && distanceField.generationRoutine.IsDone){
				distanceField.generationRoutine = null;
				UpdatePreview();
			}

			EditorGUILayout.HelpBox("Size in kb: "+ distanceField.GetSizeInBytes()*0.001f,MessageType.Info);

			if (GUI.changed)
				serializedObject.ApplyModifiedProperties();
			
		}

		public override bool HasPreviewGUI(){
			return true;
		}

		public override bool RequiresConstantRepaint(){
			return true;	
		}

		public override void OnPreviewGUI(Rect region, GUIStyle background)
		{
			previewDir = PreviewHelpers.Drag2D(previewDir, region);

			if (Event.current.type != EventType.Repaint || previewMesh == null)
			{
                return;
            }

			Quaternion quaternion = Quaternion.Euler(this.previewDir.y, 0f, 0f) * Quaternion.Euler(0f, this.previewDir.x, 0f) * Quaternion.Euler(0, 120, -20f);
		
			previewHelper.BeginPreview(region, background);

			Bounds bounds = previewMesh.bounds;
			float magnitude = bounds.extents.magnitude;
			float num = 4f * magnitude;
			previewHelper.m_Camera.transform.position = -Vector3.forward * num;
			previewHelper.m_Camera.transform.rotation = Quaternion.identity;
			previewHelper.m_Camera.nearClipPlane = num - magnitude * 1.1f;
			previewHelper.m_Camera.farClipPlane = num + magnitude * 1.1f;

			// Compute matrix to rotate the mesh around the center of its bounds:
			Matrix4x4 matrix = Matrix4x4.TRS(Vector3.zero,quaternion,Vector3.one) * Matrix4x4.TRS(-bounds.center,Quaternion.identity,Vector3.one);

			Graphics.DrawMesh(previewMesh, matrix, previewMaterial,1, previewHelper.m_Camera, 0);

			Texture texture = previewHelper.EndPreview();
			GUI.DrawTexture(region, texture, ScaleMode.StretchToFill, true);
			
        }
	
		/**
		 * Creates a solid mesh from some Bounds. This is used to display the distance field volumetric preview.
		 */
		private Mesh CreateMeshForBounds(Bounds b){
			Mesh m = new Mesh();

			/** Indices of bounds corners:

			  		   Y
			  		   2	   6
			    	   +------+
			 	  3  .'|  7 .'|
				   +---+--+'  |
				   |   |  |   |
				   |   +--+---+   X
				   | .' 0 | .' 4
				   +------+'
				Z 1        5
				
			*/
			Vector3[] vertices = new Vector3[8]{
				b.center + new Vector3(-b.extents.x,-b.extents.y,-b.extents.z), //0
				b.center + new Vector3(-b.extents.x,-b.extents.y,b.extents.z),  //1
				b.center + new Vector3(-b.extents.x,b.extents.y,-b.extents.z),  //2
				b.center + new Vector3(-b.extents.x,b.extents.y,b.extents.z),   //3
				b.center + new Vector3(b.extents.x,-b.extents.y,-b.extents.z),  //4
				b.center + new Vector3(b.extents.x,-b.extents.y,b.extents.z),   //5
				b.center + new Vector3(b.extents.x,b.extents.y,-b.extents.z),   //6
				b.center + new Vector3(b.extents.x,b.extents.y,b.extents.z)     //7
			};
			int[] triangles = new int[36]{
				2,3,7,
				6,2,7,
			
				7,5,4,
				6,7,4,
				
				3,1,5,
				7,3,5,
			
				2,0,3,
				3,0,1,
			
				6,4,2,
				2,4,0,
				
				4,5,0,
				5,1,0
			};

			m.vertices = vertices;
			m.triangles = triangles;
			return m;
		}
	}
}

