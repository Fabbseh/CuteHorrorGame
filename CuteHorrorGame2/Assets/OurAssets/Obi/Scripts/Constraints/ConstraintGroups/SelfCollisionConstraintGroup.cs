using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Obi
{
	[Serializable]
	public class SelfCollisionConstraintGroup : ConstraintGroup<SelfCollisionConstraint>
	{

		private Vector3[] neighborCellOffsets = new Vector3[]
		{  // Offsets to neighboring cells whose indices exceed this one:
			new Vector3(1,0,0),    // + , 0 , 0 ( 1)
			new Vector3(-1,1,0),   // - , + , 0 ( 2)
			new Vector3(0,1,0),    // 0 , + , 0 ( 3)
			new Vector3(1,1,0),    // + , + , 0 ( 4)
			new Vector3(-1,-1,1),  // - , - , + ( 5)
			new Vector3(0,-1,1),   // 0 , - , + ( 6)
			new Vector3(1,-1,1),   // + , - , + ( 7)
			new Vector3(-1,0,1),   // - , 0 , + ( 8)
			new Vector3(0,0,1),    // 0 , 0 , + ( 9)
			new Vector3(1,0,1),    // + , 0 , + (10)
			new Vector3(-1,1,1),   // - , + , + (11)
			new Vector3(0,1,1),    // 0 , + , + (12)
			new Vector3(1,1,1)     // + , + , + (13)
		};

		[Tooltip("How much friction to apply when resolving self-collisions. with rigidbodies. 0 is no friction at all (cloth will slide off itself) and 1 is maximum friction.")]
		[Range(0,1)]
		public float friction = 0.5f;

		public const float epsilon =  1e-8f;

		public SelfCollisionConstraintGroup() : base(){
			enabled = false;
			evaluationOrder = EvaluationOrder.PARALLEL;
			name = "Self collision";
		}

		/**
		 * Generate a list of self collision constraints to be satisfied by cloth particles.
	 	*/
		public List<SelfCollisionConstraint> GenerateSelfCollisionConstraints(Transform transform, HalfEdge edgeStructure, AdaptiveGrid grid, List<ObiClothParticle> particles){
			
			List<SelfCollisionConstraint> collisions = new List<SelfCollisionConstraint>();

			if (!enabled) return collisions;
			
			UpdateNeighbourLists(edgeStructure,grid,particles);
			
			for (int i = 0; i < particles.Count; i++){
				ObiClothParticle p1 = particles[i];	
				for(int n = 0; n < particles[i].neighbours.Count; n++){

					ObiClothParticle p2 = particles[particles[i].neighbours[n]];	

					Vector3 diff = p1.position - p2.position;
					float diffMag = diff.magnitude;
					Vector3 normal = diff / (diffMag + epsilon);
					Vector3 point = p2.position + normal * p2.radius;
					float distance = diffMag - (p1.radius + p2.radius);

					collisions.Add(new SelfCollisionConstraint(transform,p1,p2,point,normal,distance,friction)); //TODO: have a constraint pool instead of creating these all the time.
					
				}
			}
			
			return collisions;
		}

		protected void UpdateNeighbourLists(HalfEdge edgeStructure, AdaptiveGrid grid,List<ObiClothParticle> particles){
			
			if (grid == null || edgeStructure == null) return;
			
			foreach (ObiClothParticle p in particles){
				p.neighbours.Clear();
			}
			
			for (int index = 0; index < grid.cells.Count; index++) {
				
				AdaptiveGrid.Cell currentCell = grid.cells.Values.ElementAt(index);
				
				//For each particle in the current cell:
				for (int j = 0; j < currentCell.particles.Count; j++){
					ObiClothParticle i = currentCell.particles[j];
					
					//For each particle in the current cell that follows us:
					for(int k = j+1; k < currentCell.particles.Count; k++){
						ObiClothParticle n = currentCell.particles[k];
						
						//Calculate radius of each bounding sphere using particle area contributions:
						float radius = i.radius + n.radius;
						
						if ((n.predictedPosition - i.predictedPosition).sqrMagnitude < radius*radius &&
						    !edgeStructure.AreLinked(edgeStructure.heVertices[n.index],edgeStructure.heVertices[i.index])){
							i.neighbours.Add(n.index);
							n.neighbours.Add(i.index);
						}
					}
				}
				
				
				//For each neighbour cell:
				for (int nx = 0; nx < neighborCellOffsets.Length; nx++){
					
					int hash = grid.ComputeCellHash(currentCell.Index + neighborCellOffsets[nx]);
					
					AdaptiveGrid.Cell cell;
					if (grid.cells.TryGetValue(hash,out cell)){
						
						//For each particle in the current cell:
						for (int j = 0; j < currentCell.particles.Count; j++){
							ObiClothParticle i = currentCell.particles[j];
							
							//For each particle in the neighbour search cell:
							for(int k = 0; k < cell.particles.Count; k++){
								ObiClothParticle n = cell.particles[k];
								
								float radius = i.radius + n.radius;
								
								if ((n.predictedPosition - i.predictedPosition).sqrMagnitude < radius*radius &&
								    !edgeStructure.AreLinked(edgeStructure.heVertices[n.index],edgeStructure.heVertices[i.index])){
									i.neighbours.Add(n.index);
									n.neighbours.Add(i.index);
								}	
							}		
						}
					}
				}
			}
			
		}

	}
}

