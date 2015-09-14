using UnityEngine;
using System.Collections;

namespace Obi
{
public static class ObiUtils
{

	public static float Remap (this float value, float from1, float to1, float from2, float to2) {
		return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
	}

	/** Return the one norm of the matrix.
	*/
	public static float OneNorm(this Matrix4x4 A)
	{
		float sum1 = Mathf.Abs(A[0,0]) + Mathf.Abs(A[1,0]) + Mathf.Abs(A[2,0]);
		float sum2 = Mathf.Abs(A[0,1]) + Mathf.Abs(A[1,1]) + Mathf.Abs(A[2,1]);
		float sum3 = Mathf.Abs(A[0,2]) + Mathf.Abs(A[1,2]) + Mathf.Abs(A[2,2]);
		float maxSum = sum1;
		if (sum2 > maxSum)
			maxSum = sum2;
		if (sum3 > maxSum)
			maxSum = sum3;
		return maxSum;
	}

	/** Return the inf norm of the matrix.
	*/
	public static float InfNorm(this Matrix4x4 A)
	{
		float sum1 = Mathf.Abs(A[0, 0]) + Mathf.Abs(A[0, 1]) + Mathf.Abs(A[0, 2]);
		float sum2 = Mathf.Abs(A[1, 0]) + Mathf.Abs(A[1, 1]) + Mathf.Abs(A[1, 2]);
		float sum3 = Mathf.Abs(A[2, 0]) + Mathf.Abs(A[2, 1]) + Mathf.Abs(A[2, 2]);
		float maxSum = sum1;
		if (sum2 > maxSum)
			maxSum = sum2;
		if (sum3 > maxSum)
			maxSum = sum3;
		return maxSum;
	}

	public static Matrix4x4 MultiplyValue(this Matrix4x4 M, float val){
		for (int i = 0; i < 16; i++)
			M[i] *= val;
		return M;
	}

	public static Matrix4x4 Add(this Matrix4x4 M, Matrix4x4 other){
		for (int i = 0; i < 16; i++)
			M[i] += other[i];
		return M;
	}

	public static float Determinant(this Matrix4x4 M){

		Matrix4x4 Mt = M.transpose;
		Matrix4x4 MadjTt = Matrix4x4.identity;

		MadjTt.SetRow(0, Vector3.Cross(Mt.GetRow(1),Mt.GetRow(2)));
		MadjTt.SetRow(1, Vector3.Cross(Mt.GetRow(2),Mt.GetRow(0)));
		MadjTt.SetRow(2, Vector3.Cross(Mt.GetRow(0),Mt.GetRow(1)));

		return Mt[0,0] * MadjTt[0,0] + Mt[0,1] * MadjTt[0,1] + Mt[0,2] * MadjTt[0,2];

	}

