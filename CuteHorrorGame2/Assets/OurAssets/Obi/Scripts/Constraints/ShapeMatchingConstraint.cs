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
	public class ShapeMatchingConstraint : Constraint
	{
		
		public bool enabled = false;

		public Matrix4x4 invRestMatrix;		/**< Particles' rotation at rest.*/
		public Vector3 restCM;				/**< Particles' center of mass at rest.*/
		public Vector3[] restRi;

		public float linearDeformation = 0;
		
		private const float epsilon = 1e-6f;

		public ShapeMatchingConstraint() : base(null)
		{
		}

		public Quaternion QuaternionFromMatrix(Matrix4x4 m) {
			 return Quaternion.LookRotation(m.GetColumn(2), m.GetColumn(1)); 
		}

		public override void CalculatePositionDeltas(HalfEdge halfedge, List<ObiClothParticle> particles, float dt)
		{
			if (!enabled || restRi == null) return;

			// Get current center of mass:
			float totalMass = 0;
			Vector3 cm = Vector3.zero;
			foreach(ObiClothParticle p in particles){
				float mass = 1/(p.w + epsilon);
				totalMass += mass;
				cm += p.predictedPosition * mass;
			}
			if (totalMass == 0) return;
			cm /= totalMass;

			// Get A:
			Matrix4x4 A = Matrix4x4.zero;
			A[3,3] = 1;
			foreach(ObiClothParticle particle in particles){
				
				Vector3 q = restRi[particle.index];
				Vector3 p = particle.predictedPosition - cm;

				float mass = 1/(particle.w + epsilon);
				p *= mass;
				
				A[0,0] += p[0] * q[0]; A[0,1] += p[0] * q[1]; A[0,2] += p[0] * q[2];
				A[1,0] += p[1] * q[0]; A[1,1] += p[1] * q[1]; A[1,2] += p[1] * q[2];
				A[2,0] += p[2] * q[0]; A[2,1] += p[2] * q[1]; A[2,2] += p[2] * q[2];
				
			}

			// Extract rotation component from matrix:
			Matrix4x4 R = A.PolarDecomposition(1e-4f);
			Matrix4x4 D = R;

			A = A * invRestMatrix;

			// Mix in the amount of allowed linear deformation:
			if (linearDeformation > 0){

				float detCubicRoot = Mathf.Clamp(Mathf.Pow(A.Determinant(),1/3f),0.9f,2);
				if (!Single.IsNaN(detCubicRoot) && !Single.IsInfinity(detCubicRoot) && detCubicRoot != 0){
					// We divide A by the cubic root of the determinant to ensure volume conservation: 
					D = A.MultiplyValue(linearDeformation/detCubicRoot).Add(R.MultiplyValue(1-linearDeformation));
				}

			}
		
			foreach(ObiClothParticle particle in particles){
				if (particle.w > 0){
					Vector3 goal = cm + D.MultiplyPoint3x4(restRi[particle.index]);
					particle.positionDelta += (goal - particle.predictedPosition) * LinearStiffness;
					particle.numConstraints++;
				}
			}
			
		}

		/**
		 * Uses the current configuration of the particles to compute rest shape information.
		 */
		public void ComputeRestInfo(List<ObiClothParticle> particles){

			// Get current center of mass:
			float totalMass = 0;
			restCM = Vector3.zero;
			foreach(ObiClothParticle p in particles){
				float mass = 1/(p.w + epsilon);
				totalMass += mass;
				restCM += p.position * mass;
			}
			if (totalMass == 0) return;
			restCM /= totalMass;
			
			restRi = new Vector3[particles.Count];

			Matrix4x4 I = Matrix4x4.zero;
			I[3,3] = 1;
			foreach(ObiClothParticle p in particles){
				
				Vector3 q = restRi[p.index] = p.position - restCM;
				float mass = 1/(p.w + epsilon);
				
				float x2 = q[0]*q[0]*mass;
				float y2 = q[1]*q[1]*mass;
				float z2 = q[2]*q[2]*mass;
				
				float xy = q[0]*q[1]*mass;
				float xz = q[0]*q[2]*mass;
				float yz = q[1]*q[2]*mass;
				
				I[0,0] += x2;    I[0,1] += xy; 	  I[0,2] += xz;
				I[1,0] += xy; 	 I[1,1] += y2;    I[1,2] += yz;
				I[2,0] += xz; 	 I[2,1] += yz; 	  I[2,2] += z2;
            }

			invRestMatrix = I.inverse;
		}
		
		public override void ApplyPositionDeltas(List<ObiClothParticle> particles, float sorFactor){
			foreach(ObiClothParticle p in particles){
				p.ApplyPositionDeltas(sorFactor);
			}
		}
		
	}
}