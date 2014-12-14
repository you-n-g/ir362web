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

var siteTitle = '362 搜索';
var suggestUrl = 'http://192.168.56.101:8000';
var DOC_PER_PAGE = 10;
var keyword;
var docCount = 0;
var pageNum = 0;
var pageCount = 0;
var start;
var end;

document.title = siteTitle;

function parseQuery() {
	keyword = '';
	start = 0;
	end = 0;
	var queryString = location.hash.substr(1).split('&');
	for (var i = 0; i < queryString.length; i++) {
		if (queryString[i].indexOf('keyword=') === 0) {
			keyword = decodeURIComponent(queryString[i].split('keyword=')[1]);
		} else if (queryString[i].indexOf('start=') === 0) {
			start = parseInt(queryString[i].split('start=')[1]);
		} else if (queryString[i].indexOf('end=') === 0) {
			end = parseInt(queryString[i].split('end=')[1]);
		}
	}
	if (keyword && end) {
		DOC_PER_PAGE = end - start;
	}
}

if (location.hash) {
	parseQuery();
	if (keyword) {
		$('body').removeClass('initial');
	}
}