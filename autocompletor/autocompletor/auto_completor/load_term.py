#! /usr/bin/env python
#coding=utf-8

from xpinyin import Pinyin

import db

def _load_term_to_db(fileName):
    p = Pinyin()
    count = 0
    with open(fileName) as fp:
        for line in fp:
            print count
            count += 1
            if(count < 3225):
                continue
            try:
                line = line.decode('gbk')
            except Exception, err:
                print line, err
                continue
            terms = line.split()
            for term in terms:
                if len(term) <= 1:
                    continue
                pinyin = p.get_pinyin(term, "")
                cond = {"_id": term}
                if db.get_term(cond):
                    to = {"$inc": {"accFrequence": 1}}
                    db.update_term(cond, to)
                else:
                    data = {"_id": term,
                            "pinyin": pinyin,
                            "accFrequence": 1,
                            "queryFrequence": 0}
                    db.insert_term(data)

def load_term():
    fileName = "wordfrequency.txt"
    _load_term_to_db(fileName)

if __name__ == "__main__":
    load_term()
