package org.ir362.querying.parser;

public class SingleTermQuery {
	
	protected String term = "";
	
	protected boolean required = true;
	
	public SingleTermQuery() {}
	
	public SingleTermQuery(String term) {
		if (null != term) {
			this.term = term;
		}
	}
	
	public SingleTermQuery(boolean required, String term) {
		if (null != term) {
			this.required = required;
			this.term = term;
		}
	}
	
	public boolean getRequired() {
		return required;
	}
	
	public void setRequired(boolean required) {
		this.required = required;
	}
	
	public String getTerm() {
		return term;
	}
	
	public void setTerm(String tern) {
		this.term = term;
	}
	
	public String toString() {
		if (required) {
			return "+" + term;
		}
		return "-" + term;
	}
	
}