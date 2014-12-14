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

var socket = io();
var userHash = true;

function search(startPage) {
	start = startPage;
	end = start + DOC_PER_PAGE;
	var newHash = '#keyword=' + encodeURIComponent(keyword) + '&start=' + start + '&end=' + end;
	var newHashOrigin = '#keyword=' + keyword + '&start=' + start + '&end=' + end;
	if (location.hash !== newHash && location.hash !== newHashOrigin) {
		userHash = false;
	}
	location.hash = newHash;
	socket.emit('search', JSON.stringify({keyword: keyword, start: start, end: end}));
	$('#suggest').hide();
	$('#suggest').empty();
}

if ($('body').hasClass('initial')) {
	$('#m').focus();
}

socket.on('search', function(msg) {
	$('#result').empty();
	var res = JSON.parse(msg);
	keyword = res.keyword;
	$('#m').val(keyword);
	document.title = keyword + ' - ' + siteTitle;
	docCount = res.docCount;
	pageCount = Math.ceil(docCount / DOC_PER_PAGE);
	if (docCount > 0) {
		$('#docCount').text(docCount);
		$('#resultStat').removeClass('noResult');
		for (var i = 0; i < res.snippetList.length; i++) {
			try {
				var outline = JSON.parse(res.snippetList[i]);
			} catch (e) {
				$('#result').append($('<li>').text(res.snippetList[i]));
				continue;
			}
			var newDoc = $('#template').clone().removeAttr('id');
			var protocol = 'http://';
			if (outline.url.substr(0, 7) === protocol) {
				outline.url = outline.url.substr(7);
			} else {
				protocol = '';
			}
			newDoc.find('.title').text(outline.title).attr('href', protocol + outline.url).attr('target', '_blank');
			newDoc.find('.url').text(outline.url);
			newDoc.find('.url').html(newDoc.find('.url').html().replace(new RegExp(keyword, 'g'), '<span class="keyword">' + keyword + '</span>'));
			newDoc.find('.date').text(outline.date + ' - ');
			newDoc.find('.commentNumber').text(outline.commentNumber + ' 条评论 - ');
			newDoc.find('.snippet').text(outline.snippet);
			newDoc.find('.snippet').html(newDoc.find('.snippet').html().replace(new RegExp(keyword, 'g'), '<span class="keyword">' + keyword + '</span>'));
			$('#result').append(newDoc);
		}
	} else {
		$('#resultStat').addClass('noResult');
	}
	pageNum = Math.ceil(res.start / DOC_PER_PAGE);
	var startPage = pageNum - 5;
	if (startPage < 0) {
		startPage = 0;
	}
	var endPage = startPage + 10;
	if (endPage > pageCount) {
		endPage = pageCount;
		startPage = endPage - 10;
		if (startPage < 0) {
			startPage = 0;
		}
	}
	$('#pageNum').empty();
	function addPage(i) {
		var newPage = $('<a>').text(i + 1);
		if (i != pageNum) {
			newPage.click(function() {
				search(DOC_PER_PAGE * i);
			});
		} else {
			newPage.addClass('currentPage');
		}
		$('#pageNum').append(newPage);
	}
	for (var i = startPage; i < endPage; i++) {
		addPage(i);
	}
	var onePage = true;
	if (pageNum > 0) {
		onePage = false;
		$('#pageCtrl').removeClass('isFirst');
	} else {
		$('#pageCtrl').addClass('isFirst');
	}
	if (res.start + res.snippetList.length < docCount) {
		onePage = false;
		$('#pageCtrl').removeClass('isLast');
	} else {
		$('#pageCtrl').addClass('isLast');
	}
	if (onePage) {
		$('#pageCtrl').addClass('onePage');
	} else {
		$('#pageCtrl').removeClass('onePage');
	}
	$('body').removeClass('initial');
	window.scrollTo(0, 0);
});