	/** Perform a polar decomposition of matrix M and return the rotation matrix R. This method handles the degenerated cases.*/
	public static Matrix4x4 PolarDecomposition(this Matrix4x4 M, float tolerance)
	{
		Matrix4x4 Mt = M.transpose;
		float Mone = M.OneNorm();
		float Minf = M.InfNorm();
		float Eone;
		Matrix4x4 MadjTt = Matrix4x4.identity;
		Matrix4x4 Et = Matrix4x4.identity;
		Matrix4x4 R;
		do
		{
			MadjTt.SetRow(0, Vector3.Cross(Mt.GetRow(1),Mt.GetRow(2)));
            MadjTt.SetRow(1, Vector3.Cross(Mt.GetRow(2),Mt.GetRow(0)));
            MadjTt.SetRow(2, Vector3.Cross(Mt.GetRow(0),Mt.GetRow(1)));
			
			float det = Mt[0,0] * MadjTt[0,0] + Mt[0,1] * MadjTt[0,1] + Mt[0,2] * MadjTt[0,2];
			
			if (Mathf.Abs(det) < Mathf.Epsilon)
			{
				Vector3 len = Vector3.zero;
				int index = -1;
				for (int i = 0; i < 3; i++)
				{
					len[i] = MadjTt.GetRow(i).sqrMagnitude;
					if (len[i] > Mathf.Epsilon)
					{
						// index of valid cross product
						// => is also the index of the vector in Mt that must be exchanged
						index = i;
						break;
					}
				}
				if (index == -1)
				{
					R = Matrix4x4.identity;
					return R;
				}
				else
				{
					Mt.SetRow(index, Vector3.Cross(Mt.GetRow((index+1)%3),Mt.GetRow((index+2)%3)));
					MadjTt.SetRow((index + 1) % 3,Vector3.Cross(Mt.GetRow((index+2)%3),Mt.GetRow(index)));
					MadjTt.SetRow((index + 2) % 3,Vector3.Cross(Mt.GetRow(index),Mt.GetRow((index+1)%3)));
					Matrix4x4 M2 = Mt.transpose;
					Mone = M2.OneNorm();
					Minf = M2.InfNorm();
					det = Mt[0,0] * MadjTt[0,0] + Mt[0,1] * MadjTt[0,1] + Mt[0,2] * MadjTt[0,2];
				}
			}
			
			float MadjTone = MadjTt.OneNorm();
			float MadjTinf = MadjTt.InfNorm();
			
			float gamma = Mathf.Sqrt(Mathf.Sqrt((MadjTone*MadjTinf) / (Mone*Minf)) / Mathf.Abs(det));
			
			float g1 = gamma*0.5f;
			float g2 = 0.5f / (gamma*det);
			
			for (int i = 0; i < 3; i++)
			{
				for (int j = 0; j < 3; j++)
				{
					Et[i,j] = Mt[i,j];
					Mt[i,j] = g1*Mt[i,j] + g2*MadjTt[i,j];
					Et[i,j] -= Mt[i,j];
				}
			}
			
			Eone = Et.OneNorm();
			
			Mone = Mt.OneNorm();
			Minf = Mt.InfNorm();
		} while (Eone > Mone * tolerance);
		
		// Q = Mt^T 
		R = Mt.transpose;
		return R;
	}

	/**
	 * Calculates barycentric coordinates of a point inside a triangle.
	 */
	public static Vector3 BarycentricCoordinates(Vector3 A, Vector3 B, Vector3 C, Vector3 P){
		
		// Compute vectors        
		Vector3 v0 = C - A;
		Vector3 v1 = B - A;
		Vector3 v2 = P - A;
		
		// Compute dot products
		float dot00 = Vector3.Dot(v0, v0);
		float dot01 = Vector3.Dot(v0, v1);
		float dot02 = Vector3.Dot(v0, v2);
		float dot11 = Vector3.Dot(v1, v1);
		float dot12 = Vector3.Dot(v1, v2);
		
		// Compute barycentric coordinates
		float invDenom = 1f / (dot00 * dot11 - dot01 * dot01);
		float u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		float v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		
		return new Vector3(1-u-v,v,u);
		
	}
	
	/**
	 * Interpolates values across a triangle using barycentric coordinates. For use with Vector3 arguments.
	 */
	public static Vector3 BarycentricInterpolation (Vector3 A, Vector3 B, Vector3 C, Vector3 barycentricCoords){
		
		return barycentricCoords.x*A + barycentricCoords.y*B + barycentricCoords.z*C;
		
	}
	
	/**
	 * Interpolates values across a triangle using barycentric coordinates. For use with float arguments.
	 */
	public static float BarycentricInterpolation (float A, float B, float C, Vector3 barycentricCoords){
		
		return barycentricCoords.x*A + barycentricCoords.y*B + barycentricCoords.z*C;
		
	}

	public static float BarycentricExtrapolationScale (Vector3 barycentricCoords){
		
		return 1/(barycentricCoords.x*barycentricCoords.x + 
		          barycentricCoords.y*barycentricCoords.y +
		          barycentricCoords.z*barycentricCoords.z);
		
	}

	/**
	 * Calculates the magnitude of an impulse given to a rigidbody.
	 */
	public static float GetImpulseMagnitude(Matrix4x4 invInertiaTensor, float rigidbodyWeight, float particleWeight, Vector3 r, Vector3 n, Vector3 v){
		
		float dot = Vector3.Dot(v,n);
		if (dot >= 0) return 0; //early out if the velocity points away from the contact point.
		
		Vector3 ixrxn =  Vector3.Cross(invInertiaTensor * Vector3.Cross(r,n),r);
		return - dot / (  rigidbodyWeight + particleWeight + Vector3.Dot (ixrxn,n)  );
		
	}

