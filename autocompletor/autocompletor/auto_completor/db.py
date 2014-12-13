#! /usr/bin/env python
#coding=utf-8

"""
@Created on Dec 12, 2014
@Author: Zixuan Zhang

This script provides API to DB
"""

import pymongo

def _get_db(ip = "127.0.0.1"):
    con = pymongo.Connection(ip)
    db = con['search_engine']
    return db

DB = _get_db()

def insert_term(data):
    DB.terms.insert(data);

def get_terms(cond):
    return DB.terms.find(cond)

def get_term(cond):
    return DB.terms.find_one(cond)

def update_term(cond, to):
    DB.terms.update(cond, to)
