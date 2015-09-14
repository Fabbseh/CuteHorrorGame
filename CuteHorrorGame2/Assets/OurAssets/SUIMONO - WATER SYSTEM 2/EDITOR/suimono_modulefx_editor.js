
@script ExecuteInEditMode()
@CustomEditor (SuimonoModuleFX)

class suimono_modulefx_editor extends Editor {



	var renName : String="";
	var setRename : int = 0;
	
	var localPresetIndex : int = -1;
	
	var showErrors : boolean = false;
	var showPresets : boolean = false;
 	var showSplash : boolean = false;
  	var showWaves : boolean = false;
  	var showGeneral : boolean = false;
  	var showSurface : boolean = false;
   	var showUnderwater : boolean = false;
  	var showEffects : boolean = false;
  	var showColor : boolean = false;
   	var showReflect : boolean = false;
 	var showFoam : boolean = false;
 	
 	var logoTex : Texture = Resources.Load("textures/gui_tex_suimonologo");
	var divTex : Texture = Resources.Load("textures/gui_tex_suimonodiv");
	var divRevTex : Texture = Resources.Load("textures/gui_tex_suimonodivrev");
	var divVertTex : Texture = Resources.Load("textures/gui_tex_suimono_divvert");
	var divHorizTex : Texture = Resources.Load("textures/gui_tex_suimono_divhorz");
	
	var bgPreset : Texture = Resources.Load("textures/gui_bgpreset");
	var bgPresetSt : Texture = Resources.Load("textures/gui_bgpresetSt");
	var bgPresetNd : Texture = Resources.Load("textures/gui_bgpresetNd");
			
 	var colorEnabled : Color = Color(1.0,1.0,1.0,1.0);
	var colorDisabled : Color = Color(1.0,1.0,1.0,0.35);
	
	var highlightColor2 : Color = Color(0.7,1,0.2,0.6);//Color(0.7,1,0.2,0.6);
	var highlightColor : Color = Color(1,0.5,0,0.9);
 	//var highlightColor3 : Color = Color(0.7,1,0.2,0.6);
 	
