using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
	[Serializable]
	public class ShapeMatchingConstraintGroup : ConstraintGroup<ShapeMatchingConstraint>
	{

		[InspectorButton("GrabShape", ButtonWidth = 120)]
		[SerializeField] private bool grabShape;

		[Range(0,1)]
		[Tooltip("Stiffness of the shape matching constraints. Lower values will cause the cloth to follow its original shape loosely, at high values the cloth will barely deviate from its original shape.")]
		public float matchingStiffness = 1;		   /**< Resistance of structural spring constraints to stretch.*/

		[Range(0,1)]
		[Tooltip("Amount of linear deformation the shape can undergo.")]
		public float linearDeformation = 0;		   /**< Linear mode deformation.*/
		
		public ShapeMatchingConstraintGroup() : base(){
			enabled = false;
			name = "Shape matching";
		}
		
		public void GrabShape(IEnumerable<ShapeMatchingConstraint> constraints,List<ObiClothParticle> particles){
			foreach(ShapeMatchingConstraint c in constraints){
				c.ComputeRestInfo(particles);
			}
		}

		public override void SetupConstraintParameters(IEnumerable<ShapeMatchingConstraint> constraints){
			
			foreach(ShapeMatchingConstraint c in constraints){
				c.Stiffness = matchingStiffness; 
				c.enabled = enabled;
				c.linearDeformation = linearDeformation;
				c.SolverIterations = iterations;
			}
			
		}
	}
}

