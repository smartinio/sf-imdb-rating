chrome.browserAction.onClicked.addListener(function() {
	chrome.tabs.update({ url: "https://github.com/smartinkth/sf-imdb-rating"})
});