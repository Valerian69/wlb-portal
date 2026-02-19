// Empty service worker - placeholder for PWA support
// This file prevents 404 errors from browsers/extensions requesting /service-worker.js

self.addEventListener('install', (event) => {
  // No-op - service worker not active
});

self.addEventListener('fetch', (event) => {
  // No-op - all requests go to network
});
