using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
/**
 * This class is a spatial partition structure that uses a dictionary to store cells. Particles are assigned to cells
 * using a hash comptuted from their world position. The structure can then be used to speed up nearest-neighbour queries between particles 
 * or as a broad-phase for particle-rigidbody collisions.
 */
public class AdaptiveGrid
{

	/**
	 * This class represents a single cell of an AdaptiveGrid. Holds an array of all particles associated to this cell, which may or may not be
	 * inside the cell. It is responsibility of the caller to keep the grid up to date by either calling AdaptiveGrid.UpdateParticle or manually
	 * adding and removing particles from cells where necessary.
	 */
	public class Cell{

		public List<ObiClothParticle> particles = new List<ObiClothParticle>();
		private AdaptiveGrid grid = null;
		private int hash;
		private Vector3 index;

		public AdaptiveGrid Grid{
			get{return grid;}
		}

		public int Hash{
			get{return hash;}
		}
		
		/**
		 * Returns the 3-dimensional index of this cell (readonly)
		 */
		public Vector3 Index{
			get{return index;}
		}
	
		public Cell(AdaptiveGrid grid, Vector3 position, int hash){
			this.hash = hash;
			this.grid = grid;
			this.index = position;
		}

		/**
		 * Adds to this cell a reference to the supplied particle.
		 */
		public void AddParticle(ObiClothParticle p){
			
			//Add the particle index to the cell:
			particles.Add(p);
			
		}

		/**
		 * Removes the supplied particle from this cell, then destroys the cell if no particles are stored in it.
		 */
		public void RemoveParticle(ObiClothParticle p){

			//Remove the particle from the cell.
			particles.Remove(p);

			//If the cell is now empty, remove the cell from the grid:
			if (particles.Count == 0)
				grid.cells.Remove(hash);

		}

	}

	public Dictionary<int,Cell> cells = new Dictionary<int,Cell>();		/**< A dictionary of <hash,cell> pairs that holds the whole grid structure.*/
	private float cellSize = 0.25f;										/**< Size of a grid cell.*/

	/**
	 * Returns cell size in world units (readonly).
	 */
	public float CellSize{
		get{ return cellSize; }
	}

	public AdaptiveGrid(float cellSize){
		this.cellSize = cellSize;
	}

	/**
	 * Queries the grid structure to find cells completely or partially inside the supplied bounds.
	 * \param cellIndex 3-dimensional index of cell. It doesn't have to be an existing cell, can be one that hasn't been created yet.
	 * \return an integer that uniquely identifies the cell.
	 */
	public int ComputeCellHash(Vector3 cellIndex){
		return (int) (541*cellIndex.x + 79*cellIndex.y + 31*cellIndex.z);
	}

	/**
	 * Use this to find out which cell (existing or not) contains a position in world space
	 * \param position world space position.
	 * \return 3-dimensional index of the cell that contains that position.
	 */
	public Vector3 GetParticleCell(Vector3 position){

		return new Vector3(Mathf.FloorToInt(position.x / cellSize),
		                   Mathf.FloorToInt(position.y / cellSize),
		                   Mathf.FloorToInt(position.z / cellSize));

	}

	/**
	 * Queries the grid structure to find cells completely or partially inside the supplied bounds.
	 * \param bounds bounds that we are interested to get intersecting cells for.
	 * \param boundsExpansion how much to expand the bounds before checking for cell overlap.
	 * \param boundsExpansion how many cells we can afford to check for overlap after the initial guess. If there are more than this, we will just return all cells.
	 * \return the list of cells that intersect or are completely inside the supplied bounds.
	 */
	public List<Cell> GetCellsInsideBounds(Bounds bounds, float boundsExpansion, int maxCellOverlap){
		
		List<Cell> result;		

		bounds.Expand(boundsExpansion);

		int mincellX = Mathf.FloorToInt(bounds.min.x / cellSize);
		int maxcellX = Mathf.FloorToInt(bounds.max.x / cellSize);

		int mincellY = Mathf.FloorToInt(bounds.min.y / cellSize);
		int maxcellY = Mathf.FloorToInt(bounds.max.y / cellSize);

		int mincellZ = Mathf.FloorToInt(bounds.min.z / cellSize);
		int maxcellZ = Mathf.FloorToInt(bounds.max.z / cellSize);

		int cellCount = (maxcellX-mincellX)*(maxcellY-mincellY)*(maxcellZ-mincellZ);

		if (cellCount > maxCellOverlap) {
			result = new List<Cell>(cells.Values);
			return result;
		}

		// Give list an initial size equal to the upper bound of cells inside the bounds, to prevent size reallocations. 
		result = new List<Cell>(cellCount);

		Vector3 cellpos = Vector3.zero;
		Cell cell = null;

		for (int x = mincellX ; x <= maxcellX; x++){
			for (int y = mincellY ; y <= maxcellY; y++){
				for (int z = mincellZ ; z <= maxcellZ; z++){
					cellpos.Set(x,y,z);
					int hash = ComputeCellHash(cellpos);
					if (cells.TryGetValue(hash, out cell))
						result.Add(cell);
				}
			}
		}

		return result;

	}
	
	/**
	 * Add a particle to the grid structure.
	 * \param hash cell hash, can be computed from the cellIndex (next parameter) using ComputeCellHash.
     * \param cellIndex 3-dimensional index of the cell to add the particle to.
     * \param p the particle that should be added to the grid.
	 */
	public void AddParticle(int hash, Vector3 cellIndex, ObiClothParticle p){

		//See if the cell exists and insert the particle in it:
		Cell cell = null;
		if (cells.TryGetValue(hash,out cell)){
			cell.AddParticle(p);
		}else{
			cell = new Cell(this,cellIndex,hash);
			cell.AddParticle(p);
			cells[hash] = cell;
		}

	}

	/**
	 * Remove a particle from the grid structure.
	 * \param hash cell hash, can be computed using ComputeCellHash.
     * \param p the particle that should be removed from the grid.
	 */
	public void RemoveParticle(int hash, ObiClothParticle p){
		
		//See if the cell exists, and in that case, remove the particle from it:
		Cell cell = null;
		if (cells.TryGetValue(hash,out cell)){
			cell.RemoveParticle(p);
		}
		
	}

	/**
	 * If the supplied particle cell hash is equal to the one calculated from the supplied cellIndex, nothing is done. Else,
	 * the particle is removed from its current cell and then added to the cell indicated by cellIndex.
	 */
	public void UpdateParticle(ObiClothParticle p, Vector3 cellIndex){
		int hash = ComputeCellHash(cellIndex);
		if (hash != p.gridCellHash){
			RemoveParticle(p.gridCellHash,p);
			AddParticle(hash,cellIndex,p);
			p.gridCellHash = hash;
		}
	}

}
}

