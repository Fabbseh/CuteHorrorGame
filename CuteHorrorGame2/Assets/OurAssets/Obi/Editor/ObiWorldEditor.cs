using UnityEngine;
using UnityEditor;
using System.IO;
using System.Collections;

namespace Obi{
	[CustomEditor(typeof(ObiWorld))] 
	public class ObiWorldEditor : Editor
	{

		[MenuItem("Component/Physics/Obi/Obi World",false,0)]
		static void AddObiCloth()
		{
			foreach(Transform t in Selection.transforms)
				Undo.AddComponent<ObiWorld>(t.gameObject);
		}
		
		ObiWorld world;
		GameObject obj;
		Vector2 scrollPosition;

		public void OnEnable(){
			world = (ObiWorld) target;
		}

		public override void OnInspectorGUI() {
			
			Editor.DrawPropertiesExcluding(serializedObject,"m_Script");

			if (GUILayout.Button("Manage world")){
				// Get existing open window or if none, make a new one:
				ObiWorldManager window = (ObiWorldManager)EditorWindow.GetWindow (typeof (ObiWorldManager));
				window.selectedWorld = world;
				window.Show();
			}
            
            if (GUI.changed)
                serializedObject.ApplyModifiedProperties();
			
		}

		private static void DrawDBVH(ObiWorld world, DBVH.DBVHNode node){
			
			if (node == null) return;
			
			if (node.content == null){
				DrawDBVH(world,world.dynamicBVH.GetLeftChild(node));
				DrawDBVH(world,world.dynamicBVH.GetRightChild(node));
			}
			
			Gizmos.DrawCube(node.bounds.center,node.bounds.size);
			
		}

		[DrawGizmo (GizmoType.Selected)]
		static void DrawGizmoForObiWorld(ObiWorld world, GizmoType gizmoType) {
			
			if ((gizmoType & GizmoType.Selected) != 0) {
				
				Gizmos.color = new Color(0,0,1,0.05f);
				DrawDBVH(world, world.dynamicBVH.Root);
				
			}
			
		}
		
	}
}

