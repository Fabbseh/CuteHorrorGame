using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

[Serializable]
public class SerializableHashSet<T> : IEnumerable, IEnumerable<T>
{

	[SerializeField] private List<T> elements = new List<T>();
	
	// save the set to a list
	/*public void OnBeforeSerialize()
	{
		elements.Clear();
		elements.AddRange(this);
	}
	
	// load set from list
	public void OnAfterDeserialize()
	{
		Clear();
		UnionWith(elements);
	}*/

	/**
	 * Terrible workaround until unity ISerializationCallbackReceiver works properly and we can use a HashSet.
	 */
	public void AddNoDuplicates(T element){
		if (!elements.Contains(element)) 
			elements.Add(element);
	}

	public void Add(T element){
		elements.Add(element);
	}

	public void RemoveWhere(Predicate<T> match){
		elements.RemoveAll(match);
	}

	public List<T> FindAll(Predicate<T> match){
		return elements.FindAll(match);
	}

	public int Count{
		get{return elements.Count;}
	}

	public IEnumerator<T> GetEnumerator()
	{
		return elements.GetEnumerator();
	}

	IEnumerator IEnumerable.GetEnumerator()
	{
		return GetEnumerator();
	}
}
