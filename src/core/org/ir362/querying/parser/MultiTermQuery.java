package org.ir362.querying.parser;

import java.util.LinkedList;

public class MultiTermQuery {
	
	protected LinkedList<SingleTermQuery> termList = new LinkedList<SingleTermQuery>();
	
	public MultiTermQuery() {}
	
	public int length() {
		return termList.size();
	}
	
	public SingleTermQuery get(int index) {
		return termList.get(index);
	}
	
	public void add(SingleTermQuery term) {
		if (term != null) {
			termList.addLast(term);
		}
	}
	
	public String toString() {
		String output = "";
		for(SingleTermQuery term : termList){
			output += term.toString() + "\n";
		}
		return output;
	}
}