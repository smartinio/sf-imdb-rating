const starImage = chrome.extension.getURL('img/icon48.png'),

      getCache = () => {
        const cache = localStorage.getItem('ratings');
        return cache ? JSON.parse(cache) : [];
      },

      setCache = data => {
        localStorage.setItem('ratings', JSON.stringify(data));
      },
      
      /* Used to generate a local copy of the DOM from IMDB */
      getDocument = response => {
        return new DOMParser().parseFromString(response, 'text/html');
      },

      /* Used to generate the rating component on SF.se */
      formattedElement = (rating) => {
        let str = `<p class="animated flipInX imdbRating">`;
            str += `<img style="margin-top:-3px;vertical-align:middle;width:1em;height:1em" src="${starImage}" />`;
            str += `<span style="color:white">&nbsp;${rating}</span></p>`;
        return $(str);
      },

      isNumeric = n => !isNaN(parseFloat(n)) && isFinite(n),

      /* Parses a movie's IMDB page and saves its rating */
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
        const results = getDocument(response).getElementsByClassName('result_text'),
              currentYear = new Date().getFullYear(),
              years = [currentYear, currentYear+1, currentYear-1];

        let result = false;

        /* Only interested in movies from this, last or next year */
        outer:
        for (let year of years) {
          for (key in results) {
            if (!isNumeric(key)) continue;
            if (results[key].innerText.includes(`(${year})`)) {
              result = results[key];
              break outer;
            }
          }
        }

        let title = '';

        if (result) {
          title = result.firstElementChild.href.split('/')[4];
          chrome.runtime.sendMessage({ title, type: 'page' }, response => parsePage(response, container, longTitle));
        }

        else {
          if (!hasRating) $(container).append(formattedElement('N/A'));
        }
      },

      /* Find the movie listings and start the score-retrieving process */
      scan = () => {
        const containers = $('.ncgShowTitle').toArray().concat($('.ncgMovieTitle').toArray());

        for (let container of containers) {
          const hasRating = $(container).is(':has(p.imdbRating)'),
                title = hasRating? container.innerText.replace(/(\r\n|\n|\r)/gm, '').slice(0,-4) : container.innerText,
                cached = getCache().find(r => r.title === title);

          if (cached) {
            if (!hasRating)
              $(container).append(formattedElement(cached.rating));
            continue;
          }

          else {
            chrome.runtime.sendMessage({ title, type: 'search' }, response => parseSearch(response, container, title, hasRating));
          }
        }
      },

      isNew = date => {
        const diff = new Date().getTime() - new Date(date).getTime(),
              limit = 1000 * 3600;
        return Math.abs(diff) < limit;
      };

/*  Clear old cache entries */
setCache(getCache().filter(r => isNew(r.date)));

/*  Temporary solution to wait for aurelia to finish loading  */
$(document).ready(() => { setTimeout(scan, 2000) } );

/*  Re-scan on change (mainly tab-navigation)  */
$('#Aurelia').change(() => { setTimeout(scan, 400) });