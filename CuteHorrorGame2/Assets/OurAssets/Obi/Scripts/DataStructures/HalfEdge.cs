using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
/**
 * Half-Edge data structure. Used to simplify and accelerate adjacency queries for
 * a triangular mesh. You can check out http://www.flipcode.com/archives/The_Half-Edge_Data_Structure.shtml
 * for more information on the half-edge mesh representation.
 *
 * This particular implementation does not use pointers, in order to benefit from Unity's serialization system.
 * Instead it uses arrays and indices, which makes some operations more cumbersome due to the need of updating
 * indices across the whole structure when removing faces, edges, or vertices.
 */
[Serializable]
public class HalfEdge
{
	
	Mesh input = null; //No need to serialize the mesh here, as we will be assigning it from outside.

	/**
	 * Represents half and edge of the mesh, if you cut each edge longitudinally.
	 */
	[Serializable]
	public class HEEdge{

		public int index;			      /**<edge index in edge list.*/
		public int indexOnFace = -1;      /**<edge index on its face, -1 if this is a border edge.*/
		public int faceIndex = -1;	  	  /**<face index on face list, -1 if this is a border edge.*/
		public int nextEdgeIndex;    	  /**<next face edge index on edge list.*/
		public int pair = -1;		 	  /**<pair edge index.*/

		public int endVertex;   		  /**<index of vertex at the end of the half-edge*/
		public int startVertex; 		  /**<index of vertex at the start of the half-edge*/

	}

	/**
	 * Represents a vertex of the mesh. Each HEVertex can correspond to more than one "physical" vertex in the mesh,
	 * since some vertices can be split at uv/normal/other attributes discontinuities. You can get all physical vertices
	 * shared by a single HEVertex using the physicalIDs list, which holds indices for the mesh.vertices array.
	 */
	[Serializable]
	public class HEVertex{	

		public List<int> physicalIDs;	/**<IDs of the physical mesh vertices associated to this vertex.*/
		public int index;				/**<vertex index on vertex list.*/
		public int halfEdgeIndex;		/**<index of outgoing half edge. In case of a border vertex, this is always a border edge.*/
		
		public HEVertex(int physicalIndex){
			physicalIDs = new List<int>(){physicalIndex};
		}

	}

	/**
	 * Represents a face in the mesh.
	 */
	[Serializable]
	public class HEFace{
		public int index;							/**< face index on face list.*/
		public float area;							/**< area of the face*/
		public int[] edges = new int[3]; 	 		/**< indices of edges on the face.*/
	}
	
	public List<HEFace> heFaces = new List<HEFace>();				/**<faces list*/
	public List<HEEdge> heEdges = new List<HEEdge>();				/**<edges list*/
	public List<HEVertex> heVertices = new List<HEVertex>();		/**<vertices list*/

	[SerializeField] protected float _volume = 0;   			/**< mesh volume*/
	[SerializeField] protected float _area = 0;	  				/**< mesh area*/
	[SerializeField] protected bool _closed = true;		
	[SerializeField] protected bool _modified = false;

	public Mesh InputMesh{
		set{input = value;}
		get{return input;}
	}

	/**
	 * Returns volume for a closed mesh (readonly)
	 */
	public float MeshVolume{
		get{return _volume;}
	}

	public float MeshArea{
		get{return _area;}
	}

	public bool IsClosed{
		get{return _closed;}
	}

	public bool IsModified{
		get{return _modified;}
	} 

	public HalfEdge(Mesh input)
	{
		this.input = input;
	}
		 
