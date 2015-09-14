using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
	/**
	 * Strives to keep the volume of a closed particle mesh. The pressure parameter can be used to apply overpressure (when > 1), which will make the 
	 * mesh volume exceed the original volume, or to maintain only a fraction of the original volume (when < 1).
	 */
	[Serializable]
	public class PressureConstraint : Constraint
	{

		public bool enabled = false;
		public float pressure = 1;
		
		public PressureConstraint() : base(null)
		{
		}
		
		public override void CalculatePositionDeltas(HalfEdge halfedge, List<ObiClothParticle> particles, float dt)
		{
			if (!enabled || !halfedge.IsClosed) return;

			float currentVolume = 0;
			ObiClothParticle p1;
			ObiClothParticle p2;
			ObiClothParticle p3;
		
			// calculate current mesh volume:
			foreach(HalfEdge.HEFace face in halfedge.heFaces){
				p1 = particles[halfedge.heEdges[face.edges[0]].endVertex];
				p2 = particles[halfedge.heEdges[face.edges[1]].endVertex];
				p3 = particles[halfedge.heEdges[face.edges[2]].endVertex];
				currentVolume += Vector3.Dot(Vector3.Cross(p1.predictedPosition,p2.predictedPosition),p3.predictedPosition)/6f;
			}

			// calculate gradients and weighted sum:
			Vector3[] gradients = new Vector3[particles.Count];
			float gradientSum = 0;

			foreach(HalfEdge.HEFace face in halfedge.heFaces){

				p1 = particles[halfedge.heEdges[face.edges[0]].endVertex];
				p2 = particles[halfedge.heEdges[face.edges[1]].endVertex];
				p3 = particles[halfedge.heEdges[face.edges[2]].endVertex];

				Vector3 n = Vector3.Cross(p2.predictedPosition-p1.predictedPosition,p3.predictedPosition-p1.predictedPosition);
	
				gradients[p1.index] += n;
				gradients[p2.index] += n;
				gradients[p3.index] += n;
			}

			for(int i = 0; i < gradients.Length; i++){
				gradientSum += particles[i].w * gradients[i].sqrMagnitude;
			}

			if (!Mathf.Approximately(gradientSum,0)){

				// calculate constraint scaling factor:
				float s = (currentVolume - pressure * halfedge.MeshVolume) / gradientSum;

				// apply position correction to all particles:
				foreach(ObiClothParticle p in particles){
					p.positionDelta -= s * p.w * gradients[p.index] * LinearStiffness;
					p.numConstraints++;
				}

			}

		}

		public override void ApplyPositionDeltas(List<ObiClothParticle> particles, float sorFactor){
			foreach(ObiClothParticle p in particles){
				p.ApplyPositionDeltas(sorFactor);
			}
		}

	}
}