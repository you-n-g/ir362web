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

//var RETRIEVE_EXEC = '/home/young/workspace/terrier-4.0_w/ir362bin/retrieve.sh';
//var GETDOC_EXEC = '/home/young/workspace/terrier-4.0_w/ir362bin/get_doc.sh';
var RETRIEVE_EXEC = 'ls';
var GETDOC_EXEC = 'cat';
var PORT = 8888;

var spawn = require('child_process').spawn;
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/js/jquery-1.11.1.js', function(req, res) {
	res.sendFile(__dirname + '/jquery-1.11.1.js');
});

io.on('connection', function(socket) {
	var keyword = '';
	var docList = [];
	var snippetList = [];
	socket.on('search', function(msg) {
		console.log('search: ' + msg);
		var req = JSON.parse(msg);
		function getSnippetList() {
			if (req.end > docList.length - 1) {
				req.end = docList.length - 1;
			}
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
					//var getDocProcess = spawn(GETDOC_EXEC, [docList[i]]);
					var getDocProcess = spawn(GETDOC_EXEC, [__dirname + '/' + 'test' + '/' + docList[i]]);
					var getDocOut = '';
					getDocProcess.stdout.on('data', function(data) {
						getDocOut += data;
					});
					getDocProcess.on('close', function(code) {
						snippetList[i] = getDocOut;
						getDocDone();
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
		if (keyword === req.keyword) {
			getSnippetList();
		} else {
			var retrieveProcess = spawn(RETRIEVE_EXEC, [req.keyword]);
			var retrieveOut = '';
			retrieveProcess.stdout.on('data', function(data) {
				retrieveOut += data;
			});
			retrieveProcess.on('close', function(code) {
				keyword = req.keyword;
				docList = retrieveOut.split('\n');
				snippetList = [];
				getSnippetList();
			});
		}
	});
});

http.listen(PORT, function() {
	console.log('Listening on PORT ' + PORT + ' ...');
});
