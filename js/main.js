var imgs = $(".posterTrigger");
var test = $(".concept-splash");

var svenska = ["Alla tiders kvinnor", "Badrinath Ki Dulhania - Bollywood", "Den lyckligaste dagen i Olli Mäkis liv", "Den okända flickan", "Dolda tillgångar", "En väldig vänskap",
 "Fantastiska vidunder och var man hittar dem", "Fyren mellan haven", "Hur man får en miljonär", "Jag, Daniel Blake", "Kong - Skull Island", "Logan - The Wolverine",
 "McCabe and Mrs Miller", "Min pappa Toni Erdmann", "Nattportieren - Klassiker", "Prövningen", "Skönheten och odjuret", "Systrar bakom galler", "Vaiana",
 "xXx: The Return of Xander Cage"];

var engelska = ["20th Century Women","Badrinath Ki Dulhania","the happiest day in the life of olli mäki","the unknown girl","hidden figures","Virgin mountain","Fantastic Beasts and Where to Find Them",
"The light between oceans", "How to marry a millionaire", "I, Daniel Blake", "Kong: Skull Island", "Logan", "McCabe & Mrs. Miller", "Toni Erdmann", "The night porter",
"Graduation", "Beauty+and+the+Beast&y=2017", "Prison sisters", "Moana", "xXx: Return of Xander Cage"];

var translated = {};

for (var i = 0; i < svenska.length; i++)
	translated[svenska[i]] = engelska[i];

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

						dblink = '<a target="_blank" class="imex-imdb" href="'+ imdbURL +'">"' +
								'<img class="imex-img" src="'+ imdbIMG +'" /></a>',
						star = '<img class="imex-star" src="'+ imgURL +'" />',
						span = '<span class="imex-bg">'+ rating +'</span>';
					
					container.append(star + span + dblink);
				}
			}
		})($(imgs[i]))
	});
}