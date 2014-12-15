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

var server = require('webserver').create();
var WIDTH = 588;
var HEIGHT = 833;
var gallery = {};

server.listen(8889, function(request, response) {
	var url = request.url.substr(request.url.indexOf('url=') + 4);
	function res() {
		response.statusCode = 200;
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.write(JSON.stringify({url: url, image: gallery[url]}));
		response.close();
	}
		
	if (gallery[url]) {
		console.log('Cache: ' + url);
		res();
	} else {
		console.log('New: ' + url);
		var page = new WebPage();
		page.settings.loadImages = true;
		page.settings.javascriptEnabled = false;
		page.resourceTimeout = 300;
		page.viewportSize = {width: WIDTH, height: HEIGHT};
		page.clipRect = {top: 90, left: 33, width: WIDTH, height: HEIGHT};
		//page.zoomFactor = 1;
		page.open(url, function() {
			gallery[url] = page.renderBase64('PNG');
			page.close();
			res();
		});
	}
});
