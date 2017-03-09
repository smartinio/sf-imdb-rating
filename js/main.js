var imgs = $('.posterTrigger');
var test = $('.concept-splash');

for (var i = 0; i < imgs.length; i++) {
  var rating,
    title = $(imgs[i]).find('img')[0].alt;

  if (title in translated)
    title = translated[title];
  
  $.ajax({
    url: 'http://www.omdbapi.com/?t=' + title, 
    success:
    (function(container) {
      return function(data) {
        rating = data.imdbRating;
        if (rating && rating != 'N/A') {
          var imgURL = chrome.extension.getURL('img/star.png'),
            imdbIMG = chrome.extension.getURL('img/imdb.png'),
            imdbURL = 'http://www.imdb.com/title/' + data.imdbID,

            star = '<img class="imex-star" src="'+ imgURL +'" />',
            span = '<span class="imex-bg">'+ rating +'</span>';
            dblink = '<a target="_blank" class="imex-imdb" href="'+ imdbURL +'">' +
                '<img class="imex-img" src="'+ imdbIMG +'" /></a>',
          
          container.append(star + span + dblink);
        }
      }
    })($(imgs[i]))
  });
}