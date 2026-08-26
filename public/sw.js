// Minimal service worker.
// Job: make the app installable (PWA) and serve the app shell
// from cache when offline. Data (tasks) always goes over the network
// since it must stay fresh — the SW intentionally does NOT cache Supabase/API calls.

const CACHE = "family-app-v1";
const APP_SHELL = ["/", "/tasks", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only touch same-origin GET requests; everything else (POST mutations,
  // Supabase calls to another domain) goes straight to the network.
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  // Network-first: try the network, fall back to cache if offline.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached ?? caches.match("/"))),
  );
});

// A push notification arrived — show it. Payload is JSON from sendPushToUser.
self.addEventListener("push", (event) => {
  let data = { title: "Obiteljska aplikacija", body: "", url: "/tasks" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // If the payload isn't JSON, use the text as the message body.
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/tasks" },
    }),
  );
});

// Click on a notification — open (or focus) the app at the requested URL.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/tasks";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      }),
  );
});
