using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace Obi{

[ExecuteInEditMode]
public class ObiWorld : MonoBehaviour
{

	[HideInInspector] public DBVH dynamicBVH;
	[SerializeField][HideInInspector] List<GameObject> objects = new List<GameObject>();

	public IList<GameObject> Objects{
		get{return objects.AsReadOnly();}
	}

	public void OnEnable(){
		if (dynamicBVH == null)
			dynamicBVH = new DBVH();
	}

	public void AddObject(GameObject obj){

		if (obj != null){
			ObiCloth cloth = obj.GetComponent<ObiCloth>();

			if (cloth != null){
				cloth.world = this;
				objects.Add(obj);
			}else{
			
				ObiActor actor = obj.GetComponent<ObiActor>();
				if (actor != null){
					
					dynamicBVH.Insert(actor);
					objects.Add(obj);
					
				}else{
					Debug.LogError("Could not add object from ObiWorld because ObiActor component is missing. Re-create the ObiWorld component.");
				}

			}

		}

	}

	/**
	 * Removes an actor from the world. Never call this directly, as ObiActors remove themselves from the world upon being destroyed.
	 */
	public void RemoveObject(GameObject obj){
		
		if (obj != null){

			ObiCloth cloth = obj.GetComponent<ObiCloth>();
			
			if (cloth != null){

				cloth.world = null;
				objects.Remove(obj);

			}else{

				ObiActor actor = obj.GetComponent<ObiActor>();
				if (actor != null){

					dynamicBVH.Remove(actor);
					objects.Remove(obj);

				}else{
					Debug.LogError("Could not remove object from ObiWorld because ObiActor component is missing. Re-create the ObiWorld component.");
				}

			}

		}
		
	}

	public List<GameObject> PotentialColliders(Bounds bounds){
		List<GameObject> result = new List<GameObject>();
		List<DBVH.DBVHNode> nodes = dynamicBVH.BoundsQuery(bounds);
		foreach(DBVH.DBVHNode n in nodes){
			result.Add(n.content.gameObject);
		}
		return result;
	}

	// Update is called once per frame
	void LateUpdate ()
	{
		dynamicBVH.Update();
	}

}
}

