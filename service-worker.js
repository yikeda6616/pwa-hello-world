/** @type {ServiceWorkerGlobalScope} */
// @ts-ignore
// eslint-disable-next-line no-restricted-globals
const sw = self;

async function updateCache() {
  const cache = await sw.caches.open('pwa-hello-world');
  await cache.addAll(['/pwa-hello-world/']);
}

sw.addEventListener('install', event => {
  console.log('[SW] Install');
  const p = updateCache().then(async () => {
    const clients = await sw.clients.matchAll({ includeUncontrolled: true });
    clients.forEach(client => {
      const message = { type: 'sw/install' };
      client.postMessage(message);
    });
  });
  event.waitUntil(p);
});

sw.addEventListener('activate', event => {
  console.log('[SW] Activate');
  sw.clients.claim();
});

/**
 * @param {RequestInfo} key
 */
async function loadCache(key) {
  const cache = await sw.caches.open('pwa-hello-world');
  return (await cache.match(key)) || new Response('', { status: 404 });
}

sw.addEventListener('fetch', event => {
  const sUrl = event.request.url;
  // console.log('[SW] Fetch', sUrl);

  const url = new URL(sUrl);
  if (url.pathname === '/pwa-hello-world/') {
    const p = loadCache(url.pathname);
    event.respondWith(p);
  }
});

setInterval(async () => {
  const text = 'SW#1';
  console.log(`[SW] ${text}`);
  const clients = await sw.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      text,
      type: 'ping'
    });
  });
}, 1000);

sw.addEventListener('message', async event => {
  const message = event.data;

  switch (message.type) {
    case 'sw/skipWaiting': {
      sw.skipWaiting();
      break;
    }

    default: // do nothing;
  }
});
