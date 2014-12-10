package org.ir362;

import java.io.IOException;

import net.sf.samtools.util.StringUtil;

import org.ir362.matching.ResultSet;
import edu.uci.ics.crawler4j.frontier.DocIDServer;
import edu.uci.jforests.util.Pair;
import org.ir362.querying.Manager;
import org.ir362.querying.Request;
import org.terrier.structures.Index;
import org.terrier.structures.IndexOnDisk;
import org.terrier.structures.MetaIndex;
import org.terrier.utility.ApplicationSetup;

import antlr.StringUtils;

public class GetDocnos {
	public static void print_docnos(String query) throws IOException {
        String defaultMatching = ApplicationSetup.getProperty("terrier.jsp.matching", "Matching");
        String defaultModel = ApplicationSetup.getProperty("terrier.jsp.model", "PL2");
        IndexOnDisk index = Index.createIndex();
		Manager queryingManager = new Manager(index);
		Request rq = queryingManager.newRequest(query);
		rq.setSearchingModel(defaultMatching, defaultModel);
		queryingManager.preProcess(rq);  // we obtain
		queryingManager.runMatching(rq);
		// TODO 待到需要时再考虑 PostProcessing 和 runPostFilters(rq)
//		queryingManager.runPostProcessing(rq);
//		queryingManager.runPostFilters(rq);
		ResultSet rs = rq.getResultSet();

		// 这段话会得到真正的docid, 即将 230转换为233那段……
		// 即将 docid 转化为docno, 本来在 runPostFilters里运行的
        MetaIndex meta = index.getMetaIndex();
        String[] decorateKeys = meta.getKeys();


		int rank = 0;
		for(Pair<Integer, Double> p : rs.getResultArray())
		{
			rank++;
			//System.out.println("Rank="+rank+"\n");		
            //System.out.println("result: "+ "DocID="+ p.getFirst() + "\n");

            // TODO 一次获取多个 docid 的meta效率应该会更高吧。
            //System.out.println("result: "+ "Docno="+ meta.getItem("docno", p.getFirst()) + "\n");
            System.out.println(meta.getItem("docno", p.getFirst()));

			//System.out.println("Score: "+ p.getSecond() + "\n");	
		}
	}
	public static final void main(String args[]) throws IOException {
		print_docnos(StringUtil.join(" ", args));
	}
}