	/**
	 * Analyzes the input mesh and populates the half-edge structure. Can be called as many times you want (for examples if the original mesh is modified).
	 */
	public IEnumerator Generate(){

		if (input != null){

			heFaces.Clear();
			heVertices.Clear();
			heEdges.Clear();
			_area = 0;
			_modified = false;

			Dictionary<Vector3, HEVertex> vertexBuffer = new Dictionary<Vector3, HEVertex>();
			Dictionary<KeyValuePair<int,int>,HEEdge> edgeBuffer = new Dictionary<KeyValuePair<int,int>,HEEdge>();
			
			// Get copies of vertex and triangle buffers:
			Vector3[] vertices = input.vertices;
			int[] triangles = input.triangles;

			// first, create vertices:
			for(int i = 0; i < vertices.Length; i++){

				//if the vertex already exists, add physical vertex index to it.
				HEVertex vertex;
				if (vertexBuffer.TryGetValue(vertices[i], out vertex)){
					vertex.physicalIDs.Add(i);
				}else{
					vertex = new HEVertex(i);
				}

				vertexBuffer[vertices[i]] = vertex;

				if (i % 200 == 0)
					yield return new CoroutineJob.ProgressInfo("Half-edge: analyzing vertices...",i/(float)vertices.Length);
			}
			
			// assign unique indices to vertices:
			int index = 0;
			foreach(KeyValuePair<Vector3,HEVertex> pair in vertexBuffer){
				((HEVertex)pair.Value).index = index;
				heVertices.Add(pair.Value);
				if (index % 200 == 0)
					yield return new CoroutineJob.ProgressInfo("Half-edge: assigning indices...",index/(float)vertices.Length);
				index++;
			}
			
			// build half edge structure:
			for(int i = 0; i<triangles.Length;i+=3){

				Vector3 pos1 = vertices[triangles[i]];
				Vector3 pos2 = vertices[triangles[i+1]];
				Vector3 pos3 = vertices[triangles[i+2]];

				HEVertex v1 = vertexBuffer[pos1];
				HEVertex v2 = vertexBuffer[pos2];
				HEVertex v3 = vertexBuffer[pos3];

				// create half edges:
				HEEdge e1 = new HEEdge();
				e1.index = heEdges.Count;
				e1.indexOnFace = 0;
				e1.faceIndex = heFaces.Count;
				e1.endVertex = v1.index;
				e1.startVertex = v2.index;
				
				HEEdge e2 = new HEEdge();
				e2.index = heEdges.Count+1;
				e2.indexOnFace = 1;
				e2.faceIndex = heFaces.Count;
				e2.endVertex = v2.index;
				e2.startVertex = v3.index;
				
				HEEdge e3 = new HEEdge();
				e3.index = heEdges.Count+2;
				e3.indexOnFace = 2;
				e3.faceIndex = heFaces.Count;
				e3.endVertex = v3.index;
				e3.startVertex = v1.index;

				// link half edges together:
				e1.nextEdgeIndex = e3.index;
				e2.nextEdgeIndex = e1.index;
				e3.nextEdgeIndex = e2.index;

				// vertex outgoing half edge indices:
				v1.halfEdgeIndex = e3.index;
				v2.halfEdgeIndex = e1.index;
				v3.halfEdgeIndex = e2.index;

				// add edges:
				heEdges.Add(e1);
				heEdges.Add(e2);
				heEdges.Add(e3);
				
				// populate and add face:
				HEFace face = new HEFace();
				face.edges[0] = e1.index;
				face.edges[1] = e2.index;
				face.edges[2] = e3.index;
				face.area = ObiUtils.TriangleArea(pos1,pos2,pos3);
				_area += face.area;
				_volume += Vector3.Dot(Vector3.Cross(pos1,pos2),pos3)/6f;
				face.index = heFaces.Count;
				heFaces.Add(face);
				
				try{
					edgeBuffer.Add(new KeyValuePair<int,int>(v1.index,v2.index),e1);
					edgeBuffer.Add(new KeyValuePair<int,int>(v2.index,v3.index),e2);
					edgeBuffer.Add(new KeyValuePair<int,int>(v3.index,v1.index),e3);
				}catch{
					Debug.LogError("Your mesh is non manifold, and thus cannot be processed by Obi: more than 1 edge joining the same pair of vertices.");
					heFaces.Clear();
					heVertices.Clear();
                    heEdges.Clear();
                    _area = 0;
					yield break;
				}

				if (i % 500 == 0)
					yield return new CoroutineJob.ProgressInfo("Half-edge: generating edges and faces...",i/(float)triangles.Length);

			}

			List<HEEdge> borderEdges = new List<HEEdge>();		//edges belonging to a mesh border.
			
			// stitch half edge pairs together:
			index = 0;
			foreach(KeyValuePair<KeyValuePair<int,int>,HEEdge> pair in edgeBuffer){

				KeyValuePair<int,int> edgeKey = new KeyValuePair<int,int>(pair.Key.Value,pair.Key.Key);

				HEEdge edge = null;
				if (edgeBuffer.TryGetValue(edgeKey, out edge)){
					((HEEdge)pair.Value).pair = edge.index;
				}else{

					//create border edge:
					HEEdge e = new HEEdge();
					e.index = heEdges.Count;
					e.endVertex = ((HEEdge)pair.Value).startVertex;
					e.startVertex = ((HEEdge)pair.Value).endVertex;
					heVertices[e.startVertex].halfEdgeIndex = e.index;
					e.pair = ((HEEdge)pair.Value).index;
					((HEEdge)pair.Value).pair = e.index;
					heEdges.Add(e);

					borderEdges.Add(e);
				}

				if (index % 1000 == 0)
					yield return new CoroutineJob.ProgressInfo("Half-edge: stitching half-edges...",index/(float)edgeBuffer.Count);
				
				index++;

			}

			_closed = borderEdges.Count == 0;

			// link together border edges:
			foreach(HEEdge edge in borderEdges){
				edge.nextEdgeIndex = heVertices[edge.endVertex].halfEdgeIndex;
			}

		}else{
			Debug.LogWarning("Tried to generate adjacency info for an empty mesh.");
		}
		
	}

