package org.ir362.querying;

import org.ir362.matching.MatchingTerms;
import org.ir362.matching.ResultSet;
import org.ir362.querying.parser.Query;
import org.terrier.structures.Index;


public class Request {
	private String original_query;
	private String matching_model;
	private String weighting_model;
	private Query query=null;
	private MatchingTerms mt=null;
	private Index index=null;
	private ResultSet result;

	public Request(String original_query, Index index) {
		this.original_query = original_query;
		this.index = index;
	}
	
	public void setSearchingModel(String matching_model, String weighting_model) {
		this.matching_model = matching_model;
		this.weighting_model = weighting_model;
	}
	
	public Query getQuery() {
		return query;
	}
	public void setQuery(Query q) {
		// TODO 我需要一个人来set我啊！！
		this.query = q;
	}
	
	public String getWeightingModel(){
		return weighting_model;
	}
	
	public String getMatchingModel(){
		return matching_model;
	}

	public void setMatchingTerms(MatchingTerms mt) {
		this.mt = mt;
	}

	public MatchingTerms getMatchingTerms() {
		return this.mt;
	}

	public Index getIndex() {
		return index;
	}

	public void setResultSet(ResultSet result) {
		this.result = result;
	}

	public ResultSet getResultSet() {
		return result;
	}
	
	public String get_original_query() {
		return original_query;
	}
}