	/**
	 * Expands a Bounds object using both a velocity vector and an offset.
	 */
	public static Bounds ExpandBounds(this Bounds b, Vector3 velocity, float offset){
		Bounds expanded = new Bounds(b.center,b.size);
		expanded.Expand(offset);
		expanded.Encapsulate(velocity + b.max);
		expanded.Encapsulate(velocity + b.min);
		return expanded;
	}

	public static float Volume(this Bounds b){
		return b.size.x * b.size.y * b.size.z;
	}

	public static bool IntersectsSphere(this Bounds b, Vector3 center, float radius){
		// Project sphere center to bounds, see if distance is < radius:
		Vector3 closest = b.ClosestPoint(center);
		return (closest - center).sqrMagnitude < radius * radius;
	}

	/**
	 * Generates a unique hash from a pair of integers. Order is not important, <a,b> will produce the same result as <b,a>
	 * based on Szudzik's function (half of it):
	 */
	public static int Pair(int a, int b){
		int max = Mathf.Max(a,b);
		int min = Mathf.Min(a,b);
		return max*max+min;
	}
	
	/**
	 * Inverse of the Pair(a,b) function, obtains the original pair of numbers used to generate the unique hash.
	 */
	public static Vector2 Unpair(int a){
		int b = (int)Mathf.Sqrt(a);
		int c = b*b;
		return new Vector2(a-c,b);
	}

	/**
	 * Calculates the area of a triangle.
	 */
	public static float TriangleArea(Vector3 p1, Vector3 p2, Vector3 p3){
		return Vector3.Cross(p2-p1,p3-p1).magnitude / 2f;
	}

	/**
	 * Calculates the bounds of a triangle.
	 */
	public static Bounds GetTriangleBounds(Vector3 p1, Vector3 p2, Vector3 p3){
		Bounds b = new Bounds(p1,Vector3.zero);
		b.Encapsulate(p2);
		b.Encapsulate(p3);
		return b;
	}

	/**
	 * Calculates the intersection of a ray and a triangle, returning whether they intersect or not.
	 */
	public static bool RayTriangleIntersection(Vector3 p1, Vector3 p2, Vector3 p3, Vector3 rayOrigin, Vector3 rayDirection)
	{
		float u,v,t;
		bool frontFacing;
		return RayTriangleIntersection(p1,p2,p3,rayOrigin,rayDirection,out u, out v, out t, out frontFacing);
	}

	/**
	 * Calculates the intersection of a ray and a triangle, returning whether they intersect or not. Additional data is provided:
	 * barycentric coordinates of the hit, distance along ray, and if the ray hits the front face of the triangle or not.
	 */
	public static bool RayTriangleIntersection(Vector3 p1, Vector3 p2, Vector3 p3, Vector3 rayOrigin, Vector3 rayDirection, out float u, out float v, out float t, out bool frontfacing)
	{

		// Vectors from p1 to p2/p3 (edges)
		Vector3 e1, e2;  
		Vector3 s, p, q;
		float det,invDet;
		
		// Initialize values:
		u = 0;
		v = 0;
		t = 0;
		frontfacing = false;
			
		// Find vectors for two edges sharing vertex/point p1
		e1 = p2 - p1;
		e2 = p3 - p1;
		
		// calculating determinant 
		p = Vector3.Cross(rayDirection, e2);
		
		//Calculate determinant
		det = Vector3.Dot(e1, p);
		
		//if determinant is near zero, ray lies in plane of triangle otherwise not
		if (det > -Mathf.Epsilon && det < Mathf.Epsilon) { return false; }
		invDet = 1.0f / det;

		//see if the triangle is facing the ray:
		frontfacing = det > Mathf.Epsilon;
		
		//calculate distance from p1 to ray origin
		s = rayOrigin - p1;
		
		//Calculate u parameter
		u = Vector3.Dot(s, p) * invDet;
		
		//Check for ray hit
		if (u < 0 || u > 1) { return false; }
		
		//Prepare to test v parameter
		q = Vector3.Cross(s, e1);
		
		//Calculate v parameter
		v = Vector3.Dot(rayDirection, q) * invDet;
		
		//Check for ray hit
		if (v < 0 || u + v > 1) { return false; }
		
		t = Vector3.Dot(e2, q) * invDet;

		if (t > Mathf.Epsilon)
		{ 
			//ray does intersect
			return true;
		}
		
		// No hit at all
		return false;
	}
	
