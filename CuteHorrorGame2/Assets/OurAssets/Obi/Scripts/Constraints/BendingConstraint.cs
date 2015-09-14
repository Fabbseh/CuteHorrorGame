using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
	/**
	 * This constraint affects the curvature between three particles.
	 */
	[Serializable]
	public class BendingConstraint : Constraint
	{
		public int pIndex1;
		public int pIndex2;
		public int pIndex3; // center vertex.
		public float K = 0;
		[SerializeField] private float restLenght;
		private float w;
		
		public BendingConstraint(List<ObiClothParticle> particles, Transform transform, int pIndex1,int pIndex2,int pIndex3, float stiffness) : base(transform)
		{
			this.pIndex1 = pIndex1;
			this.pIndex2 = pIndex2;
			this.pIndex3 = pIndex3; 
			this.Stiffness = stiffness;
			Vector3 center = (particles[pIndex1].position + particles[pIndex2].position + particles[pIndex3].position)/3f;
			this.restLenght = Vector3.Distance(particles[pIndex3].position,center);
		}
		
		public override void CalculatePositionDeltas(HalfEdge halfedge,List<ObiClothParticle> particles, float dt)
		{
			// If all particles are asleep, skip constraint.
			if (particles[pIndex1].asleep && particles[pIndex2].asleep && particles[pIndex3].asleep) return;
			
			// If at least one of the particles is awake, wake the other one up.
			particles[pIndex1].asleep = false;
			particles[pIndex2].asleep = false;
			particles[pIndex3].asleep = false;

			w = particles[pIndex1].w + particles[pIndex2].w + 2*particles[pIndex3].w;

			if (w > 0 && LinearStiffness > 0){

				Vector3 center = (particles[pIndex1].predictedPosition + particles[pIndex2].predictedPosition + particles[pIndex3].predictedPosition)/3f;
				Vector3 dirCenter = particles[pIndex3].predictedPosition - center;
				float distCenter = dirCenter.magnitude;

				if (distCenter > 0){

					float diff = 1.0f - ((K + restLenght) / distCenter);

					if (diff >= 0){ // remove this to force a certain curvature.

						Vector3 dirForce = dirCenter * diff;
						particles[pIndex1].positionDelta += LinearStiffness * (2.0f*particles[pIndex1].w/w) * dirForce;
						particles[pIndex2].positionDelta += LinearStiffness * (2.0f*particles[pIndex2].w/w) * dirForce;
						particles[pIndex3].positionDelta -= LinearStiffness * (4.0f*particles[pIndex3].w/w) * dirForce;
						particles[pIndex1].numConstraints++;
						particles[pIndex2].numConstraints++;
						particles[pIndex3].numConstraints++;
					}
				}

			}
					 
		}

		public override void ApplyPositionDeltas(List<ObiClothParticle> particles, float sorFactor){
			particles[pIndex1].ApplyPositionDeltas(sorFactor);
			particles[pIndex2].ApplyPositionDeltas(sorFactor);
			particles[pIndex3].ApplyPositionDeltas(sorFactor);
		}
		
		public override int GetHashCode()
		{
			return ObiUtils.Pair(pIndex1,pIndex2);
		}
		
		public override bool Equals(object obj)
		{
			BendingConstraint other = obj as BendingConstraint;
			return (other != null && other.GetHashCode() == GetHashCode());
		}
		
	}
}