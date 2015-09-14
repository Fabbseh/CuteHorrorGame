using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
[Serializable]
public class StretchConstraintGroup : ConstraintGroup<DistanceConstraint>
{
	[Range(0.1f,2)]
	[Tooltip("Scale of stretching constraints. Values > 1 will expand initial cloth size, values < 1 will make it shrink.")]
	public float stretchingScale = 1;				/**< Stiffness of structural spring constraints.*/
	
	[Range(0,1)]
	[Tooltip("Cloth resistance to stretching. Lower values will yield more elastic cloth.")]
	public float stretchingStiffness = 1;		   /**< Resistance of structural spring constraints to stretch..*/

	[Range(0,1)]
	[Tooltip("Cloth resistance to compression. Lower values will yield more elastic cloth.")]
	public float compressionStiffness = 1;		   /**< Resistance of structural spring constraints to compression.*/

	[Tooltip("If enabled, cloth will tear if a stretching threshold is surpassed.")]
	public bool tearable = false;					/**< If true, cloth will be able to tear if tension forces between particles exceed restLenght * tearFactor.*/
	
	[Tooltip("Maximum strain betweeen particles before the spring constraint holding them together would break. A factor of 2 would make springs break when their lenght surpasses restLenght*2")]
	public float tearFactor = 1.5f;					/**< Factor that controls how much a structural cloth spring can stretch before breaking.*/

	public StretchConstraintGroup(){
		name = "Stretch";
	}

	public override void SetupConstraintParameters(IEnumerable<DistanceConstraint> constraints){

		foreach(DistanceConstraint c in constraints){
			c.shouldBreak = false;
			c.SolverIterations = iterations;
			c.Stiffness = stretchingStiffness;
			c.CompressionStiffness = compressionStiffness;
			c.tearDistance = c.restLenght * stretchingScale * tearFactor;
			c.scale = stretchingScale;
		}

	}
}
}

