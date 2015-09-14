
using UnityEngine;
using UnityEditor;

namespace Obi{
	public class ObiWorldManager : EditorWindow {
		
		static GUIStyle selectedLabelStyle;
		static GUIStyle unselectedLabelStyle;
		static Texture2D addIcon;
		static Texture2D removeIcon;

		[MenuItem ("Window/Obi World Manager")]
		static void Init () {
			// Get existing open window or if none, make a new one:
			ObiWorldManager window = (ObiWorldManager)EditorWindow.GetWindow (typeof (ObiWorldManager));
			window.Show();			
		}

		Vector2 worldScrollPosition,worldMembersScrollPosition;
		ObiWorld[] worlds;

		public ObiWorld selectedWorld;

		void GenerateStyles(){

			if (selectedLabelStyle == null){
				selectedLabelStyle = new GUIStyle(GUI.skin.label);
				selectedLabelStyle.normal.textColor = Color.white;
				selectedLabelStyle.normal.background = EditorGUIUtility.LoadRequired("SelectedWorld_bck.psd") as Texture2D;
			}
			
			if (unselectedLabelStyle == null){
				unselectedLabelStyle = new GUIStyle(GUI.skin.label);
				unselectedLabelStyle.normal.textColor = Color.white;
			}

			if (addIcon == null)
			addIcon = EditorGUIUtility.LoadRequired("AddIcon.psd") as Texture2D;
			if (removeIcon == null)
			removeIcon = EditorGUIUtility.LoadRequired("RemoveIcon.psd") as Texture2D;

		}
		
		void OnGUI () {

			GenerateStyles();

			worlds = GameObject.FindObjectsOfType<ObiWorld>();

			GUILayout.BeginHorizontal();

				GUILayout.BeginVertical();
					EditorGUILayout.LabelField("Worlds in the scene:",EditorStyles.boldLabel);
	
					worldScrollPosition = GUILayout.BeginScrollView(worldScrollPosition,"ProjectBrowserPreviewBg");
	
					if (worlds != null)
					foreach(ObiWorld world in worlds){
						if (GUILayout.Button(world.name,(selectedWorld == world)?selectedLabelStyle:unselectedLabelStyle)){		
							selectedWorld = world;
						}
					}
	
		
					GUILayout.EndScrollView();
				GUILayout.EndVertical();

	
				if (selectedWorld == null){
					EditorGUILayout.HelpBox("No Obi World selected.",MessageType.Info);
				}else{

					GUILayout.BeginVertical();

						EditorGUILayout.LabelField("GameObjects in "+selectedWorld.name+":",EditorStyles.boldLabel);

						worldMembersScrollPosition = GUILayout.BeginScrollView(worldMembersScrollPosition);
						
						foreach(GameObject obj in selectedWorld.Objects){
							if (GUILayout.Button(obj.name,GUI.skin.label)){
								Selection.activeGameObject = obj;
							}
						}
						
						GUILayout.EndScrollView();

						if (GUILayout.Button(new GUIContent("Add selected objects",addIcon,"Adds all currently selected game objects to the Obi World."),GUILayout.Height(50))){	
							foreach(GameObject obj in Selection.gameObjects){	
								ObiActor a = obj.AddComponent<ObiActor>();
								a.Initialize(selectedWorld);
							}
						}
						if (GUILayout.Button(new GUIContent("Remove selected objects",removeIcon,"Removes all currently selected game objects from the Obi World."),GUILayout.Height(50))){		
							foreach(GameObject obj in Selection.gameObjects){
		
								// Get the ObiActor for this world and destroy it.	
								ObiActor[] actors = obj.GetComponents<ObiActor>();
								for(int i = 0; i < actors.Length; i++){
									if (actors[i].world == selectedWorld){
										GameObject.DestroyImmediate(actors[i]);
									}
								}

							}
						}


					GUILayout.EndVertical();
				}
				
			

			GUILayout.EndHorizontal();


		}
	}
}
