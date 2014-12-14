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

_init()

def _is_chinese(uchar):
    if uchar >= u'\u4e00' and uchar <= u'\u9fa5':
        return True
    else:
        return False

def _str2list(ustring):
    strList = []
    uTemp = ""
    isChinese = True
    for uchar in ustring:
        res = _is_chinese(uchar)
        if res == isChinese:
            uTemp += uchar
        else:
            if uTemp:
                data = {}
                data['string'] = uTemp
                data['isChinese'] = isChinese
                strList.append(data)
            isChinese = res
            uTemp = ""
            uTemp += uchar
    if uTemp:
        data = {}
        data['string'] = uTemp
        data['isChinese'] = isChinese
        strList.append(data)
    return strList
def _is_match(search, res, searchPinyin=None, resPinyin=None):
    lenSearch = len(p.get_pinyin(search, "")) if not searchPinyin \
            else len(searchPinyin)

    lenRes = len(p.get_pinyin(res, "")) if not resPinyin\
            else len(resPinyin)
    if lenSearch > lenRes:
        return False
    strList = _str2list(search)
    start = 0
    end = 1

    for item in strList:
        string = item['string']
        isChinese = item['isChinese']
        if isChinese:
            end = start + len(string)
            if end > len(res):
                #isMatch = False
                return False
            else:
                subString = res[start: end]
                if subString != string:
                    #isMatch = False
                    return False
                else:
                    start = end
        else:
            while True:
                subString = res[start: end]
                pinyin = p.get_pinyin(subString, "")
                if len(pinyin) < len(string):
                    end += 1
                elif len(pinyin) == len(string):
                    if pinyin == string:
                        start = end
                        break
                    else:
                        return False
                else:
                    return False
    return True

def get_matches(query):
    if not isinstance(query, unicode):
        query = query.decode('utf-8')

    string = p.get_pinyin(query, "")
    matches = pinyinTree.get_match(string)
    if not matches:
        return None
    results = {}
    res = {}
    for match in matches:
        #terms = db.get_terms({"pinyin": match, "accFrequence": {"$gt": 5}})
        terms = db.get_terms({"pinyin": match})
        for term in terms:
            if _is_match(query, term['_id'], string, term['pinyin']):
                score = term['accFrequence'] * 0.05 + term['queryFrequence'] * 0.95
                results[term['_id']] = score

    results = sorted(results.items(), key=lambda results: results[1], reverse=True) 
    
    return results[0: min(20, len(results))]

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
            pinyinTree.insert_pinyin(pinyin)
    else:
        data = {"_id": query,
                "pinyin": pinyin,
                "accFrequence": 0,
                "queryFrequence": 1}
        db.insert_term(data)
