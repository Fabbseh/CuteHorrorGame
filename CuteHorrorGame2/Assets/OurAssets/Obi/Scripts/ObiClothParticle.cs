using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
/**
 * Holds information for a single particle in the cloth simulation.
 */
[Serializable]
public class ObiClothParticle
{
	public Vector3 position;									/**< current particle position*/
	public Vector3 predictedPosition;							/**< predicted particle position at the end of this frame.*/
	public Vector3 velocity;									/**< current particle velocity.*/
	public List<int> neighbours = new List<int>();				/**< particle neighbours*/
	public bool asleep = false;									/**< whether this particle is sleeping or not.*/
	public float wakeCounter = 2;								/**< while this counter is over zero, the particle is not ready to go to sleep.*/

	public int index;											/**< index of this particle in the half-edge vertices array.*/
	[NonSerialized] public int gridCellHash = int.MaxValue;		/**< hash in the adaptive grid structure.*/
	[NonSerialized] public int numConstraints = 0;				/**< amount of constraints affecting this particle.*/
	[NonSerialized] public Vector3 positionDelta = Vector3.zero;/**< accumulated position delta for this step.*/
	
	[SerializeField] private float _w = 0;						/**< weight of this particle, that is, inverse mass.*/
	[SerializeField] private float _mass = 0;					/**< mass of this particle.*/
	[SerializeField] private float _areaContribution = 1;		/**< area contribution of this particle to the overall area density.*/
	[SerializeField] private float _radius = 1;					/**< particle radius, used for self collisions*/
	
	/**
	 * Returns particle weight (inverse of mass)(read only).
	 */
	public float w{
		get{return _w;}
	}
	
	/**
	 * Get or set particle mass. When setting the mass, the particle weight is automatically calculated
	 * and updated.
	 */
	public float mass{
		set{
			if (_mass != value){
				_mass = value;
				_w = 1 / Mathf.Max(_mass * _areaContribution,0.00001f);
				WakeUp(1); //wake up for at least 1 second.
			}
		}
		get{
			return _mass;
		}
	}

	public float areaContribution{
		get{return _areaContribution;}
	}

	public float radius{
		get{return _radius;}
	}
	
	/**
	 * Particle constructor.
	 * \param index index of the particle in the half-edge vertices array.
	 * \param mass mass of the particle.
	 * \param position position of the particle.
	 * \param velocity velocity of the particle.
	 */
	public ObiClothParticle(int index, float areaContribution, float mass, Vector3 position, Vector3 velocity)
	{
		this.index = index;
		this._areaContribution = areaContribution;
		this._radius = Mathf.Sqrt(areaContribution/Mathf.PI);
		this.mass = mass;
		this.position = position;
		this.velocity = velocity;
	}

	/**
	 * Applies accumulated position delta to the predicted position and resets the constraint counter.
	 */
	public void ApplyPositionDeltas(float sorFactor){
		if (numConstraints > 0){
			predictedPosition += positionDelta * (sorFactor/numConstraints);
			positionDelta = Vector3.zero;
			numConstraints = 0;
		}
	}

	public void WakeUp(float minimumWakeTime){
		asleep = false;
		wakeCounter = minimumWakeTime;
	}

	public void GoToSleep(){
		asleep = true;
		velocity = Vector3.zero;
	}
}
}