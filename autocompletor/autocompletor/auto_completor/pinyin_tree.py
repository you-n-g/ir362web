#! /usr/bin/env python
#coding=utf-8

from xpinyin import Pinyin
import db

class Node(object):
    """
    Pinyin Tree Node Class
    """
    def __init__(self, character="$", isEnd=False):
        character = character.lower()
        self.char = character
        self.isEnd = isEnd
        self.childs = {}

class PinyinTree(object):
    """
    Pinyin Tree
    """
    def __init__(self):
        self.root = Node(character="$", isEnd=False)
        self.pinyin_count = 0

    def insert_pinyin(self, pinyin):
        current = self.root
        self.pinyin_count += 1
        count = 0
        for char in pinyin:
            if char not in current.childs:
                if count == (len(pinyin) - 1):
                    child = Node(char, isEnd=True)
                else:
                    child = Node(char, isEnd=False)
                current.childs[char] = child
            elif count == (len(pinyin) - 1) and not current.childs[char].isEnd:
                current.childs[char].isEnd = True
            count += 1
            current = current.childs[char]

    def _loads_candidates(self, node, pinyin, candidates):
        if node.isEnd:
            p = ""
            for c in pinyin:
                p += c
            candidates.append(p)
        for child in node.childs:
            pinyin.append(child)
            self._loads_candidates(node.childs[child], pinyin, candidates)
            pinyin.pop()

    def get_match(self, string):
        """
        Get All Candidates which Match String
        """
        current = self.root
        count = 0
        for char in string:
            if char not in current.childs:
                return None
            current = current.childs[char]

        #which means matching
        candidates = []
        pinyin = []
        self._loads_candidates(current, pinyin, candidates)
        matches = []
        for candidate in candidates:
            matches.append(string + candidate)
        return matches

    def _load_chars(self, node, pinyin):
        pinyin.append(node.char)
        if node.isEnd:
            p = ""
            for c in pinyin:
                p += c
            print p
        for child in node.childs:
            self._load_chars(node.childs[child], pinyin)
            pinyin.pop(len(pinyin) - 1)

    def print_pinyins(self):
        """
        Print All Pinyins in PinyinTree
        """
        pinyin = []
        node = self.root
        self._load_chars(node, pinyin)



