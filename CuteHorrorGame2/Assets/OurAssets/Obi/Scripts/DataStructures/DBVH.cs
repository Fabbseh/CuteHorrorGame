using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi{

/**
 * This class is a dynamic bounding volume hierarchy, which is used in Obi as a broad phase to speed up cloth-rigidbody and 
 * cloth-cloth collision detection.
 */
[Serializable]
public class DBVH
{
	[Serializable]
	public class DBVHNode {
		
		[SerializeField] protected int index = -1;					/**< index of this node in the tree*/
		public Bounds bounds = new Bounds();		/**< bounding box of this nodes contents, or fat aabb for leaf nodes.*/
		public ObiActor content = null;				/**< in case of a leaf node, the associated GameObject.*/

		public int Index{
			get{return index;}
			set{
				index = value;
				if (content != null) 
					content.nodeIndex = value;
			}
		}

		public int Left{
			get{return 2*index+1;}
		}

		public int Right{
			get{return 2*index+2;}
		}

		public int Parent{
			get{return Mathf.FloorToInt((index-1)/2f);}
		}

		public DBVHNode(){
		}
		
		public DBVHNode(ObiActor actor){
			this.content = actor;
		}

		public void UpdateBounds(List<DBVHNode> nodes){

			if (nodes == null) return;

			// leaf:
			if (content != null){
				this.bounds = content.bounds;
				this.bounds.Expand(content.boundsPadding);
			}else{ //branch:
				Bounds newBounds = nodes[Left].bounds;
				newBounds.Encapsulate(nodes[Right].bounds);
				this.bounds = newBounds;
			}
		}
		
	}

	[SerializeField] List<DBVHNode> nodes = new List<DBVHNode>();

	public DBVHNode Root{
		get{
			if (nodes.Count > 0)
				return nodes[0];
			return null;
		}
	}

	public bool NodeExists(int index){
		//since unity doesnt serialize nulls as nulls, we have to check for both nodes[index] == null and nodes[index].Index < 0
		return !( (index < 0 || index >= nodes.Count) || nodes[index] == null || nodes[index].Index < 0); 
	}

	public DBVHNode GetLeftChild(DBVHNode node){
		if (node == null) return null;
		if (NodeExists(node.Left))
			return nodes[node.Left];
		return null;
	}
	
	public DBVHNode GetRightChild(DBVHNode node){
		if (node == null) return null;
		if (NodeExists(node.Right))
			return nodes[node.Right];
		return null;
	}

	/**
	 * Places a node at a certain index in the tree. If the destination index is not null,
	 * the node there gets overwritten.
	 */
	private void PutNode(DBVHNode node, int index){
		while (nodes.Count <= index)
			nodes.Add(null);
		node.Index = index;
		nodes[index] = node;
	}

	/**
	 * Transplants a whole subtree to a new index, and updates all indices down the subtree.
	 */
	private void TransplantTree(DBVHNode node, int index){

		if (node != null) {

			Queue<DBVHNode> fromQueue = new Queue<DBVHNode>();
			fromQueue.Enqueue(node);
			Queue<int> toQueue = new Queue<int>();
			toQueue.Enqueue(index);
			DBVHNode fromNode;
		    int toNode;

			while (fromQueue.Count > 0) {

				fromNode = fromQueue.Dequeue();
				toNode = toQueue.Dequeue();

				// enqueue left and right nodes:
				if (NodeExists(fromNode.Left)){
					fromQueue.Enqueue(nodes[fromNode.Left]);
					toQueue.Enqueue(2*toNode+1);
				}
				if (NodeExists(fromNode.Right)){
					fromQueue.Enqueue(nodes[fromNode.Right]);
					toQueue.Enqueue(2*toNode+2);
				}
				
				// move the from node to the "to" index.
				nodes[fromNode.Index] = null;
				PutNode(fromNode,toNode);

			}

		} 
	}

	/**
	 * Inserts a new GameObject into the DBVH. The node bounds are supposed to be up to date.
	 */
	public bool Insert(ObiActor actor){

		// If no gameobject at all, we can't insert it.
		if (actor == null) return false;

		// Create a new node.
		DBVHNode node = new DBVHNode(actor);
		node.UpdateBounds(nodes);

		// If there are no nodes in the tree, this is the root.
		if (nodes.Count == 0){
			node.Index = 0;
			nodes.Add(node);
		}else{
			InsertNode(node,nodes[0]);
		}

		return true;
	}

	/**
	 * Reursively inserts a node into the tree, starting at the provided parent node.
	 */
	private void InsertNode(DBVHNode node, DBVHNode parent){

		if (parent.content != null){ //parent is a leaf.
			
			// create a new parent for both the old leaf and the new leaf.
			DBVHNode branch = new DBVHNode();
			
			// our branch node is the new parent.
			PutNode(branch,parent.Index);
			PutNode(parent,branch.Left);
			PutNode(node,branch.Right);
		
			parent = branch;
			
		}else{ // parent is a branch node, go down the child that will suffer less volume increase.
			
			Bounds bL = nodes[parent.Left].bounds;
			Bounds bR = nodes[parent.Right].bounds; 
            
			bL.Encapsulate(node.bounds);
			bR.Encapsulate(node.bounds);

			float volumeDiffL =	bL.Volume() - nodes[parent.Left].bounds.Volume();
			float volumeDiffR = bR.Volume() - nodes[parent.Right].bounds.Volume();
            
            if (volumeDiffL < volumeDiffR)
				InsertNode(node,nodes[parent.Left]);
            else
				InsertNode(node,nodes[parent.Right]);
			
		}

		// Update parent bounds on our way up the recursion stack.
		parent.UpdateBounds(nodes);

	}

	/**
	 * Removes a GameObject from the tree.
	 */ 
	public void Remove(ObiActor actor){

		if (actor == null) return;
	
		DBVHNode node = nodes[actor.nodeIndex];
		
		//If this is the root node, destroy the whole thing.
		if (node.Parent < 0){ 
		
			nodes.Clear();

		}else{ //This is a regular node.
			
			DBVHNode sibling;
			DBVHNode parent = nodes[node.Parent];

			// Get our sibling node:
			if (parent.Left == node.Index)
				sibling = nodes[parent.Right];
			else
				sibling = nodes[parent.Left];

			// transplant whole subtree:
			nodes[node.Index] = null;
			TransplantTree(sibling, parent.Index);

			// make sure bounds up the transplanted branch stay compact:
			int pIndex = sibling.Parent;
			while (pIndex >= 0){
				nodes[pIndex].UpdateBounds(nodes);
				pIndex = nodes[pIndex].Parent;
			}
	
		}

	}

	/**
	 * Updates the DBVH.
	 */
	public void Update(){ 

		if (nodes.Count > 0){
			if (nodes[0].content != null){
				nodes[0].UpdateBounds(nodes);
			}else{

				// Get list of all invalid nodes in the tree.
				List<DBVHNode> invalidNodes = new List<DBVHNode>();
				GetInvalidNodes(nodes[0],ref invalidNodes);
	
				// Iterate trouugh all invalid nodes removing, updating and reinserting them.
				foreach(DBVHNode node in invalidNodes){

					// Re-insert the node.
					Remove(node.content);
					node.UpdateBounds(nodes);
					Insert(node.content);
				}

			}
		}
	}

	/**
	 * Returns a list of nodes in the tree that need to be updated.
	 */
	private void GetInvalidNodes(DBVHNode node, ref List<DBVHNode> invalidNodes){

		if (node.content != null) //leaf
		{
			// check if fat node bounds still contain the actor bounds or not.
			if (!node.bounds.Contains(node.content.bounds.max) ||
				!node.bounds.Contains(node.content.bounds.min))
                invalidNodes.Add(node);
		}
		else 
		{
			if (NodeExists(node.Left))
			GetInvalidNodes(nodes[node.Left], ref invalidNodes);
			if (NodeExists(node.Right))
			GetInvalidNodes(nodes[node.Right], ref invalidNodes);
        }
            
    }

	public List<DBVHNode> BoundsQuery(Bounds bounds){

		List<DBVHNode> results = new List<DBVHNode>();

		if (nodes.Count > 0){		

			Stack<DBVHNode> stack = new Stack<DBVHNode>();
			stack.Push(nodes[0]);
			while(stack.Count > 0)
			{

				DBVHNode node = stack.Pop();
			
				if (node.content != null){ //leaf node

					if (bounds.Intersects(node.content.bounds))
						results.Add(node);

				}else{
			
					if (NodeExists(node.Left) && bounds.Intersects(nodes[node.Left].bounds))
						stack.Push(nodes[node.Left]);

					if (NodeExists(node.Right) && bounds.Intersects(nodes[node.Right].bounds))
						stack.Push(nodes[node.Right]);

				}
	
	
			}
		}

		return results;

	}
        
}
}

