using UnityEditor;
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace Obi{

/**
 * Custom inspector for ObiCloth components.
 * Allows particle selection and constraint edition. 
 * 
 * Selection:
 * 
 * - To select a particle, left-click on it. 
 * - You can select multiple particles by holding shift while clicking.
 * - To deselect all particles, click anywhere on the object except a particle.
 * 
 * Constraints:
 * 
 * - To edit particle constraints, select the particles you wish to edit.
 * - Constraints affecting any of the selected particles will appear in the inspector.
 * - To add a new pin constraint to the selected particle(s), click on "Add Pin Constraint".
 * 
 */
[CustomEditor(typeof(ObiCloth)), CanEditMultipleObjects] 
public class ObiClothEditor : Editor
{

	[MenuItem("Component/Physics/Obi/Obi Cloth",false,0)]
    static void AddObiCloth()
    {
		foreach(Transform t in Selection.transforms)
			Undo.AddComponent<ObiCloth>(t.gameObject);
    }

	ObiCloth cloth;
	EditorCoroutine routine;

	float vertexSize = 0.02f;
	bool previewVirtualParticles = false;
	bool previewSpatialGrid = false;
	bool previewSkin = false;
	bool constraintsFolded = true;
	float uiWidth = 200;
	float uiHeight = 150;

	//Mass edition related:
	float selectionMass = 0;
	float newMass = 0;
	int differentMassCount = 0;
	bool mixedMass = false;

	//Editor playback related:
	bool isPlaying = false;
	float lastFrameTime = 0.0f;
	float accumulatedTime = 0.0f;

	Vector3 camup;
	Vector3 camright;
	List<int> selectedParticles = new List<int>();

	//Marquee selector stuff:
	bool dragging = false;
	Vector2 startPos;
	Vector2 currentPos;
	Rect marquee;
	
	public void OnEnable(){

		cloth = (ObiCloth)target;

		// In case the cloth has not been initialized yet, start the initialization routine.
		if (!cloth.Initialized && !cloth.Initializing){
			CoroutineJob job = new CoroutineJob();
			routine = EditorCoroutine.StartCoroutine(job.Start(cloth.GeneratePhysicRepresentationForMesh()));
		}

		EditorApplication.update += Update;
		EditorApplication.playmodeStateChanged += OnPlayModeStateChanged;
	}

	public void OnDisable(){
		EditorApplication.update -= Update;
		EditorApplication.playmodeStateChanged -= OnPlayModeStateChanged;
		EditorUtility.ClearProgressBar();
	}
	
	public override void OnInspectorGUI() {
		
		serializedObject.Update();

		Editor.DrawPropertiesExcluding(serializedObject,"m_Script","pressureConstraintsGroup");

		// Inform about current pressure constraint availability, and show it if available.
		if (cloth.edgeStructure.IsClosed)
			EditorGUILayout.PropertyField(serializedObject.FindProperty("pressureConstraintsGroup"),true);
		else
			EditorGUILayout.HelpBox("Mesh is not closed, so no pressure constraint available.",MessageType.Info);

		// Draw rigidbody pin constraints.
		DrawPinConstraints();

		// Progress bar:
		EditorCoroutine.ShowCoroutineProgressBar("Obi is thinking...",routine);
		
		// Apply changes to the serializedProperty
		if (GUI.changed)
			serializedObject.ApplyModifiedProperties();

	}

	private void DrawPinConstraints(){

		PinConstraint removedConstraint = null;
		
		// Draw pin constraints:
		constraintsFolded =	EditorGUILayout.Foldout(constraintsFolded,"Pin Constraints");
		if (constraintsFolded){

			if (selectedParticles.Count > 0){

				List<PinConstraint> selectedConstraints = cloth.pins.FindAll(x => selectedParticles.Contains(x.pIndex));

				if (selectedConstraints.Count > 0){
				
					foreach(PinConstraint c in selectedConstraints){
						
						GUILayout.BeginVertical("box");

							GUILayout.BeginHorizontal();
								
								EditorGUI.BeginChangeCheck();
								bool allowSceneObjects = !EditorUtility.IsPersistent(target);
								c.rigidbody = EditorGUILayout.ObjectField("Pinned to:",c.rigidbody,typeof(Rigidbody),allowSceneObjects) as Rigidbody;
								
								// initialize offset after changing the rigidbody.
								if (EditorGUI.EndChangeCheck() && c.rigidbody != null){
									c.offset = c.rigidbody.transform.InverseTransformVector(cloth.transform.TransformPoint(cloth.particles[c.pIndex].position) - c.rigidbody.transform.position);
								}

								Color oldColor = GUI.color;
								GUI.color = Color.red;
								if (GUILayout.Button("X",GUILayout.Width(30))){
									removedConstraint = c;
									continue;
								}
								GUI.color = oldColor;
							
							GUILayout.EndHorizontal();

							c.offset = EditorGUILayout.Vector3Field("Offset:",c.offset);

						GUILayout.EndVertical();
						
					}
					
					if (removedConstraint != null){
						cloth.pins.RemoveWhere(x => x == removedConstraint);
						EditorUtility.SetDirty(cloth);
					}
				}else{
					EditorGUILayout.HelpBox("No constraints for selected particles.",MessageType.Info);
				}
				
				// Add new constraint button:
				if (GUILayout.Button("Add Pin Constraint")){
					foreach(int particleIndex in selectedParticles){
						PinConstraint pin = new PinConstraint(cloth.transform,particleIndex,null,Vector3.zero);
						cloth.pins.Add(pin);
					}
					EditorUtility.SetDirty(cloth);
				}
			}else{
				EditorGUILayout.HelpBox("No particles selected.",MessageType.Info);
			}
		}
	}

	public static Material particleMaterial;
	static void CreateParticleMaterial() {
		if (!particleMaterial) { 
			particleMaterial = EditorGUIUtility.LoadRequired("Particles.mat") as Material;
			particleMaterial.hideFlags = HideFlags.HideAndDontSave;
			particleMaterial.shader.hideFlags = HideFlags.HideAndDontSave;
		}
	}

	private void SelectParticle(int index){
		if (index >= 0 && index < cloth.particles.Count){
			if (selectedParticles.Count == 0){
				newMass = selectionMass = cloth.particles[index].mass;
				mixedMass = false;
				differentMassCount = 0;
			}else if (cloth.particles[index].mass != selectionMass){
				mixedMass = true;
				differentMassCount++;
			}
			selectedParticles.Add(index);
		}
	}

	private void DeselectParticle(int index){
		if (index >= 0 && index < cloth.particles.Count){
			if (cloth.particles[index].mass != selectionMass)
				differentMassCount--;
			if (differentMassCount <= 0)
				mixedMass = false;
	
			selectedParticles.Remove(index);
		}
	}

	public void OnSceneGUI(){

		CreateParticleMaterial();
		particleMaterial.SetPass(0);

		if (cloth.mesh == null) return;

		// get mesh vertices and normals:
		Vector3[] vertices = cloth.mesh.vertices;
		Vector3[] normals = cloth.mesh.normals;

		// get editor camera up and right vectors in worldspace:
		if (Camera.current != null){

			camup = Camera.current.transform.up * vertexSize;
			camright = Camera.current.transform.right * vertexSize;

			int controlID = GUIUtility.GetControlID(FocusType.Passive);
			int selectedParticleIndex = -1;

			// select vertex on mouse click:
			switch (Event.current.GetTypeForControl(controlID)){

				case EventType.MouseDown: 

					if (Event.current.button != 0) break;

					startPos = Event.current.mousePosition;
						
					// If the user is pressing shift, accumulate selection.
					if ((Event.current.modifiers & EventModifiers.Shift) == 0 && (Event.current.modifiers & EventModifiers.Alt) == 0){
						selectedParticles.Clear();
					}
				
					// If the user is holding down control, dont allow selection of other objects and use marquee tool.
                    if ((Event.current.modifiers & EventModifiers.Control) != 0)
						GUIUtility.hotControl = controlID;
					
					float minSqrDistance = System.Single.MaxValue;

					if (cloth.particles != null)
					for(int i = 0; i < cloth.particles.Count; i++){
						
						Vector3 position = cloth.transform.TransformPoint(cloth.particles[i].position);
						
						// skip particles not facing the camera:
						if (!IsClothParticleFacingCamera(cloth.transform,Camera.current,normals,i,position)) continue;
						
						// get particle position in gui space:
						Vector2 pos = HandleUtility.WorldToGUIPoint(position);
						
						// get distance from mouse position to particle position:
						float sqrDistance = Vector2.SqrMagnitude(startPos-pos);
						
						// check if this particle is closer to the cursor that any previously considered particle.
						if (sqrDistance < 100 && sqrDistance < minSqrDistance){ //magic number 100 = 10*10, where 10 is min distance in pixels to select a particle.
							minSqrDistance = sqrDistance;
							selectedParticleIndex = i;
                        }
                            
                    }
                    
                    if (selectedParticleIndex >= 0){ 	//add the particle to the selected particles set.
                        
                        if (!selectedParticles.Contains(selectedParticleIndex))
                            SelectParticle(selectedParticleIndex);
                        else
                            DeselectParticle(selectedParticleIndex);
                        
                        // Prevent cloth deselection if we have selected a particle:
                        GUIUtility.hotControl = controlID;
                        Event.current.Use();
                        Repaint();
                        
                    }
                    else if (Event.current.modifiers == EventModifiers.None){ // deselect all particles:
						selectedParticles.Clear();
						Repaint();
					}
					
				break;

				case EventType.MouseDrag:

					if (GUIUtility.hotControl == controlID){

						currentPos = Event.current.mousePosition;
						if (!dragging && Vector2.Distance(startPos, currentPos) > 5) {
							dragging = true;
						}else{
		                    GUIUtility.hotControl = controlID;
		                    Event.current.Use();
						}
					
						//update marquee rect:
						float left = Mathf.Min(startPos.x,currentPos.x);
						float right = Mathf.Max(startPos.x,currentPos.x);
						float bottom = Mathf.Min(startPos.y,currentPos.y);
						float top = Mathf.Max(startPos.y,currentPos.y);
						
						marquee = new Rect(left, bottom, right - left, top - bottom);

					}

				break;

				case EventType.MouseUp:
					
					if (GUIUtility.hotControl == controlID){

						dragging = false;
						
						for(int i = 0; i < cloth.particles.Count; i++){
							
							Vector3 position = cloth.transform.TransformPoint(cloth.particles[i].position);
							
							// skip particles not facing the camera:
							if (!IsClothParticleFacingCamera(cloth.transform,Camera.current,normals,i,position)) continue;
							
							// get particle position in gui space:
		                    Vector2 pos = HandleUtility.WorldToGUIPoint(position);
		                    
							if (pos.x > marquee.xMin && pos.x < marquee.xMax && pos.y > marquee.yMin && pos.y < marquee.yMax)
		                        SelectParticle(i);
							
						}

						GUIUtility.hotControl = 0;
                        Event.current.Use();
					}
					
				break;

			}

		}

		if (Event.current.type == EventType.repaint){

			//Draw all cloth vertices:
			GL.Begin(GL.TRIANGLES);
			if (cloth.particles != null)
			for(int i = 0; i < cloth.particles.Count; i++)
			{
				Vector3 position = cloth.transform.TransformPoint(cloth.particles[i].position);
	
				// skip particles not facing the camera:
				if (!IsClothParticleFacingCamera(cloth.transform,Camera.current,normals,i,position)) continue;
	
				// get particle size in screen space:
				float size = HandleUtility.GetHandleSize(position)*2;
					Color color = (cloth.particles[i].asleep && cloth.particles[i].w != 0) ? Color.gray : Color.Lerp(Color.red,Color.blue,cloth.particles[i].w);
	
				// highlight the particle if its selected:
				if (selectedParticles.Contains(i)){
					GL.Color(color);
					DrawParticle(position,camup*2*size,camright*2*size);
					GL.Color(Color.white);
					DrawParticle(position,camup*1.5f*size,camright*1.5f*size);
				}
	
				// draw the regular particle:
				GL.Color(color);
				DrawParticle(position,camup*size,camright*size);
			}
	
			GL.Color(Color.yellow);
	
			//preview virtual particles:	
			if (previewVirtualParticles && cloth.collisionConstraintsGroup.virtualParticleCoordinates != null){
				foreach(int i in selectedParticles){
					foreach(HalfEdge.HEFace face in cloth.edgeStructure.GetNeighbourFacesEnumerator(cloth.edgeStructure.heVertices[i])){
						
						Vector3 v1 = vertices[cloth.edgeStructure.heVertices[cloth.edgeStructure.heEdges[face.edges[0]].startVertex].physicalIDs[0]];
						Vector3 v2 = vertices[cloth.edgeStructure.heVertices[cloth.edgeStructure.heEdges[face.edges[1]].startVertex].physicalIDs[0]];
						Vector3 v3 = vertices[cloth.edgeStructure.heVertices[cloth.edgeStructure.heEdges[face.edges[2]].startVertex].physicalIDs[0]];
	
						foreach(Vector3 vpCoord in cloth.collisionConstraintsGroup.virtualParticleCoordinates){
	
							Vector3 virtualPosition = cloth.transform.TransformPoint(ObiUtils.BarycentricInterpolation(v1,v2,v3,vpCoord));
							float size = HandleUtility.GetHandleSize(virtualPosition);
							
							DrawParticle(virtualPosition,camup*size,camright*size);
						}
	
					}
				}
			}
			GL.End();

			// Draw the regular grid:
			GL.Begin(GL.LINES);
			GL.Color(Color.yellow);
			if (previewSpatialGrid){
				if (cloth.grid != null){
					//Draw adaptive grid:
					Gizmos.color = new Color(1,1,0,0.25f);
					foreach (KeyValuePair<int,AdaptiveGrid.Cell> pair in cloth.grid.cells){
						DrawGridCell(pair.Value.Index*cloth.grid.CellSize + Vector3.one*cloth.grid.CellSize*0.5f,Vector3.one*cloth.grid.CellSize*0.5f);
					}
				}
			}
			GL.End();
				  
			// Draw pin constraints:
			if (cloth.pins != null){
				List<PinConstraint> selectedConstraints = cloth.pins.FindAll(x => selectedParticles.Contains(x.pIndex));
				foreach(PinConstraint c in selectedConstraints){
					Handles.color = Color.red;
					if (c.rigidbody != null){
		
						Vector3 pinPosition = c.rigidbody.transform.TransformPoint(c.offset);
		
						Handles.DrawDottedLine(cloth.transform.TransformPoint(cloth.particles[c.pIndex].position),
							                   c.rigidbody.transform.TransformPoint(c.offset),5);
		
						Handles.SphereCap(0,pinPosition,Quaternion.identity,HandleUtility.GetHandleSize(pinPosition)*0.1f);
						
					}
				}
			}
			
			// Draw skin preview:
			if (previewSkin)	
				DrawSkinPreview();
		}

		//Sceneview GUI:
		GUI.changed = false;

		Handles.BeginGUI();

			GUI.skin = EditorGUIUtility.GetBuiltinSkin(EditorSkin.Scene);

			// Draw drag box:
			if(dragging){
				GUI.Box (new Rect (marquee.xMin, marquee.yMin, marquee.width, marquee.height),"");
			}

			if (cloth.IsSkinned) 
				uiHeight = 168;

			Rect uirect = new Rect (Screen.width - uiWidth - GUI.skin.window.border.horizontal + 5, Screen.height - uiHeight - GUI.skin.window.border.vertical + 5, uiWidth, uiHeight);
			GUI.Window(0,uirect,DrawUIWindow,"Obi Cloth");

		Handles.EndGUI();

		if (GUI.changed){
			EditorUtility.SetDirty(cloth);
		}
		
	}

	private void DrawSkinPreview(){

		Handles.matrix = cloth.transform.localToWorldMatrix;
		foreach(int i in selectedParticles){
			SkinConstraint sc = cloth.skinConstraints[i];
			if (sc.radius > 0){
				float discRadius = Mathf.Sqrt(1 - Mathf.Pow(sc.backstop / sc.radius,2)) * sc.radius;
				Handles.color = new Color(1,0,0,0.1f);
				Handles.DrawSolidDisc(cloth.particles[i].position + sc.normal * sc.backstop,sc.normal,discRadius);
				Handles.color = Color.red;
				Handles.DrawLine(cloth.particles[i].position,cloth.particles[i].position + sc.normal * sc.backstop);		
			}
		}

	}

	/**
	 * Return whether all physical vertices at the particle should are culled or not. If at least one is not culled, the particle is visible.
	 */
	private bool IsClothParticleFacingCamera(Transform clothTransform,Camera cam, Vector3[] meshNormals, int particleIndex, Vector3 particleWorldPosition){

		if (cam == null || clothTransform == null) return false;

		if (particleIndex < cloth.edgeStructure.heVertices.Count){

			HalfEdge.HEVertex vertex = cloth.edgeStructure.heVertices[particleIndex];

			foreach(int index in vertex.physicalIDs){
				if (Vector3.Dot(clothTransform.TransformVector(meshNormals[index]),cam.transform.position - particleWorldPosition) > 0)
					return true;
			}

		}

		return false;

	}

	/**
	 * Draws a window with cloth info:
	 */
	void DrawUIWindow(int windowID) {

		previewVirtualParticles = GUILayout.Toggle(previewVirtualParticles,"Preview virtual particles");
		previewSpatialGrid = GUILayout.Toggle(previewSpatialGrid,"Preview grid");
		if (cloth.IsSkinned) previewSkin = GUILayout.Toggle(previewSkin,"Preview skin");
		
		GUILayout.BeginHorizontal();

			EditorGUI.showMixedValue = mixedMass;
			newMass = EditorGUILayout.FloatField(newMass);
			EditorGUI.showMixedValue = false;

			if (GUILayout.Button("Set Mass")){
				selectionMass = newMass;
				foreach(int particleIndex in selectedParticles){
					ObiClothParticle particle = cloth.particles[particleIndex];
					particle.mass = selectionMass;
				}
			}

			if (GUILayout.Button(new GUIContent(EditorGUIUtility.Load("PinIcon.psd") as Texture2D,"Fix/unfix particles."),GUILayout.MaxHeight(18),GUILayout.MaxWidth(25))){
				foreach(int particleIndex in selectedParticles){
					ObiClothParticle particle = cloth.particles[particleIndex];
					if (particle.w == 0){	
						particle.mass = 1;
					}else{
						newMass = particle.mass = float.PositiveInfinity;
						particle.velocity = Vector3.zero;
					}
				}
			}
	
		GUILayout.EndHorizontal();

		if (GUILayout.Button("Invert selection")){
			List<ObiClothParticle> unselectedParticles = cloth.particles.FindAll(x => !selectedParticles.Contains(x.index));
			selectedParticles.Clear();
			foreach(ObiClothParticle p in unselectedParticles){
				SelectParticle(p.index);
			}
		}
		
		GUILayout.BeginHorizontal();

		GUI.enabled = !EditorApplication.isPlaying;

			if (GUILayout.Button(EditorGUIUtility.Load("RewindButton.psd") as Texture2D,GUILayout.MaxHeight(24))){
				cloth.ResetGeometry();
				accumulatedTime = 0;
			}

			if (GUILayout.Button(EditorGUIUtility.Load("StopButton.psd") as Texture2D,GUILayout.MaxHeight(24))){
				isPlaying = false;
			}

			if (GUILayout.Button(EditorGUIUtility.Load("PlayButton.psd") as Texture2D,GUILayout.MaxHeight(24))){
				lastFrameTime = Time.realtimeSinceStartup;
				isPlaying = true;
			}

			if (GUILayout.Button(EditorGUIUtility.Load("StepButton.psd") as Texture2D,GUILayout.MaxHeight(24))){
				isPlaying = false;
				cloth.SimulateStep(Time.fixedDeltaTime);
				cloth.CommitResultsToMesh();
			}

		GUI.enabled = true;

		GUILayout.EndHorizontal();
		
		GUILayout.BeginHorizontal();

		if (GUILayout.Button("Reset Cloth")){
			accumulatedTime = 0;
			CoroutineJob job = new CoroutineJob();
			job.asyncThreshold = 1000;
			routine = EditorCoroutine.StartCoroutine(job.Start(cloth.ResetAll()));
		}

			
		if (GUILayout.Button("Optimize")){
			if (EditorUtility.DisplayDialog("Cloth optimization","About to remove fixed particles that do not contribute to the simulation. The only way to undo this is reset or recreate the cloth. Do you want to continue?","Ok","Cancel"))
				cloth.Optimize();
		}

		GUILayout.EndHorizontal();

	}

	void OnPlayModeStateChanged()
	{
		//Prevent the user from going into play mode while we are doing stuff:
		if (routine != null && !routine.IsDone && EditorApplication.isPlayingOrWillChangePlaymode)
		{
			EditorApplication.isPlaying = false;
		}
	}

	void Update () {
		if (isPlaying){

			accumulatedTime += Mathf.Min(Time.realtimeSinceStartup - lastFrameTime, Time.maximumDeltaTime);

			while (accumulatedTime >= Time.fixedDeltaTime){
				cloth.SimulateStep(Time.fixedDeltaTime);
				cloth.CommitResultsToMesh();
				accumulatedTime -= Time.fixedDeltaTime;
			}		

			lastFrameTime = Time.realtimeSinceStartup;
		}
	}
	

	private void DrawParticle(Vector3 p, Vector3 up, Vector3 r){

		GL.Vertex(p+up);
		GL.Vertex(p-r);
		GL.Vertex(p+r);

		GL.Vertex(p-up);
		GL.Vertex(p+r);
		GL.Vertex(p-r);

	}

	private void DrawGridCell(Vector3 center, Vector3 size){
		
		//Bottom face:
		GL.Vertex(center + new Vector3(-size.x,-size.y,-size.z));
		GL.Vertex(center + new Vector3(size.x,-size.y,-size.z));

		GL.Vertex(center + new Vector3(size.x,-size.y,-size.z));
		GL.Vertex(center + new Vector3(size.x,-size.y,size.z));

		GL.Vertex(center + new Vector3(size.x,-size.y,size.z));
		GL.Vertex(center + new Vector3(-size.x,-size.y,size.z));

		GL.Vertex(center + new Vector3(-size.x,-size.y,size.z));
		GL.Vertex(center + new Vector3(-size.x,-size.y,-size.z));

		//Top face:
		GL.Vertex(center + new Vector3(-size.x,size.y,-size.z));
		GL.Vertex(center + new Vector3(size.x,size.y,-size.z));
		
		GL.Vertex(center + new Vector3(size.x,size.y,-size.z));
		GL.Vertex(center + new Vector3(size.x,size.y,size.z));
		
		GL.Vertex(center + new Vector3(size.x,size.y,size.z));
		GL.Vertex(center + new Vector3(-size.x,size.y,size.z));
		
		GL.Vertex(center + new Vector3(-size.x,size.y,size.z));
		GL.Vertex(center + new Vector3(-size.x,size.y,-size.z));

		//Remaining edges:
		GL.Vertex(center + new Vector3(-size.x,size.y,-size.z));
		GL.Vertex(center + new Vector3(-size.x,-size.y,-size.z));
		
		GL.Vertex(center + new Vector3(size.x,size.y,-size.z));
		GL.Vertex(center + new Vector3(size.x,-size.y,-size.z));
		
		GL.Vertex(center + new Vector3(size.x,size.y,size.z));
		GL.Vertex(center + new Vector3(size.x,-size.y,size.z));
		
		GL.Vertex(center + new Vector3(-size.x,size.y,size.z));
		GL.Vertex(center + new Vector3(-size.x,-size.y,size.z));
		
	}

}
}

