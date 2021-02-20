//https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook
//https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker

'use strict';

const cachingStrategies = {
  CACHE_THEN_NETWORK: 0,        //fast app startup times, needs valid implementation in websites js
  CACHE_FALLBACK_NETWORK: 1,    //datasaver mode, refresh triggered by websites js
  NETWORK_FALLBACK_CACHE: 2     //normal mode for supporting basic offline usage
};

const usedCachingStrat = cachingStrategies.NETWORK_FALLBACK_CACHE;

var LASTCACHEUPDATE = Date.now();

const STATIC_CACHE = [

];

self.addEventListener('install', (evt) => {
  caches.open('static-cache').then((cache) => {
    cache.addAll(STATIC_CACHE);
  });
});

function clearDynamicCache(urlcontains) {
  caches.open('dynamic-cache').then((cache) => {
    cache.keys().then(function(keys) {
      keys.forEach(function(request) {
        if (typeof(urlcontains) !== undefined) {
          if(request.url.indexOf(urlcontains) > -1) {
            cache.delete(request);
          }
        } else {
          cache.delete(request);
        }
      });
    });
  });
  LASTCACHEUPDATE = new Date();
}

self.addEventListener('message', function (evt) {
  if (evt.data.do === 'clearDynamicCache') {
    clearDynamicCache();
  }
})

self.addEventListener('message', function (evt) {
  if (evt.data.do === 'clearAPICache') {
    clearDynamicCache("/api/");
  }
})

self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.open('static-cache').then((cache) => {
      return cache.match(evt.request).then((response) => {
        if(response !== undefined) return response;
        switch(usedCachingStrat) {

          case cachingStrategies.CACHE_THEN_NETWORK:                          //needs valid implementation in websites js
            return caches.open('dynamic-cache').then((cache) => {
              return fetch(evt.request).then((response) => {
                if (evt.request.method === 'GET') {
                  cache.put(evt.request, response.clone());
                }
                return response;
              });
            });
            break;

          case cachingStrategies.CACHE_FALLBACK_NETWORK:
            return caches.open('dynamic-cache').then((cache) => {
              return cache.match(evt.request).then((response) => {
                return response || fetch(evt.request).then((response) => {
                  if (evt.request.method === 'GET') {
                    //cache.put(evt.request, response.clone());                 //comment to disable dynamic caching
                  }
                  return response;
                });
              });
            });
            break;

          case cachingStrategies.NETWORK_FALLBACK_CACHE:
            return caches.open('dynamic-cache').then((cache) => {
              return fetch(evt.request).then((response) => {
                if (evt.request.method === 'GET') {
                  //cache.put(evt.request, response.clone());                   //comment to disable dynamic caching
                }
                return response;
              }).catch(() => {
                return cache.match(evt.request);
              });
            });
            break;

        }
      });
    })
  );
});