	public bool AreLinked(HEVertex v1, HEVertex v2){
		
		HEEdge startEdge = heEdges[v1.halfEdgeIndex];
		HEEdge edge = startEdge;
		
		do{
			edge = heEdges[edge.pair];
			if (edge.startVertex == v2.index)
				return true;
			edge = heEdges[edge.nextEdgeIndex];
			
		} while (edge != startEdge);

		return false;
	}

	public IEnumerable<HEVertex> GetNeighbourVerticesEnumerator(HEVertex vertex)
	{
		
		HEEdge startEdge = heEdges[vertex.halfEdgeIndex];
		HEEdge edge = startEdge;
		
		do{
			edge = heEdges[edge.pair];
			yield return heVertices[edge.startVertex];
			edge = heEdges[edge.nextEdgeIndex];
			
		} while (edge != startEdge);
		
	}

	public IEnumerable<HEEdge> GetNeighbourEdgesEnumerator(HEVertex vertex)
	{
		
		HEEdge startEdge = heEdges[vertex.halfEdgeIndex];
		HEEdge edge = startEdge;
		
		do{
			edge = heEdges[edge.pair];
			yield return edge;
			edge = heEdges[edge.nextEdgeIndex];
			yield return edge;
			
		} while (edge != startEdge);
		
	}

	public IEnumerable<HEFace> GetNeighbourFacesEnumerator(HEVertex vertex)
	{

		HEEdge startEdge = heEdges[vertex.halfEdgeIndex];
		HEEdge edge = startEdge;

		do{

			edge = heEdges[edge.pair];
			if (edge.faceIndex > -1)
				yield return heFaces[edge.faceIndex];
			edge = heEdges[edge.nextEdgeIndex];

		} while (edge != startEdge);

	}

	/**
	 * Calculates area-weighted normals for the input mesh, taking into account shared vertices. Will only
	 * modify those normals known by the half-edge structure, in case it does not represent the whole mesh.
	 */
	public Vector3[] AreaWeightedNormals(){
		
		if (input == null) return null;
		
		Vector3[] normals = input.normals;
		Vector3[] vertices = input.vertices;
		
		// array of bytes to store if the normal has been modified or not.
		bool[] modified = new bool[normals.Length];
		
		Vector3 v1,v2,v3,n;
		foreach(HEFace face in heFaces){
			
			HEVertex hv1 = heVertices[heEdges[face.edges[0]].endVertex];
			HEVertex hv2 = heVertices[heEdges[face.edges[1]].endVertex];
			HEVertex hv3 = heVertices[heEdges[face.edges[2]].endVertex];
			
			v1 = vertices[hv1.physicalIDs[0]];
			v2 = vertices[hv2.physicalIDs[0]];
			v3 = vertices[hv3.physicalIDs[0]];
			
			n = Vector3.Cross(v2-v1,v3-v1);
			
			foreach(int pi in hv1.physicalIDs){
				if (!modified[pi]) {
					normals[pi] = n;
					modified[pi] = true;
				}else
					normals[pi] += n;
			}
			foreach(int pi in hv2.physicalIDs){
				if (!modified[pi]) {
					normals[pi] = n;
					modified[pi] = true;
				}else
					normals[pi] += n;
			}	
			foreach(int pi in hv3.physicalIDs){
				if (!modified[pi]) {
					normals[pi] = n;
					modified[pi] = true;
				}else
					normals[pi] += n;
			}
		}
		
		for(int i = 0; i < normals.Length; i++)
			normals[i].Normalize();
		
		return normals;
		
	}
		

