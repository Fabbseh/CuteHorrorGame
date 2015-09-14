using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi{

/**
 * This class is a bounding interval hierarchy, which is used in Obi to speed up distance queries to triangle meshes when
 * building ADFs (Adaptive distance fields).
 */
[Serializable]
public class BIH{
	
	public class SurfaceInfo{

		public float distanceSqr = float.MaxValue;
		public int sign = 1;
		public Vector3 normal = Vector3.zero;
		public Vector3 vectorToSurface = Vector3.zero;

		public float signedDistance{
			get{return Mathf.Sqrt(distanceSqr) * sign;}
		}
			
		public SurfaceInfo(){}		

		public SurfaceInfo(float distance, int sign, Vector3 normal, Vector3 vectorToSurface){
			this.distanceSqr = distance;
			this.sign = sign;
			this.normal = normal;
			this.vectorToSurface = vectorToSurface;
		}
	
	}

	[Serializable]
	public class BIHNode {
	
		public int axis = 0;						/**< split axis*/

		public int[] children;						/**< index of child nodes in tree*/
		public float[] pivots;						/**< value of pivot for left and right children.*/

		public int depth = 0;

		public Bounds bounds = new Bounds();		/**< bounding box of this nodes contents*/ //TODO: we could do without storing this, we are only interested in split axis and pivots.
		public List<BIH.Triangle> triangles = new List<BIH.Triangle>();	/**< triangles inside this node*/

		public BIHNode(Bounds bounds){
			this.bounds = bounds;
		}

		public BIHNode(List<BIH.Triangle> triangles,int depth){
			this.triangles = triangles;
			this.depth = depth;
		}
		
	}

	[Serializable]
	public class Triangle{

		public int[] indices = new int[3];

		public Triangle(int i1, int i2, int i3){
			indices[0] = i1;
			indices[1] = i2;
			indices[2] = i3;
		}
	}

	[SerializeField] List<BIHNode> nodes = new List<BIHNode>();
	Vector3[] vertices;
	Vector3[] normals;

	public BIHNode Root{
		get{
			if (nodes.Count > 0) return nodes[0];
			return null;
		}
	}

	/**
 	* Build a bounding interval hierarchy by separating triangles at plane boundaries.
 	*/
	public void Generate(Bounds bounds, Vector3[] vertices, Vector3[] normals, int[] indices, int maxDepth, float maxOverlap) {
		
		nodes.Clear();

		if (vertices == null || normals == null || indices == null)
			return;

		this.vertices = vertices;
		this.normals = normals;

		// Depth first construction, for cache-friendlyness when traversing the tree.
		Stack<BIHNode> stack = new Stack<BIHNode>();
		BIHNode root = new BIHNode(bounds);
		
		// Build initial triangle list:
		for(int i = 0; i < indices.Length;i+=3){
			root.triangles.Add(new Triangle(indices[i],indices[i+1],indices[i+2]));
		}

		stack.Push(root);
		nodes.Add(root);
		while(stack.Count > 0)
		{
			BIHNode current = stack.Pop();

			if (current.depth >= maxDepth) continue;

			List<Triangle> leftTris = new List<Triangle>();
			List<Triangle> rightTris = new List<Triangle>();

			// Select split axis (longest axis of the bounding box)
			if (current.bounds.extents.y > Mathf.Max(current.bounds.extents.x,current.bounds.extents.z))
				current.axis = 1;
			else if (current.bounds.extents.z > Mathf.Max(current.bounds.extents.x,current.bounds.extents.y))
				current.axis = 2;

			// Get split plane position:
			float avgPivot = 0;
			foreach(Triangle tri in current.triangles){
				avgPivot += vertices[tri.indices[0]][current.axis] + vertices[tri.indices[1]][current.axis] + vertices[tri.indices[2]][current.axis];
			}
			avgPivot /= 3*current.triangles.Count;

			// Sort triangles based on split plane side.
			foreach(Triangle tri in current.triangles){

				float triCenter = (vertices[tri.indices[0]] + vertices[tri.indices[1]] + vertices[tri.indices[2]]) [current.axis] / 3f;
				if (avgPivot >= triCenter)  leftTris.Add(tri); else rightTris.Add(tri);

			}

			bool stopSubdividing = (leftTris.Count/(float)current.triangles.Count) > maxOverlap || (rightTris.Count/(float)current.triangles.Count) > maxOverlap || leftTris.Count < 2 || rightTris.Count < 2;
			
			// Stop subdividing if  left or right node have more than a certain percentage of triangles of the parent node.
			if (!stopSubdividing){

				current.triangles = null;
				current.children = new int[2];
				current.pivots = new float[2];


				// LEFT CHILD:
				BIHNode leftChild = new BIHNode(leftTris,current.depth+1);

				leftChild.bounds = ObiUtils.GetTriangleBounds(vertices[leftChild.triangles[0].indices[0]],
				                                              vertices[leftChild.triangles[0].indices[1]],
				                                              vertices[leftChild.triangles[0].indices[2]]);
				
				foreach(Triangle tri in leftChild.triangles){
					leftChild.bounds.Encapsulate(ObiUtils.GetTriangleBounds(vertices[tri.indices[0]],
					                                                        vertices[tri.indices[1]],
					                                                        vertices[tri.indices[2]]));
					
				}
				current.pivots[0] = leftChild.bounds.max[current.axis];

				current.children[0] = nodes.Count;
				stack.Push(leftChild);
				nodes.Add(leftChild);
			
				// RIGHT CHILD

				BIHNode rightChild = new BIHNode(rightTris,current.depth+1);

				rightChild.bounds = ObiUtils.GetTriangleBounds(vertices[rightChild.triangles[0].indices[0]],
				                                               vertices[rightChild.triangles[0].indices[1]],
				                                               vertices[rightChild.triangles[0].indices[2]]);
				
				foreach(Triangle tri in rightChild.triangles){
					rightChild.bounds.Encapsulate(ObiUtils.GetTriangleBounds(vertices[tri.indices[0]],
					                                                        vertices[tri.indices[1]],
					                                                        vertices[tri.indices[2]]));
					
				}
				current.pivots[1] = rightChild.bounds.min[current.axis];

				current.children[1] = nodes.Count;
				stack.Push(rightChild);
				nodes.Add(rightChild);

			}
			
		}
	}

	private SurfaceInfo DistanceToTriangles(Vector3 point,List<Triangle> triangles){
		
		if (vertices == null || normals == null || triangles == null) return new SurfaceInfo();
		
		float minDistanceSqr = float.MaxValue;
		int sign = 1;
		Vector3 vectorToSurface = Vector3.zero;
		Vector3 normal = Vector3.zero;

		foreach(Triangle tri in triangles){
			
			Vector3 p1 = vertices[tri.indices[0]];
			Vector3 p2 = vertices[tri.indices[1]];
			Vector3 p3 = vertices[tri.indices[2]];
			
			// calculate distance to this triangle.
			float u,v;
			Vector3 nearest = ObiUtils.NearestPointOnTri(p1,p2,p3,point, out u, out v);
			Vector3 vector = point - nearest;
			float sqrDistance = vector.sqrMagnitude;
			
			if (sqrDistance < minDistanceSqr){

				minDistanceSqr = sqrDistance;
				vectorToSurface = vector;

				Vector3 bary = new Vector3(1-u-v,u,v);
				normal = ObiUtils.BarycentricInterpolation(normals[tri.indices[0]],normals[tri.indices[1]],normals[tri.indices[2]],bary);
				sign = (int) Mathf.Sign(Vector3.Dot(normal,vector));
			}
			
		}
		
		return new SurfaceInfo(minDistanceSqr,sign,normal,vectorToSurface * sign); //TODO. closed meshes give signed distance, open ones should not.
		
	}


	private SurfaceInfo DistanceToSurface(Vector3 point, BIHNode node){

		if (node == null) return new SurfaceInfo();

		if (node.children != null){

			/**
			 * If the current node is not a leaf, figure out which side of the split plane that contains the query point, and recurse down that side. 
			 * You will get the index and distance to the closest triangle in that subtree. 
			 * Then, check if the distance to the nearest triangle is closer to the query point than the distance between the query point and the split plane. 
			 * If it is closer, there is no need to recurse down the other side of the KD tree and you can just return. 
			 * Otherwise, you will need to recurse down the other way too, and return whichever result is closer.
			 */

			SurfaceInfo si = new SurfaceInfo();

			// child nodes overlap
			if (node.pivots[0] > node.pivots[1]){

				// CASE 1: we are in the overlapping zone: recurse down both.
				if (point[node.axis] <= node.pivots[0] && point[node.axis] >= node.pivots[1]){

					si = DistanceToSurface(point, nodes[node.children[0]]);
					SurfaceInfo si2 = DistanceToSurface(point, nodes[node.children[1]]);
					if (si2.distanceSqr < si.distanceSqr)
						si = si2;

				}
				// CASE 2: to the right of left pivot, that is: in the right child only.
				else if (point[node.axis] > node.pivots[0]){

					si = DistanceToSurface(point, nodes[node.children[1]]);

					// only recurse down left child if nearest surface in right child is furthest than left pivot.
					float pivotDistance = point[node.axis] - node.pivots[0];
					if (si.distanceSqr > pivotDistance*pivotDistance){
						SurfaceInfo si2 = DistanceToSurface(point, nodes[node.children[0]]);
						if (si2.distanceSqr < si.distanceSqr)
							si = si2;
					}
				}
				// CASE 3: to the left of right pivot, that is: in the left child only.
				else{

					si = DistanceToSurface(point, nodes[node.children[0]]);
					
					// only recurse down right child if nearest surface in left child is furthest than right pivot.
					float pivotDistance = node.pivots[1] - point[node.axis];
					if (si.distanceSqr > pivotDistance*pivotDistance){
						SurfaceInfo si2 = DistanceToSurface(point, nodes[node.children[1]]);
						if (si2.distanceSqr < si.distanceSqr)
							si = si2;
					}

				}

			}
			// child nodes dont overlap.
			else{

				// CASE 4: we are in the middle. just pick up one child (I chose right), get minimum, and if the other child pivot is nearer, recurse down it too.
				// Just like case 2.
				if (point[node.axis] > node.pivots[0] && point[node.axis] < node.pivots[1]){

					si = DistanceToSurface(point, nodes[node.children[1]]);
					
					// only recurse down left child if nearest surface in right child is furthest than left pivot.
					float pivotDistance = point[node.axis] - node.pivots[0];
					if (si.distanceSqr > pivotDistance*pivotDistance){
						SurfaceInfo si2 = DistanceToSurface(point, nodes[node.children[0]]);
						if (si2.distanceSqr < si.distanceSqr)
							si = si2;
					}
				}
				// CASE 5: in the left child. Just like case 3.
				else if (point[node.axis] <= node.pivots[0]){

					si = DistanceToSurface(point, nodes[node.children[0]]);
					
					// only recurse down right child if nearest surface in left child is furthest than right pivot.
					float pivotDistance = node.pivots[1] - point[node.axis];
					if (si.distanceSqr > pivotDistance*pivotDistance){
						SurfaceInfo si2 = DistanceToSurface(point, nodes[node.children[1]]);
						if (si2.distanceSqr < si.distanceSqr)
							si = si2;
					}

				}
				// CASE 6: in the right child. Just like case 2
				else if (point[node.axis] >= node.pivots[1]){

					si = DistanceToSurface(point, nodes[node.children[1]]);
					
					// only recurse down left child if nearest surface in right child is furthest than left pivot.
					float pivotDistance = point[node.axis] - node.pivots[0];
					if (si.distanceSqr > pivotDistance*pivotDistance){
						SurfaceInfo si2 = DistanceToSurface(point, nodes[node.children[0]]);
						if (si2.distanceSqr < si.distanceSqr)
							si = si2;
					}
				}

			}

			return si;

		}else{
			return DistanceToTriangles(point,node.triangles);
		}

	}

	public SurfaceInfo DistanceToSurface(Vector3 point){
		return DistanceToSurface(point,Root);
	}

}
	
}
