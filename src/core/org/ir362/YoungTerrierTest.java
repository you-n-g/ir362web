package org.ir362;
import java.util.Map;

import org.terrier.matching.ResultSet;
import org.terrier.querying.Manager;
import org.terrier.querying.SearchRequest;
import org.terrier.structures.Index;
import org.terrier.structures.IndexOnDisk;
import org.terrier.utility.ApplicationSetup;

class YoungTerrierTest {
    public static final void main(String args[]) throws Exception {
        System.out.println("Hello index on disk");
        // TODD ApplicationSetup
        String defaultMatching = ApplicationSetup.getProperty("terrier.jsp.matching", "Matching");
        String defaultModel = ApplicationSetup.getProperty("terrier.jsp.model", "PL2");
		IndexOnDisk index = Index.createIndex();
		Manager queryingManager = new Manager(index);
		String query = "test";
		SearchRequest srq = queryingManager.newSearchRequest("YoungQueryID", query); // DOING
		srq.setOriginalQuery(query);
		srq.setControl("start", "0");
		srq.setControl("decorate", "on");
		srq.setControl("end", "100");
		srq.addMatchingModel(defaultMatching, defaultModel);
		queryingManager.runPreProcessing(srq); // Doingf
		queryingManager.runMatching(srq);
		queryingManager.runPostProcessing(srq);
		queryingManager.runPostFilters(srq);
		ResultSet rs = srq.getResultSet();

	
		// displaying
		String[] displayKeys = rs.getMetaKeys();
		String[][] meta = new String[displayKeys.length][];
		
		for(int j=0;j<displayKeys.length;j++)
		{
			meta[j] = rs.getMetaItems(displayKeys[j]);
		}
		double[] scores = rs.getScores();
		for(int i=0;i<rs.getResultSize();i++)
		{
			final int rank = 0 + i + 1;
			System.out.println("Rank="+rank+"\n");		
			for(int j=0;j<displayKeys.length;j++)
			{
				System.out.println("result: "+displayKeys[j]+" "+meta[j][i]+"\n");
			}
			System.out.println("Score: "+ scores[i] + "\n");	
		}

    }
}