function updateQuery() {
	$.get(suggestUrl + '/update_query/' + encodeURIComponent(keyword), function(data) {
		$('#relativel').empty();
		$('#relativer').empty();
		var originList = JSON.parse(data);
		var list = [];
		for (var i = 0; i < originList.length; i++) {
			if (originList[i] && originList[i].length > keyword.length) {
				list.push(originList[i]);
			}
		}
		var lcount = Math.ceil(list.length / 2);
		function relClick() {
			$('#m').val($(this).text());
			$('#searchForm').submit();
		}
		for (var i = 0; i < lcount; i++) {
			var rellink = $('<a>').text(list[i]);
			rellink.click(relClick);
			$('#relativel').append($('<li>').append(rellink));
		}
		for (var i = lcount; i < list.length; i++) {
			var rellink = $('<a>').text(list[i]);
			rellink.click(relClick);
			$('#relativer').append($('<li>').append(rellink));
		}
		if (lcount) {
			$('#relative').show();
		}
	});
}

$('#searchForm').submit(function() {
	keyword = $('#m').val();
	if (keyword !== '') {
		$('#m').blur();
		search(0);
		$('#relative').hide();
		updateQuery();
	} else {
		$('body').addClass('initial');
		location.hash = '';
	}
	return false;
});

$('#prevPage').click(function() {
	if (pageNum > 0) {
		search(DOC_PER_PAGE * (pageNum - 1));
	}
});

$('#nextPage').click(function() {
	if (pageNum < pageCount - 1) {
		search(DOC_PER_PAGE * (pageNum + 1));
	}
});

$(document).click(function (e) {
	if ($('#suggest')[0] !== e.target && !$.contains($('#suggest')[0], e.target) && $('#m')[0] !== e.target && !$.contains($('#m')[0], e.target)) {
		$('#suggest').hide();
		$('#suggest').empty();
	}
});

var lastValue = $('#m').val();
var timerId = null;
$('#m').keydown(function(e) {
	if (e.which === 40 || e.which === 38) {
		return false;
	}
});

$('#m').keyup(function(e) {
	if (e.which === 40) {
		var current = $('#suggest').find('.selected');
		if (current.length) {
			if (current.next().length) {
				lastValue = current.next().text();
				$('#m').val(lastValue);
				current.next().addClass('selected');
			} else {
				$('#m').focus();
			}
			current.removeClass('selected');
		} else {
			var first = $('#suggest').find('li:first');
			if (first.length) {
				lastValue = first.text();
				$('#m').val(lastValue);
				first.addClass('selected');
			}
		}
	} else if (e.which === 38) {
		var current = $('#suggest').find('.selected');
		if (current.length) {
			if (current.prev().length) {
				lastValue = current.prev().text();
				$('#m').val(lastValue);
				current.prev().addClass('selected');
			} else {
				$('#m').focus();
			}
			current.removeClass('selected');
		} else {
			var last = $('#suggest').find('li:last');
			if (last.length) {
				lastValue = last.text();
				$('#m').val(lastValue);
				last.addClass('selected');
			}
		}
	} else if (lastValue !== $('#m').val()) {
		if (timerId !== null) {
			clearTimeout(timerId);
			timerId = null;
		}
		lastValue = $('#m').val();
		if (lastValue) {
			timerId = setTimeout(function() {
				timerId = null;
				var requestValue = lastValue;
				$.get(suggestUrl + '/get_match/' + encodeURIComponent(requestValue), function(data) {
					var list = JSON.parse(data);
					if (list.length) {
						$('#suggest').empty();
						var count = 0;
						for (var i = 0; i < list.length && count < 8; i++) {
							if (list[i] !== lastValue) {
								$('#suggest').append($('<li>').text(list[i]));
								count++;
							}
						}
						if (count && requestValue === $('#m').val() && $('#m').is(":focus")) {
							$('#suggest').show();
						} else {
							$('#suggest').hide();
							$('#suggest').empty();
						}
					}
				});
			}, 300);
		} else {
			$('#suggest').hide();
			$('#suggest').empty();
		}
	}
});

$('#suggest').mouseenter(function() {
	$('#suggest').find('.selected').removeClass('selected');
});

$('#suggest').click(function() {
	var current = $('#suggest').find('li:hover');
	if (current.length) {
		$('#m').val(current.text());
		$('#searchButton').trigger('click');
	}
});

$(window).bind('hashchange', function() {
	if (userHash) {
		parseQuery();
		if (keyword) {
			search(start);
			updateQuery();
		} else {
			$('body').addClass('initial');
			$('#m').focus();
			$('#result').empty();
		}
	} else {
		userHash = true;
	}
});

if (keyword) {
	search(start);
	updateQuery();
}
