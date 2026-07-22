import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

let intervalId: number | null = null;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: defaultCache,
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
