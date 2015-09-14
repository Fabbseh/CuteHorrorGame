using UnityEngine;
using System;
using System.Collections;

namespace Obi{

/**
 * Holds aerodynamic properties for a cloth object. 
 */
[Serializable]
public class Aerodynamics
{

	[Tooltip("Whether this constraint group affects the cloth or not.")]
	public bool enabled = false;

	[Tooltip("Direction and magnitude of wind in word space.")]
	public Vector3 wind = Vector3.zero;				/**< Wind force vector expressed in world space.*/

	[Tooltip("Air density in kg/m3. Higher densities will make both drag and lift forces stronger.")]
	public float airDensity = 1.225f;

	[Tooltip("How much is the cloth affected by drag forces. Extreme values can cause the cloth to behave unrealistically, so use with care.")]
	public float dragCoefficient = 0.05f;

	[Tooltip("How much is the cloth affected by lift forces. Extreme values can cause the cloth to behave unrealistically, so use with care.")]
	public float liftCoefficient = 0.05f;

	public void ApplyAerodynamicsToParticle(ObiClothParticle p, Vector3 normal, Vector3 localSpaceWind, float dt){
		
		Profiler.BeginSample("Aerodynamics");

		if (enabled){

			float halfAirDensity = airDensity * 0.5f; /// air density in kg/m3.
			
			Vector3 relVelocity = p.velocity - localSpaceWind;	//relative velocity between particle and wind force.
			float relVelSqrMag = relVelocity.sqrMagnitude; 		//squared magnitude of relative velocity.
			Vector3 relVelocityNorm = relVelocity.normalized;	//direction of relative velocity.
			
			// Calculate surface normal:
			Vector3 surfNormal = normal.normalized * Mathf.Sign(Vector3.Dot(normal,relVelocityNorm));
			
			// Calculate aerodynamic factor. This is just a fancy name for a common part of the lift and drag calculations.
			float aerodynamicFactor = halfAirDensity * relVelSqrMag * p.areaContribution;
			
			// Calculate dot product between the surface normal at the particle's position, and the relative velocity direction.
			float dotNRV = Vector3.Dot(surfNormal,relVelocity.normalized);
			
			// Calculate drag force:
			float dragMagnitude = dragCoefficient * aerodynamicFactor;
			Vector3 fDrag = - dragMagnitude * dotNRV * relVelocityNorm;
			
			// Calculate lift force:
			float liftMagnitude = liftCoefficient * aerodynamicFactor;
			Vector3 fLift = liftMagnitude * dotNRV * Vector3.Cross(Vector3.Cross(surfNormal,relVelocityNorm),relVelocityNorm).normalized;
			
			// Apply both forces as accelerations:
			p.velocity += fDrag * p.w * dt; // a = F/m
			p.velocity += fLift * p.w * dt; // a = F/m

		}
		
		Profiler.EndSample();
	}
}
}

