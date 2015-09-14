using UnityEngine;
using System.Collections;
using Obi;

public class ObiWorldTest : MonoBehaviour {

	public ObiWorld world;

	// Use this for initialization
	void Start () {
			
		int num = 10;

		for (int i = 0; i <= num; i++){
			for (int j = 0; j <= num; j++){
				GameObject g = GameObject.CreatePrimitive(PrimitiveType.Sphere);
				g.AddComponent<RandomMotion>();
				g.transform.position = new Vector3(i*2-num,0,j*2-num);
				ObiActor a = g.AddComponent<ObiActor>();
				a.Initialize(world);
			}
		}
	}
	
}
