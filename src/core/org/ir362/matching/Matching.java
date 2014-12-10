package org.ir362.matching;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.terrier.structures.CollectionStatistics;
import org.terrier.structures.Index;
import org.terrier.structures.Lexicon;
import org.terrier.structures.LexiconEntry;
import org.terrier.structures.Pointer;
import org.terrier.structures.PostingIndex;
import org.terrier.structures.postings.IterablePosting;


/** 匹配的真正代码在我们这里 */ 

public  class Matching
{
	/** The index used for retrieval. */ 
	private Index index;
	private PostingIndex<Pointer> invertedIndex;
	private CollectionStatistics collectionStatistics;
	protected final List<IterablePosting> termPostings = new ArrayList<IterablePosting>();
	protected double numberOfDocuments;
	protected double averageDocumentLength;
	
	/** The lexicon used. */
	protected Lexicon<String> lexicon;
	
	
	public Matching(Index index) 
	{
		this.index = index;
		this.collectionStatistics = index.getCollectionStatistics();
	}


	public ResultSet match(MatchingTerms mt) throws IOException {
		// init some variable
		ResultSet rs = new ResultSet();
		lexicon = index.getLexicon();
		invertedIndex = (PostingIndex<Pointer>) index.getInvertedIndex();
		numberOfDocuments = (double)collectionStatistics.getNumberOfDocuments();
		averageDocumentLength = (double)collectionStatistics.getAverageDocumentLength();
		double df, idf, tf, docLen;


		// calc score
        int docid;
        double score;
        LexiconEntry t;
        IterablePosting ip;

        /** The constant k_1.*/
        double k_1 = 1.2d;
        /** The constant b.*/
        double b = 0.75d;

		for (String term: mt.getTerms()) {
                t = lexicon.getLexiconEntry(term);
                if (t == null) continue; // 如果都没有出现这个词项，则跳过
                df = (double)t.getDocumentFrequency();
                idf = Math.log(numberOfDocuments / df); // 这个+1到底要不要

                ip = invertedIndex.getPostings((Pointer) t);
                while (ip.next() != IterablePosting.EOL) {
                        docid = ip.getId();
                        tf = ip.getFrequency();
                        docLen = ip.getDocumentLength();
                        double Robertson_tf = k_1*tf/(tf+k_1*(1-b+b*docLen/averageDocumentLength));
                        score = Robertson_tf * idf;
                        rs.scoresMap.adjustOrPutValue(docid, score, score);
                }
                // close
                ip.close();
		}
        return rs;
	}
}
