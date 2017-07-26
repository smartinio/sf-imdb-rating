const getCache = () => {
        const cache = localStorage.getItem('ratings');
        return cache ? JSON.parse(cache) : [];
      },

      setCache = data => {
        localStorage.setItem('ratings', JSON.stringify(data));
      },
      
      /* Generates a local copy of the DOM from IMDB. */
      getDocument = response => {
        return new DOMParser().parseFromString(response, 'text/html');
      },

      /* Creates a rating component for SF.se. */
      formattedElement = (rating) => {
        const starImage = chrome.extension.getURL('img/icon48.png'),
              pClass = "animated flipInX imdbRating",
              imgStyle = "margin-top:-3px; vertical-align:middle; width:1em; height:1em",
              spanStyle = "color: white";

        let str = `<p class="${pClass}">`;
            str += `<img style="${imgStyle}" src="${starImage}" />`;
            str += `<span style="${spanStyle}">&nbsp;${rating}</span></p>`;

        return $(str);
      },

      isNumeric = n => !isNaN(parseFloat(n)) && isFinite(n),

      /* Parses a movie's IMDB page and saves its rating. */
      parsePage = (response, container, title) => {
        const rateBox = getDocument(response).getElementsByClassName('ratingValue')[0],
              rating = rateBox ? rateBox.children[0].innerText : 'N/A',
              cacheEntry = {title, rating, date: new Date()},
              cache = getCache();

        cache.push(cacheEntry);
        setCache(cache);
        $(container).append(formattedElement(rating));
      },

      /* Parses the result of an IMDB search. Necessary because of swedish titles. */
      parseSearch = (response, container, longTitle, hasRating) => {
        const possibleMovies = Array.from(getDocument(response).querySelectorAll('.result_text')),
              currentYear = new Date().getFullYear(),
              fromNow = (movie) => {
                return   movie.innerText.includes(`(${currentYear})`)
                      || movie.innerText.includes(`(${currentYear + 1})`)
                      || movie.innerText.includes(`(${currentYear - 1})`);
              };

        /* We're only interested in movies from this, last or next year. */
        const result = possibleMovies.find(fromNow);

        if (result) {
          const title = result.firstElementChild.href.split('/')[4];

          chrome.runtime.sendMessage(
            { title, type: 'page' },
            response => parsePage(response, container, longTitle)
          );
        }

        else {
          if (!hasRating) $(container).append(formattedElement('N/A'));
        }
      },

      /* Finds the movie listings and starts the score-retrieving process. */
      scan = () => {
        const containers = $('.ncgShowTitle').toArray().concat($('.ncgMovieTitle').toArray()),
              clearDebris = (container) => {
                return container.innerText.replace(/(\r\n|\n|\r)/gm, '').slice(0,-4)
              }

        for (let container of containers) {
          const hasRating = $(container).is(':has(p.imdbRating)'),
                title = hasRating ? clearDebris(container) : container.innerText,
                cached = getCache().find(r => r.title === title);

          if (cached) {
            if (!hasRating)
              $(container).append(formattedElement(cached.rating));
            continue;
          }

          chrome.runtime.sendMessage(
            { title, type: 'search' },
            response => parseSearch(response, container, title, hasRating)
          );
        }
      },

      isLessThanOneDayOld = ({ date }) => {
        const diff = new Date().getTime() - new Date(date).getTime(),
              limit = 24 * 3600 * 1000;
              
        return diff < limit;
      };

/*  Clear old cache entries. */
setCache(getCache().filter(entry => isLessThanOneDayOld(entry)));

/*  Temporary solution to wait for aurelia to finish loading.  */
$(document).ready(() => { setTimeout(scan, 2000) } );

/*  Re-scan on change (mainly tab-navigation).  */
$('#Aurelia').change(() => { setTimeout(scan, 400) });
