chrome.runtime.onMessage.addListener((request, sender, callback) => {
  const url = 
    request.type === 'search'
    ? 'http://www.imdb.com/find?ref_=nv_sr_fn&q=' + request.title + '&s=all'
    : 'http://www.imdb.com/title/' + request.title;

  $.ajax({
    url,
    success: response => callback(response)
  });
  return true;
});

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.update({ url: 'https://github.com/smartinkth/sf-imdb-rating'})
});