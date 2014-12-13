from django.http import HttpResponse

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
    auto_completor.update_query(query)
    return HttpResponse("Success")
