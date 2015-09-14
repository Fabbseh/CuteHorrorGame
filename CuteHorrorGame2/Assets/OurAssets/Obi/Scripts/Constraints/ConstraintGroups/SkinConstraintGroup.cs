using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
	[Serializable]
	public class SkinConstraintGroup : ConstraintGroup<SkinConstraint>
	{

		[Range(0,1)]
		[Tooltip("How strongly the skin constraints should be enforced.")]
		public float stiffness = 1;		   /**< Resistance of structural spring constraints to stretch..*/
		
		[Tooltip("Maximum distance between the skinned vertex position and the corresponding cloth particle.")]
		public float radius = 0.1f;	

		[Tooltip("Minimum distance from the skinned surface cloth particles can be at. Negative values allow penetration, positive values add space between the skinned surface and the cloth.")]
		public float backstop = 0;		   

		[Tooltip("If enabled, skinned tangents will be transferred to the cloth. For use with normal-mapped meshes.")]
		public bool transferTangents = false;	/**< If true, cloth will be able to tear if tension forces between particles exceed restLenght * tearFactor.*/
		
		public SkinConstraintGroup(){
			name = "Skin";
			enabled = false;
		}
		
		public override void SetupConstraintParameters(IEnumerable<SkinConstraint> constraints){
			
			foreach(SkinConstraint c in constraints){
				c.SolverIterations = iterations;
				c.Stiffness = stiffness;
				c.backstop = backstop;
				c.radius = radius;
			}
			
		}
	}
}

