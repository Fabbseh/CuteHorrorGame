using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
	/**
	 * These constraints try to maintain the particle inside a sphere defined by center and radius.
	 */
	[Serializable]
	public class SkinConstraint : Constraint
	{
		
		public int pIndex;				/**< Index of the particle.*/
		public float radius;		/**< Distance that should be kept between the two particles.*/
		public float backstop;
		public Vector3 point;
		public Vector3 normal;
		
		public const float epsilon = 1e-6f;
		
		public SkinConstraint(Transform transform, int pIndex, Vector3 point, float radius, Vector3 normal, float backstop, float stiffness) : base(transform)
		{
			this.pIndex = pIndex;
			this.radius = radius;
			this.point = point;
			this.normal = normal;
			this.backstop = backstop;
			this.Stiffness = stiffness;
			this.point = point;
		}
		
		public override void CalculatePositionDeltas(HalfEdge halfedge,List<ObiClothParticle> particles, float dt)
		{
			
			// We can skip this for fixed particles:
			if (particles[pIndex].w == 0) return;

			// Wake the particle up.
			particles[pIndex].asleep = false;
			
			Vector3 positionDiff = particles[pIndex].predictedPosition - point;
			float distance = positionDiff.magnitude;
			float surfaceDistance = Vector3.Dot(positionDiff,normal);

			if (LinearStiffness > 0){

				Vector3 correctionVector = Vector3.zero;

				if (distance > radius){
					float correctionFactor = distance - radius;
					correctionVector += positionDiff / distance * correctionFactor;
				}	
				if (surfaceDistance < backstop){
					correctionVector += normal * Mathf.Min(surfaceDistance - backstop,0);
				}

				if (correctionVector != Vector3.zero){
					particles[pIndex].positionDelta -= LinearStiffness * correctionVector;
					particles[pIndex].numConstraints++;
				}

			}
			
		}
		
		public override void ApplyPositionDeltas(List<ObiClothParticle> particles, float sorFactor){
			particles[pIndex].ApplyPositionDeltas(sorFactor);
		}
		
		public override int GetHashCode()
		{
			return pIndex;
		}
		
		public override bool Equals(object obj)
		{
			DistanceConstraint other = obj as DistanceConstraint;
			return (other != null && other.GetHashCode() == GetHashCode());
		}
		
	}
}



