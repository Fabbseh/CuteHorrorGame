using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
	/**
 * Collision constraints are created and destroyed dynamically during a normal solver step. They are used to allow cloth particles to collide
 * with regular colliders, and to inject energy into rigidbodies when needed.
 */
	public class SelfCollisionConstraint : Constraint{
		
		public ObiClothParticle particle1;
		public ObiClothParticle particle2;
		
		public Vector3 normal;
		public Vector3 point;
		public float distance;
		
		public float weightSum;
		public float frictionCoeff;
		
		public float normalImpulse = 0;
		public float tangentImpulse = 0;

		public const float epsilon =  1e-8f;
		
		public SelfCollisionConstraint(Transform transform, ObiClothParticle particle1, ObiClothParticle particle2, Vector3 point, Vector3 normal, float distance, float friction) : base(transform){
			this.transform = transform;
			this.particle1 = particle1;
			this.particle2 = particle2;
			this.point = point;
			this.normal = normal;
			this.distance = distance;
			this.weightSum = particle1.w + particle2.w;
			this.frictionCoeff = friction;
		}
		
		public override void CalculatePositionDeltas(HalfEdge halfedge,List<ObiClothParticle> particles, float dt)
		{
			// If there is no rigidbody, it is kinematic or is sleeping, and the particle is asleep, we can skip this constraint.
			if (particle1.asleep && particle2.asleep) return;
			
			// If both the particle and the rigidbody are fixed, skip this.
			if (weightSum == 0) return;
			
			//Calculate relative normal and tangent velocities at nearest point:
			Vector3 relativeVelocity = (particle1.predictedPosition - particle1.position) / dt - (particle2.predictedPosition - particle2.position) / dt;		
			float relativeNormalVelocity = Vector3.Dot(relativeVelocity,normal);
			Vector3 tangentSpeed = relativeVelocity - relativeNormalVelocity * normal;	
			float relativeTangentVelocity = tangentSpeed.magnitude;
			Vector3 tangent = tangentSpeed / (relativeTangentVelocity + epsilon);		
			
			//Calculate normal impulse correction:
			float nvCorrection = relativeNormalVelocity + distance / dt;  
			float niCorrection = nvCorrection / weightSum;
			
			//Accumulate impulse:
			float newImpulse = Mathf.Min(normalImpulse + niCorrection,0);
			
			//Calculate change impulse change and set new impulse:
			float normalChange = newImpulse - normalImpulse;
			normalImpulse = newImpulse;
			
			// If this turns out to be a real (non-speculative) contact, compute friction impulse.
			float tangentChange = 0;
			if (nvCorrection < 0){ // Real contact
				
				float tiCorrection = - relativeTangentVelocity / weightSum;
				
				//Accumulate tangent impulse using coulomb friction model:
				float frictionCone = - normalImpulse * frictionCoeff;
				float newTangentImpulse = Mathf.Clamp(tangentImpulse + tiCorrection,-frictionCone, frictionCone);
				
				//Calculate change impulse change and set new impulse:
				tangentChange = newTangentImpulse - tangentImpulse;
				tangentImpulse = newTangentImpulse;
			}
			
			if (normalChange != 0 || tangentChange != 0){
				// wake the particle up:
				particle1.asleep = false;
				particle2.asleep = false;
				particle1.numConstraints++;
				particle2.numConstraints++;
			}
			
			//Add impulse to both particles:
			Vector3 impulse = (normal * normalChange - tangent * tangentChange);
			particle1.positionDelta -= impulse * particle1.w * dt;
			particle2.positionDelta += impulse * particle2.w * dt;
			
		}
		
		public override void ApplyPositionDeltas(List<ObiClothParticle> particles, float sorFactor){
			particle1.ApplyPositionDeltas(sorFactor);
			particle2.ApplyPositionDeltas(sorFactor);
		}

	}
}

