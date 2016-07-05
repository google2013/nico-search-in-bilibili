// ==UserScript==
// @name         SearchInBilibili
// @namespace    SearchInBilibili
// @version      0.1
// @description  Search related videos in bilibili right in a niconico video page
// @author       lhc70000
// @include      http://www.nicovideo.jp/watch/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js
// @grant        GM_xmlhttpRequest
// @connect      search.bilibili.com
// ==/UserScript==
(function () {
	var cssText = '\
body>.biliHintBox {\
  color: #333;\
  font-family: "Microsoft YaHei", Arial, Helvetica, sans-serif;\
  position: fixed;\
  width: 240px;\
  padding: 1em;\
  font-size: 11px;\
  border-radius:3px;\
  background-color: rgba(255,255,255,.8);\
  box-shadow: 0 0 8px #999;\
  z-index: 5004;\
}\
body>.biliHintBox em {\
  background-color: #ffffaa;\
}\
#searchInBilibili {\
  position: relative;\
  padding-left: 10px;\
}\
#searchInBilibili>a {\
  height: 20px;\
  color: #fff;\
  margin-left: 20px;\
  padding: 3px 6px 2px 6px;\
  border: none;\
  border-radius: 2px;\
  background-color: #ffafc9;\
  text-decoration: none;\
  cursor: pointer;\
}\
#searchInBilibili>.searchBox {\
  display: none;\
  color: #333;\
  font-size: 11px;\
  position: absolute;\
  background: #f5f5f5;\
  left: 135px;\
  width: 360px;\
  height: 320px;\
  top: -200px;\
  z-index: 5000;\
  overflow: auto;\
  box-shadow: 0 0 8px #999;\
  border: 1px solid #555;\
  border-radius: 3px;\
  padding: 1em;\
}\
#searchInBilibili>.searchBox center {\
  font-size: 14px;\
  padding-top: 40px;\
}\
#searchInBilibili.open>.searchBox {\
  display:block;\
}\
#searchInBilibili.open>.searchBox>.video {\
  font-family: "Microsoft YaHei", Arial, Helvetica, sans-serif;\
  width: 100%;\
  border-bottom: 1px solid #e5e5e5;\
  padding: 0.5em 0;\
}\
#searchInBilibili.open>.searchBox>.video:hover {\
  background-color: #e5e5e5;\
}\
#searchInBilibili.open>.searchBox>.video:after {\
  clear: both;\
}\
#searchInBilibili>.searchBox>.video .img {\
  float: left;\
  position: relative;\
  margin-right: 10px;\
}\
#searchInBilibili>.searchBox>.video .img>img {\
  width: 80px;\
  height: 50px;\
}\
#searchInBilibili>.searchBox>.video .img>span {\
  position: absolute;\
  padding: 0 3px;\
  right: 0;\
  bottom: 0;\
  background-color:rgba(100,100,100,.6);\
  font-size: 9px;\
  color: #fff\
}\
#searchInBilibili>.searchBox>.video .info {\
  position: relative;\
}\
#searchInBilibili>.searchBox>.video .info>.des {\
  display: none;\
  clear: both;\
}\
#searchInBilibili>.searchBox>.video .info>.headline {\
  height: 32px;\
  overflow: hidden;\
}\
#searchInBilibili>.searchBox>.video .info>.headline span{\
  padding: 0;\
  font-weight: normal;\
}\
#searchInBilibili>.searchBox>.video .info>.headline span.avid{\
  display:none;\
}\
#searchInBilibili>.searchBox>.video .info>.headline span.type{\
  padding: 0 8px;\
  font-size: 10px;\
  border: 1px solid #ccc;\
  border-radius: 8px;\
}\
#searchInBilibili>.searchBox>.video .info>.tags {\
  margin-top: 2px;\
  height: 16px;\
  overflow: hidden;\
}\
#searchInBilibili>.searchBox>.video .info>.tags span{\
  color: #aaa;\
  font-size: 11px;\
  font-weight: normal;\
  padding-left: 0;\
  padding-right: 4px;\
}\
#searchInBilibili>.searchBox>.video .info>.tags span:after {\
  content: " / ";\
}\
#searchInBilibili>.searchBox>.video .info>.tags .watch-num:before {\
  content: "\\25B8";\
}\
#searchInBilibili>.searchBox>.video .info>.tags .hide:before {\
  content: "\\2261";\
}\
#searchInBilibili>.searchBox>.video .info>.tags a {\
  color: #777;\
}\
';
	$('head').append($('<style>' + cssText + '</style>'));
	$(function () {
		var smNum = document.location.pathname.split('/').pop();
		var bLink = 'http://search.bilibili.com/all?keyword=' + smNum;
		var li = $('<li id="searchInBilibili" data-link="' + bLink + '"><a>Bilibili で検索</a></li>');
		var searchBtn = li.find('a');
		var searchWindow = $('<div class="searchBox"><center>検索中<br/>しばらく待ってください</center></div>').appendTo(li);
		var hintBox = $('<div class="biliHintBox"></div>').appendTo($('body')).hide();
		var showHint = function (text, pos) {
			hintBox.html(text).offset(pos).show();
		};
		var hideHint = function () {
			hintBox.hide();
		};
		var bResult;
		// on click
		searchBtn.on('click', function () {
			var self = li;
			if (self.hasClass('open')) {
				self.removeClass('open');
			} else {
				self.addClass('open');
				if (!self.hasClass('loaded')) {
					// perform search if never searched
					GM_xmlhttpRequest({
                        method: "GET",
						url: self.data('link'),
						onload: function (response) {
                            console.log(response);
							var bResult = $(response.responseText).find('.video.matrix').on('mouseover', function () {
								var vm = $(this);
								showHint(vm.find('.des').html(), {
									top: vm.offset().top,
									left: vm.offset().left + vm.outerWidth()
								});
							}).on('mouseleave', function () {
								hideHint();
							});
							// add download link from bilibilijj
							bResult.each(function () {
								var vm = $(this);
								var jjLink = vm.find('.headline a').attr('href').replace('bilibili', 'bilibilijj');
								vm.find('.tags').append($('<span><a href="' + jjLink + '" target="_blank">DL</a></span>'));
							});
							// append result
							searchWindow.empty();
							searchWindow.append(bResult);
							self.addClass('loaded');
						}
					});
				}
				// close search window when clicking outside
				window.setTimeout(function () {
					$('body').one('click', function () {
						self.removeClass('open');
					});
				}, 10);
			}
		});
		var ul = $('ul.videoStats');
		ul.append(li);
	});
})();
