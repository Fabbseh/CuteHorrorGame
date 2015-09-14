using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
	[Serializable]
	public class CollisionConstraintGroup : ConstraintGroup<CollisionConstraint>
	{

		[Tooltip("How much friction to apply when resolving collisions with rigidbodies. 0 is no friction at all (cloth will slide as if rigidbodies were made of ice) and 1 is maximum friction.")]
		[Range(0,1)]
		public float friction = 0.5f;

		[Tooltip("Whether to use or not virtual particles. These are particles placed inside cloth triangles, and used for collision detection only. Using them allows to detect collisions with objects that would otherwise slip between cloth vertices.")]
		public bool virtualParticles = false;			/**< If true, mesh faces will be sprinkled with additional particles used only on the collision detection phase. 
														 This allows for finer collision detection on coarse meshes. However, in order to avoid missing collisions, make sure the gridSize parameter is not smaller 
														 than the average triangle in your meshes, because for performance reasons virtual particles are only tested if at least one regular particle resides in the same grid cell
		                                         		 as the rigidbody being tested for collisions.*/
		
		[Tooltip("Barycentric coordinates of virtual particles.")]
		public Vector3[] virtualParticleCoordinates;	/**< Barycentric coordinates of virtual particles on the mesh*/

		public CollisionConstraintGroup(){
			evaluationOrder = EvaluationOrder.PARALLEL;
			name = "Collision";
		}

		/**
		 * Generate a list of collision constraints to be satisfied by cloth particles.
		 */
		public List<CollisionConstraint> GenerateCollisionConstraints(float dt,Transform transform, Bounds clothBounds, ObiWorld world, HalfEdge edgeStructure, AdaptiveGrid grid, List<ObiClothParticle> particles){
			
			List<CollisionConstraint> collisions = new List<CollisionConstraint>();
			
			if (enabled && world != null && 
			    grid != null && 
			    particles != null && 
			    edgeStructure != null && 
			    transform != null){

				List<GameObject> colliders = world.PotentialColliders(clothBounds);

				foreach(GameObject go in colliders){
					
					if (go != null){
	
						Collider c = go.GetComponent<Collider>();
						DistanceFieldCollider dfc = go.GetComponent<DistanceFieldCollider>();
						ObiActor actor = go.GetComponent<ObiActor>();
	
						// If the object does not contain a regular collider or a distance field collider, skip it.
						if (actor == null || (c == null && dfc == null)) continue;
	
						// Create a set of faces that should be sprinkled with virtual particles.
						HashSet<HalfEdge.HEFace> facesWVirtualCollisions = new HashSet<HalfEdge.HEFace>();
	
						// iterate over cells intersecting with the collider bounds. 
						List<AdaptiveGrid.Cell> collidingCells = grid.GetCellsInsideBounds(actor.bounds,0,50);

						Vector3 point;
						Vector3 normal;
						float distance;

						Rigidbody rigidbody = go.GetComponent<Rigidbody>();	
						foreach(AdaptiveGrid.Cell cell in collidingCells){
							
							// check each particle in the cell for collisions:
							foreach(ObiClothParticle p in cell.particles){

								// Get speculative contact info: nearest point, feature normal and distance.
								ColliderEscapePoint(c,dfc,transform.TransformPoint(p.position),out point, out normal, out distance);

								// Create speculative contact:
								collisions.Add(new CollisionConstraint(transform,p,rigidbody,point,normal,distance,friction));

								// if using virtual particles, check all triangles that have at least one vertex in a colliding cell.
								if (virtualParticles && virtualParticleCoordinates != null){
									foreach(HalfEdge.HEFace face in edgeStructure.GetNeighbourFacesEnumerator(edgeStructure.heVertices[p.index])){
										facesWVirtualCollisions.Add(face);
									}
								}
								
							}
							
						}
						
						// Test virtual particles for collisions:
						foreach(HalfEdge.HEFace triangle in facesWVirtualCollisions){
							
							ObiClothParticle p1 = particles[edgeStructure.heEdges[triangle.edges[0]].endVertex];
							ObiClothParticle p2 = particles[edgeStructure.heEdges[triangle.edges[1]].endVertex];
							ObiClothParticle p3 = particles[edgeStructure.heEdges[triangle.edges[2]].endVertex];
							
							foreach (Vector3 vpBarycentricCoords in virtualParticleCoordinates){
								
								Vector3 vpPosition = ObiUtils.BarycentricInterpolation(p1.position,p2.position,p3.position,vpBarycentricCoords);

								// Get speculative contact info: nearest point, feature normal and distance.
								ColliderEscapePoint(c,dfc,transform.TransformPoint(vpPosition),out point, out normal, out distance);
								
								// Create speculative contact:
								collisions.Add(new VirtualCollisionConstraint(transform,p1,p2,p3,vpPosition,vpBarycentricCoords,rigidbody,point,normal,distance,friction));

							}
						}
					}
					
				}
			}
			
			return collisions;
		}

		private void ColliderEscapePoint(Collider c, DistanceFieldCollider dfc, Vector3 position, out Vector3 point, out Vector3 normal, out float distance){
			
			point = position;
			normal = Vector3.zero;
			distance = 0;

			if (dfc != null){
				
				dfc.EscapePoint(position,out point,out normal,out distance);
				
			}
		
			else if (c is SphereCollider){
				
			 	((SphereCollider) c).EscapePoint(position,out point,out normal,out distance);
				
			}
		
			else if (c is BoxCollider){
				
				((BoxCollider) c).EscapePoint(position,out point,out normal,out distance);
				
			} 

			else if (c is CapsuleCollider){
				
				((CapsuleCollider) c).EscapePoint(position,out point,out normal,out distance);
				
			}

			else if (c is TerrainCollider){
				
				((TerrainCollider) c).EscapePoint(position,out point,out normal,out distance);
				
			}
			
		}

	}
}

