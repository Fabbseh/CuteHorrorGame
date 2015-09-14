using UnityEditor;
using UnityEngine;
using System.Collections.Generic;

namespace Obi{
[InitializeOnLoad]
class ObiWorldHierarchyInfo
{
	static Texture2D texture;
	static List<int> markedObjects;
	
	static ObiWorldHierarchyInfo ()
	{
		// Init
		texture = EditorGUIUtility.LoadRequired("ObiWorldHierarchyIcon.png") as Texture2D;
		EditorApplication.hierarchyWindowItemOnGUI += HierarchyItemCB;
	}
	
	static void HierarchyItemCB (int instanceID, Rect selectionRect)
	{

		GameObject g = EditorUtility.InstanceIDToObject(instanceID) as GameObject;
		
		if (g != null){

			ObiWorld world = g.GetComponent<ObiWorld>();
	
			if (world != null){
	
				// place the icoon to the right of the list:
				Rect r = new Rect (selectionRect); 
				r.x = r.width - 20;
				r.width = 18;
				
				// Draw the texture if it's a light (e.g.)
				GUI.Label (r, texture); 
			}
		}
		
	}
	
}
}