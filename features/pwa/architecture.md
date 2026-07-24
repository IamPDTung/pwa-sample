# PWA — Kiến trúc & Luồng hoạt động

## Tổng quan
Dự án sử dụng `@serwist/next` để biến ứng dụng Next.js thành PWA có thể cài đặt trên desktop/mobile.

## Cấu hình

### `next.config.ts`
```ts
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",           // Source service worker
  swDest: "public/sw.js",           // Output sau khi compile
  register: false,                   // Đăng ký thủ công (manual)
  disable: process.env.NODE_ENV !== "production", // Tắt SW ở dev
});
```

**Tại sao `register: false`?**
SW được đăng ký thủ công từ component client `register-pwa.tsx` để kiểm soát thời điểm đăng ký.

**Tại sao `disable` ở dev?**
Service worker intercept các HTTP request. Trong môi trường dev với webpack HMR, SW sẽ cache các bundle cũ, gây ra infinite recompile loop. Vì vậy SW chỉ chạy ở production.

**Tại sao dùng `--webpack`?**
`@serwist/next` chưa hỗ trợ Turbopack. Phải thêm flag `--webpack` vào cả `dev` và `build`.

### `public/manifest.json`
```json
{
  "name": "My PWA",
  "short_name": "MyPWA",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#7c3aed",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Icons được generate bằng `sharp`.

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "webworker", "esnext"]
  }
}
```

`"webworker"` được thêm vào lib để TypeScript nhận diện type `ServiceWorkerGlobalScope` trong file `sw.ts`.

## Service Worker (`sw.ts`)

### Khởi tạo
```ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: defaultCache,
});
```

### Fetch listener (navigation offline support)
Được đăng ký **trước** `serwist.addEventListeners()` để `event.respondWith()` của ta thắng:

```ts
self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.mode === "navigate" && url.origin === self.location.origin) {
    event.respondWith((async () => {
      try {
        // Online: fetch + cache response
        const networkResponse = await fetch(request);
        const cache = await caches.open("page-navigations");
        cache.put(request, networkResponse.clone());
        return networkResponse;
      } catch {
        // Offline: thử cache → offline.html → root → inline HTML
        const cachedPage = await caches.match(request);
        if (cachedPage) return cachedPage;

        const offlineCached = await caches.match("/offline.html");
        if (offlineCached) return offlineCached;

        const rootCached = await caches.match("/");
        if (rootCached) return rootCached;

        return new Response(OFFLINE_HTML, {
          status: 200,
          headers: { "Content-Type": "text/html" },
        });
      }
    })());
  }
});

serwist.addEventListeners();
```

**Tại sao `defaultCache` vẫn ở trong `runtimeCaching`?**
`defaultCache` (`/.*/i` → `NetworkOnly`) chỉ xử lý non-navigation requests (JS, CSS, ảnh, API). Khi navigation request đến, custom fetch listener (đăng ký trước) gọi `event.respondWith()` trước → serwist không xử lý navigation request đó.

### Message handler (push notifications interval)
```ts
self.addEventListener("message", (event) => {
  if (event.data?.type === "START_INTERVAL") {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      self.registration.showNotification("⏰ Auto Notification", {
        body: `Time: ${new Date().toLocaleTimeString()}`,
        icon: "/icon-192.png",
        tag: "auto-interval",
      });
    }, 5000);
  }
  if (event.data?.type === "STOP_INTERVAL") {
    clearInterval(intervalId);
  }
});
```

### Notification click handler
```ts
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return (client as WindowClient).focus();
      }
      return clients.openWindow("/");
    })
  );
});
```

## Đăng ký SW (`register-pwa.tsx`)

```tsx
"use client";
import { useEffect } from "react";

export default function RegisterPWA() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.serwist) {
      window.serwist.register();
    }
  }, []);
  return null;
}
```

- Component này render ở mọi trang (đặt trong root layout)
- `useEffect` đảm bảo chỉ chạy trên client
- `window.serwist.register()` là API của `@serwist/next`

## Flow cài đặt PWA

```
Người dùng mở trang web
  → SW đăng ký (register-pwa.tsx)
  → SW precache các assets tĩnh
  → Trình duyệt kiểm tra manifest.json
  → Nếu đủ điều kiện → hiện banner "Install"
  → Người dùng click Install
  → App được thêm vào desktop/màn hình chính
  → Mở app ở chế độ standalone (không có URL bar)
```

## ESLint
`public/sw.js` được thêm vào `eslint.config.mjs` ignores vì file này được generate tự động.