	/**
	 * Use this to remove big amounts of vertices from the half-edge. It will also remove faces and edges connecting those
	 * vertices.
	 */
	public void BatchRemoveVertices(HashSet<int> vertexIndices){
	
		// We need to keep a list of all old edges and faces:
		List<HEEdge> oldEdges = new List<HEEdge>(heEdges);
		List<HEFace> oldFaces = new List<HEFace>(heFaces);
		List<HEVertex> oldVertices = new List<HEVertex>(heVertices);
		
		// Remove all half-edge faces that reference at least one optimized-away particle. 
		heFaces.RemoveAll((HalfEdge.HEFace face)=>{
			foreach(int edgeIndex in face.edges){
				if (vertexIndices.Contains(heEdges[edgeIndex].endVertex)){
					// iterate over all edges and set their face index and index on face to -1. This allows to preserve border edges.
					foreach(int i in face.edges){
						heEdges[i].faceIndex = heEdges[i].indexOnFace = -1;
					}
					return true;
				}
			}
			return false;
		});
		
		// Remove all half-edge edges that reference at least one optimized-away particle.
		heEdges.RemoveAll((HalfEdge.HEEdge edge)=>{
			return vertexIndices.Contains(edge.endVertex) || vertexIndices.Contains(edge.startVertex);
		});
		
		// Remove all half-edge vertices that have been optimized-away.
		heVertices.RemoveAll(v => vertexIndices.Contains(v.index));
		
		// Update face indices:
		for (int i = 0; i < heFaces.Count; i++){
			heFaces[i].index = i;
		}
		
		// Update vertex indices:
		for (int i = 0; i < heVertices.Count; i++){
			heVertices[i].index = i;
		}
		
		//Re-stitch edge indices for faces and face indices for edges:
		for (int i = 0; i < heEdges.Count; i++){
			
			HalfEdge.HEEdge edge = heEdges[i];
			
			//Update edge start and end vertex indices:
			edge.startVertex = oldVertices[edge.startVertex].index;
			edge.endVertex = oldVertices[edge.endVertex].index;
			
			if (edge.faceIndex >= 0){
				
				HalfEdge.HEFace face = oldFaces[edge.faceIndex];
				
				//update face index.
				edge.faceIndex = face.index; 
				
				// update face edge indices:
				face.edges[edge.indexOnFace] = i;
				
			}
			
		}
		
		// Update edge indices:
		for (int i = 0; i < heEdges.Count; i++){
			heEdges[i].index = i;
		}

		// Update half-edge indices. 
		for (int i = 0; i < heFaces.Count; i++){
			heVertices[heEdges[heFaces[i].edges[0]].startVertex].halfEdgeIndex = heFaces[i].edges[0];
			heVertices[heEdges[heFaces[i].edges[1]].startVertex].halfEdgeIndex = heFaces[i].edges[1];
			heVertices[heEdges[heFaces[i].edges[2]].startVertex].halfEdgeIndex = heFaces[i].edges[2];
		}	
		
		// Re-stitch edge pair indices and next edge indices:
		for (int i = 0; i < heEdges.Count; i++){
			HalfEdge.HEEdge edge = heEdges[i];
			oldEdges[edge.pair].pair = edge.index;
			edge.pair = oldEdges[edge.pair].index;

			if (edge.faceIndex == -1){ //in case of a border edge, the start vertex should reference it.
				heVertices[edge.startVertex].halfEdgeIndex = edge.index;
			}

			edge.nextEdgeIndex = oldEdges[edge.nextEdgeIndex].index;
		}

		// Link border edges together:
		for (int i = 0; i < heEdges.Count; i++){
			HalfEdge.HEEdge edge = heEdges[i];
			if (edge.faceIndex == -1){
				edge.nextEdgeIndex = heVertices[edge.endVertex].halfEdgeIndex;
			}
		}

		//TODO: update total area.
		_closed = false;
		
	}

