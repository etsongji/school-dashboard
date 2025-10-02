// Service Worker - PWA 지원
const CACHE_NAME = 'school-dashboard-v2.1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/calendar.js',
  '/js/meal.js',
  '/js/cms-loader.js',
  '/images/school-logo.png',
  '/calendar.html',
  '/notices.html',
  '/rules.html'
];

// 설치 이벤트
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: 캐시 열림');
        return cache.addAll(urlsToCache);
      })
  );
});

// fetch 이벤트
self.addEventListener('fetch', function(event) {
  // NEIS API나 Google API 요청은 캐시하지 않음
  if (event.request.url.includes('open.neis.go.kr') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('content.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 캐시에 있으면 캐시된 버전 반환
        if (response) {
          return response;
        }
        return fetch(event.request).catch(function() {
          // 네트워크 실패시 캐시된 인덱스 페이지 반환
          return caches.match('/');
        });
      }
    )
  );
});

// 활성화 이벤트
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: 이전 캐시 삭제');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});