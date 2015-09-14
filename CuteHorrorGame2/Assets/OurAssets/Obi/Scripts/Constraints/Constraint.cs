using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
	/**
	 * Base class for all constraints affecting ObiParticles. Constraints can update both particle positions and velocities,
	 * at different times during the solver step.
	 */
	[Serializable]
	public abstract class Constraint{

		[SerializeField][HideInInspector] protected Transform transform;		/**< space in which particle properties are expressed. */

		[SerializeField][HideInInspector] private float stiffness = 1;		/**< raw stiffness value.*/
		[SerializeField][HideInInspector] private float linearStiffness = 1;	/**< stiffness value used for linear response.*/

		[SerializeField][HideInInspector] private int solverIterations = 1;	/**< number of iterations performed by the solver, used to linearize stiffness.*/

		public float Stiffness{
			set{
				if (value != stiffness){
					stiffness = value;
					RecalculateLinearStiffness();
				}
			}
			get{
				return stiffness;
			}
		}

		public float LinearStiffness{
			get{
				return linearStiffness;
			}
		}

		public int SolverIterations{
			set{
				if (value != solverIterations && value > 0){
					solverIterations = value;
					RecalculateLinearStiffness();
				}
			}
			get{
				return solverIterations;
			}
		}

		public Constraint (Transform transform){
			this.transform = transform;
		}

		private void RecalculateLinearStiffness(){
			linearStiffness = 1-Mathf.Pow(1-stiffness,1f/solverIterations);
		}

		/**
		 * Calculates position deltas (corrections). Will use the provided particle list to 
		 * obtain the required particle data, and the half edge structure for fast mesh queries.
		 */
		public abstract void CalculatePositionDeltas(HalfEdge halfedge, List<ObiClothParticle> particles, float dt);

		/**
		 * Applies position deltas directly to the particles.
		 */
		public abstract void ApplyPositionDeltas(List<ObiClothParticle> particles, float sorFactor);
		
	}
}

