#! /usr/bin/env python

"""
@Created on Dec 12, 2014
@Author: Zixuan

This Script Provides Basic API
    1. Get Matches
    2. Record Query, Update DB and PinyinTree
"""
import time

from xpinyin import Pinyin

import db
from pinyin_tree import PinyinTree

pinyinTree = PinyinTree()
p = Pinyin()

def _init():
    #terms = db.get_terms({"accFrequence": {"$gt": 300}})
    terms = db.get_terms({"$or": [{"accFrequence": {"$gt": 200}},\
            {"queryFrequence": {"$gt": 3}}]})
    for term in terms:
        pinyin = term['pinyin']
        pinyinTree.insert_pinyin(pinyin)

start = time.time()
_init()

def get_matches(query):
    start = time.time()
    if not isinstance(query, unicode):
        query = query.decode('utf-8')

    string = p.get_pinyin(query, "")
    matches = pinyinTree.get_match(string)
    if not matches:
        return None
    results = {}
    for match in matches:
        #terms = db.get_terms({"pinyin": match, "accFrequence": {"$gt": 5}})
        terms = db.get_terms({"pinyin": match})
        for term in terms:
            t = term['_id']
            score = term['accFrequence'] * 0.05 + term['queryFrequence'] * 0.95
            results[term['_id']] = score

    res = {}
    for result in results:
        if result.startswith(query):
            res[result] = results[result]
    res= sorted(res.items(), key=lambda res: res[1], reverse=True) 
    return res[0: min(20, len(res))]

def update_query(query):
    if not isinstance(query, unicode):
        query = query.decode('utf-8')
    pinyin = p.get_pinyin(query, "")
    cond = {"_id": query}
    res = db.get_term(cond)
    if res:
        to = {"$inc": {"queryFrequence": 1}}
        db.update_term(cond, to)
        if res[u'queryFrequence'] > 2:
            pinyinTree.insert_pinyin(query)
    else:
        data = {"_id": query,
                "pinyin": pinyin,
                "accFrequence": 0,
                "queryFrequence": 1}
        db.insert_term(data)
