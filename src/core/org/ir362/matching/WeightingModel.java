package org.ir362.matching;

import org.ir362.querying.Request;

public abstract class WeightingModel
{
	abstract public void setParameter(double param);
	public static WeightingModel createInstance(Request rq) {
		// TODO Young, return different model based on rq
		return new TF_IDF();
	}
}
