using UnityEngine;
using System.Collections;

namespace Obi
{
public class DistanceFieldCollider : MonoBehaviour
{

	public float contactOffset = 0.01f;

	/** Returns world-space bounds. Just like renderer.bounds.*/
	public Bounds bounds{ 
		get{
			Bounds bounds = new Bounds();

			if (distanceField == null || distanceField.mesh == null) return bounds;

			bounds.center = transform.TransformPoint(distanceField.mesh.bounds.center);
			for (int i = 0; i < 8; i++){
				bounds.Encapsulate(transform.TransformPoint(distanceField.mesh.bounds.center + Vector3.Scale(distanceField.mesh.bounds.extents,distanceField.corners[i])));
			}

			return bounds;
		}
	}

	public DistanceField distanceField;

}
}