	/**
	 * Calculates the nearest point on a triangle to a given point.
	 */
	public static Vector3 NearestPointOnTri(Vector3 p1, Vector3 p2, Vector3 p3,Vector3 p, out float u, out float v) {

		Vector3 edge0 = p2 - p1;
		Vector3 edge1 = p3 - p1;
		Vector3 v0 = p1 - p;
		
		float a00 = Vector3.Dot(edge0,edge0);
		float a01 = Vector3.Dot(edge0,edge1);
      	float a11 = Vector3.Dot(edge1,edge1);
      	float b0 = Vector3.Dot(edge0,v0);
      	float b1 = Vector3.Dot(edge1,v0);

		const float zero = 0;
		const float one = 1;
		
		float det = a00*a11 - a01*a01;
		u = a01*b1 - a11*b0;
		v = a01*b0 - a00*b1;
		
		if (u + v <= det)
		{
			if (u < zero)
			{
				if (v < zero)  // region 4
				{
					if (b0 < zero)
					{
						v = zero;
						if (-b0 >= a00)  // V0
						{
							u = one;
						}
						else  // E01
						{
							u = -b0 / a00;
						}
					}
					else
					{
						u = zero;
						if (b1 >= zero)  // V0
						{
							v = zero;
						}
						else if (-b1 >= a11)  // V2
						{
							v = one;
						}
						else  // E20
						{
							v = -b1 / a11;
						}
					}
				}
				else  // region 3
				{
					u = zero;
					if (b1 >= zero)  // V0
					{
						v = zero;
					}
					else if (-b1 >= a11)  // V2
					{
						v = one;
					}
					else  // E20
					{
						v = -b1 / a11;
					}
				}
			}
			else if (v < zero)  // region 5
			{
				v = zero;
				if (b0 >= zero)  // V0
				{
					u = zero;
				}
				else if (-b0 >= a00)  // V1
				{
					u = one;
				}
				else  // E01
				{
					u = -b0 / a00;
				}
			}
			else  // region 0, interior
			{
				float invDet = one / det;
				u *= invDet;
				v *= invDet;
			}
		}
		else
		{
			float tmp0, tmp1, numer, denom;
			
			if (u < zero)  // region 2
			{
				tmp0 = a01 + b0;
				tmp1 = a11 + b1;
				if (tmp1 > tmp0)
				{
					numer = tmp1 - tmp0;
					denom = a00 - 2*a01 + a11;
					if (numer >= denom)  // V1
					{
						u = one;
						v = zero;
					}
					else  // E12
					{
						u = numer / denom;
						v = one - u;
					}
				}
				else
				{
					u = zero;
					if (tmp1 <= zero)  // V2
					{
						v = one;
					}
					else if (b1 >= zero)  // V0
					{
						v = zero;
					}
					else  // E20
					{
						v = -b1 / a11;
					}
				}
			}
			else if (v < zero)  // region 6
			{
				tmp0 = a01 + b1;
				tmp1 = a00 + b0;
				if (tmp1 > tmp0)
				{
					numer = tmp1 - tmp0;
					denom = a00 - 2*a01 + a11;
					if (numer >= denom)  // V2
					{
						v = one;
						u = zero;
					}
					else  // E12
					{
						v = numer / denom;
						u = one - v;
					}
				}
				else
				{
					v = zero;
					if (tmp1 <= zero)  // V1
					{
						u = one;
					}
					else if (b0 >= zero)  // V0
					{
						u = zero;
					}
					else  // E01
					{
						u = -b0 / a00;
					}
				}
			}
			else  // region 1
			{
				numer = a11 + b1 - a01 - b0;
				if (numer <= zero)  // V2
				{
					u = zero;
					v = one;
				}
				else
				{
					denom = a00 - 2*a01 + a11;
					if (numer >= denom)  // V1
					{
						u = one;
						v = zero;
					}
					else  // 12
					{
						u = numer / denom;
						v = one - u;
					}
				}
			}
		}
		
		return p1 + u * edge0 + v * edge1;

	}