	/**
	 * Calculates angle-weighted normals for the input mesh, taking into account shared vertices.
	 */
	public Vector3[] AngleWeightedNormals(){
		
		if (input == null) return null;

		Vector3[] normals = input.normals;
		Vector3[] vertices = input.vertices;

		for(int i = 0; i < normals.Length; i++)
			normals[i] = Vector3.zero;

		int i1,i2,i3;
		Vector3 e1, e2;
		foreach(HEFace face in heFaces){
			
			HEVertex hv1 = heVertices[heEdges[face.edges[0]].endVertex];
			HEVertex hv2 = heVertices[heEdges[face.edges[1]].endVertex];
			HEVertex hv3 = heVertices[heEdges[face.edges[2]].endVertex];

			i1 = hv1.physicalIDs[0];
			i2 = hv2.physicalIDs[0];
			i3 = hv3.physicalIDs[0];
			
			e1 = vertices[i2]-vertices[i1];
			e2 = vertices[i3]-vertices[i1];
			foreach(int pi in hv1.physicalIDs)
				normals[pi] += Vector3.Cross(e1,e2) * Mathf.Acos(Vector3.Dot(e1.normalized,e2.normalized));
			
			e1 = vertices[i3]-vertices[i2];
			e2 = vertices[i1]-vertices[i2];
			foreach(int pi in hv2.physicalIDs)
				normals[pi] += Vector3.Cross(e1,e2) * Mathf.Acos(Vector3.Dot(e1.normalized,e2.normalized));
			
			e1 = vertices[i1]-vertices[i3];
			e2 = vertices[i2]-vertices[i3];
			foreach(int pi in hv3.physicalIDs)
				normals[pi] += Vector3.Cross(e1,e2) * Mathf.Acos(Vector3.Dot(e1.normalized,e2.normalized));
			
		}

		for(int i = 0; i < normals.Length; i++)
			normals[i].Normalize();
		
		return normals;
	}

