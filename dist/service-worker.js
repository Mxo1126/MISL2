"use strict";
/// <reference lib="webworker" />
const CACHE_NAME = 'misl-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/dist/js/main.js',
    '/images/MISL.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS_TO_CACHE)));
});
self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request)
        .then(response => {
        if (response) {
            return response;
        }
        return fetch(event.request)
            .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
                .then(cache => {
                cache.put(event.request, responseToCache);
            });
            return response;
        });
    }));
});
self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then(cacheNames => {
        return Promise.all(cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName)));
    }));
});