	/**
	 * Calculates the world space escape point/normal from a SphereCollider. Input position should be given in world space. 
	 */
	public static void EscapePoint(this SphereCollider sc, Vector3 position, out Vector3 point, out Vector3 normal, out float distance){
		
		point = position;
		normal = Vector3.zero;
			
		Vector3 center = Vector3.Scale(sc.center,sc.transform.lossyScale);
		position = Quaternion.Inverse(sc.transform.rotation) * (position - sc.transform.position) - center;
		
		float radius = sc.radius * Mathf.Max(sc.transform.lossyScale.x,
		                                     sc.transform.lossyScale.y,
		                                     sc.transform.lossyScale.z) + sc.contactOffset;
		
		float centerToPointMagnitude = position.magnitude;
		
		distance = centerToPointMagnitude - radius;
		normal = position/centerToPointMagnitude;
		point = normal * radius;
		
		point = sc.transform.rotation * (point + center) + sc.transform.position;
		normal = sc.transform.TransformDirection(normal);

	}

	/**
	 * Calculates the world space escape point/normal from a CapsuleCollider. Input position should be given in world space. 
	 */
	public static void EscapePoint(this CapsuleCollider cc, Vector3 position, out Vector3 point, out Vector3 normal,out float distance){
		
		point = position;
		normal = Vector3.zero;
		
		Vector3 center = Vector3.Scale(cc.center,cc.transform.lossyScale);
		position = Quaternion.Inverse(cc.transform.rotation) * (position - cc.transform.position) - center;

		float height = 0;
		float radius = 0;
		float d = 0;
		Vector3 axisProj = Vector3.zero;
		Vector3 cap = Vector3.zero;

		switch(cc.direction){
			case 0:{ //X
				radius = cc.radius * Mathf.Max(cc.transform.lossyScale.y,cc.transform.lossyScale.z) + cc.contactOffset;
				height = Mathf.Max(radius,Mathf.Abs(cc.height * 0.5f * cc.transform.lossyScale.x)) + cc.contactOffset;
				d = position.x;
				axisProj = Vector3.right * d;
				cap = Vector3.right * (height - radius);
			}break;
			case 1:{ //Y
				radius = cc.radius * Mathf.Max(cc.transform.lossyScale.x,cc.transform.lossyScale.z) + cc.contactOffset;
				height = Mathf.Max(radius,Mathf.Abs(cc.height * 0.5f * cc.transform.lossyScale.y)) + cc.contactOffset;
				d = position.y;
				axisProj = Vector3.up * d;
				cap = Vector3.up * (height - radius);
			}break;
			case 2:{ //Z
				radius = cc.radius * Mathf.Max(cc.transform.lossyScale.x,cc.transform.lossyScale.y) + cc.contactOffset;
				height = Mathf.Max(radius,Mathf.Abs(cc.height * 0.5f * cc.transform.lossyScale.z)) + cc.contactOffset;
				d = position.z;
				axisProj = Vector3.forward * d;
				cap = Vector3.forward * (height - radius);
			}break;
		}
		
		Vector3 centerToPoint;
		float centerToPointMagnitude;

		if (d > height - radius){ //one cap

			centerToPoint = position - cap;
			centerToPointMagnitude = centerToPoint.magnitude;

			distance = centerToPointMagnitude - radius;
			normal = centerToPoint/centerToPointMagnitude;
			point = cap + normal * radius;

		}else if (d < - height + radius){ //other cap

			centerToPoint = position + cap;
			centerToPointMagnitude = centerToPoint.magnitude;
			
			distance = centerToPointMagnitude - radius;
			normal = centerToPoint/centerToPointMagnitude;
			point = -cap + normal * radius; 

		}else{ //cilinder

			centerToPoint = position - axisProj;
			centerToPointMagnitude = centerToPoint.magnitude;
			
			distance = centerToPointMagnitude - radius;
			normal = centerToPoint/centerToPointMagnitude;
			point = axisProj + normal * radius;
		}
		
		point = cc.transform.rotation * (point + center) + cc.transform.position;
		normal = cc.transform.TransformDirection(normal);

	}

