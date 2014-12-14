from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

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
@csrf_exempt
def cluster(request, req=""):
    post = request.POST
    docIDs = post.get('docIDs', None)
    docIDs = json.loads(docIDs)
    res = auto_completor.cluster(docIDs)
    res = json.dumps(res)
    return HttpResponse(res)
