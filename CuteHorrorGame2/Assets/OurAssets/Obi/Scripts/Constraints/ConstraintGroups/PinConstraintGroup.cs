using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Obi
{
	[Serializable]
	public class PinConstraintGroup : ConstraintGroup<PinConstraint>
	{
		public PinConstraintGroup(){
			name = "Pin";
		}
	}
}

