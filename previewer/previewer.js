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
