using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
	/**
	 * Use these to constraint a particle to a given rigidbody, be it kinematic or not. The particle will be affected by rigidbody dynamics, and 
	 * the rigidbody will also be affected by the particle simulation.
	 */
	[Serializable]
	public class PinConstraint : Constraint
	{
		public Rigidbody rigidbody;	/**< Rigidbody to which the particle is pinned.*/
		public int pIndex;			/**< Index of the pinned particle.*/
		public Vector3 offset;		/**< Pinning position expressed in rigidbody's local space.*/
		
		public PinConstraint(Transform transform, int pIndex, Rigidbody rigidbody, Vector3 offset) : base(transform)
		{
			this.rigidbody = rigidbody;
			this.pIndex = pIndex;
			this.offset = offset;
		}
		
		public override void CalculatePositionDeltas(HalfEdge halfedge,List<ObiClothParticle> particles, float dt)
		{

			// move particle to pin position:
			if (rigidbody != null){

				float rigidbodyWeight = (rigidbody == null || rigidbody.isKinematic) ? 0 : 1/rigidbody.mass;
				float weightSum = particles[pIndex].w + rigidbodyWeight;

				if (weightSum == 0) return;

				Vector3 wsOffset = rigidbody.transform.TransformPoint(offset);
				Vector3 positionChange = (particles[pIndex].predictedPosition-transform.InverseTransformPoint(wsOffset)) / weightSum;

				if (particles[pIndex].w > 0){
					particles[pIndex].positionDelta -= positionChange * particles[pIndex].w;
					particles[pIndex].numConstraints++;
				}

				// apply impulse to rigidbody:
				if (!rigidbody.isKinematic){
					rigidbody.AddForceAtPosition(transform.TransformVector(positionChange) / dt,wsOffset,ForceMode.Impulse);
				}
			}

		}

		public override void ApplyPositionDeltas(List<ObiClothParticle> particles, float sorFactor){
			particles[pIndex].ApplyPositionDeltas(sorFactor);
		}

		public override int GetHashCode()
		{
			if (rigidbody != null)
				return ObiUtils.Pair(pIndex,rigidbody.GetInstanceID());
			return pIndex;
		}
		
		public override bool Equals(object obj)
		{
			DistanceConstraint other = obj as DistanceConstraint;
			return (other != null && other.GetHashCode() == GetHashCode());
		}
		
	}
}