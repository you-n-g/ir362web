/*
 * Author: Zhu Qichen <zhuqichen14@mails.ucas.ac.cn>
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

var query_executable = '/home/young/workspace/terrier-4.0_w/ir362bin/retrieve.sh';
var getdoc_executable = '/home/young/workspace/terrier-4.0_w/ir362bin/get_doc.sh';
var port = 8888;

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
	console.log('A user connected.');
	socket.on('chat message', function(msg) {
		console.log('Message: ' + msg);
		var query = spawn(query_executable, [msg]);
		var out = '';
        var err_out = '';
		var err = false;
		query.stdout.on('data', function (data) {
				out += data;
		});
		query.stderr.on('data', function (data) {
				err = true;
				err_out += data;
		});
		query.on('close', function (code) {
            /* 我们不管error了
			if (out == '' && err) {
				err_out = 'Error code ' + code;
				socket.emit('chat message', JSON.stringify([err_out]));
			} 
            */
            if (out) {
				var docId = out.split('\n');
				var send = [];
				var count = 0;
				function getDocDone() {
					count++;
					if (count == docId.length) {
						socket.emit('chat message', JSON.stringify(send));
					}
				}
				function getDoc(i) {
					if (docId[i] === '') {
						getDocDone();
					} else {
						var get = spawn(getdoc_executable, [docId[i]]);
						var out = '';
						var err = false;
						get.stdout.on('data', function (data) {
								out += data;
						});
						get.stderr.on('data', function (data) {
								err = true;
								out += data;
						});
						get.on('close', function (code) {
								if (err) {
									out = 'Error code ' + code;
								}
								send[i] = out;
								getDocDone();
						});
					}
				}
				for (var i = 0; i < docId.length; i++) {
					getDoc(i);
				}
			} else {
                socket.emit('chat message', JSON.stringify(["未检索到任何信息"]));
            }
		});
	});
	socket.on('disconnect', function() {
		console.log('A user disconnected.');
	});
});

http.listen(port, function() {
	console.log('Listening on port ' + port + ' ...');
});
