
@script ExecuteInEditMode()
@CustomEditor (BetterSkyboxHandler)

class BetterSkyboxHandler_editor extends Editor {

	var renName : String="";
	var setRename : int = 0;

 	var logoTex : Texture = Resources.Load("textures/gui_tex_BSlogo");
	var divTex : Texture = Resources.Load("textures/gui_tex_BS_div");
	var divRevTex : Texture = Resources.Load("textures/gui_tex_BS_divrev");
	var divVertTex : Texture = Resources.Load("textures/gui_tex_BS_divvert");
	var divHorizTex : Texture = Resources.Load("textures/gui_tex_BS_divhorz");

 	var colorEnabled : Color = Color(1.0,1.0,1.0,1.0);
	var colorDisabled : Color = Color(1.0,1.0,1.0,0.25);

		
    function OnInspectorGUI () {


		//SET SCREEN WIDTH
		var setWidth = Screen.width-220;
		if (setWidth < 120) setWidth = 120;
		
		//BETTER SKYBOX LOGO
		var buttonText : GUIContent = new GUIContent(""); 
		var buttonStyle : GUIStyle = GUIStyle.none; 
		var rt : Rect = GUILayoutUtility.GetRect(buttonText, buttonStyle);
		var margin : int = 15;
		//GUI.color = colorEnabled;

		//start menu
        GUI.contentColor = Color(1.0,1.0,1.0,0.4);
		EditorGUI.LabelField(Rect(rt.x+margin+2, rt.y+37, 50, 18),"Version");
		GUI.contentColor = Color(1.0,1.0,1.0,0.6);
		
		var linkVerRect : Rect = Rect(rt.x+margin+51, rt.y+37, 40, 18);
		EditorGUI.LabelField(linkVerRect,target.BSVersionNumber);

	    
	    var linkHelpRect : Rect = Rect(rt.x+margin+105, rt.y+37, 198, 18);
	    var linkURLRect : Rect = Rect(rt.x+margin+165+140, rt.y+37, 100, 18);
	    
	    GUI.contentColor = Color(1.0,1.0,1.0,0.2);
	    EditorGUI.LabelField(linkHelpRect,"let's make those skyboxes better!");
		
		GUI.contentColor = Color(1.0,1.0,1.0,0.6);
		if (Event.current.type == EventType.MouseUp && linkURLRect.Contains(Event.current.mousePosition)) Application.OpenURL("http://www.tanukidigital.com/");
		EditorGUI.LabelField(linkURLRect,"tanukidigital");
		// end menu
		
		
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,320,36),logoTex);
        GUILayout.Space(40.0);
        
        
        // GENERAL SETTINGS
        GUI.contentColor = colorEnabled;
        rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
        
        GUI.Label (Rect (rt.x+margin+30, rt.y+10, 150, 20), GUIContent ("Lock"));
       	target.lockRotation = EditorGUI.Toggle(Rect(rt.x+margin+10, rt.y+10, 20, 18),"", target.lockRotation);
  
  		if (target.lockRotation) GUI.contentColor = colorDisabled;
        GUI.Label (Rect (rt.x+margin+100, rt.y+10, 150, 20), GUIContent ("Rotation"));
        target.yRotation = EditorGUI.Slider(Rect(rt.x+margin+165, rt.y+10, setWidth, 18),"",target.yRotation,0.0,359.99);
        GUI.contentColor = colorEnabled;
        
        GUI.Label (Rect (rt.x+margin+10, rt.y+30, 150, 20), GUIContent ("SkyBox Type"));
		target.skyIndex = EditorGUI.Popup(Rect(rt.x+margin+100, rt.y+31, 279, 18),"",target.skyIndex, target.skyOptions);
			
			//Custom SphereMap 2D
			if (target.skyIndex == 2){
				GUI.Label (Rect (rt.x+margin+10, rt.y+55, 100, 15), GUIContent("Texture(2D)"));
        		target.customSpheremap2D = EditorGUI.ObjectField(Rect(rt.x+margin+100, rt.y+55, 279, 100), target.customSpheremap2D, Texture2D, true);
        		GUILayout.Space(50.0);
			}
			//EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+30, 80, 18),"Surface Type");
			//target.typeIndex = EditorGUI.Popup(Rect(rt.x+margin+100, rt.y+30, 145, 18),"",target.typeIndex, target.typeOptions);

			//EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+60, 90, 18),"Flow Direction");
        	//target.flow_dir_degrees = EditorGUI.Slider(Rect(rt.x+margin+165, rt.y+60, setWidth, 18),"",target.flow_dir_degrees,0.0,360.0);
        	//EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+80, 90, 18),"Wave Speed");
        	//target.flowSpeed = EditorGUI.Slider(Rect(rt.x+margin+165, rt.y+80, setWidth, 18),"",target.flowSpeed,0.0,1.0);
        	//EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+100, 90, 18),"Flow Speed");
			//target.foamSpeed = EditorGUI.Slider(Rect(rt.x+margin+165, rt.y+100, setWidth, 18),"",target.foamSpeed,0.0,3.0);

			GUILayout.Space(120.0);


	    EditorGUILayout.Space();
        if (GUI.changed) EditorUtility.SetDirty (target);
    }

}