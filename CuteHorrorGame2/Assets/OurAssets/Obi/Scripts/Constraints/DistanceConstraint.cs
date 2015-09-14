using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
/**
 * These constraints try to maintain a certain distance between two particles. 
 */
[Serializable]
public class DistanceConstraint : Constraint
{

	public int p1;				/**< Index of the first particle.*/
	public int p2;				/**< Index of the second particle.*/
	public float restLenght;	/**< Distance that should be kept between the two particles.*/
	public float scale = 1;		/**< Scale factor for the restLenght attribute.*/
	public float tearDistance;  /**< Distance netween particles at which the spring strain would be too much.*/

	public const float epsilon = 1e-8f;

	[SerializeField][HideInInspector] private float compressionStiffness = 1;		/**< raw stiffness value.*/
	[SerializeField][HideInInspector] private float linearCompressionStiffness = 1;	/**< stiffness value used for linear response.*/

	[NonSerialized] public bool shouldBreak = false;

	public float CompressionStiffness{
		set{
			if (value != compressionStiffness){
				compressionStiffness = value;
				RecalculateLinearCompressionStiffness();
			}
		}
		get{
			return compressionStiffness;
		}
	}
	
	public float LinearCompressionStiffness{
		get{
			return linearCompressionStiffness;
		}
	}

	private void RecalculateLinearCompressionStiffness(){
		linearCompressionStiffness = 1-Mathf.Pow(1-compressionStiffness,1f/SolverIterations);
	}

	public DistanceConstraint(Transform transform, int p1Index, int p2Index, float restLenght, float stiffness, float compressionStiffness, float tearDistance) : base(transform)
	{
		this.p1 = p1Index;
		this.p2 = p2Index;
		this.restLenght = restLenght;
		this.Stiffness = stiffness;
		this.CompressionStiffness = compressionStiffness;
		this.tearDistance = tearDistance;
	}
	
	public override void CalculatePositionDeltas(HalfEdge halfedge,List<ObiClothParticle> particles, float dt)
	{
		// If both particles are asleep, skip the constraint.
		if (particles[p1].asleep && particles[p2].asleep) return;

		// If at least one of the particles is awake, wake the other one up.
		particles[p1].asleep = false;
		particles[p2].asleep = false;

		Vector3 positionDiff = particles[p1].predictedPosition-particles[p2].predictedPosition;
		float distance = positionDiff.magnitude;
		
		if (distance > epsilon && (LinearStiffness > 0 || LinearCompressionStiffness > 0)){
			
			float correctionFactor = (distance - restLenght * scale);
			Vector3 correctionVector = positionDiff / distance * correctionFactor;
			
			float wsum = particles[p1].w + particles[p2].w;
			
			if (wsum > 0){ 

				if (correctionFactor > 0){
					particles[p1].positionDelta -= LinearStiffness * correctionVector * particles[p1].w/wsum;
					particles[p2].positionDelta += LinearStiffness * correctionVector * particles[p2].w/wsum;
				}else{
					particles[p1].positionDelta -= LinearCompressionStiffness * correctionVector * particles[p1].w/wsum;
					particles[p2].positionDelta += LinearCompressionStiffness * correctionVector * particles[p2].w/wsum;
				}

				particles[p1].numConstraints++;
				particles[p2].numConstraints++;

			}

			// return false if the spring should break:
			if (!shouldBreak)
				shouldBreak = distance >= tearDistance;

		}
				
	}

	public override void ApplyPositionDeltas(List<ObiClothParticle> particles, float sorFactor){
		particles[p1].ApplyPositionDeltas(sorFactor);
		particles[p2].ApplyPositionDeltas(sorFactor);
	}

	public override int GetHashCode()
	{
		return ObiUtils.Pair(p1,p2);
	}
	
	public override bool Equals(object obj)
	{
		DistanceConstraint other = obj as DistanceConstraint;
		return (other != null && other.GetHashCode() == GetHashCode());
	}
	
}
}

