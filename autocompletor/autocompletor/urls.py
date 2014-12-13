from django.conf.urls import patterns, include, url
from django.contrib import admin

from autocompletor.views import get_match
from autocompletor.views import update_query

urlpatterns = patterns('',
    url(r'^get_match/([^/]*)$', get_match),
    url(r'^update_query/([^/]*)$', update_query),
)