 	var aMin : float = 0.9;
 	var aMax : float = 1.0;
  	var apMin : float = 0.9;
 	var apMax : float = 1.1;
 	//function OnInspectorUpdate() {
	//	Repaint();
	//}	
		
		
    function OnInspectorGUI () {
    

 	/*
    	if (localPresetIndex == -1) localPresetIndex = target.presetUseIndex;
    
        //check for unity vs unity pro & load textures
        
        #if !UNITY_4_3
		if (!PlayerSettings.advancedLicense){
			divTex = Resources.Load("textures/gui_tex_suimonodiv_i");
			logoTex = Resources.Load("textures/gui_tex_suimonologo_i");
			bgPreset = Resources.Load("textures/gui_bgpreset_i");
			bgPresetSt = Resources.Load("textures/gui_bgpresetSt_i");
			bgPresetNd = Resources.Load("textures/gui_bgpresetNd_i");
			highlightColor = Color(0.0,0.81,0.9,0.6);
		}
		#endif
		*/
		



		#if UNITY_PRO_LICENSE
			divTex = Resources.Load("textures/gui_tex_suimonodiv");
			logoTex = Resources.Load("textures/gui_tex_suimonologofxsys");
			bgPreset = Resources.Load("textures/gui_bgpreset");
			bgPresetSt = Resources.Load("textures/gui_bgpresetSt");
			bgPresetNd = Resources.Load("textures/gui_bgpresetNd");
			highlightColor = Color(1,0.5,0,0.9);
		#else
			divTex = Resources.Load("textures/gui_tex_suimonodiv_i");
			logoTex = Resources.Load("textures/gui_tex_suimonologofxsys_i");
			bgPreset = Resources.Load("textures/gui_bgpreset_i");
			bgPresetSt = Resources.Load("textures/gui_bgpresetSt_i");
			bgPresetNd = Resources.Load("textures/gui_bgpresetNd_i");
			highlightColor = Color(0.0,0.81,0.9,0.6);
		#endif
		
		
		
		//SUIMONO LOGO
		var buttonText : GUIContent = new GUIContent(""); 
		var buttonStyle : GUIStyle = GUIStyle.none; 
		var rt : Rect = GUILayoutUtility.GetRect(buttonText, buttonStyle);
		var margin : int = 15;
		//GUI.color = colorEnabled;
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,36),logoTex);
        GUILayout.Space(25.0);
        
        
        
        //SET EFFECT SYSTEMS
        //rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
        //EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
        //EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y+30,387,24),divRevTex);
 
 
 
        //GUILayout.Space(30.0);


         
         
         
         
         
        //SET SYSTEMS
		rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
		EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
		EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y+89+(target.effectsSystems.Length*28.0),387,24),divRevTex);
		
		//EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+15, 387, 18),"SET ACTIVATION RULES");
		
		var lbl : String[] = target.effectsLabels;
		
		if (target.effectsSystems.Length <= 0){
			//GUI.color = colorDisabled;
			EditorGUI.LabelField(Rect(rt.x+margin+50, rt.y+35, 387, 18),"THERE ARE CURRENTLY NO FX SYSTMS...");
			//GUI.color = colorEnabled;
		} else {
			for (var rL : int = 0; rL < target.effectsSystems.Length; rL++){
			if (rL < target.effectsSystems.Length){
			
							
				EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y+35+(rL * 28.0),387,24),divTex);
				//EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y+17+(rL * 40.0),387,24),divRevTex);

				//GUI.color = colorDisabled;
				if (GUI.Button(Rect(rt.x+margin+10,rt.y+15+(rL * 28.0),18,16),"-")){
					target.DeleteSystem(rL);
				}

		
				//GUI.color = colorEnabled;
				//var lbl = EditorGUI.TextField(Rect(rt.x+margin+35, rt.y+15+(rL * 40.0), 100, 18),target.effectsLabels[rL]);
				//target.SetLabel(lbl,rL);
				//var lbl : String = target.effectsLabels[rL];
				
				//lbl[rL] = EditorGUI.TextField(Rect(rt.x+margin+35, rt.y+15+(rL * 40.0), 100, 18),target.effectsLabels[rL]);
				//if (lbl[rL] != target.effectsLabels[rL]){
				//	target.SetLabel(lbl[rL],rL);
				//	target.effectsLabels[rL] = lbl[rL];
				//}
				
				target.effectsSystems[rL] = EditorGUI.ObjectField(Rect(rt.x+margin+40, rt.y+14+(rL * 28.0), 210, 18), target.effectsSystems[rL], Transform, true);
				target.clampIndex[rL] = EditorGUI.Popup(Rect(rt.x+margin+260, rt.y+15+(rL * 28.0), 120, 18),"",target.clampIndex[rL], target.clampOptions);

			
				//if (GUI.Button(Rect(rt.x+margin+370, rt.y+15+(rL * 40.0), 30, 14),"OK")){
				//	target.SetLabel(lbl,rL);
					//lbl = target.effectsLabels[rL];
				//}
				
				
				//if (target.ruleIndex[rL] > 3 && target.ruleIndex[rL] < 8){
				//	target.ruleIndex[rL] = EditorGUI.Popup(Rect(rt.x+margin+90, rt.y+45+(rL * 20.0), 246, 18),"",target.ruleIndex[rL], target.ruleOptions);
				//	target.effectData[rL] = EditorGUI.FloatField(Rect(rt.x+margin+340, rt.y+44+(rL * 20.0), 30, 18),"",target.effectData[rL]);
				//} else {
				//	target.ruleIndex[rL] = EditorGUI.Popup(Rect(rt.x+margin+90, rt.y+45+(rL * 20.0), 280, 18),"",target.ruleIndex[rL], target.ruleOptions);
				//}
				
				GUILayout.Space(28.0);
			}
			}
		}
		
		if (GUI.Button(Rect(rt.x+margin+90,rt.y+20+(target.effectsSystems.Length*28.0),200,18),"+ ADD NEW SYSTEM")) target.AddSystem();
	
         
        GUILayout.Space(100.0);
         
         
        
        
    	//ERROR CHECK (require WATER_Module game object in scene!)
	    //if (GameObject.Find("SUIMONO_Module").gameObject == null){
	    //	EditorGUILayout.HelpBox("A SUIMONO_Module object is required in your scene!",MessageType.Error);
	    //}
        
	/*
        // GENERAL SETTINGS
        rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
        target.showGeneral = EditorGUI.Foldout(Rect (rt.x+margin+3, rt.y+5, 20, 20), target.showGeneral, "");
        GUI.Label (Rect (rt.x+margin+20, rt.y+5, 300, 20), GUIContent ("GENERAL SETTINGS"));
        if (target.showGeneral){
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+30, 80, 18),"Surface Type");
			target.typeIndex = EditorGUI.Popup(Rect(rt.x+margin+100, rt.y+30, 145, 18),"",target.typeIndex, target.typeOptions);
			EditorGUI.LabelField(Rect(rt.x+margin+260, rt.y+30, 80, 18),"Overall Scale");
	        target.overallScale = EditorGUI.FloatField(Rect(rt.x+margin+350, rt.y+30, 30, 18),"",target.overallScale);

			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+60, 90, 18),"Flow Direction");
        	target.flow_dir_degrees = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+60, 270, 18),"",target.flow_dir_degrees,0.0,360.0);
        	EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+80, 90, 18),"Flow Speed");
        	target.flowSpeed = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+80, 270, 18),"",target.flowSpeed,0.0,1.0);
        	EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+100, 90, 18),"Foam Speed");
			target.foamSpeed = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+100, 270, 18),"",target.foamSpeed,0.0,1.0);

  			target.enableCustomTextures = EditorGUI.Toggle(Rect(rt.x+margin+10, rt.y+130, 170, 18),"Use Custom Textures", target.enableCustomTextures);
  			target.enableDynamicReflections = EditorGUI.Toggle(Rect(rt.x+margin+210, rt.y+130, 200, 18),"Use Dynamic Reflection", target.enableDynamicReflections);
  				
			GUILayout.Space(130.0);
			
		}
        GUILayout.Space(10.0);
        
        
        
        
              
        //TESSELLATION SETTINGS
        //only show for non OSX users and only when DX11 is enabled.
        #if !UNITY_STANDALONE_OSX
        if (PlayerSettings.useDirect3D11){
	        if (target.typeIndex == 0 || target.typeIndex == 1){
	        rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
	        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
	        target.showTess = EditorGUI.Foldout(Rect (rt.x+margin+3, rt.y+5, 20, 20), target.showTess, "");
	        GUI.Label (Rect (rt.x+margin+20, rt.y+5, 300, 20), GUIContent ("TESSELLATION DX11"));
	        if (target.showTess){
				target.waveTessAmt = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+30, 370, 18),"Tessellation Factor",target.waveTessAmt,0.0,1000.0);
				target.waveTessMin = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+50, 370, 18),"Tessellation Start",target.waveTessMin,0.0,1.0);
				target.waveTessSpread = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+70, 370, 18),"Tessellation Spread",target.waveTessSpread,0.0,1.0);
	
				target.autoTess = EditorGUI.Toggle(Rect(rt.x+margin+10, rt.y+90, 370, 18),"Use Auto Tessellation", target.autoTess);

				target.waveFac = 1.0;
	
				GUILayout.Space(100.0);
			}
	        GUILayout.Space(10.0);
	        
	        } else {
		       	
		       	target.waveFac = 0.0;
		       	
	        }
        }
		#endif
    
        
        
        //WAVE SETTINGS
        //if (target.typeIndex == 0 || target.typeIndex == 1){
        rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
        target.showWaves = EditorGUI.Foldout(Rect (rt.x+margin+3, rt.y+5, 20, 20), target.showWaves, "");
        if (target.typeIndex == 0 || target.typeIndex == 1){
        	GUI.Label (Rect (rt.x+margin+20, rt.y+5, 300, 20), GUIContent ("3D WAVE SETTINGS"));
        } else {
        	GUI.Label (Rect (rt.x+margin+20, rt.y+5, 300, 20), GUIContent ("WAVE SETTINGS"));
        }
        if (target.showWaves){
        	if (target.typeIndex == 0 || target.typeIndex == 1){
				target.waveHeight = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+30, 370, 18),"Deep Wave Height",target.waveHeight,0.01,10.0);
				target.waveScale = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+50, 370, 18),"Deep Wave Scale",target.waveScale,0.0,1.0);
			} else {
				target.waveHeight = 0.1;
				target.waveScale = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+30, 370, 18),"Deep Wave Scale",target.waveScale,0.0,1.0);

			}

			if (target.typeIndex == 0 || target.typeIndex == 1){
				target.detailHeight = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+80, 370, 18),"Detail Wave Height",target.detailHeight,0.0,3.0);
				target.detailScale = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+100, 370, 18),"Detail Wave Scale",target.detailScale,0.0,1.0);
			} else {
				target.detailHeight = 0.0;
				target.detailScale = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+50, 370, 18),"Detail Wave Scale",target.detailScale,0.0,1.0);
			}
		
			if (target.typeIndex == 0 || target.typeIndex == 1){
			target.normalShore = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+130, 370, 18),"Normalize Shoreline",target.normalShore,0.0,1.0);
			target.waveShoreHeight = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+150, 370, 18),"Shallow Wave Height",target.waveShoreHeight,0.0,20.0);
			target.waveShoreScale = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+170, 370, 18),"Shallow Wave Scale",target.waveShoreScale,0.0,1.0);
        	
        	target.shoreSpeed = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+190, 370, 18),"Shallow Wave Speed",target.shoreSpeed,0.0,1.0);
        	}


			
  			
  			if (target.typeIndex == 0 || target.typeIndex == 1){
  				target.waveFac = 1.0;
				GUILayout.Space(200.0);
			} else {
				//target.waveFac = 0.0;
				GUILayout.Space(60.0);
			}
		}
        GUILayout.Space(10.0);
        
        //} else {
	       	
	    //  	target.waveFac = 0.0;
	       	
        //}
        
        
        
        
        
        // SURFACE SETTINGS
        rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
        target.showSurface = EditorGUI.Foldout(Rect (rt.x+margin+3, rt.y+5, 20, 20), target.showSurface, "");
        GUI.Label (Rect (rt.x+margin+20, rt.y+5, 300, 20), GUIContent ("WATER SURFACE"));
        if (target.showSurface){
			target.lightAbsorb = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+30, 370, 18),"Light Absorption",target.lightAbsorb,0.0,1.0);
			target.lightRefract = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+50, 370, 18),"Refraction Amount",target.lightRefract,0.0,1.0);
			target.refractShift = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+70, 370, 18),"Refraction Shift",target.refractShift,0.0,1.0);
			//target.refractScale = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+90, 370, 18),"Refraction Scale",target.refractScale,0.0,1.0);
			target.blurSpread = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+90, 370, 18),"Blur Amount",target.blurSpread,0.0,1.0);
			target.surfaceSmooth = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+110, 370, 18),"Surface Roughness",target.surfaceSmooth,0.0,1.0);
			
			target.reflectDist = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+145, 370, 18),"Reflection Distance",target.reflectDist,0.0,1.0);
			target.reflectSpread = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+165, 370, 18),"Reflection Spread",target.reflectSpread,0.0,1.0);
			target.reflectionOffset = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+185, 370, 18),"Reflection Strength",target.reflectionOffset,0.0,1.0);
			target.colorDynReflect = EditorGUI.ColorField(Rect(rt.x+margin+10, rt.y+205, 370, 18),"Reflection Color",target.colorDynReflect);
			
            target.colorSurfHigh = EditorGUI.ColorField(Rect(rt.x+margin+10, rt.y+240, 370, 18),"Surface High Color",target.colorSurfHigh);
            target.colorSurfLow = EditorGUI.ColorField(Rect(rt.x+margin+10, rt.y+260, 370, 18),"Surface Back Color",target.colorSurfLow);
            
            target.depthColor = EditorGUI.ColorField(Rect(rt.x+margin+10, rt.y+300, 370, 18),"Surface Color",target.depthColor);
            target.depthColorR = EditorGUI.ColorField(Rect(rt.x+margin+10, rt.y+320, 370, 18),"Depth Color (Shallow)",target.depthColorR);
            target.depthColorG = EditorGUI.ColorField(Rect(rt.x+margin+10, rt.y+340, 370, 18),"Depth Color (Medium)",target.depthColorG);
            target.depthColorB = EditorGUI.ColorField(Rect(rt.x+margin+10, rt.y+360, 370, 18),"Depth Color (Deep)",target.depthColorB);
            
            
            target.specColorL = EditorGUI.ColorField(Rect(rt.x+margin+10, rt.y+400, 370, 18),"Specular Color",target.specColorL);
            target.specColorH = EditorGUI.ColorField(Rect(rt.x+margin+10, rt.y+420, 370, 18),"Specular Hot",target.specColorH);
            target.specScatterAmt = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+440, 370, 18),"Specular Amount",target.specScatterAmt,0.0,1.0);
            target.specScatterWidth = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+460, 370, 18),"Hot Specular Amount",target.specScatterWidth,0.0,1.0);
                
            
            //target.tideColor = EditorGUI.ColorField(Rect(rt.x+margin+10, rt.y+500, 370, 18),"Tide Color",target.tideColor);
            //target.tideAmount = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+520, 370, 18),"Tide Offset",target.tideAmount,0.0,1.0);
            //target.tideSpread = EditorGUI.Slider(Rect(rt.x+margin+10, rt.y+540, 370, 18),"Tide Spread",target.tideSpread,0.02,1.0);
               
               
            //GUI.color = colorDisabled;
            //if (target.enableCustomTextures) GUI.color = colorEnabled;
  			//target.enableCustomTextures = EditorGUI.Toggle(Rect(rt.x+margin+10, rt.y+520, 170, 18),"Use Custom Textures", target.enableCustomTextures);
  			//GUI.color = colorEnabled;
			//if (target.customTextures){
	        
	        //}
  			
			GUILayout.Space(480.0);
		}
        GUILayout.Space(10.0);

      
      
      
      
      
      
      

        
      
      
      
        // FOAM SETTINGS
        rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
        target.showFoam = EditorGUI.Foldout(Rect (rt.x+margin+3, rt.y+5, 20, 20), target.showFoam, "");
        GUI.Label (Rect (rt.x+margin+20, rt.y+5, 300, 20), GUIContent ("FOAM & EDGE"));
        if (target.showFoam){
			
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+30, 90, 18),"Foam Scale");
        	target.foamScale = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+30, 270, 18),"",target.foamScale,0.0,1.0);
        	EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+50, 90, 18),"Foam Color");
        	target.foamColor = EditorGUI.ColorField(Rect(rt.x+margin+110, rt.y+50, 270, 18),"",target.foamColor);
        	
        	EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+80, 90, 18),"Foam Amount");
        	target.foamAmt = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+80, 270, 18),"",target.foamAmt,0.0,1.0);

			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+100, 90, 18),"Wave Height");
        	target.hFoamHeight = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+100, 270, 18),"",target.hFoamHeight,0.0,1.0);
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+120, 90, 18),"Wave Amount");
        	target.hFoamAmt = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+120, 270, 18),"",target.hFoamAmt,0.0,1.0);
        	EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+140, 90, 18),"Wave Spread");
        	target.hFoamSpread = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+140, 270, 18),"",target.hFoamSpread,0.0,1.0);

			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+170, 90, 18),"Edge Blend");
        	target.edgeBlend = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+170, 270, 18),"",target.edgeBlend,0.0,1.0);
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+190, 90, 18),"Edge Amount");
        	target.edgeSpread = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+190, 270, 18),"",target.edgeSpread,0.0,1.0);
        	EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+210, 90, 18),"Edge Color");
        	target.edgeColor = EditorGUI.ColorField(Rect(rt.x+margin+110, rt.y+210, 270, 18),"",target.edgeColor);


			GUILayout.Space(225.0);
		}
        GUILayout.Space(10.0);
        
        
        
        
        
        

        // UNDERWATER SETTINGS
        rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
        target.showUnderwater = EditorGUI.Foldout(Rect (rt.x+margin+3, rt.y+5, 20, 20), target.showUnderwater, "");
        GUI.Label (Rect (rt.x+margin+20, rt.y+5, 300, 20), GUIContent ("UNDERWATER"));
        if (target.showUnderwater){

           	//if (!target.enableUnderwaterFX) GUI.color = colorDisabled;
            //target.enableUnderwaterFX = EditorGUILayout.Toggle("     Enable UnderwaterFX", target.enableUnderwaterFX);
			//GUI.color = colorEnabled;
            	
            //if (target.enableUnderwaterFX){
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+30, 90, 18),"Enable Debris");
			target.enableUnderDebris = EditorGUI.Toggle(Rect(rt.x+margin+110, rt.y+30, 30, 18),"", target.enableUnderDebris);
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+50, 90, 18),"Reflection Dist");
            target.reflectDistUnderAmt = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+50, 270, 18),"",target.reflectDistUnderAmt,0.0,1.0);
            
            EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+70, 90, 18),"Refract Amt");
            target.underRefractionAmount = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+70, 270, 18),"",target.underRefractionAmount,0.0,1.0);
            
            EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+90, 90, 18),"Refract Scale");
            target.underRefractionScale = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+90, 270, 18),"",target.underRefractionScale,0.0,3.0);
            EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+110, 90, 18),"Refract Speed");
            target.underRefractionSpeed = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+110, 270, 18),"",target.underRefractionSpeed,0.0,1.0);
                       
            EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+130, 90, 18),"Blur Amount");
            target.underBlurAmount = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+130, 270, 18),"",target.underBlurAmount,0.0,1.0);
            EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+150, 90, 18),"Fog Distance");
			target.underwaterFogDist = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+150, 270, 18),"",target.underwaterFogDist,0.0,1.0);
            EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+170, 90, 18),"Fog Spread");
			target.underwaterFogSpread = EditorGUI.Slider(Rect(rt.x+margin+110, rt.y+170, 270, 18),"",target.underwaterFogSpread,0.0,0.005);
            EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+190, 90, 18),"Fog Color");
			target.underwaterColor = EditorGUI.ColorField(Rect(rt.x+margin+110, rt.y+190, 270, 18),"",target.underwaterColor);
            //}
            
            
            
			GUILayout.Space(210.0);
		}
        GUILayout.Space(10.0);
        
        
        
        
        
        
        // INTERACTIVE SETTINGS
        rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
        target.showEffects = EditorGUI.Foldout(Rect (rt.x+margin+3, rt.y+5, 20, 20), target.showEffects, "");
        GUI.Label (Rect (rt.x+margin+20, rt.y+5, 300, 20), GUIContent ("INTERACTION"));
        if (target.showEffects){

        	//SPLASH EFFECTS
            EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+30, 105, 18),"Enable Effects");
			target.splashIsOn = EditorGUI.Toggle(Rect(rt.x+margin+125, rt.y+30, 30, 18),"", target.splashIsOn);
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+50, 105, 18),"Update Speed");
			target.UpdateSpeed = EditorGUI.FloatField(Rect(rt.x+margin+125, rt.y+50, 30, 18),"", target.UpdateSpeed);
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+70, 105, 18),"Ripple Sensitivity");
			target.rippleSensitivity = EditorGUI.FloatField(Rect(rt.x+margin+125, rt.y+70, 30, 18),"", target.rippleSensitivity);
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+90, 105, 18),"Splash Sensitivity");
			target.splashSensitivity = EditorGUI.FloatField(Rect(rt.x+margin+125, rt.y+90, 30, 18),"", target.splashSensitivity);
			
			
			GUILayout.Space(95.0);
		}
        GUILayout.Space(10.0);
        
        
        
        
        
        
        // PRESET MANAGER
        rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
        target.showPresets = EditorGUI.Foldout(Rect (rt.x+margin+3, rt.y+5, 20, 20), target.showPresets, "");
        GUI.Label (Rect (rt.x+margin+20, rt.y+5, 300, 20), GUIContent ("PRESET MANAGER"));
        if (target.showPresets){

			//select preset
			//EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+30, 80, 18),"Surface Type");
			//target.typeIndex = EditorGUI.Popup(Rect(rt.x+margin+100, rt.y+30, 145, 18),"",target.typeIndex, target.typeOptions);
			EditorGUI.LabelField(Rect(rt.x+margin+18, rt.y+24, 100, 18),"Transition:");
			target.presetTransIndexFrm = EditorGUI.Popup(Rect(rt.x+margin+85, rt.y+24, 80, 13),"",target.presetTransIndexFrm, target.presetOptions);
			EditorGUI.LabelField(Rect(rt.x+margin+167, rt.y+24, 100, 18),"-->");
			target.presetTransIndexTo = EditorGUI.Popup(Rect(rt.x+margin+194, rt.y+24, 80, 13),"",target.presetTransIndexTo, target.presetOptions);
			target.presetTransitionTime = EditorGUI.FloatField(Rect(rt.x+margin+285, rt.y+23, 30, 18),target.presetTransitionTime);
    		var transAction : String = "Start";
        	if (target.presetStartTransition) transAction = (target.presetTransitionCurrent*target.presetTransitionTime).ToString("F2");//"Stop";
        	if(GUI.Button(Rect(rt.x+margin+324, rt.y+24, 60, 15), transAction)){
        		target.presetStartTransition = !target.presetStartTransition;
        	}

			
			//start presets
			GUI.color = Color(1,1,1,0.1);
			EditorGUI.DrawPreviewTexture(Rect(rt.x+margin+20,rt.y+45,364,5),bgPresetSt);
			
			//fill presets
			//for (var pr:int = 0; pr < 4; pr++){
			//presetOptions
			for (var pr:int = 0; pr < target.presetOptions.length; pr++){
				
				//background
				GUI.color = Color(1,1,1,0.1);
				if ((pr/2.0) > Mathf.Floor(pr/2.0)) GUI.color = Color(1,1,1,0.13);
				//if (target.presetUseIndex == pr) GUI.color = Color(1,0.5,0,0.9);
				if (localPresetIndex == pr) GUI.color = highlightColor;
				EditorGUI.DrawPreviewTexture(Rect(rt.x+margin+20,rt.y+50+(pr*13),364,12),bgPreset);
				
				//preset name/button
				if (setRename != (pr+1)){
					GUI.color = Color(1,1,1,0.75);
            		EditorGUI.LabelField(Rect(rt.x+margin+32, rt.y+47+(pr*13), 300, 16), target.presetOptions[pr]);
            		GUI.color = Color(1,1,1,0.1);
            		if (GUI.Button(Rect(rt.x+margin+32, rt.y+47+(pr*13)+2, 300, 13),"")){
            			localPresetIndex = pr;
            			target.presetIndex = pr;
            			target.PresetLoad();
            		}
            	}
            	
            	//rename
            	GUI.color = Color(1,1,1,0.4);
				if (GUI.Button(Rect(rt.x+margin+21, rt.y+47+(pr*13)+2, 11, 11),"")){
					Debug.Log("rename");
					setRename = (pr +1);
				}
				if (setRename == (pr+1)){
					renName = EditorGUI.TextField(Rect(rt.x+margin+32, rt.y+49+(pr*13), 200, 14), renName);
					GUI.color = highlightColor2;
					if (GUI.Button(Rect(rt.x+margin+230, rt.y+49+(pr*13), 30, 14),"OK")){
						setRename = 0;
						target.PresetRename(target.presetOptions[pr],renName);
						renName="";
						
					}
					GUI.color = Color(1,1,1,0.4);
					if (GUI.Button(Rect(rt.x+margin+262, rt.y+49+(pr*13), 20, 14),"X")){
						setRename = 0;
					}
            	}
            	
            	//add/delete
            	GUI.color = Color(1,1,1,0.35);
            	if (localPresetIndex == pr) GUI.color = highlightColor;
				if (GUI.Button(Rect(rt.x+margin+334, rt.y+48+(pr*13)+1, 25, 12),"+")) target.PresetSave(target.presetOptions[pr]);
            	if (GUI.Button(Rect(rt.x+margin+358, rt.y+48+(pr*13)+1, 25, 12),"-")) target.PresetDelete(target.presetOptions[pr]);

           		GUI.color = Color(1,1,1,1);

           	}
           	//end presets
           	GUI.color = Color(1,1,1,0.1);
			EditorGUI.DrawPreviewTexture(Rect(rt.x+margin+20,rt.y+61+((pr-1)*13),364,23),bgPresetNd);
			
			GUI.color = Color(1,1,1,1);
			GUI.color = Color(1,1,1,0.55);
			if (GUI.Button(Rect(rt.x+margin+320, rt.y+66+((pr-1)*13), 65, 18),"+ NEW")) target.PresetSave("");
			
			GUI.color = colorEnabled;
			
			GUILayout.Space(60.0+(pr*12));
		}
        GUILayout.Space(10.0);
        
*/
  


        	
        if (GUI.changed) EditorUtility.SetDirty (target);
    }
    
    
    
    
    
    
}