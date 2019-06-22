async function installServiceWorker() {
  const reg = await navigator.serviceWorker.register('./service-worker.js');
  console.log('[SW] Register', reg);
}

installServiceWorker();

navigator.serviceWorker.addEventListener('message', async event => {
  const message = event.data;
  switch (message.type) {
    case 'sw/install': {
      // eslint-disable-next-line no-alert
      const ok = window.confirm('New version is available. Reload now?');
      if (ok) {
        window.location.reload();
      }
      break;
    }

    default: // do nothing
  }
});

/**
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise(f => setTimeout(f, ms));
}

async function main() {
  const reg = await navigator.serviceWorker.ready;
  if (reg.waiting) {
    await sleep(500); // just in case when infinite loop occurs accidentally

    const message = { type: 'sw/skipWaiting' };
    reg.waiting.postMessage(message);
    window.location.reload();

    return;
  }

  console.log('[main] Ready!');
}

main();
