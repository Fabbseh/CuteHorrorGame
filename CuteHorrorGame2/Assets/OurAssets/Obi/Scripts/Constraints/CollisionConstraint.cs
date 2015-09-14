using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
/**
 * Collision constraints are created and destroyed dynamically during a normal solver step. They are used to allow cloth particles to collide
 * with regular colliders, and to inject energy into rigidbodies when needed.
 */
public class CollisionConstraint : Constraint{
	
	public ObiClothParticle particle;

	public Vector3 normal;
	public Vector3 point;
	public float distance;
	public Vector3 wspoint;

	public float rigidbodyWeight;
	public Rigidbody rigidbody;
	public float weightSum;
	public float frictionCoeff;

	public float normalImpulse = 0;
	public float tangentImpulse = 0;

	public const float epsilon =  1e-8f;
	
	public CollisionConstraint(Transform transform, ObiClothParticle particle, Rigidbody rigidbody, Vector3 point, Vector3 normal, float distance, float friction) : base(transform){
		this.transform = transform;
		this.particle = particle;
		this.wspoint = point;
		this.point = transform.InverseTransformPoint(point);
		this.normal = transform.InverseTransformDirection(normal);
		this.distance = distance;
		this.rigidbody = rigidbody;
		this.rigidbodyWeight = (rigidbody == null || rigidbody.isKinematic) ? 0 : 1/rigidbody.mass;
		this.weightSum = particle.w + rigidbodyWeight;
		this.frictionCoeff = friction;
	}
	
	public override void CalculatePositionDeltas(HalfEdge halfedge,List<ObiClothParticle> particles, float dt)
	{
		// If there is no rigidbody, it is kinematic or is sleeping, and the particle is asleep, we can skip this constraint.
		if ((rigidbody == null || rigidbody.IsSleeping()) && particle.asleep) return;
	
		// If both the particle and the rigidbody are fixed, skip this.
		if (weightSum == 0) return;

		//Calculate relative normal and tangent velocities at nearest point:
		Vector3 rigidbodyVelocityAtContact = (rigidbody == null || rigidbody.isKinematic) ? Vector3.zero : transform.InverseTransformVector(rigidbody.GetPointVelocity(wspoint));
		Vector3 relativeVelocity = (particle.predictedPosition - particle.position) / dt - rigidbodyVelocityAtContact;		
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
		if (nvCorrection < 0 && frictionCoeff > 0){ // Real contact

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
			particle.asleep = false;
			particle.numConstraints++;
		}

		//Add impulse to particle and rigidbody
		Vector3 impulse = (normal * normalChange - tangent * tangentChange);
		particle.positionDelta -= impulse * particle.w * dt;

		// add impulse to rigid body, if any:
		if (rigidbody != null){
			rigidbody.AddForceAtPosition(transform.TransformVector(impulse),wspoint,ForceMode.Impulse);
		}
		
	}

	public override void ApplyPositionDeltas(List<ObiClothParticle> particles, float sorFactor){
		particle.ApplyPositionDeltas(sorFactor);
	}
	
	
}
}

