// No patient data or API responses are cached on the device.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data.json(); } catch {}
  event.waitUntil(self.registration.showNotification('ProFuncional', {
    body: payload.body || 'Tienes un recordatorio del centro. Abre la app para consultarlo.',
    tag: payload.tag || 'profuncional', icon: '/icon-192.png', data: { url: '/' }
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async clients => {
    for (const client of clients) if (new URL(client.url).origin === self.location.origin) { await client.focus(); return; }
    await self.clients.openWindow('/');
  }));
});
