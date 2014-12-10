package org.ir362.querying.parser;

import org.ir362.querying.Request;

/**
 *  这个暂时不用了， 以后看情况再把它改成抽象出来的接口，现在直接用其琛写的那几个类
 *  先都统一解析成 MultiTermQuery
 *  */
public class Query { // TODO chnage it to interface - Young
    private Request rq=null;

	public Query(Request rq) {
		this.rq = rq;
	}
}
