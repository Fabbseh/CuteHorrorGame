using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
	/**
	 * Types of constraint evaluation order.
	 */
	public enum EvaluationOrder{
		SEQUENTIAL, /**< Sequential constraint evaluation projects constraints in a fixed order, determined
		             	 by constraint creation order. Each constraint "sees" the previous position deltas applied
		                 by previously evaluated constraints, which tipically leads to faster convergence than parallel evaluation.
		                 However this also introduces biasing, which can lead to instabilities caused by some constraint position adjustments 
		                 having more "preference" than others.

		             	 Use this mode if you are not having stability issues of any kind.*/
		
		PARALLEL	/**< With parallel constraint evaluation each constraint knows nothing about corrections made by 
						 other constraints. All constraints calculate their desired corrections to the initial prediction,
		          		 then corrections are averaged and the final overall correction applied to the particles after each step. 
		          		 This eliminates any ordering bias, but also causes slower convergence. 

						 Use this mode if you are having stability issues, if you can afford to have a few more iterations per step,
		          		 or if you don't need fast convergence.

		          		 Common use cases:
		          		 - Self collisions should almost always use parallel evaluation mode, as they're prone to make the cloth implode when lots of self collisions happen at once.
		          		 - Pressure constraint has a very high pressure value and the stretch constraints are having a hard time preserving the original mesh shape -> Use parallel mode for the stretch constraints.
	          			 - Stretch scale is very low and stretch constraints can't keep the mesh shape -> Use parallel mode for the stretch constraints.
		          		 - Cloth is trapped between several rigidbodies and starts shaking because collision constraints can't seem to decide where to place cloth vertices -> Use parallel mode for the collision constraints.*/
	}

	/**
	 * Evaluates a group of constraints of the same type together. Each group evaluates all its constraints a certain number
	 * of times during a physics step, which can be set using the "iterations" variable. 
	 */
	[Serializable]
	public class ConstraintGroup<T> where T : Constraint
	{
		protected string name = "";

		[Tooltip("Whether this constraint group affects the cloth or not.")]
		public bool enabled = true;

		[Tooltip("Number of relaxation iterations performed by the constraint solver. A low number of iterations will perform better, but be less accurate.")]
		public int iterations = 3;													/**< Amount of solver iterations per step for this constraint group.*/

		[Tooltip("Order in which constraints are evaluated. SEQUENTIAL converges faster but is not very stable. PARALLEL is very stable but converges slowly, requiring more iterations to achieve the same result.")]
		public EvaluationOrder evaluationOrder = EvaluationOrder.SEQUENTIAL;		/**< Constraint evaluation order.*/

		[Tooltip("Over-relaxation factor used when constraints are evaluated in PARALLEL mode. At 1, no overrelaxation is performed. At 2, constraints double their relaxation rate. High values reduce stability but improve convergence.")]
		[Range(1,2)]
		public float SORFactor = 1.0f;												/**< Sucessive over-relaxation factor for parallel evaluation order.*/

		public int effectiveIterations{												/**< Returns 0 if the group is disabled, and the amount of iterations otherwise.*/
			get{return enabled?iterations:0;}
		}

		/**
		 * Updates constraint parameters.
		 */
		public virtual void SetupConstraintParameters(IEnumerable<T> constraints){
			foreach(Constraint c in constraints){
				c.SolverIterations = iterations;
			}
		}

		/**
		 * Evaluates all constraints provided, in parallel or sequential order.
		 */
		public void Evaluate(IEnumerable<T> constraints, HalfEdge edgeStructure,List<ObiClothParticle> particles, float dt) //TODO: allow independent num iteration settings for each constraint group.
		{
			if (!enabled || constraints == null) return;

			Profiler.BeginSample(name+" evaluation");
			switch(evaluationOrder){
				case EvaluationOrder.SEQUENTIAL:{
					//apply deltas directly for this constraint, so changes are immediately visible for next constraint.
					foreach(Constraint c in constraints){
						c.CalculatePositionDeltas(edgeStructure,particles,dt);
						c.ApplyPositionDeltas(particles,1); 
					}
				}break;
				case EvaluationOrder.PARALLEL:{
					//average position deltas and apply them only at the end of the projection step.
					foreach(Constraint c in constraints){
						c.CalculatePositionDeltas(edgeStructure,particles,dt);
					}
					foreach(ObiClothParticle p in particles){
						p.ApplyPositionDeltas(SORFactor);
					}
				}break;
			}
			Profiler.EndSample();
		}

		/**
		 * Returns iteration padding value for a given number of total solver iterations. Will return 1 if the 
		 * group is disabled or the amount of iterations is less than 1.
		 */
		public int IterationPadding(int maxIterations){
			return (enabled && iterations > 0) ? Mathf.CeilToInt(maxIterations/(float)iterations):1;
		}

	}

}