	/**
	 * Splits a vertex in two along a plane. Returns true if the vertex can be split, false otherwise. Does not create new border
	 * edges inside the tear in order to prevent non-manifold vertices emerging, so it is only suitable for realtime cloth tearing.
	 * \param vertex the vertex to split.
     * \param splitPlane plane to split the vertex at.
     * \param newVertex the newly created vertex after the split operation has been performed.
     * \param vertices new mesh vertices list after the split operation.
     * \param removedEdges list of edge ids removed after splitting the vertex.
     * \param addedEdges list of edge ids added after splitting the vertex.
     * \param oldAndNewEdges a dictionary relating old and new edge ids.
	 */
	public bool SplitVertex(HEVertex vertex, Plane splitPlane, out HEVertex newVertex, out Vector3[] vertices, out HashSet<int> removedEdges, out HashSet<int> addedEdges, out Dictionary<int,int> oldAndNewEdges){

		// initialize return values:
		removedEdges = new HashSet<int>();
		addedEdges = new HashSet<int>();
		oldAndNewEdges = new Dictionary<int,int>();
		newVertex = null;

		// initialize face lists for each side of the split plane.
		List<HEFace> side1Faces = new List<HEFace>();
		List<HEFace> side2Faces = new List<HEFace>();
		HashSet<int> side2Edges = new HashSet<int>();

		// Get a copy of mesh vertices:
		vertices = input.vertices;

		// classify adjacent faces depending on which side of the cut plane they reside in:
		foreach(HEFace face in GetNeighbourFacesEnumerator(vertex)){

			int v1 = heEdges[face.edges[0]].startVertex;
            int v2 = heEdges[face.edges[1]].startVertex;
            int v3 = heEdges[face.edges[2]].startVertex;

			//Skip this face if it doesnt contain the splitted vertex.
			if (v1 != vertex.index && v2 != vertex.index && v3 != vertex.index) continue;

            Vector3 faceCenter = (vertices[heVertices[v1].physicalIDs[0]] +
			                      vertices[heVertices[v2].physicalIDs[0]] +
			                      vertices[heVertices[v3].physicalIDs[0]]) / 3.0f;

			if (splitPlane.GetSide(faceCenter)){
				side1Faces.Add(face);
			}else{
				side2Faces.Add(face);
				foreach(int e in face.edges)
					side2Edges.Add(e);
			}
		}

		// If the vertex cant be split, return false.
		if (side1Faces.Count == 0 || side2Faces.Count == 0) return false;

		// create new mesh vertex and triangle buffers:
		vertices = new Vector3[input.vertexCount+1]; 
		Array.Copy(input.vertices,vertices,input.vertexCount);

		int[] triangles = input.triangles;

		// create a new vertex:
		newVertex = new HEVertex(input.vertexCount);
		newVertex.index = heVertices.Count;
		heVertices.Add(newVertex);

		// add the new vertex to the mesh vertices buffer:
		vertices[input.vertexCount] = vertices[vertex.physicalIDs[0]];

		// Copy uvs, colors and other mesh info.
		Vector2[] uv = null;
		Vector2[] uv2 = null;
		Vector2[] uv3 = null;
		Vector2[] uv4 = null;
		Color32[] colors = null;
		if (input.uv.Length > 0){
			uv = new Vector2[input.uv.Length+1];
			Array.Copy(input.uv,uv,input.uv.Length);
			uv[input.uv.Length] = uv[vertex.physicalIDs[0]]; //TODO: could cause copying uvs from the other side of the cut...
		}
		if (input.uv2.Length > 0){
			uv2 = new Vector2[input.uv2.Length+1];
			Array.Copy(input.uv2,uv2,input.uv2.Length);
			uv2[input.uv2.Length] = uv2[vertex.physicalIDs[0]];
		}
		if (input.uv3.Length > 0){
			uv3 = new Vector2[input.uv3.Length+1];
			Array.Copy(input.uv3,uv3,input.uv3.Length);
			uv3[input.uv3.Length] = uv3[vertex.physicalIDs[0]];
		}
		if (input.uv4.Length > 0){
			uv4 = new Vector2[input.uv4.Length+1];
			Array.Copy(input.uv4,uv4,input.uv4.Length);
			uv4[input.uv4.Length] = uv4[vertex.physicalIDs[0]];
		}
		if (input.colors32.Length > 0){
			colors = new Color32[input.colors32.Length+1];
			Array.Copy(input.colors32,colors,input.colors32.Length);
			colors[input.colors32.Length] = colors[vertex.physicalIDs[0]];
		}

		// rearrange edges at side 1:
		foreach(HEFace face in side1Faces){ 

			// find half edges that start or end at the split vertex:
			HEEdge edgeIn = heEdges[Array.Find<int>(face.edges,e => heEdges[e].endVertex == vertex.index)];
			HEEdge edgeOut = heEdges[Array.Find<int>(face.edges,e => heEdges[e].startVertex == vertex.index)];

			int oldInID = ObiUtils.Pair(edgeIn.startVertex,edgeIn.endVertex);
			int oldOutID = ObiUtils.Pair(edgeOut.startVertex,edgeOut.endVertex);

			if (ShouldRemoveEdge(edgeIn,side2Edges.Contains(edgeIn.pair)))
				removedEdges.Add(oldInID);

			if (ShouldRemoveEdge(edgeOut,side2Edges.Contains(edgeOut.pair)))
				removedEdges.Add(oldOutID);

			// stitch half edges to new vertex
			edgeIn.endVertex = newVertex.index;
			edgeOut.startVertex = newVertex.index;

			newVertex.halfEdgeIndex = edgeOut.index;

            int newInID = ObiUtils.Pair(edgeIn.startVertex,edgeIn.endVertex);
            int newOutID = ObiUtils.Pair(edgeOut.startVertex,edgeOut.endVertex); 

			addedEdges.Add(newInID);
			addedEdges.Add(newOutID);

			if (!oldAndNewEdges.ContainsKey(newInID))
			oldAndNewEdges.Add(newInID,oldInID);
			if (!oldAndNewEdges.ContainsKey(newOutID))
			oldAndNewEdges.Add(newOutID,oldOutID);

			// update mesh triangle buffer to point at new vertex where needed:
			if (triangles[face.index*3] == vertex.physicalIDs[0]) triangles[face.index*3] = newVertex.physicalIDs[0];
			if (triangles[face.index*3+1] == vertex.physicalIDs[0]) triangles[face.index*3+1] = newVertex.physicalIDs[0];
			if (triangles[face.index*3+2] == vertex.physicalIDs[0]) triangles[face.index*3+2] = newVertex.physicalIDs[0];

		}

		// update input mesh:
		input.vertices = vertices;
		input.triangles = triangles; 
		if (uv != null)
		input.uv = uv;
		if (uv2 != null)
		input.uv2 = uv2;
		if (uv3 != null)
		input.uv3 = uv3;
		if (uv4 != null)
		input.uv4 = uv4;
		if (colors != null)
		input.colors32 = colors;
		
		_closed = false;
		_modified = true;

		return true;

	}

	private bool ShouldRemoveEdge(HEEdge edge, bool pairInOtherSide){
		HEEdge pair = heEdges[edge.pair];
		return !pairInOtherSide || (pairInOtherSide && (pair.startVertex != edge.endVertex || pair.endVertex != edge.startVertex));
	}

}
}


