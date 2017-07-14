const starImage = chrome.extension.getURL('img/icon48.png'),

      getCache = () => {
        const cache = localStorage.getItem('ratings');
        return cache ? JSON.parse(cache) : [];
      },

      setCache = data => {
        localStorage.setItem('ratings', JSON.stringify(data));
      },
    
      getDocument = response => {
        return new DOMParser().parseFromString(response, 'text/html');
      },

      formattedElement = rating => {
        let str = `<p><img style="margin-top:-3px;vertical-align:middle;width:1em;height:1em" src="${starImage}"/>`;
            str += `<span style="color:white">&nbsp;${rating}</span></p>`;
        return $(str);
      },

      parsePage = (response, container, title) => {
        const rating = getDocument(response).getElementsByClassName('ratingValue')[0].children[0].innerText,
              cacheEntry = {title, rating, date: new Date()},
              cache = getCache();

        cache.push(cacheEntry);
        setCache(cache);
        $(container).append(formattedElement(rating));
      },

      parseSearch = (response, container) => {
        const result = getDocument(response).getElementsByClassName('result_text')[0],
              title = result.firstElementChild.href.split('/')[4],
              cached = getCache().find(r => r.title === title);

        if (cached) $(container).append(formattedElement(cached.rating));
        else chrome.runtime.sendMessage({ title, type: 'page' }, response => parsePage(response, container, title));
      },

      scan = () => {
        const containers = $('.ncgShowTitle').toArray().concat($('.ncgMovieTitle').toArray());

        for (let container of containers) {
          const title = container.innerText;
          chrome.runtime.sendMessage({ title, type: 'search' }, response => parseSearch(response, container));
        }
      },

      isNew = date => {
        const diff = new Date().getTime() - new Date(date).getTime(),
              limit = 1000 * 3600;
        return Math.abs(diff) < limit;
      };

setCache(getCache().filter(r => isNew(r.date)));
document.addEventListener('aurelia-composed', function() { setTimeout(scan, 2000) }, true);