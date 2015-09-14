
@script ExecuteInEditMode()
@CustomEditor (fx_EffectObject)

class suimono_objectfx_editor extends Editor {
	
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

 	var emMin : float = 1.0;
 	var emMax : float = 3.0;
 	
 	var aMin : float = 0.9;
 	var aMax : float = 1.0;
  	var apMin : float = 0.9;
 	var apMax : float = 1.1;
 	var szMin : float = 0.5;
 	var szMax : float = 1.5;

		
		
    function OnInspectorGUI () {
    	

		#if UNITY_PRO_LICENSE
			divTex = Resources.Load("textures/gui_tex_suimonodiv");
			logoTex = Resources.Load("textures/gui_tex_suimonologofx");
			bgPreset = Resources.Load("textures/gui_bgpreset");
			bgPresetSt = Resources.Load("textures/gui_bgpresetSt");
			bgPresetNd = Resources.Load("textures/gui_bgpresetNd");
			highlightColor = Color(1,0.5,0,0.9);
		#else
			divTex = Resources.Load("textures/gui_tex_suimonodiv_i");
			logoTex = Resources.Load("textures/gui_tex_suimonologofx_i");
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
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,36),logoTex);
        GUILayout.Space(25.0);
        
        
        
        //SET TYPE
        rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
        EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y+30,387,24),divRevTex);

        	//GUI.color = colorEnabled;
        	//if (target.typeIndex == 1) GUI.color = colorDisabled;
        	if (GUI.Button(Rect(rt.x+margin,rt.y+12,192,24),"Particle Effect")) target.typeIndex = 0;
        	//GUI.color = colorEnabled;
        	//if (target.typeIndex == 0) GUI.color = colorDisabled;
        	if (GUI.Button(Rect(rt.x+margin+194,rt.y+12,192,24),"Audio Effect")) target.typeIndex = 1;
        	//GUI.color = colorEnabled;
        	
        GUILayout.Space(30.0);
        
        
        
        //SET EFFECT PARTICLE
		if (target.typeIndex == 0){
         
            rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
        	EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
			EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y+139,387,24),divRevTex);
			
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+15, 90, 18),"Particle Effect");
			target.systemIndex = EditorGUI.Popup(Rect(rt.x+margin+110, rt.y+15, 260, 18),"",target.systemIndex, target.sysNames);

        	
        	emMin = target.emitNum.x;
			emMax = target.emitNum.y;
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+45, 130, 18),"Emit Number");
			EditorGUI.MinMaxSlider(Rect(rt.x+margin+115, rt.y+45, 200, 18),emMin,emMax,0.0,20.0);
			EditorGUI.LabelField(Rect(rt.x+margin+340, rt.y+45, 50, 18),Mathf.Floor(emMin)+"  "+Mathf.Floor(emMax));
			
			szMin = target.effectSize.x;
			szMax = target.effectSize.y;
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+65, 130, 18),"Particle Size");
			EditorGUI.MinMaxSlider(Rect(rt.x+margin+115, rt.y+65, 200, 18),szMin,szMax,0.0,4.0);
			EditorGUI.LabelField(Rect(rt.x+margin+340, rt.y+65, 50, 18),szMin.ToString("F1")+"  "+szMax.ToString("F1"));
				
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+90, 130, 18),"Emission Speed");
			target.emitSpeed = EditorGUI.FloatField(Rect(rt.x+margin+115, rt.y+90, 60, 18),"",target.emitSpeed);
				
			EditorGUI.LabelField(Rect(rt.x+margin+210, rt.y+90, 130, 18),"Directional Speed");
			target.directionMultiplier = EditorGUI.FloatField(Rect(rt.x+margin+320, rt.y+90, 40, 18),"",target.directionMultiplier);
			
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+115, 130, 18),"Emit At Surface");
			target.emitAtWaterLevel = EditorGUI.Toggle(Rect(rt.x+margin+115, rt.y+114, 40, 18),"",target.emitAtWaterLevel);
			//EditorGUI.LabelField(Rect(rt.x+margin+210, rt.y+115, 130, 18),"Link Size to Speed");
			//target.linkSizeToSpeed = EditorGUI.Toggle(Rect(rt.x+margin+315, rt.y+114, 40, 18),"",target.linkSizeToSpeed);
			EditorGUI.LabelField(Rect(rt.x+margin+155, rt.y+115, 130, 18),"Tint Color");
			target.tintCol = EditorGUI.ColorField(Rect(rt.x+margin+225, rt.y+114, 140, 18),"",target.tintCol);
			
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+135, 130, 18),"Clamp Rotation");
			target.clampRot = EditorGUI.Toggle(Rect(rt.x+margin+115, rt.y+134, 40, 18),"",target.clampRot);
			
			EditorGUI.LabelField(Rect(rt.x+margin+210, rt.y+135, 130, 18),"Distance Range");
			target.effectDistance = EditorGUI.FloatField(Rect(rt.x+margin+320, rt.y+134, 40, 18),"",target.effectDistance);
			
			
			target.emitNum.x = Mathf.Floor(emMin);
			target.emitNum.y = Mathf.Floor(emMax);
        	target.effectSize.x = szMin;
			target.effectSize.y = szMax;
			
        	GUILayout.Space(150.0);
         
         }
        
        
        //SET EFFECT AUDIO
		if (target.typeIndex == 1){
         
            rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
        	EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
			EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y+139,387,24),divRevTex);
			
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+15, 130, 18),"Select Audio Sample");
			target.audioObj = EditorGUI.ObjectField(Rect(rt.x+margin+150, rt.y+15, 220, 18), target.audioObj, AudioClip, true);
			
			aMin = target.audioVol.x;
			aMax = target.audioVol.y;
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+45, 130, 18),"Audio Volume Range");
			EditorGUI.MinMaxSlider(Rect(rt.x+margin+150, rt.y+45, 230, 18),aMin,aMax,0.0,1.0);

			apMin = target.audioPit.x;
			apMax = target.audioPit.y;
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+65, 130, 18),"Audio Pitch Range");
			EditorGUI.MinMaxSlider(Rect(rt.x+margin+150, rt.y+65, 230, 18),apMin,apMax,0.0,2.0);
			
			EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+90, 150, 18),"Audio Repeat Speed");
			target.audioSpeed = EditorGUI.FloatField(Rect(rt.x+margin+145, rt.y+90, 60, 18),"",target.audioSpeed);
			

			target.audioVol.x = aMin;
			target.audioVol.y = aMax;
			target.audioPit.x = apMin;
			target.audioPit.y = apMax;
			
        	GUILayout.Space(150.0);
         }
        
        
        
        
        
        
        
        
        
        //SET RULES
		rt = GUILayoutUtility.GetRect(buttonText, buttonStyle);
		EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y,387,24),divTex);
		EditorGUI.DrawPreviewTexture(Rect(rt.x+margin,rt.y+89+(target.effectRule.Length*20.0),387,24),divRevTex);
		
		EditorGUI.LabelField(Rect(rt.x+margin+10, rt.y+15, 387, 18),"SET ACTIVATION RULES");
		
		if (target.effectRule.Length <= 0){
			//GUI.color = colorDisabled;
			EditorGUI.LabelField(Rect(rt.x+margin+50, rt.y+35, 387, 18),"THERE ARE CURRENTLY NO RULES TO VIEW...");
			//GUI.color = colorEnabled;
		} else {
			for (var rL : int = 0; rL < target.effectRule.Length; rL++){
				if (rL < target.effectRule.Length){
				//GUI.color = colorDisabled;
				if (GUI.Button(Rect(rt.x+margin+10,rt.y+45+(rL * 20.0),18,16),"-")){
					target.DeleteRule(rL);
				}
				
				if (rL >= target.effectRule.Length) break;
				
				//GUI.color = colorEnabled;
				EditorGUI.LabelField(Rect(rt.x+margin+35, rt.y+45+(rL * 20.0), 70, 18),"RULE "+(rL+1));
				if (target.ruleIndex[rL] > 3 && target.ruleIndex[rL] < 8){
					target.ruleIndex[rL] = EditorGUI.Popup(Rect(rt.x+margin+90, rt.y+45+(rL * 20.0), 246, 18),"",target.ruleIndex[rL], target.ruleOptions);
					target.effectData[rL] = EditorGUI.FloatField(Rect(rt.x+margin+340, rt.y+44+(rL * 20.0), 30, 18),"",target.effectData[rL]);
				} else {
					target.ruleIndex[rL] = EditorGUI.Popup(Rect(rt.x+margin+90, rt.y+45+(rL * 20.0), 280, 18),"",target.ruleIndex[rL], target.ruleOptions);
				}
				GUILayout.Space(20.0);
				}
			}
		}
		
		if (GUI.Button(Rect(rt.x+margin+90,rt.y+60+(target.effectRule.Length*20.0),200,18),"+ ADD NEW RULE")) target.AddRule();
	




	
		GUILayout.Space(100.0);




        //if (GUI.changed)
        EditorUtility.SetDirty (target);
    }
    
    
    
    
    
    
}