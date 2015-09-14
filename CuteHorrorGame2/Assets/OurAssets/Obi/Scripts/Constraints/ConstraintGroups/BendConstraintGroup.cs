using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
[Serializable]
public class BendConstraintGroup : ConstraintGroup<BendingConstraint>
{

	[Range(0,1)]
	[Tooltip("Cloth resistance to bending. Higher values will yield more rigid cloth.")]
	public float bendingStiffness = 0.5f;			/**< Stiffness of local curvature constraint enforcement.*/

	[Tooltip("Maximum amount of bending tolerated by the cloth before resisting it.")]
	[Range(0,1)]
	public float maxBending = 0.5f;					/**< Maximum local curvature change accepted by the cloth.*/

	public BendConstraintGroup(){
		name = "Bend";
	}

	public override void SetupConstraintParameters(IEnumerable<BendingConstraint> constraints){
		
		foreach(BendingConstraint c in constraints){
			c.K = maxBending;
			c.SolverIterations = iterations;
			c.Stiffness = bendingStiffness;
		}
		
	}
}
}

