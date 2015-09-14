using UnityEngine;
using System.Collections;

namespace Obi{

/**
 * This component holds ObiWorld related information for a GameObject. Each object inside the world is given
 * one of these, with a node index and a padding value.
 * WARNING: Do not delete these manually from any GameObject. An ObiWorld instance should be in charge of doing this.
 */
[ExecuteInEditMode]
public class ObiActor : MonoBehaviour
{

	[HideInInspector] public ObiWorld world = null;
	[HideInInspector] public float boundsPadding = 0.5f;
	[HideInInspector] public int nodeIndex = -1;

	public Bounds bounds{
		get{

			// Get all colliders, including distance fields:
			Collider[] colliders = GetComponents<Collider>();
			DistanceFieldCollider dfCollider = GetComponent<DistanceFieldCollider>();

			// Initialize bounds:
			Bounds _bounds = new Bounds();

			// Compute world-space bounds of all colliders:
			if (dfCollider != null){
				_bounds = dfCollider.bounds;
				_bounds.Expand(dfCollider.contactOffset * 2);
			}

			if (colliders.Length > 0){

				_bounds = colliders[0].bounds;
				_bounds.Expand(colliders[0].contactOffset * 2);

				for (int i = 1; i < colliders.Length; i++){
					_bounds.Encapsulate(colliders[i].bounds);
					_bounds.Expand(colliders[i].contactOffset * 2);
				}

			}

			// If there is a rigidbody present, expand the bounds by its velocity:
			Rigidbody rb = GetComponent<Rigidbody>();
			if (rb != null){
				Bounds end = new Bounds(rb.transform.position + rb.velocity * Time.fixedDeltaTime,_bounds.size);
				_bounds.Encapsulate(end);
			}

			return _bounds;

		}
	}


	public void Awake(){
		this.hideFlags = HideFlags.HideInInspector; //This prevents manually removing the component in the editor.
	}

	public void Initialize(ObiWorld world){

		this.world = world;

		if (this.world != null){
			
			// Remove any existing actors for the same world:
			ObiActor[] actors = GetComponents<ObiActor>();
			for(int i = 0; i < actors.Length;i++){	
				if (actors[i] != this && actors[i].world == this.world)
					GameObject.DestroyImmediate(actors[i]);
			}	
			
			this.world.AddObject(gameObject);
		}

	}

	public void OnDestroy(){
		if (world != null)
			world.RemoveObject(this.gameObject);
	}
	
}
}
