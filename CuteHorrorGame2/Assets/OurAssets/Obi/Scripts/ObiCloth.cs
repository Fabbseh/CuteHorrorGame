/**
\mainpage ObiCloth documentation
 
Introduction:
------------- 

ObiCloth is a position-based dynamics solver for cloth. It is meant to bring back and extend upon Unity's 4.x
cloth, which had two-way rigidbody coupling. 
 
Features:
-------------------

- Cloth particles can be pinned both in local space and to rigidbodies (kinematic or not).
- Cloth can be teared.
- Realistic wind forces.
- Rigidbodies react to cloth dynamics, and cloth reacts to rigidbodies too.
- Easy prefab instantiation, cloth can be translated, scaled and rotated.
- Simulation can be warm-started in the editor, then all simulation state gets serialized with the object. This means
  your cloth prefabs can be stored at any point in the simulation, and they will resume it when instantiated.

*/

using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{

/**
 * An ObiCloth component generates a particle-based physical representation of the object geometry
 * and simulates it as cloth.
 * 
 * You can use it to make flags, capes, ropes, drapes, nets, or any kind of object that exhibits cloth-like behavior.
 * 
 * ObiCloth objects have their particle properties expressed in local space. That means that particle positions, velocities, etc
 * are all expressed and serialized using the object's transform as reference. Thanks to this it is very easy to instantiate cloth prefabs and move/rotate/scale
 * them around, while keeping things working as expected. However, you should keep this in mind when making the cloth interact with other objects
 * because things will probably need to be transformed back and forth between world and local space.
 * 
 * For convenience, Physics.gravity is used as cloth gravity and it is expressed and applied in world space. 
 * Which means that no matter how you rotate a ObiCloth object, gravity will always pull particles down.
 * (as long as gravity in your world is meant to pulls things down, heh).
 * 
 */
[ExecuteInEditMode]
[AddComponentMenu("Physics/Obi/Obi Cloth")]
public sealed class ObiCloth : MonoBehaviour
{
	// serializable constraint container classes:
	[Serializable] public class SpringSet : SerializableHashSet<DistanceConstraint> {}
	[Serializable] public class BendingSet : SerializableHashSet<BendingConstraint> {}
	[Serializable] public class PinSet : SerializableHashSet<PinConstraint> {}
	
	// Overall behavior:

	[Tooltip("Percentage of world space movement applied to the cloth vertices.")]
	[Range(0,1)]
	public float worldVelocityScale = 0;			/**< Amount of world-space velocity applied to the cloth vertices.*/

	[Tooltip("Amount of damping added to particle velocities. A value of 0 means no daping at all, 1 means the cloth will behave as a completely plastic body.")]
	[Range(0,1)]
	public float damping = 0f;					    /**< Particle velocity damping.*/

	[Tooltip("Velocity threshold under which particles go to sleep mode, and stop being updated until something wakes them up.")]
	public float squaredSleepVelocity = 0.02f;		/**< Under this velocity, particles stop getting updated, reducing computation cost. Only setting the "asleep" flag to false wakes them up again.*/

	[Tooltip("Velocity threshold above which particles wake up.")]
	public float squaredWakeupVelocity = 0.06f;		/**< Above this velocity, asleep particles wake up.*/

	[Tooltip("Minimum time (in seconds) the particles must be awake when static before going to sleep.")]
	public float minimumWakeTime = 4;				/**< Minimum wake time for particles.*/

	[Tooltip("If enabled, mesh bounds will be recalculated at the end of each update step.")]
	public bool recalculateBounds = true;			/**< Whether to recalculate mesh bounds after each frame or not.*/
	
	[Tooltip("If enabled, will force the cloth to keep simulating even when not visible from any camera.")]
	public bool simulateWhenInvisible = false;		/**< Whether to keep simulating the cloth when its not visible by any camera.*/
	
	[HideInInspector]public Mesh mesh;
	private MeshFilter meshFilter;
	private MeshRenderer meshRenderer;
	private SkinnedMeshRenderer skinnedMeshRenderer;

	[HideInInspector] public Mesh sharedMesh;				/**< original unmodified mesh.*/
	[HideInInspector] public HalfEdge edgeStructure;		/**< adjacency data structure.*/
	[HideInInspector] public List<ObiClothParticle> particles = null;		/**< list of particles that compose the cloth. */

	// serializable constraints:
	[HideInInspector] public SpringSet structuralSprings = null; 		 	/**< set of structural springs holding the cloth together. */
	[HideInInspector] public BendingSet bendingConstraints = null; 		 	/**< set of bending constraints springs keeping the cloth from overbending. */
	[HideInInspector] public PinSet pins = null; 				   		  	/**< set of pin constraints keeping cloth vertices pinned. */
	[HideInInspector] public PressureConstraint pressureConstraint = null;	/**< pressure constraint, affecting all particles in the cloth*/
	[HideInInspector] public ShapeMatchingConstraint shapeMatchingConstraint = null;
	[HideInInspector] public List<SkinConstraint> skinConstraints = null; 		/**< set of constraints preventing the cloth from deviating too much from its skinned position. */

	// constraint groups:
	public Aerodynamics aerodynamics;
	public StretchConstraintGroup stretchConstraintsGroup;
	public BendConstraintGroup bendConstraintsGroup;
	public SelfCollisionConstraintGroup selfCollisionConstraintsGroup;
	public CollisionConstraintGroup collisionConstraintsGroup;
	public PinConstraintGroup pinConstraintsGroup;
	public PressureConstraintGroup pressureConstraintsGroup;
	public ShapeMatchingConstraintGroup shapeMatchingConstraintsGroup;
	public SkinConstraintGroup skinConstraintsGroup;

	// grid:
	[NonSerialized] public AdaptiveGrid grid;

	//aux/misc:
	private Matrix4x4 lastTransform;
	private bool initializing = false;

	[HideInInspector] public ObiWorld world;
 
	public struct BodyInformation{
		public float mass;
		public Vector3 centerOfMass;
		public Vector3 centerOfMassVelocity;
	}

	public bool Initialized{
			get{return particles != null && 
					   edgeStructure != null && 
					   structuralSprings != null && 
					   bendingConstraints != null && 
					   pins != null && 
					   shapeMatchingConstraint != null &&
					   pressureConstraint != null;}
	}

	public bool Initializing{
		get{return initializing;}
	}

	public bool IsSkinned{
		get{return skinnedMeshRenderer != null;}
	}

	public Transform RootBone{
		get{
			if (skinnedMeshRenderer == null) 
				return null;
			return skinnedMeshRenderer.rootBone;
		}
	}

	void Awake()
	{
		ObiActor actor = GetComponent<ObiActor>();
		if (actor != null)
			world = actor.world;

		lastTransform = transform.localToWorldMatrix;
		skinnedMeshRenderer = GetComponent<SkinnedMeshRenderer>();

		if (skinnedMeshRenderer == null)
			InitializeWithRegularMesh();
		else 
			InitializeWithSkinnedMesh();

	}

	private void InitializeWithRegularMesh(){

		meshFilter = GetComponent<MeshFilter>();
		meshRenderer = GetComponent<MeshRenderer>();

		if (meshFilter == null || meshRenderer == null){
			Debug.LogError("Could not initialize Obi Cloth component: no mesh found. Try adding a SkinnedMeshRenderer or a MeshFilter/MeshRenderer to your object.");
			return;
		}

		// Store the shared mesh if it hasn't been stored previously.
		if (sharedMesh != null)
			meshFilter.mesh = sharedMesh;
		else
			sharedMesh = meshFilter.sharedMesh;
		
		// Make a deep copy of the original shared mesh.
		mesh = Mesh.Instantiate(meshFilter.sharedMesh) as Mesh; 
		
		// Use the freshly created mesh copy as the renderer mesh and the half-edge input mesh, if it has been already analyzed.
		meshFilter.mesh = mesh;
		
		if (edgeStructure != null)
			edgeStructure.InputMesh = mesh;

	}

	private void InitializeWithSkinnedMesh(){

		// Store the shared mesh if it hasn't been stored previously.
		if (sharedMesh != null)
			skinnedMeshRenderer.sharedMesh = sharedMesh;
		else
			sharedMesh = skinnedMeshRenderer.sharedMesh;

		// Make a deep copy of the original shared mesh.
		mesh = Mesh.Instantiate(skinnedMeshRenderer.sharedMesh) as Mesh;
		
		if (edgeStructure != null)
			edgeStructure.InputMesh = mesh;
	}

	void OnDestroy(){
		if (meshFilter != null)
			meshFilter.mesh = sharedMesh;
		if (skinnedMeshRenderer != null)
			skinnedMeshRenderer.sharedMesh = sharedMesh;
		GameObject.DestroyImmediate(mesh);
	}

	void OnEnable(){

		//Generate constraint groups:
		GenerateConstraintGroups();

		if (Application.isPlaying && !Initialized) 
			StartCoroutine(GeneratePhysicRepresentationForMesh());

		if (Initialized)
			RecreateGrid();
	}

	private void GenerateConstraintGroups(){
		if (aerodynamics == null)
			aerodynamics = new Aerodynamics();
		if (pressureConstraintsGroup == null)
			pressureConstraintsGroup = new PressureConstraintGroup();
		if (skinConstraintsGroup == null)
			skinConstraintsGroup = new SkinConstraintGroup();
		if (shapeMatchingConstraintsGroup == null)
			shapeMatchingConstraintsGroup = new ShapeMatchingConstraintGroup();
		if (stretchConstraintsGroup == null)
			stretchConstraintsGroup = new StretchConstraintGroup();
		if (selfCollisionConstraintsGroup == null)
			selfCollisionConstraintsGroup = new SelfCollisionConstraintGroup();
		if (bendConstraintsGroup == null)
			bendConstraintsGroup = new BendConstraintGroup();
		if (collisionConstraintsGroup == null)
			collisionConstraintsGroup = new CollisionConstraintGroup();
		if (pinConstraintsGroup == null)
			pinConstraintsGroup = new PinConstraintGroup();
	}

	/**
	 * Recreates spatial grid and resets particle cell hashes.
	 */
	public void RecreateGrid(){
		
		// Get maximum particle radius:
		float maxParticleRadius = 0;
		foreach(ObiClothParticle p in particles){
			maxParticleRadius = Mathf.Max(maxParticleRadius,p.radius);
		}
		
		// calculate cell size from radius and stretch scale:
		float cellSize = maxParticleRadius * 2 * stretchConstraintsGroup.stretchingScale;

		grid = new AdaptiveGrid(cellSize);
		foreach(ObiClothParticle p in particles){
			p.gridCellHash = int.MaxValue;
		}

	}

	void FixedUpdate ()
	{
		if ((skinnedMeshRenderer != null && skinnedMeshRenderer.isVisible) || 
			(meshRenderer != null && meshRenderer.isVisible) || 
			simulateWhenInvisible)

		SimulateStep(Time.fixedDeltaTime);
	}

	void LateUpdate()
	{
		ApplySkinning();
		CommitResultsToMesh();
	}

	public void Terminate(){
		particles = null;
		edgeStructure = null;
		structuralSprings = null;
		bendingConstraints = null;
		pins = null;
		pressureConstraint = null;
		skinConstraintsGroup = null;
		shapeMatchingConstraint = null;
	}
	
	/**
	 * Forces all cloth particles to wake up, so they will be simulated at the end of this frame.
	 */
	public void WakeUp(){
		foreach (ObiClothParticle p in particles)
			p.WakeUp(minimumWakeTime);
	}

	/**
	 * Generates the particle based physical representation of the cloth mesh. This is the initialization method for the cloth object
	 * and should not be called directly once the object has been created.
	 */
	public IEnumerator GeneratePhysicRepresentationForMesh()
	{		
		initializing = true;
		
		//Generate adjacency info for the mesh:
		edgeStructure = new HalfEdge(mesh);
		
		//Generating the half-edge structure is potentially a long operation, so it must be a coroutine job:
		CoroutineJob generateHalfEdge = new CoroutineJob();
		generateHalfEdge.asyncThreshold = 1000;			 //If things seem to be taking long (more than a second), do it asynchronously and allow other stuff to continue.

		//Depending on whether we are in-game or in the editor, start the coroutine as usual or using EditorCoroutine.
		if (Application.isPlaying){
			StartCoroutine(generateHalfEdge.Start(edgeStructure.Generate()));
		}else{
			EditorCoroutine.StartCoroutine(generateHalfEdge.Start(edgeStructure.Generate()));
		}

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

		//Once the half edge generation has finished and we have connectivity information about the mesh, 
		//start creating particles and constraints.
		
		//Create a particle for each vertex:
		Vector3[] vertices = mesh.vertices;
		particles = new List<ObiClothParticle>();
		for (int i = 0; i < edgeStructure.heVertices.Count; i++){

			HalfEdge.HEVertex vertex = edgeStructure.heVertices[i];

			float area = 0;
			foreach (HalfEdge.HEFace face in edgeStructure.GetNeighbourFacesEnumerator(vertex)){
				area += face.area/face.edges.Length;
			}

			particles.Add(new ObiClothParticle(particles.Count,
				                               area,
				                               (skinnedMeshRenderer == null)? 1 : float.PositiveInfinity,
				                               vertices[vertex.physicalIDs[0]],
				                               Vector3.zero));

			if (i % 100 == 0)
				yield return new CoroutineJob.ProgressInfo("ObiCloth: generating particles...",i/(float)edgeStructure.heVertices.Count);
		}

		//Create structural springs: 
		structuralSprings = new SpringSet(); 
		for (int i = 0; i < edgeStructure.heEdges.Count; i++){

			HalfEdge.HEEdge edge = edgeStructure.heEdges[i];

			ObiClothParticle p1 = particles[edge.startVertex];
			ObiClothParticle p2 = particles[edge.endVertex];

			float springLenght = Vector3.Distance(p1.position,p2.position);
			
			structuralSprings.Add(new DistanceConstraint(transform, edge.startVertex,edge.endVertex,springLenght,stretchConstraintsGroup.stretchingStiffness,stretchConstraintsGroup.compressionStiffness,springLenght*stretchConstraintsGroup.tearFactor));

			if (i % 500 == 0)
				yield return new CoroutineJob.ProgressInfo("ObiCloth: generating structural constraints...",i/(float)edgeStructure.heEdges.Count);
		}

		//Create bending constraints:
		bendingConstraints = new BendingSet();
		for (int i = 0; i < edgeStructure.heVertices.Count; i++){

			HalfEdge.HEVertex vertex = edgeStructure.heVertices[i];

			foreach (HalfEdge.HEVertex n1 in edgeStructure.GetNeighbourVerticesEnumerator(vertex)){

				float cosBest = 0;
				HalfEdge.HEVertex vBest = n1;

				foreach (HalfEdge.HEVertex n2 in edgeStructure.GetNeighbourVerticesEnumerator(vertex)){
					float cos = Vector3.Dot((particles[n1.index].position-particles[vertex.index].position).normalized,
					                        (particles[n2.index].position-particles[vertex.index].position).normalized);
					if (cos < cosBest){
						cosBest = cos;
						vBest = n2;
					}
				}
				
				bendingConstraints.Add(new BendingConstraint(particles,transform,n1.index,vBest.index,vertex.index,bendConstraintsGroup.bendingStiffness));

			}

			if (i % 500 == 0)
				yield return new CoroutineJob.ProgressInfo("ObiCloth: adding bend constraints...",i/(float)edgeStructure.heVertices.Count);
		}

		//Create skin constraints (if needed)
		skinConstraints = new List<SkinConstraint>();
		if (skinnedMeshRenderer != null){

			Vector3[] normals = mesh.normals;

			for (int i = 0; i < edgeStructure.heVertices.Count; i++){

				HalfEdge.HEVertex vertex = edgeStructure.heVertices[i];
				//using only the first normal at the vertex for backstop, its just a cheap approximation:
				skinConstraints.Add(new SkinConstraint(transform,i,vertices[vertex.physicalIDs[0]],0.1f, 
					                                      		   normals[vertex.physicalIDs[0]],0,1));

			}
		}

		pins = new PinSet();
		pressureConstraint = new PressureConstraint();
		shapeMatchingConstraint = new ShapeMatchingConstraint();

		shapeMatchingConstraint.ComputeRestInfo(particles);

		RecreateGrid();

		initializing = false;
	}

	/**
	 * Injects a percentage of world space transform movement back to the cloth particles.
	 */
	private void ApplyWorldSpaceMovement(float dt){

		Profiler.BeginSample("Apply world space movement");
		if (worldVelocityScale > 0){

			Matrix4x4 delta = transform.worldToLocalMatrix * lastTransform;
			
			foreach(ObiClothParticle p in particles){
				if (p.w > 0){

					Vector3 oldPosition = p.position;
					p.position = Vector3.Lerp(p.position,delta.MultiplyPoint3x4(p.position),worldVelocityScale);

					Vector3 worldVelocity = (p.position - oldPosition)/dt;
			
					// If the particle is asleep and we have to move it too much, wake it up.
					if (p.asleep && worldVelocity.sqrMagnitude > squaredSleepVelocity * 3)
						p.WakeUp(minimumWakeTime);
                }
			}

			lastTransform = transform.localToWorldMatrix;

		}
		Profiler.EndSample();

	}

	/**
	 * Sets all fixed cloth vertices to the position specified by the SkinnedMeshRenderer this frame.
	 */
	private void ApplySkinning(){
		
		if (skinnedMeshRenderer != null){

			if (!Initialized || mesh == null || particles.Count != edgeStructure.heVertices.Count) return;

			// Grab the skinned vertex positions from the SkinnedMeshRenderer:
			skinnedMeshRenderer.sharedMesh = sharedMesh;
			skinnedMeshRenderer.BakeMesh(mesh);

			Vector3[] vertices = mesh.vertices;
			Vector3[] normals = mesh.normals;
				
			// Move all fixed cloth vertices to their skinned position:
			foreach(ObiClothParticle p in particles){
				int vindex = edgeStructure.heVertices[p.index].physicalIDs[0];
				if (p.w == 0)
					p.position = vertices[vindex];
				else{
					skinConstraints[p.index].point = vertices[vindex];
					skinConstraints[p.index].normal = normals[vindex];
				}
			}
		}
		
	}

	private void SetupConstraintParameters(){
		pressureConstraintsGroup.SetupConstraintParameters(new List<PressureConstraint>(){pressureConstraint});
		shapeMatchingConstraintsGroup.SetupConstraintParameters(new List<ShapeMatchingConstraint>(){shapeMatchingConstraint});
		stretchConstraintsGroup.SetupConstraintParameters(structuralSprings);
		skinConstraintsGroup.SetupConstraintParameters(skinConstraints);
		bendConstraintsGroup.SetupConstraintParameters(bendingConstraints);
	}

	/**
	 * Returns the maximum number of iterations performed by any constraint group in this step.
	 */
	private int GetMaxIterations(){
		return Mathf.Max(stretchConstraintsGroup.effectiveIterations,
		                 bendConstraintsGroup.effectiveIterations,
		                 selfCollisionConstraintsGroup.effectiveIterations,
		                 collisionConstraintsGroup.effectiveIterations,
		                 pinConstraintsGroup.effectiveIterations,
		                 pressureConstraintsGroup.effectiveIterations,
			             shapeMatchingConstraintsGroup.effectiveIterations);
	}

	/**
	 * Returns information about a body of particles as a whole: total mass, its center of mass, and the velocity of the center of mass.
	 */
	public static BodyInformation GetBodyInformation(List<ObiClothParticle> particles, float epsilon){

		BodyInformation bodyInformation;

		bodyInformation.mass = 0;
		bodyInformation.centerOfMass = Vector3.zero;
		bodyInformation.centerOfMassVelocity = Vector3.zero;

		foreach(ObiClothParticle p in particles){
			float mass = 1/(p.w + epsilon);
			bodyInformation.mass += mass;
			bodyInformation.centerOfMass += p.position * mass;
			bodyInformation.centerOfMassVelocity += p.velocity * mass;
		}

		bodyInformation.centerOfMass /= bodyInformation.mass;
		bodyInformation.centerOfMassVelocity /= bodyInformation.mass;

		return bodyInformation;

	}

	/**
	 * Calculates and returns the inertia tensor of a list of particles.
	 */
	public static Matrix4x4 GetInertiaTensor(List<ObiClothParticle> particles,Vector3[] comDisplacements, float epsilon){

		Matrix4x4 I = Matrix4x4.zero;// inertia tensor
		I[3,3] = 1;
		foreach(ObiClothParticle p in particles){
			
			Vector3 q = comDisplacements[p.index];
			float mass = 1/(p.w + epsilon);
			
			float x2 = q[0]*q[0]*mass;
			float y2 = q[1]*q[1]*mass;
			float z2 = q[2]*q[2]*mass;
			
			float xy = -q[0]*q[1]*mass;
			float xz = -q[2]*q[0]*mass;
			float yz = -q[1]*q[2]* mass;
			
			I[0,0] += z2+y2; I[0,1] += xy; 	  I[0,2] += xz;
            I[1,0] += xy; 	 I[1,1] += z2+x2; I[1,2] += yz;
            I[2,0] += xz; 	 I[2,1] += yz; 	  I[2,2] += y2+x2;
            
        }

		return I;
    }
        
	/**
	 * Applies velocity damping to particles.
	 */
    private void DampVelocities(float epsilon){

		Profiler.BeginSample("Damp Velocities");

		if (damping != 0){
            
	        BodyInformation bodyInformation = ObiCloth.GetBodyInformation(particles,epsilon);
	
			Vector3[] ri = new Vector3[particles.Count]; //deviation of each particle from the center of mass.
			foreach(ObiClothParticle p in particles){
				ri[p.index] = p.position - bodyInformation.centerOfMass;
			}
			
			Vector3 L = Vector3.zero; // angular momentum
			foreach(ObiClothParticle p in particles){
				L += Vector3.Cross(ri[p.index],p.velocity /(p.w + epsilon));
			}
			
			// calculate the inertia tensor of the cloth body as a whole:
			Matrix4x4 I = ObiCloth.GetInertiaTensor(particles,ri,epsilon);
	       
	        // angular velocity of the whole cloth.
	        Vector3 w = I.inverse.MultiplyPoint3x4(L);
	        
	        // dampen velocities:
	        foreach(ObiClothParticle p in particles){
				if (p.w > 0){
	            	p.velocity += damping * (bodyInformation.centerOfMassVelocity + Vector3.Cross(w, ri[p.index]) - p.velocity);
				}
			}

		}

		Profiler.EndSample();
		
	}

	/**
	 * Advances the physical simulation by "dt" seconds.
	 */
	public void SimulateStep(float dt){
		
		if (mesh == null) return;
			
		Vector3[] vertices = mesh.vertices;
		Vector3[] normals = mesh.normals;
		Vector3 localGravity = transform.InverseTransformVector(Physics.gravity);
		Vector3 localWind = transform.InverseTransformVector(aerodynamics.wind);

		// Add external acceleration & forces
		ApplyWorldSpaceMovement(dt);
        foreach(ObiClothParticle p in particles){
			if (p.w > 0){
				// Apply gravity:
				p.velocity += localGravity * dt; // a = F/m, since gravity is an acceleration, don't multiply by inverse mass.
				// Apply aerodynamic forces:
				aerodynamics.ApplyAerodynamicsToParticle(p,normals[edgeStructure.heVertices[p.index].physicalIDs[0]],localWind, dt);
			}
		}
		
		// pretty self-explanatory:
		DampVelocities(1e-6f);

		// calculate initial particle positions and bounds estimate:
		Vector3 max = Vector3.one * Mathf.NegativeInfinity;
		Vector3 min = Vector3.one * Mathf.Infinity;
		foreach(ObiClothParticle p in particles){
			p.predictedPosition = p.position + p.velocity * dt;
			Vector3 wpos = transform.TransformPoint(p.predictedPosition);
			max = Vector3.Max(max,wpos);
			min = Vector3.Min(min,wpos);
		}

		Vector3 size = max-min;
		Bounds predictedBounds = new Bounds(min+size*0.5f,size);

		// update grid structure:
		UpdateGrid();

		// generate collision constraints:
		List<CollisionConstraint> collisions = collisionConstraintsGroup.GenerateCollisionConstraints(dt,transform,predictedBounds,world,edgeStructure,grid, particles);

		// generate self collision constraints:
		List<SelfCollisionConstraint> scollisions = selfCollisionConstraintsGroup.GenerateSelfCollisionConstraints(transform,edgeStructure,grid, particles);
		
		// update all constraint parameters / initialize stuff:
		SetupConstraintParameters();

		int maxIter = GetMaxIterations();

		// calculate iteration padding for interleaved constraint solving:
		int bendIterationPadding = bendConstraintsGroup.IterationPadding(maxIter);
		int pressureIterationPadding = pressureConstraintsGroup.IterationPadding(maxIter);
		int skinIterationPadding = skinConstraintsGroup.IterationPadding(maxIter);
		int shapeMatchingIterationPadding = shapeMatchingConstraintsGroup.IterationPadding(maxIter);
		int	selfCollisionIterationPadding = selfCollisionConstraintsGroup.IterationPadding(maxIter);
		int stretchIterationPadding = stretchConstraintsGroup.IterationPadding(maxIter);
		int collisionIterationPadding = collisionConstraintsGroup.IterationPadding(maxIter);
		int pinIterationPadding = pinConstraintsGroup.IterationPadding(maxIter);

		// evaluate constraints:
		Profiler.BeginSample("Constraint projection");
		for (int i = 1; i < maxIter; i++){

			// GROUP 1 ++++++ bending:
			if (i % bendIterationPadding == 0)
				bendConstraintsGroup.Evaluate(bendingConstraints,edgeStructure,particles,dt);

			// GROUP 2 ++++++ pressure:
			if (i % pressureIterationPadding == 0)
				pressureConstraintsGroup.Evaluate(new List<PressureConstraint>(){pressureConstraint},edgeStructure,particles,dt);

			// GROUP 3 ++++++ stretch:
			if (i % stretchIterationPadding == 0)
				stretchConstraintsGroup.Evaluate(structuralSprings,edgeStructure,particles,dt);

			// GROUP 4 ++++++ self collisions:
			if (i % selfCollisionIterationPadding == 0)
				selfCollisionConstraintsGroup.Evaluate(scollisions,edgeStructure,particles,dt);

			// GROUP 5 ++++++ collisions:
			if (i % collisionIterationPadding == 0)
				collisionConstraintsGroup.Evaluate(collisions, edgeStructure, particles,dt);

			// GROUP 6 ++++++ pins:
			if (i % pinIterationPadding == 0)
				pinConstraintsGroup.Evaluate(pins,edgeStructure,particles,dt);

			// GROUP 7 ++++++ shape matching:
			if (i % shapeMatchingIterationPadding == 0)
				shapeMatchingConstraintsGroup.Evaluate(new List<ShapeMatchingConstraint>(){shapeMatchingConstraint},edgeStructure,particles,dt);

            // GROUP 8 ++++++ skin:
			if (skinnedMeshRenderer != null && i % skinIterationPadding == 0)
                skinConstraintsGroup.Evaluate(skinConstraints,edgeStructure,particles,dt);

		}	

		// All groups perform the last evaluation together, regardless of interleaving.
		if (bendConstraintsGroup.effectiveIterations > 0) bendConstraintsGroup.Evaluate(bendingConstraints,edgeStructure,particles,dt);
		if (pressureConstraintsGroup.effectiveIterations > 0) pressureConstraintsGroup.Evaluate(new List<PressureConstraint>(){pressureConstraint},edgeStructure,particles,dt);
		if (stretchConstraintsGroup.effectiveIterations > 0) stretchConstraintsGroup.Evaluate(structuralSprings,edgeStructure,particles,dt);
		if (selfCollisionConstraintsGroup.effectiveIterations > 0) collisionConstraintsGroup.Evaluate(collisions, edgeStructure, particles,dt);
		if (collisionConstraintsGroup.effectiveIterations > 0) collisionConstraintsGroup.Evaluate(collisions, edgeStructure, particles,dt);
		if (pinConstraintsGroup.effectiveIterations > 0) pinConstraintsGroup.Evaluate(pins,edgeStructure,particles,dt);
		if (shapeMatchingConstraintsGroup.effectiveIterations > 0) shapeMatchingConstraintsGroup.Evaluate(new List<ShapeMatchingConstraint>(){shapeMatchingConstraint},edgeStructure,particles,dt);
		if (skinnedMeshRenderer != null && skinConstraintsGroup.effectiveIterations > 0) skinConstraintsGroup.Evaluate(skinConstraints,edgeStructure,particles,dt);

		Profiler.EndSample();

		// Recalculate velocities, enter sleep mode or advance to predicted positions:
		Profiler.BeginSample("Velocity update & sleep logic");
		foreach(ObiClothParticle p in particles){

			p.velocity = (p.predictedPosition - p.position) / dt;

			float sqrVelocity = p.velocity.sqrMagnitude;

			// If the particle velocity is lower than a threshold, decrease wake counter.
			if (sqrVelocity <= squaredSleepVelocity){
				p.wakeCounter -= dt;
			// Else, if the particle velocity is several times higher than the sleep threshold, wake it up.
			}else if (sqrVelocity > squaredWakeupVelocity){
				p.WakeUp(minimumWakeTime); 
            }

			// If the particle has had low velocity for a while, make it go to sleep. 
			if (p.wakeCounter < 0){
				p.GoToSleep();
			}

			// If the particle is not asleep, update its position.
			if (!p.asleep)
				p.position = p.predictedPosition;

		}
		Profiler.EndSample();

		// Remove broken springs and split geometry vertices:
		Profiler.BeginSample("Tearing");
		if (stretchConstraintsGroup.tearable){
			List<DistanceConstraint> toBeTeared = new List<DistanceConstraint>();
			foreach(DistanceConstraint sp in structuralSprings){
				if (sp.shouldBreak) toBeTeared.Add(sp);
			}
			foreach(DistanceConstraint sp in toBeTeared){
				TearSpring(sp, vertices);
			}
		}
		Profiler.EndSample();

	}
	

	/**
	 * Updates the spatial grid structure used to accelerate collisions.
	 */
	public void UpdateGrid(){

		Profiler.BeginSample("Update grid");
		if (grid != null){
			foreach(ObiClothParticle p in particles){
	
				Vector3 cellIndex = grid.GetParticleCell(transform.TransformPoint(p.position));
				grid.UpdateParticle(p,cellIndex);
	
			}
		}
		Profiler.EndSample();

	}

		
	/**
 	* Resets both the cloth mesh and its physical representation to the original state. 
 	*/
	public IEnumerator ResetAll(){
		
		Terminate();
		
		// Get original mesh info from the shared mesh:
		mesh.triangles = sharedMesh.triangles;
		mesh.vertices = sharedMesh.vertices;
		mesh.uv = sharedMesh.uv;
		mesh.uv2 = sharedMesh.uv2;
		mesh.uv3 = sharedMesh.uv3;
		mesh.uv4 = sharedMesh.uv4;
		mesh.colors = sharedMesh.colors;
		
		// Calculate new mesh bounds:
		if (recalculateBounds)
			mesh.RecalculateBounds();
		
		//Regenerate physic representation (recreate particles, constraints, etc.):
		CoroutineJob reinitialization = new CoroutineJob();
		reinitialization.asyncThreshold = 1000;			 //If things seem to be taking long (more than a second), do it asynchronously and allow other stuff to continue.
		
		//Depending on whether we are in-game or in the editor, start the coroutine as usual or using EditorCoroutine.
		if (Application.isPlaying){
			StartCoroutine(reinitialization.Start(GeneratePhysicRepresentationForMesh()));
		}else{
			EditorCoroutine.StartCoroutine(reinitialization.Start(GeneratePhysicRepresentationForMesh()));
		}
		
		//Wait for the reinitialization to complete.
		CoroutineJob.ProgressInfo progress = null;
		while(!reinitialization.IsDone){
			try{
				progress = reinitialization.Result as CoroutineJob.ProgressInfo;
			}catch(Exception e){
				Debug.LogException(e);
				yield break;
			}
			yield return progress;
		}
		
		UpdateNormalsAndTangents();

		WakeUp();
		
	}
	
	/**
 	* Resets cloth mesh to its original state.
 	*/
	public void ResetGeometry(){
		
		// If the structure of the mesh hasn't changed, there's no need to regenerate it all. Just reset particle and vertex positions.
		if (!edgeStructure.IsModified){
			
			Vector3[] sharedVertices = sharedMesh.vertices;

			mesh.vertices = sharedVertices;
			UpdateNormalsAndTangents();

			if (recalculateBounds)
				mesh.RecalculateBounds();
			
			//reset particle positions:
			foreach (HalfEdge.HEVertex vertex in edgeStructure.heVertices){
				particles[vertex.index].position = particles[vertex.index].predictedPosition = sharedVertices[vertex.physicalIDs[0]];
				particles[vertex.index].velocity = Vector3.zero;
			}	
			
		}else{	// If the mesh structure has been tampered with, we will need to regenerate it from scratch, while keeping fixed particles. TODO: fix, doesnt work properly.
			
			List<int> fixedParticleIndices = new List<int>();
			for(int i = 0; i < particles.Count; i++){
				if (particles[i].w == 0)
					fixedParticleIndices.Add(i);
			}
			
			CoroutineJob.RunSynchronously(ResetAll());
			
			foreach(int i in fixedParticleIndices){
				if (i < particles.Count){
					particles[i].mass = float.PositiveInfinity;
					particles[i].velocity = Vector3.zero;
				}
			}
			
		}
		
		WakeUp();
	}
	
	/**
 	* Applies changes in physics model to the cloth mesh.
 	*/
	public void CommitResultsToMesh()
	{
		if (!Initialized || mesh == null || particles.Count != edgeStructure.heVertices.Count) return;
		
		Vector3[] vertices = mesh.vertices;
		
		if (skinnedMeshRenderer != null){ //Update skinned mesh:
			
			// Transform all cloth vertices to rootBone space:
			bool[] isClothVertex = new bool[vertices.Length];
			foreach(HalfEdge.HEVertex vertex in edgeStructure.heVertices){
				Vector3 position = particles[vertex.index].position;
				foreach(int index in vertex.physicalIDs){
					isClothVertex[index] = true;
					vertices[index] = skinnedMeshRenderer.rootBone.InverseTransformPoint(transform.TransformPoint(position));
				}
			}

			// Then transform all regular vertices:
			for(int i = 0; i < vertices.Length; i++){
				if (!isClothVertex[i])
					vertices[i] = skinnedMeshRenderer.rootBone.InverseTransformPoint(transform.TransformPoint(vertices[i]));
            }

		}else{ //Update regular mesh:

			foreach(HalfEdge.HEVertex vertex in edgeStructure.heVertices){
				Vector3 position = particles[vertex.index].position;
				foreach(int index in vertex.physicalIDs){
					vertices[index] = position;
				}
			}

		}

		mesh.MarkDynamic();
		mesh.vertices = vertices;

		UpdateNormalsAndTangents();
		
		if (recalculateBounds)
			mesh.RecalculateBounds();
		
		// Apply the modified mesh to the SkinnedMeshRenderer.
		if (skinnedMeshRenderer != null){
			skinnedMeshRenderer.sharedMesh = mesh;
		}
		
	}

	private void UpdateNormalsAndTangents(){

		if (skinnedMeshRenderer != null){

			Vector3[] meshNormals = mesh.normals;
			Vector4[] meshTangents = mesh.tangents;

			for(int i = 0; i < meshNormals.Length; i++){
				meshNormals[i] = skinnedMeshRenderer.rootBone.InverseTransformVector(transform.TransformVector(meshNormals[i]));

				if (skinConstraintsGroup.transferTangents){
					float oldw = meshTangents[i].w;
					meshTangents[i] = skinnedMeshRenderer.rootBone.InverseTransformVector(transform.TransformVector(meshTangents[i])); // TODO: fix this.
					meshTangents[i].w = oldw;
				}
			}

			mesh.normals = meshNormals;
			mesh.tangents = meshTangents;

        }else{
            mesh.normals = edgeStructure.AreaWeightedNormals();
        }
    }
        
        /**
	 * Tears a cloth spring, affecting both the physical representation of the cloth and its mesh.
	 */
	public void TearSpring(DistanceConstraint sp,Vector3[] vertices){

		// get vertices at both ends:
		int splitIndex = sp.p1;
		int intactIndex = sp.p2;

		// select the index of the particle with higher mass:
		if (particles[sp.p1].mass < particles[sp.p2].mass){
			splitIndex = sp.p2;
			intactIndex = sp.p1;
		}

		Vector3 v1 = vertices[edgeStructure.heVertices[splitIndex].physicalIDs[0]];
		Vector3 v2 = vertices[edgeStructure.heVertices[intactIndex].physicalIDs[0]];

		// split the one with higher mass perpencidular to the vector between both.
		HalfEdge.HEVertex newVertex;
		HashSet<int> removedEdges;
		HashSet<int> addedEdges; 
		Dictionary<int,int> oldNewEdges;
		if (edgeStructure.SplitVertex(edgeStructure.heVertices[splitIndex],new Plane((v2-v1).normalized,v1),out newVertex,out vertices,out removedEdges,out addedEdges, out oldNewEdges))
		{
			// halve the mass of the original particle:
			particles[splitIndex].mass *= 0.5f;
			
			// create new particle, half the original mass of the split one:
			particles.Add(new ObiClothParticle(particles.Count,particles[splitIndex].areaContribution,particles[splitIndex].mass,vertices[newVertex.physicalIDs[0]],Vector3.zero));

			// create new springs:
			foreach(int edgeID in addedEdges){

				Vector2 vs = ObiUtils.Unpair(edgeID); 

				// Find old equivalent spring to copy data from:
				List<DistanceConstraint> oldSpring = structuralSprings.FindAll(spring => ObiUtils.Pair(spring.p1,spring.p2) == oldNewEdges[edgeID]);
				
				structuralSprings.AddNoDuplicates(new DistanceConstraint(transform,(int)vs.x,(int)vs.y,oldSpring[0].restLenght,oldSpring[0].Stiffness,oldSpring[0].CompressionStiffness,oldSpring[0].tearDistance));
			}

			// remove broken springs and bend constraints:
			structuralSprings.RemoveWhere(spring => removedEdges.Contains(spring.GetHashCode()));
			bendingConstraints.RemoveWhere(bend => bend.pIndex3 == splitIndex);
		}

	}

	/**
	 * Removes all fixed particles that are attached to fixed particles only, and all the constraints
	 * affecting them. This also modifies the internal half-edge structure to reflect the new cloth topology.
	 */
	public void Optimize(){

		HashSet<int> particlesToOptimize = new HashSet<int>();

		// Iterate over all particles and get those fixed ones that are only linked to fixed particles.
		for (int i = 0; i < edgeStructure.heVertices.Count; i++){
			
			HalfEdge.HEVertex vertex = edgeStructure.heVertices[i];
			ObiClothParticle particle = particles[vertex.index];

			// If this particle is not fixed, don't consider it for optimization.
			if (particle.w > 0) continue;
			
			bool optimizeAway = true;			
			foreach (HalfEdge.HEVertex n in edgeStructure.GetNeighbourVerticesEnumerator(vertex)){
					
				ObiClothParticle neighbour = particles[n.index];

				// If at least one neighbour particle is not fixed, then the particle we are considering for optimization should not be removed.
				if (neighbour.w > 0){
					optimizeAway = false;
					break;
				}

			}

			if (optimizeAway)
				particlesToOptimize.Add(particle.index);
		}

		// Once we have identified all optimizable particles, remove all their constraints.
		foreach (int index in particlesToOptimize){
			structuralSprings.RemoveWhere((DistanceConstraint spring) => {
				Vector2 pair = ObiUtils.Unpair(spring.GetHashCode());
				return pair.x == index || pair.y == index;
			});
			pins.RemoveWhere((PinConstraint spring) => {
				Vector2 pair = ObiUtils.Unpair(spring.GetHashCode());
				return pair.x == index;
			});
			skinConstraints[index] = null;
			bendingConstraints.RemoveWhere(bend => bend.pIndex1 == index || 
												   bend.pIndex2 == index || 
												   bend.pIndex3 == index);
		}
		skinConstraints.RemoveAll(s => s == null);

		// Update the half-edge representation:
		edgeStructure.BatchRemoveVertices(particlesToOptimize);

		// Remove the particles themselves, and update indices for the remaining particles.
		List<ObiClothParticle> oldParticles = new List<ObiClothParticle>(particles);
		particles.RemoveAll(p => particlesToOptimize.Contains(p.index));
		for(int i = 0; i < particles.Count; i++){
			particles[i].index = i;
		}

		// Finally, update the remaining constraints:
		foreach(DistanceConstraint sp in structuralSprings){
			sp.p1 = oldParticles[sp.p1].index;
			sp.p2 = oldParticles[sp.p2].index;
		}
		foreach(BendingConstraint b in bendingConstraints){
			b.pIndex1 = oldParticles[b.pIndex1].index;
			b.pIndex2 = oldParticles[b.pIndex2].index;
			b.pIndex3 = oldParticles[b.pIndex3].index;
		}
		foreach(PinConstraint p in pins){
			p.pIndex = oldParticles[p.pIndex].index;
		}
		foreach(SkinConstraint s in skinConstraints){
			s.pIndex = oldParticles[s.pIndex].index;
		}
			
	}

	/**
     * Forces the shape matching constraints to get the current cloth state as their new shape to match.
	 */
	public void GrabShape(){
		if (shapeMatchingConstraintsGroup != null){
			shapeMatchingConstraintsGroup.GrabShape(new List<ShapeMatchingConstraint>(){shapeMatchingConstraint},particles);
		}
	}

}

}
