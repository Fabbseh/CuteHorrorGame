using UnityEngine;
using System.Collections;
using Obi;

public class PaperPlaneLauncher : MonoBehaviour {

	public ObiWorld world = null;
	public GameObject paperPlane = null;
	public Vector3 direction = Vector3.left;
	public float randomAngle = 10;
	public float speed = 20;
	public float randomSpeed = 3; 
	
	// Update is called once per frame
	void Update () {
	
		if (Input.GetKeyDown(KeyCode.Space) && paperPlane != null){
	
			Vector3 dir = Quaternion.Euler(-randomAngle + 2*Random.value*randomAngle, 
			                               -randomAngle + 2*Random.value*randomAngle,
			                               -randomAngle + 2*Random.value*randomAngle) * direction; 
			
			GameObject plane = GameObject.Instantiate(paperPlane,transform.position,Quaternion.LookRotation(dir.normalized)) as GameObject;
		
			if (world != null)
				world.AddObject(plane);			

			foreach (ObiClothParticle p in plane.GetComponent<ObiCloth>().particles){
				p.velocity = plane.transform.InverseTransformDirection(dir.normalized)* (speed-randomSpeed+Random.value*randomSpeed*2);
			}
	
		}

	}
}
