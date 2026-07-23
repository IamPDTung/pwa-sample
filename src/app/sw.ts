import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

let intervalId: number | null = null;

const OFFLINE_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Offline</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#fafafa;color:#333;display:flex;align-items:center;justify-content:center;min-height:100vh}.card{text-align:center;padding:48px 32px;max-width:400px}h1{font-size:24px;font-weight:700;margin-bottom:8px;color:#7c3aed}p{font-size:16px;color:#666;line-height:1.5;margin-bottom:24px}@media(prefers-color-scheme:dark){body{background:#0a0a0a;color:#e5e5e5}p{color:#999}}</style></head><body><div class="card"><h1>You are offline</h1><p>This page has not been cached yet.</p><p style="font-size:13px;color:#999">Visit it while online to make it available offline.</p></div></body></html>`;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    {
      matcher: ({ request, sameOrigin }) =>
        request.mode === "navigate" && sameOrigin,
      handler: new NetworkFirst({
        cacheName: "page-navigations",
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

serwist.setCatchHandler(async ({ request }) => {
  if (request.mode === "navigate") {
    const cached = await caches.match("/offline.html");
    if (cached) return cached;
    const root = await caches.match("/");
    if (root) return root;
    return new Response(OFFLINE_HTML, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  }
  return Response.error();
});

serwist.addEventListeners();

self.addEventListener("message", (event: ExtendableMessageEvent) => {
  const { type, interval } = event.data ?? {};

  if (type === "START_INTERVAL") {
    stopInterval();
    const ms = interval ?? 5000;
    intervalId = self.setInterval(() => {
      self.registration.showNotification("My PWA", {
        body: "Auto notification from Service Worker",
        icon: "/icon-192.png",
        tag: "sw-interval",
        requireInteraction: false,
      });
    }, ms) as unknown as number;
  }

  if (type === "STOP_INTERVAL") {
    stopInterval();
  }
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window" })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            return (client as WindowClient).focus();
          }
        }
        return self.clients.openWindow("/");
      })
  );
});

function stopInterval() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
