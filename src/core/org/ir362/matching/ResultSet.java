package org.ir362.matching;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Map;
import java.util.TreeMap;

import edu.uci.jforests.util.Pair;

import gnu.trove.TIntDoubleHashMap;
import gnu.trove.TIntDoubleIterator;

public class ResultSet {
	// 我打算排序在这里实现
	public TIntDoubleHashMap scoresMap;
	private TreeMap<Double, ArrayList<Integer>> scoresTree;
	private ArrayList<Pair<Integer, Double>> docidScoreArray;
	public ResultSet() {
		scoresMap = new TIntDoubleHashMap();
		scoresTree = new TreeMap<Double, ArrayList<Integer>>();
		docidScoreArray = new ArrayList<Pair<Integer, Double>>();
	}
	public void initialize() {
		// 我所干的事情就是将东西拍好序
		double score;
		TIntDoubleIterator iterator = scoresMap.iterator();
		for (int docid : scoresMap.keys()) {
                score = scoresMap.get(docid);
                if (!scoresTree.containsKey(score))
                        scoresTree.put(score, new ArrayList<Integer>());
                scoresTree.get(score).add(docid);
		}

		for (Map.Entry<Double, ArrayList<Integer>> entry: scoresTree.entrySet()) 
            for (Integer i : entry.getValue()){
                docidScoreArray.add(new Pair<Integer, Double>(i, entry.getKey()));
            }
		Collections.reverse(docidScoreArray);
	}
	
	public ArrayList<Pair<Integer, Double>> getResultArray() {
		return docidScoreArray;
	}
}