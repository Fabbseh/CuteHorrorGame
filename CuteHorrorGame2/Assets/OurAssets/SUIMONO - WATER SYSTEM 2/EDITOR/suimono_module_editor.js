
//@script ExecuteInEditMode()
@CustomEditor (SuimonoModule)






class suimono_module_editor extends Editor {

	var isPro : boolean = true;
	var showErrors : boolean = false;
	var showUnderwater : boolean = false;
	var colorEnabled : Color = Color(1.0,1.0,1.0,1.0);
	var colorDisabled : Color = Color(1.0,1.0,1.0,0.25);
	
	var logoTexb : Texture = Resources.Load("textures/gui_tex_suimonologob");
	var divTex : Texture = Resources.Load("textures/gui_tex_suimonodiv");
	var divRevTex : Texture = Resources.Load("textures/gui_tex_suimonodivrev");
	var divVertTex : Texture = Resources.Load("textures/gui_tex_suimono_divvert");
	var divHorizTex : Texture = Resources.Load("textures/gui_tex_suimono_divhorz");
	
 	var showCaustic : boolean = false;
 	//var showSplash : boolean = false;
  	//var showWaves : boolean = false;
  	//var showGeneral : boolean = false;
  	//var showColor : boolean = false;
   	//var showReflect : boolean = false;
	//var showUnder : boolean = false;
 	var verAdd : int = 0;
 	
 	
    function OnInspectorGUI () {
    		
    		
        //check for unity vs unity pro & load textures
        //#if !UNITY_4_3
		//if (!PlayerSettings.advancedLicense){
		//if (!target.useDarkUI){
		//	divTex = Resources.Load("textures/gui_tex_suimonodiv_i");
		//	logoTexb = Resources.Load("textures/gui_tex_suimonologob_i");
		//} else {
		//	divTex = Resources.Load("textures/gui_tex_suimonodiv");
		//	logoTexb = Resources.Load("textures/gui_tex_suimonologob");	
		//}
		//#endif

		#if UNITY_PRO_LICENSE
			divTex = Resources.Load("textures/gui_tex_suimonodiv");
			logoTexb = Resources.Load("textures/gui_tex_suimonologob");
		#else
			divTex = Resources.Load("textures/gui_tex_suimonodiv_i");
			logoTexb = Resources.Load("textures/gui_tex_suimonologob_i");	
		#endif


		var setWidth = Screen.width-220;
		if (setWidth < 120) setWidth = 120;
		
		//SUIMONO LOGO
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
		EditorGUI.LabelField(linkVerRect,target.suimonoVersionNumber);
		//if (Event.current.type == EventType.MouseUp && linkVerRect.Contains(Event.current.mousePosition)) Application.OpenURL("http://www.tanukidigital.com/suimono/");
		
		GUI.contentColor = Color(1.0,1.0,1.0,1.0);
	    GUI.contentColor = Color(1.0,1.0,1.0,0.4);
	    var linkHelpRect : Rect = Rect(rt.x+margin+165, rt.y+37, 28, 18);
	    var linkBugRect : Rect = Rect(rt.x+margin+165+42, rt.y+37, 65, 18);
	    var linkURLRect : Rect = Rect(rt.x+margin+165+120, rt.y+37, 100, 18);
	    
		if (Event.current.type == EventType.MouseUp && linkHelpRect.Contains(Event.current.mousePosition)) Application.OpenURL("http://www.tanukidigital.com/forum/");
		if (Event.current.type == EventType.MouseUp && linkBugRect.Contains(Event.current.mousePosition)) Application.OpenURL("http://www.tanukidigital.com/forum/");
		if (Event.current.type == EventType.MouseUp && linkURLRect.Contains(Event.current.mousePosition)) Application.OpenURL("http://www.tanukidigital.com/suimono/");

		EditorGUI.LabelField(Rect(rt.x+margin+165+30, rt.y+37, 220, 18),"|");
		EditorGUI.LabelField(Rect(rt.x+margin+165+110, rt.y+37, 220, 18),"|");
		
		GUI.contentColor = Color(1.0,1.0,1.0,0.4);
		EditorGUI.LabelField(linkHelpRect,"help");
		EditorGUI.LabelField(linkBugRect,"report bug");
		EditorGUI.LabelField(linkURLRect,"tanukidigital.com");
		// end menu

		GUI.contentColor  = Color(1.0,1.0,1.0,1.0);
		

        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,36),logoTexb);
        GUILayout.Space(40.0);
        
      
        rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
        


    
    
        //showGeneral = EditorGUI.Foldout(Rect (rt.x+margin+3, rt.y+5, 300, 20), showGeneral, "");
        //GUI.Label (Rect (rt.x+margin+20, rt.y+5, 300, 20), GUIContent ("SETTINGS"));
        //if (showGeneral){

			//GUILayout.Space(60.0);
		//}
        //GUILayout.Space(10.0);
        verAdd = 0;
        GUI.contentColor = colorEnabled;
		EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+15, 130, 18),"Unity Version Target");
		target.unityVersionIndex = EditorGUI.Popup(Rect(rt.x+margin+165, rt.y+15, setWidth, 18),"",target.unityVersionIndex, target.unityVersionOptions);

       		
		EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+verAdd+35, 140, 18),"Scene Camera Object");
		target.setCamera = EditorGUI.ObjectField(Rect(rt.x+margin+165, rt.y+verAdd+35, setWidth, 18),"",target.setCamera, Transform, true);
		EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+verAdd+55, 140, 18),"Scene Track Object");
		target.setTrack = EditorGUI.ObjectField(Rect(rt.x+margin+165, rt.y+verAdd+55, setWidth, 18),"",target.setTrack, Transform, true);
		EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+verAdd+75, 140, 18),"Suimono Sound Object");
		target.soundObject = EditorGUI.ObjectField(Rect(rt.x+margin+165, rt.y+verAdd+75, setWidth, 18),"",target.soundObject, Transform, true);
			
		GUILayout.Space(100.0+verAdd);
		
		rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
		target.showGeneral = EditorGUI.Foldout(Rect (rt.x+margin+3, rt.y+5, 20, 20), target.showGeneral, "");
       	GUI.Label (Rect (rt.x+margin+20, rt.y+5, 300, 20), GUIContent ("GENERAL SETTINGS"));
       	 	
       	if (target.showGeneral){
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+30, 140, 18),"Enable Sounds");
			target.playSounds = EditorGUI.Toggle(Rect(rt.x+margin+165, rt.y+30, setWidth, 18),"", target.playSounds);
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+50, 140, 18),"Max Sound Volume");
			target.maxVolume = EditorGUI.Slider(Rect(rt.x+margin+165, rt.y+50, setWidth, 18),"",target.maxVolume,0.0,1.0);
			
			
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+70, 140, 18),"Enable Underwater FX");
			target.enableUnderwaterFX = EditorGUI.Toggle(Rect(rt.x+margin+165, rt.y+70, setWidth, 18),"", target.enableUnderwaterFX);
			//target.enableUnderwaterDeferred = EditorGUI.Toggle(Rect(rt.x+margin+210, rt.y+80, 200, 18),"Use Deferred Renderer", target.enableUnderwaterDeferred);
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+90, 140, 18),"Enable Transition FX");		
			target.enableTransition = EditorGUI.Toggle(Rect(rt.x+margin+165, rt.y+90, setWidth, 18),"", target.enableTransition);
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+110, 140, 18),"Underwater Offset");
			target.transition_offset = EditorGUI.Slider(Rect(rt.x+margin+165, rt.y+110, setWidth, 18),"",target.transition_offset,0.0,1.0);		
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+130, 140, 18),"FX Offset");
			target.cameraPlane_offset = EditorGUI.Slider(Rect(rt.x+margin+165, rt.y+130, setWidth, 18),"",target.cameraPlane_offset,0.001,5.0);
			//target.manageShaders = EditorGUI.Toggle(Rect(rt.x+margin+10, rt.y+130, 170, 18),"Manage Shaders", target.manageShaders);
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+150, 140, 18),"Enable Interaction");
			target.enableInteraction = EditorGUI.Toggle(Rect(rt.x+margin+165, rt.y+150, setWidth, 18),"", target.enableInteraction);
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+170, 140, 18),"Show Debug");
			target.showDebug = EditorGUI.Toggle(Rect(rt.x+margin+165, rt.y+170, setWidth, 18),"", target.showDebug);
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+190, 140, 18),"Use UV Reversal");
			target.useUVReversal = EditorGUI.Toggle(Rect(rt.x+margin+165, rt.y+190, setWidth, 18),"",target.useUVReversal);


			GUILayout.Space(200.0);
		}
		GUILayout.Space(10.0);
		
		



		rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
       	target.showPerformance = EditorGUI.Foldout(Rect (rt.x+margin+3, rt.y+5, 20, 20), target.showPerformance, "");
       	GUI.Label (Rect (rt.x+margin+20, rt.y+5, 300, 20), GUIContent ("PERFORMANCE SETTINGS"));
       	 	
       	if (target.showPerformance){



			GUI.contentColor = colorDisabled;
			GUI.backgroundColor = colorDisabled;
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+28, 375, 18),"--------------------------------------------------------------------------");
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+40, 160, 18),"WATER TRANSPARENCY");
        	GUI.contentColor = colorEnabled;
        	GUI.backgroundColor = colorEnabled;
  			EditorGUI.LabelField(Rect(rt.x+margin+47, rt.y+57, 140, 18),"Enable");
  			target.enableTransparency = EditorGUI.Toggle(Rect(rt.x+margin+27, rt.y+57, 20, 18),"", target.enableTransparency);
			if (!target.enableTransparency){
				GUI.contentColor = colorDisabled;
				GUI.backgroundColor = colorDisabled;
			}
			EditorGUI.LabelField(Rect(rt.x+margin+190, rt.y+40, 180, 18),"Render Layers");
			if (target.gameObject.activeInHierarchy){
				target.transLayer = EditorGUI.MaskField(Rect(rt.x+margin+285, rt.y+40, 100, 18),"", target.transLayer, target.suiLayerMasks);
			}
			EditorGUI.LabelField(Rect(rt.x+margin+190, rt.y+57, 180, 18),"Use Resolution");
			if (target.gameObject.activeInHierarchy){
				target.transResolution = EditorGUI.Popup(Rect(rt.x+margin+285, rt.y+57, 100, 18),"", target.transResolution, target.resOptions);
			}









			GUI.contentColor = colorDisabled;
			GUI.backgroundColor = colorDisabled;
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+77, 375, 18),"--------------------------------------------------------------------------");
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+89, 160, 18),"REFLECTIONS");
        	GUI.contentColor = colorEnabled;
        	GUI.backgroundColor = colorEnabled;
  			EditorGUI.LabelField(Rect(rt.x+margin+47, rt.y+106, 140, 18),"Enable");
  			target.enableDynamicReflections = EditorGUI.Toggle(Rect(rt.x+margin+27, rt.y+106, 20, 18),"", target.enableDynamicReflections);


			GUI.contentColor = colorDisabled;
			GUI.backgroundColor = colorDisabled;
			//EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+126, 375, 18),"--------------------------------------------------------------------------");
        	EditorGUI.DrawPreviewTexture(Rect(rt.x+margin+10,rt.y+130,372,1),divHorizTex);
        	GUI.contentColor = colorEnabled;
        	GUI.backgroundColor = colorEnabled;

			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+135, 160, 18),"CAUSTIC FX");
        	GUI.contentColor = colorEnabled;
        	GUI.backgroundColor = colorEnabled;
  			EditorGUI.LabelField(Rect(rt.x+margin+47, rt.y+156, 140, 18),"Enable");
  			target.enableCaustics = EditorGUI.Toggle(Rect(rt.x+margin+27, rt.y+156, 20, 18),"", target.enableCaustics);



       		//EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+130, 140, 18),"Use Dynamic Reflections");
       		//target.enableDynamicReflections = EditorGUI.Toggle(Rect(rt.x+margin+165, rt.y+130, setWidth, 18),"", target.enableDynamicReflections);

       		//EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+150, 140, 18),"Enable Caustics");
       		//target.enableCaustics = EditorGUI.Toggle(Rect(rt.x+margin+165, rt.y+150, setWidth, 18),"", target.enableCaustics);
			
			if (!target.enableCaustics){
				GUI.contentColor = colorDisabled;
        		GUI.backgroundColor = colorDisabled;
			}
			
			EditorGUI.LabelField(Rect(rt.x+margin+27, rt.y+170, 140, 18),"Number of Caustics");
			target.causticObjectNum = EditorGUI.IntSlider(Rect(rt.x+margin+165, rt.y+170, setWidth, 18),"",target.causticObjectNum,0,45);
			GUI.contentColor = colorEnabled;
        	GUI.backgroundColor = colorEnabled;
			//EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+190, 140, 18),"Blur Quality Samples");
			//target.blurSamples = EditorGUI.IntSlider(Rect(rt.x+margin+165, rt.y+190, setWidth, 18),"",target.blurSamples,2,45);

			
			GUILayout.Space(180.0);
				
		}
       	GUILayout.Space(10.0);
			

				



       	if (target.useTenkoku == 1.0){
			rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
	        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
	       	target.showTenkoku = EditorGUI.Foldout(Rect (rt.x+margin+3, rt.y+5, 20, 20), target.showTenkoku, "");
	       	GUI.Label (Rect (rt.x+margin+20, rt.y+5, 300, 20), GUIContent ("TENKOKU SKY SYSTEM - INTEGRATION"));
	       	 	
	       	if (target.showTenkoku){

	       		EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+30, 140, 18),"Use Wind Settings");
	       		target.tenkokuUseWind = EditorGUI.Toggle(Rect(rt.x+margin+125, rt.y+30, setWidth, 18),"", target.tenkokuUseWind);
				
				EditorGUI.LabelField(Rect(rt.x+margin+195, rt.y+30, 150, 18),"Calculate Sky Reflections");
	       		target.tenkokuUseReflect = EditorGUI.Toggle(Rect(rt.x+margin+350, rt.y+30, setWidth, 18),"", target.tenkokuUseReflect);

			}
	       	GUILayout.Space(50.0);
       	}
	    GUILayout.Space(10.0);


	        //target.setCamera = EditorGUILayout.ObjectField("Scene Camera Object",target.setCamera, Transform, true);

	        //target.setTrack = EditorGUILayout.ObjectField("Scene Track Object",target.setTrack, Transform, true);

	        //ERROR CHECK (require WATER_Module game object in scene!)
	        //if (GameObject.Find("WATER_Module").gameObject == null){
	        //	EditorGUILayout.HelpBox("A WATER_Module object is required in your scene!",MessageType.Error);
	        //}
	        
	        //SOUND SETTINGS
	        //target.soundObject = EditorGUILayout.ObjectField("Suimono Sound Object",target.soundObject, Transform, true);
	        //target.playSounds = EditorGUILayout.Toggle("Enable Sounds", target.playSounds);
			//target.maxVolume = EditorGUILayout.Slider("Max Sound Volume",target.maxVolume,0.0,1.0);
			//GUILayout.Space(186.0);
			
	        //GENERAL SETTINGS

	        //showUnderwater = EditorGUILayout.Foldout(showUnderwater, "__ UNDERWATER SETTINGS _____________________________________________________________________________");
            //if (showUnderwater){

            
            //if (isPro) EditorGUILayout.LabelField("UNITY BASIC!");
            
            	//if (!target.enableUnderwaterPhysics) GUI.color = colorDisabled;
            	//target.enableUnderwaterPhysics = EditorGUILayout.Toggle("Enable Underwater Physics", target.enableUnderwaterPhysics);
				//GUI.color = colorEnabled;
				
				//if (!target.enableUnderwaterFX) GUI.color = colorDisabled;
            	//target.enableUnderwaterFX = EditorGUILayout.Toggle("Enable Underwater FX", target.enableUnderwaterFX);
				//GUI.color = colorEnabled;
            	
            	
            	
            	
            	
            	/*
            	if (target.enableUnderwaterFX){
            		//target.enableRefraction = EditorGUILayout.Toggle("   Enable Refraction", target.enableRefraction);
            		//if (target.enableRefraction){
            		if (!target.enableRefraction) GUI.color = colorDisabled;
            		EditorGUILayout.BeginHorizontal();
            		target.enableRefraction = EditorGUILayout.Toggle("     Enable Refraction", target.enableRefraction);
            		target.refractionAmount = EditorGUILayout.Slider("",target.refractionAmount,0.0,1.0,GUILayout.Width(220));
            		EditorGUILayout.EndHorizontal();
            		GUI.color = colorEnabled;
            		//if (target.refractionAmount == 0.0) target.enableRefraction = false;
            		//if (target.refractionAmount > 0.0) target.enableRefraction = true;
            		//}
            		
            		//target.enableBlur = EditorGUILayout.Toggle("   Enable Blur", target.enableBlur);
            		//if (target.enableBlur){
            		if (!target.enableBlur) GUI.color = colorDisabled;
            		EditorGUILayout.BeginHorizontal();
            		target.enableBlur = EditorGUILayout.Toggle("     Enable Blur", target.enableBlur);
            		target.blurAmount = EditorGUILayout.Slider("",target.blurAmount,0.0,0.005,GUILayout.Width(220));
            		EditorGUILayout.EndHorizontal();
            		GUI.color = colorEnabled;
            		//if (target.blurAmount == 0.0) target.enableBlur = false;
            		//if (target.blurAmount > 0.0) target.enableBlur = true;
            		//}
            		EditorGUILayout.BeginHorizontal();
            		target.enableAutoColor = EditorGUILayout.Toggle("     Enable Auto-Color", target.enableAutoColor);
            		if (target.enableAutoColor){
            			GUI.color = colorEnabled;
            			EditorGUILayout.LabelField("Auto Color is ON");
            		}
            		if (!target.enableAutoColor){
            			GUI.color = colorDisabled;
            			EditorGUILayout.LabelField("Auto Color is OFF");
            		}
            		GUI.color = colorEnabled;
            		EditorGUILayout.EndHorizontal();
            		
            		if (!target.enableAutoColor){
            			target.underwaterColor = EditorGUILayout.ColorField("          Custom Color",target.underwaterColor);
            		}
            		
            		
            		
            		EditorGUILayout.Space();
            		EditorGUILayout.Space();
            		target.showDebug = EditorGUILayout.Toggle("Show Debug Effects", target.showDebug);
            		
            	}
            	*/
            
            
            //}
            
            /*
            target.lightAbsorb = EditorGUILayout.Slider("Light Absorption",target.lightAbsorb,0.0,1.0);
			target.lightRefract = EditorGUILayout.Slider("Refraction Amount",target.lightRefract,0.0,1.0);
			
			target.overallScale = EditorGUILayout.FloatField("Master Scale",target.overallScale);
			
			target.foamScale = EditorGUILayout.Slider("Foam Scale",target.foamScale,0.0,1.0);
			target.foamAmt = EditorGUILayout.Slider("Foam Amount",target.foamAmt,0.0,1.0);
			target.foamColor = EditorGUILayout.ColorField("Foam Color",target.foamColor);

			target.reflectDist = EditorGUILayout.Slider("Reflection Distance",target.reflectDist,0.0,1.0);
			target.reflectSpread = EditorGUILayout.Slider("Reflection Spread",target.reflectSpread,0.0,1.0);
			target.colorDynReflect = EditorGUILayout.ColorField("Reflection Color",target.colorDynReflect);

			target.surfaceSmooth = EditorGUILayout.Slider("Surface Roughness",target.surfaceSmooth,0.0,1.0);

			


	        //REFLECTION PROPERTIES
	        showUnder = EditorGUILayout.Foldout(showUnder, "__ UNDERWATER PROPERTIES _____________________________________________________________________________");
            if (showUnder){
            	target.etherealShift = EditorGUILayout.Slider("Ethereal Shift",target.etherealShift,0.0,5.0);
            }

	        //COLOR AND SCALING
	        showColor = EditorGUILayout.Foldout(showColor, "__ COLOR / SCALE _____________________________________________________________________________");
	        if (showColor){
				target.depthColor = EditorGUILayout.ColorField("Water Surface Color",target.depthColor);
            }
            
	        //REFLECTION PROPERTIES
	        showReflect = EditorGUILayout.Foldout(showReflect, "__ REFLECTION PROPERTIES _____________________________________________________________________________");
            
	        //WAVE and ANIMATION
	        showWaves = EditorGUILayout.Foldout(showWaves, "__ WAVE ANIMATION _____________________________________________________________________________");
            if(showWaves){
	        	
	        	EditorGUILayout.Space();
        		EditorGUILayout.LabelField("------------------------------------------------------------------------------------------");
        		target.flow_dir = EditorGUILayout.Vector2Field("Flow Direction", target.flow_dir);
        		target.waveSpeed = EditorGUILayout.Slider("Flow Speed",target.waveSpeed,0.0,0.25);
	        	target.foamSpeed = EditorGUILayout.Slider("Foam Speed",target.foamSpeed,0.0,0.5);
	       		EditorGUILayout.LabelField("------------------------------------------------------------------------------------------");
        		EditorGUILayout.Space();
        		
	        }
	        //var flow_dir : Vector2 = Vector2(0.0015,0.0015);
			//var wave_dir : Vector2 = Vector2(0.0015,0.0015);
			//var foam_dir : Vector2 = Vector2(-0.02,-0.02);
			//var water_dir : Vector2 = Vector2(0.0,0.0);



	        
        	
        	//PRESETS
        	showPresets = EditorGUILayout.Foldout(showPresets, "__ PRESETS _____________________________________________________________________________");
            if(showPresets){
            
        		EditorGUILayout.Space();
        		target.presetIndex = EditorGUILayout.Popup("CURRENT PRESET",target.presetIndex, target.presetOptions);
        		
        		
        		EditorGUILayout.LabelField("------------------------------------------------------------------------------------------");
        		target.presetSaveName = EditorGUILayout.TextField("Save New Preset as:", target.presetSaveName);
        		if(GUILayout.Button("Save Preset")){
        			target.PresetSave();
        		}
				
        		//showPresetTrans = EditorGUILayout.Foldout(showPresetTrans,"Manage Preset Transitions");
        		//EditorGUILayout.Space();
        		EditorGUILayout.LabelField("---------------------------------------------------------------------------------");
        		//if (showPresetTrans){
        			target.presetTransIndex = EditorGUILayout.Popup("Transition to Preset",target.presetTransIndex, target.presetOptions);
        		
        		    target.presetTransitionTime = EditorGUILayout.FloatField("Set Transition Time:", target.presetTransitionTime);
        		    EditorGUILayout.LabelField("Transitioning: " + (target.presetTransitionCurrent * target.presetTransitionTime) + " of " + target.presetTransitionTime + " seconds");
        			var transAction : String = "Start";
        			if (target.presetStartTransition) transAction = "Stop";
        			if(GUILayout.Button(transAction + " Transition")){
        				target.presetStartTransition = !target.presetStartTransition;
        			}
        		
        		//}
        	}
        	
        	
        	//SPLASH EFFECTS
        	showSplash = EditorGUILayout.Foldout(showSplash, "__ SPLASH EFFECTS _____________________________________________________________________________");
            if(showSplash){
				target.splashIsOn = EditorGUILayout.Toggle("Splash is Enabled:", target.splashIsOn);
				if (target.splashIsOn){
					target.UpdateSpeed = EditorGUILayout.FloatField("Update Speed:", target.UpdateSpeed);
					target.rippleSensitivity = EditorGUILayout.FloatField("Ripple Sensitivity:", target.rippleSensitivity);
					target.splashSensitivity = EditorGUILayout.FloatField("Splash Sensitivity:", target.splashSensitivity);
				}
			}
			
			
			
        	
        	//display image
			//var fileName = (Application.dataPath + "/" + "SUIMONO - WATER SYSTEM 2" + "/EDITOR/_PRESETS");
			//var previewTex : Texture = Resources.Load(filename);
			//EditorGUILayout.Label(previewTex);
			*/
			
        	
        if (GUI.changed)
            EditorUtility.SetDirty (target);
    }
    
    
    
    
    
}