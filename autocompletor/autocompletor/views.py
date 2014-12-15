from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

import random
import json
import time
from auto_completor import auto_completor

def get_match(request, param=""):
    start = time.time()
    matches = auto_completor.get_matches(param)
    results = []
    if matches:
        for match in matches:
            results.append(match[0])
    result = json.dumps(results)
    return HttpResponse(result)

def update_query(request, query=""):
    related = auto_completor.update_query(query)
    results = []
    if related:
        for r in related:
            results.append(r[0])
    result = json.dumps(results)
    return HttpResponse(result)

def _cluster(docIDs):
    group1 = []
    group2 = []
    group3 = []
    group4 = []
    count = 0
    while count < len(docIDs):
        if count % 3 == 0:
            group1.append(docIDs[count])
        elif count % 3 == 1:
            group2.append(docIDs[count])
        else:
            group3.append(docIDs[count])
        count += 1
    res = {"group1": group1,
            "group2": group2,
            "group3": group3}
    return res

@csrf_exempt
def cluster(request, req=""):
    post = request.POST
    docIDs = post.get('docIDs', None)
    res = {}
    if not docIDs:
        return HttpResponse(json.dumps(res))
    docIDs = json.loads(docIDs)
    #res = auto_completor.cluster(docIDs)
    res = _cluster(docIDs)
    res = json.dumps(res)
    return HttpResponse(res)