	/**
	 * Calculates the world space escape point/normal from a BoxCollider. Input position should be given in world space. 
	 */
	public static void EscapePoint(this BoxCollider bc, Vector3 position, out Vector3 point, out Vector3 normal, out float distance){
		
		point = position;
		normal = Vector3.zero;
		distance = 0;
		
		Vector3 center = Vector3.Scale(bc.center,bc.transform.lossyScale);
		Vector3 size = Vector3.Scale(bc.size*0.5f,bc.transform.lossyScale) + Vector3.one * bc.contactOffset;
		
		position = Quaternion.Inverse(bc.transform.rotation) * (position - bc.transform.position) - center;

		// Get minimum distance for each axis:
		float[] distances = new float[3]{size.x - Mathf.Abs(position.x),
										 size.y - Mathf.Abs(position.y),
									     size.z -  Mathf.Abs(position.z)};

		// If we are inside the box:
		if (distances[0] >= 0 && distances[1] >= 0 && distances[2] >= 0){

			// Find minimum distance in all three axes and the axis index:
			float min = System.Single.MaxValue;
			int axis = 0;	
			for(int i = 0; i < distances.Length; i++){
				if (distances[i] < min)
				{min = distances[i]; axis=i;}
			}
	
			// Get distance, normal and point:
			distance = -distances[axis];
			normal[axis] = Mathf.Sign(position[axis]);
			point[axis] = size[axis] * normal[axis];

		}else{ // we are outside the box:

			point = new Vector3(Mathf.Clamp(position.x,-size.x, size.x),
			                    Mathf.Clamp(position.y,-size.y, size.y),
			                    Mathf.Clamp(position.z,-size.z, size.z));

			Vector3 diff = position - point;
			distance = diff.magnitude;
			normal = diff / (distance + Mathf.Epsilon);
			
		}
		
		point = bc.transform.rotation * (point + center) + bc.transform.position;
		normal = bc.transform.TransformDirection(normal);
		
	}

	/**
	 * Calculates the world space escape point/normal from a TerrainCollider. Input position should be given in world space. 
	 */
	public static void EscapePoint(this TerrainCollider tc, Vector3 position, out Vector3 point, out Vector3 normal, out float distance){
		
		point = position;
		normal = Vector3.zero;
		
		position = Quaternion.Inverse(tc.transform.rotation) * (position - tc.transform.position);
		
		// sample the terrain height at the normalized local coordinates. If distance is > 0, we are over the terrain. Else, calculate normal and point.
		Vector2 normalizedPos = new Vector2(Mathf.InverseLerp(0f, tc.terrainData.size.x, position.x), Mathf.InverseLerp(0f, tc.terrainData.size.z, position.z));

		distance = position.y - tc.terrainData.GetInterpolatedHeight(normalizedPos.x,normalizedPos.y) - tc.contactOffset;	
		normal = tc.terrainData.GetInterpolatedNormal(normalizedPos.x,normalizedPos.y);
		point = position - normal * distance;
		
		point = tc.transform.rotation * point + tc.transform.position;
		normal = tc.transform.TransformDirection(normal);

	}

	/**
	 * Calculates the world space escape point/normal from a DistanceField. Input position should be given in world space. 
	 */
	public static void EscapePoint(this DistanceFieldCollider df, Vector3 position, out Vector3 point, out Vector3 normal, out float distance){
		
		point = position;
		normal = Vector3.zero;
		distance = 0;

		if (df.distanceField == null) return;

		position = df.transform.InverseTransformPoint(position);
		
		Vector3 gradient = Vector3.zero;

		// Sample the distance field at the point. If distance is > 0, we are outside the surface.
		distance = df.distanceField.DistanceAndGradientAt(position, out gradient) - df.contactOffset;
		normal = gradient.normalized;
		point = position - normal * distance;
		
		point = df.transform.TransformPoint(point);
		normal = df.transform.TransformDirection(normal);
		
	}

}
}

