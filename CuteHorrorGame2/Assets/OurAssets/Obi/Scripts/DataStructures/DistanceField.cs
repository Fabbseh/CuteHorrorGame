using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi{
/**
 * Generates a signed distance field for a mesh, that can be used for fast collision detection. 
 * Uses an adaptive sampling scheme, so it is compact enough to be used in large/detailed meshes.
 */
public class DistanceField : ScriptableObject
{

	[Serializable]
	public class ADFNode {

		/**
		 * TODO: come up with a way to compress data further: maybe store child distances
		 * in their parent: 19 child samples + 8 own = 27  instead of 64 + 8 = 72 for each node, except leaf nodes which have no samples at all.
		 */

		public int[] children;		/**< indices of and child (8) nodes*/
		public float[] distances;	/**< distance to he surface from each of the 8 corners of the node*/
		public Vector3[] gradients;	/**< sampled gradients*/
		public Bounds bounds;
		public int depth = 0;

		public ADFNode(Bounds bounds){
			this.bounds = bounds;
		}

		public float SampleDistanceAt(Vector3 position){
			
			if (distances == null || distances.Length < 8) return float.MaxValue;

			// project the point inside the node:
			position = bounds.ClosestPoint(position);
			
			// distance interpolation:
			float tx = (position.x - bounds.min.x) / bounds.size.x;
			float ty = (position.y - bounds.min.y) / bounds.size.y;
			float tz = (position.z - bounds.min.z) / bounds.size.z;
			
			float c26 = Mathf.Lerp(distances[2],distances[6],tx);
			float c37 = Mathf.Lerp(distances[3],distances[7],tx);
			float c04 = Mathf.Lerp(distances[0],distances[4],tx);
			float c15 = Mathf.Lerp(distances[1],distances[5],tx);
			
			float c2637 = Mathf.Lerp(c26,c37,tz);
			float c0415 = Mathf.Lerp(c04,c15,tz);
			
			return Mathf.Lerp(c0415,c2637,ty);
			
		}

		public float SampleDistanceAndGradientAt(Vector3 position, out Vector3 gradient){

			gradient = Vector3.zero;
			
			if (distances == null || distances.Length < 8) return float.MaxValue;

			// project the point inside the node:
			position = bounds.ClosestPoint(position);

			// distance interpolation:
			float tx = (position.x - bounds.min.x) / bounds.size.x;
			float ty = (position.y - bounds.min.y) / bounds.size.y;
			float tz = (position.z - bounds.min.z) / bounds.size.z;

			float c26 = Mathf.Lerp(distances[2],distances[6],tx);
			float c37 = Mathf.Lerp(distances[3],distances[7],tx);
			float c04 = Mathf.Lerp(distances[0],distances[4],tx);
			float c15 = Mathf.Lerp(distances[1],distances[5],tx);

			float c2637 = Mathf.Lerp(c26,c37,tz);
			float c0415 = Mathf.Lerp(c04,c15,tz);

			float distance =  Mathf.Lerp(c0415,c2637,ty);

			if (gradients != null && gradients.Length == 8){

				// gradient interpolation (high quality, continuous between cells)			
				Vector3 v26 = Vector3.Lerp(gradients[2],gradients[6],tx);
				Vector3 v37 = Vector3.Lerp(gradients[3],gradients[7],tx);
				Vector3 v04 = Vector3.Lerp(gradients[0],gradients[4],tx);
				Vector3 v15 = Vector3.Lerp(gradients[1],gradients[5],tx);
			
				Vector3 v2637 = Vector3.Lerp(v26,v37,tz);
				Vector3 v0415 = Vector3.Lerp(v04,v15,tz);
			
				gradient = Vector3.Lerp(v0415,v2637,ty);

			}else{

				// gradient reconstruction (low quality, has discontinuities at cell boundaries):
				float c57 = Mathf.Lerp(distances[5],distances[7],ty);
				float c46 = Mathf.Lerp(distances[4],distances[6],ty);
				float c13 = Mathf.Lerp(distances[1],distances[3],ty);
				float c02 = Mathf.Lerp(distances[0],distances[2],ty);
	
				float c5746 = Mathf.Lerp(c57,c46,tz);
				float c1302 = Mathf.Lerp(c13,c02,tz);
				
				float c1357 = Mathf.Lerp(c13,c57,tx);
				float c0246 = Mathf.Lerp(c02,c46,tx);
	
				//reuse c2637 and c0415 from distance interpolation.
				gradient = new Vector3(c5746 - c1302,c2637 - c0415,c1357 - c0246);
			}

			return distance;

		}

		public int SizeInBytes(){
			int size = sizeof(int) + sizeof(float)*6; //depth + size of bounds: center + extents.
			if (children != null){
				size += sizeof(int) * children.Length;
			}
			if (distances != null){
				size += sizeof(float) * distances.Length;
			}
			if (gradients != null){
				size += sizeof(float) * 3 * gradients.Length;
			}
			return size;
		}
	}

	/** Indices of cube corners:

	  		   Y
	  		   2	   6
	    	   +------+
	 	  3  .'|  7 .'|
		   +---+--+'  |
    	   |   |  |   |
		   |   +--+---+   X
		   | .' 0 | .' 4
		   +------+'
		Z 1        5
		
	 */
	[HideInInspector] public Vector3[] corners = new Vector3[8]{ //TODO change to readonly.
		new Vector3(-1,-1,-1), //0
		new Vector3(-1,-1,1),  //1
		new Vector3(-1,1,-1),  //2
		new Vector3(-1,1,1),   //3
		new Vector3(1,-1,-1),  //4
		new Vector3(1,-1,1),   //5
		new Vector3(1,1,-1),   //6
		new Vector3(1,1,1)     //7
	};

	[HideInInspector] public Vector3[] errorSamples = new Vector3[7]{
		Vector3.zero,       //center
		new Vector3(1,0,0), //+X
		new Vector3(-1,0,0),  //-X
		new Vector3(0,1,0),  //+Y
		new Vector3(0,-1,0),   //-Y
		new Vector3(0,0,1),  //+Z
		new Vector3(0,0,-1),   //-Z
	};
	
	[NonSerialized] public BIH bih;	//TODO: make it a local variable.	
	[SerializeField][HideInInspector] List<ADFNode> nodes = new List<ADFNode>();

	[NonSerialized] public EditorCoroutine generationRoutine = null;
    public Mesh mesh;
	public bool highQualityGradient = true;
	public int maxDepth = 6;
	public float maxError = 0.001f;
	public float boundsPadding = 0.1f;

	private Vector3[] vertices; 

	public ADFNode Root{
		get{
			if (nodes.Count > 0) return nodes[0];
            return null;
        }
	}

	public IEnumerator Generate() {

		nodes.Clear();
		
		if (mesh == null)
			yield break;

		vertices = mesh.vertices;
		int[] triangles = mesh.triangles;

		float size = Mathf.Max(mesh.bounds.size.x,mesh.bounds.size.y,mesh.bounds.size.z) + boundsPadding;
		Bounds bounds = new Bounds(mesh.bounds.center,Vector3.one*size);

		// Use the half-edge structure to generate angle-weighted normals:
		HalfEdge he = new HalfEdge(mesh);

		if (Application.isPlaying){
			CoroutineJob.RunSynchronously(he.Generate()); //While playing, do this synchronously. We don't want to wait too much.
		}else{
			CoroutineJob generateHalfEdge = new CoroutineJob();
			generateHalfEdge.asyncThreshold = 2000; 	//If this takes more than 2 seconds in the editor, do it asynchronously.
			EditorCoroutine.StartCoroutine(generateHalfEdge.Start(he.Generate()));

			//Wait for the half-edge generation to complete.
			CoroutineJob.ProgressInfo progress = null;
			while(!generateHalfEdge.IsDone){
				try{
					progress = generateHalfEdge.Result as CoroutineJob.ProgressInfo;
				}catch(Exception e){
					Debug.LogException(e);
					yield break;
				}
				yield return progress;
			}	
		}
		
		//Calculate angle weighted normals, for correct inside/outside determination.
		Vector3[] normals = he.AngleWeightedNormals();

		yield return new CoroutineJob.ProgressInfo("Building BIH...",0.1f);

		// Generate BIH to speed up NN triangle queries.
		bih = new BIH();
		bih.Generate(bounds,vertices,normals,triangles,8,0.8f);

		// Breadth first construction:
		Queue<ADFNode> queue = new Queue<ADFNode>();
		ADFNode root = new ADFNode(bounds);
		queue.Enqueue(root);
		nodes.Add(root);
		int counter = 0;
		while(queue.Count > 0)
		{
			ADFNode node = queue.Dequeue();

			// Here provide an upper-bound estimation of remaining time. Note that in some cases (high maxDepth and high maxError) the process will probably finish sooner than predicted.
			if (counter % 10 == 0)
				yield return new CoroutineJob.ProgressInfo("Generating distance field level "+node.depth+"...",0.1f + (node.depth/(float)maxDepth)*0.9f);

			node.distances = new float[8];
			if (highQualityGradient)
				node.gradients = new Vector3[8];

			// Sample distance at the 8 node corners:
			for (int i = 0; i < 8; i++){
				BIH.SurfaceInfo si = bih.DistanceToSurface(node.bounds.center + Vector3.Scale(node.bounds.extents,corners[i]));
				node.distances[i] = si.signedDistance;
				if (highQualityGradient)
					node.gradients[i] = si.vectorToSurface;
			}

			if (node.depth >= maxDepth) continue;

			// Measure distances at the 6 node faces, and the center of the node.
			float[] realDistances = new float[7];
			for (int i = 0; i < 7; i++)
				realDistances[i] = bih.DistanceToSurface(node.bounds.center + Vector3.Scale(node.bounds.extents,errorSamples[i] * 0.5f)).signedDistance;

			// Get interpolated estimation of distance at the center of possible child nodes:
			float[] interpolatedDistances = new float[7];
			for (int i = 0; i < 7; i++)
				interpolatedDistances[i] = node.SampleDistanceAt(node.bounds.center + Vector3.Scale(node.bounds.extents,errorSamples[i] * 0.5f));

			// Calculate mean squared error between measured distances and interpolated ones:
			float mse = 0;
			for (int i = 0; i < 7; i++){
				float d = realDistances[i] - interpolatedDistances[i];
				mse += d*d;
			}
			mse /= 7f;

			// If error > threshold, subdivide the node.
			if (mse > maxError){

				node.children = new int[8];

				for (int i = 0; i < 8; i++){

					// Calculate child bounds and create the node:
					Vector3 childCenter = node.bounds.center + Vector3.Scale(node.bounds.extents,corners[i] * 0.5f);
					Vector3 childSize = node.bounds.size*0.5f;
					ADFNode child = new ADFNode(new Bounds(childCenter,childSize));
					child.depth = node.depth+1;
					// Set our children index.
					node.children[i] = nodes.Count;
	
					// Add it to nodes list and store it for evaluation.
					nodes.Add(child);
					queue.Enqueue(child);

				}
				
			}
			
			counter++;
		}

		// Get rid of octree.
		bih = null;
		
	}

	public float GetSizeInBytes(){
		int size = 0;
		foreach(ADFNode node in nodes)
			size += node.SizeInBytes();
		return size;
	}
		
	
	public float DistanceAndGradientAt(Vector3 position, out Vector3 gradient){

		gradient = Vector3.zero;
		if (nodes.Count <= 0) return float.MaxValue;
		
		// Depth first traversal:
		Stack<ADFNode> stack = new Stack<ADFNode>();
		stack.Push(nodes[0]);
		while (stack.Count > 0)
		{
			ADFNode node = stack.Pop();
			
			if (node.bounds.Contains(position)){

				if (node.children == null || node.children.Length == 0){ // this is a leaf node
		
					return node.SampleDistanceAndGradientAt(position, out gradient);

				}else{//this node contains children:
					for (int i = 0; i < node.children.Length; i++){
						stack.Push(nodes[node.children[i]]);
					}
				}

			}
			
		}

		return float.MaxValue;

	}

	/**
	 * Return a volume texture containing a representation of this distance field.
	 */
	public Texture3D GetVolumeTexture(int size){

		if (Root == null) return null;

		// upper bound of the distance from any point inside the bounds to the surface.
		float maxDist = Mathf.Max(Root.bounds.size.x,Root.bounds.size.y,Root.bounds.size.z);				

		float spacingX = Root.bounds.size.x / (float)size;
		float spacingY = Root.bounds.size.y / (float)size;
		float spacingZ = Root.bounds.size.z / (float)size;

		Texture3D tex = new Texture3D (size, size, size, TextureFormat.ARGB32, false);

		var cols = new Color[size*size*size];
		int idx = 0;
		Color c = Color.black;

		Vector3 gradient;
		for (int z = 0; z < size; ++z)
		{
			for (int y = 0; y < size; ++y)
			{
				for (int x = 0; x < size; ++x, ++idx)
				{
					Vector3 samplePoint = Root.bounds.min + new Vector3(spacingX * x + spacingX*0.5f,
					                                 					spacingY * y + spacingY*0.5f,
					                                  					spacingZ * z + spacingZ*0.5f);

					float distance = DistanceAndGradientAt(samplePoint,out gradient);

					if (distance >= 0)
						c.r = distance.Remap(0,maxDist*0.1f,0.5f,1);
					else 
						c.r = distance.Remap(-maxDist*0.1f,0,0,0.5f);

					cols[idx] = c;
				}
			}
		}
		tex.SetPixels (cols);
		tex.Apply ();
		return tex;

	}

}
}

