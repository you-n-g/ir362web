/*
 * Author: Zhu Qichen
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var RETRIEVE_URL = 'http://192.168.56.101:8080/IR362Server/GetSearchResults?q=';
var GETDOC_URL = 'http://192.168.56.101:8080/IR362Server/GetDocInfo?id=';
var SUGGEST_URL = 'http://192.168.56.101:8000/cluster/';
var PORT = 8888;

var spawn = require('child_process').spawn;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var path = require('path');

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));

io.on('connection', function(socket) {
	var keyword = '';
	var docList = [];
	var snippetList = [];
	var groups = null;
	socket.on('search', function(msg) {
		console.log('search: ' + msg);
		var req = JSON.parse(msg);
		function getSnippetList() {
			var count = 0;
			function getDocDone() {
				count++;
				if (count >= req.end - req.start) {
					socket.emit('search', JSON.stringify({keyword: keyword, docCount: docList.length - 1, start: req.start, snippetList: snippetList.slice(req.start, req.end)}));
				}
			}
			function getDoc(i) {
				if (typeof(snippetList[i]) !== 'undefined') {
					getDocDone();
				} else {
					request(GETDOC_URL + docList[i], function (error, response, body) {
						if (!error && response.statusCode == 200) {
							snippetList[i] = body;
							getDocDone();
						}
					});
				}
			}
			if (req.end <= req.start) {
				getDocDone();
			} else {
				for (var i = req.start; i < req.end; i++) {
					getDoc(i);
				}
			}
		}
		function cluster() {
			var length = docList.length;
			if (length > 50) {
				length = 50;
			}
			request.post({
				url: SUGGEST_URL,
				formData: {docIDs: JSON.stringify(docList.slice(0, length))}
			}, function callback(error, response, data) {
				if (!error && response.statusCode == 200) {
					groups = JSON.parse(data);
					var whichGroup = [];
					var groupCount = {};
					for (var j in groups) {
						groupCount[j] = groups[j].length;
					}
					for (var i = req.start; i < req.end; i++) {
						for (var j in groups) {
							if (groups[j].indexOf(docList[i]) >= 0) {
								whichGroup[i] = j;
								break;
							}
						}
					}
					socket.emit('cluster', JSON.stringify({
						keyword: keyword,
						docCount: docList.length - 1,
						start: req.start,
						groupCount: groupCount,
						group: whichGroup
					}));
				}
			});
		}
		
		if (keyword === req.keyword) {
			getSnippetList();
		} else {
			request(RETRIEVE_URL + req.keyword, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					docList = JSON.parse(body);
					keyword = req.keyword;
					snippetList = [];
					if (req.end > docList.length - 1) {
						req.end = docList.length - 1;
					}
					getSnippetList();
					groups = null;
					cluster();
				}
			});
		}
	});
});

http.listen(PORT, function() {
	console.log('Listening on PORT ' + PORT + ' ...');
});
