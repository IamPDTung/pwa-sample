# Push Notifications — Kiến trúc & Luồng hoạt động

## Tổng quan
Trang `/push` cho phép kiểm tra 3 chế độ push notification trên trình duyệt:
1. **Gửi ngay** — dùng `new Notification()` API (yêu cầu tab đang mở)
2. **Tự động (interval)** — SW gửi định kỳ mỗi 5 giây qua `postMessage`
3. **Web Push từ Backend** — BE gửi notification qua browser push service (hoạt động ngay cả khi **đóng hoàn toàn trình duyệt**)

## Cấu trúc file

| File | Vai trò |
|---|---|
| `src/app/push/page.tsx` | Server component, render `<PushNoti />` |
| `src/app/components/push-noti.tsx` | Client component: toàn bộ logic push + Web Push UI |
| `src/app/sw.ts` | SW: message handler + notificationclick + **push event** |
| `src/app/api/push/vapid-key/route.ts` | GET: trả về VAPID public key cho client |
| `src/app/api/push/subscribe/route.ts` | POST/DELETE: lưu/xóa push subscription |
| `src/app/api/push/send/route.ts` | POST: trigger push notification từ backend |
| `src/lib/vapid.ts` | Generate & cache VAPID keys |
| `src/lib/subscription-store.ts` | In-memory store cho push subscriptions |

Sử dụng package `web-push` (v3.x) để gửi push từ Node.js backend.

## Luồng hoạt động

### 1. Kiểm tra quyền (permission)
```tsx
useEffect(() => {
  setPermission(Notification.permission);
}, []);
```

Đọc `Notification.permission` trong useEffect vì đây là browser API, không có trong quá trình SSR.

### 2. Xin quyền
```tsx
const requestPermission = async () => {
  const result = await Notification.requestPermission();
  setPermission(result);
};
```

Chỉ gọi khi `Notification.permission === "default"` (người dùng chưa từng quyết định).

### 3. Gửi ngay (Direct Notification)
```tsx
const sendNow = () => {
  if (Notification.permission === "granted") {
    new Notification("📬 Direct Notification", {
      body: `Sent at ${new Date().toLocaleTimeString()}`,
      icon: "/icon-192.png",
      tag: "direct",
    });
  }
};
```

- Đơn giản, dùng trực tiếp `Notification` constructor
- Chỉ hoạt động khi tab đang mở
- `tag: "direct"` đảm bảo không bị trùng lặp notification

### 4. Tự động (SW Interval)
```tsx
const startAuto = () => {
  navigator.serviceWorker.controller?.postMessage({ type: "START_INTERVAL" });
  setRunning(true);
};

const stopAuto = () => {
  navigator.serviceWorker.controller?.postMessage({ type: "STOP_INTERVAL" });
  setRunning(false);
  // Lưu số lần gửi vào localStorage
  const count = Number(localStorage.getItem("pwa_noti_count") ?? 0);
  localStorage.setItem("pwa_noti_count", String(count + 1));
};
```

**Flow:**
```
Người dùng click "Start Auto"
  → Component gửi postMessage({ type: "START_INTERVAL" })
  → SW nhận message, bắt đầu setInterval(5000)
  → Mỗi 5s: SW gọi self.registration.showNotification(...)
  → Người dùng thấy notification ngay cả khi tab đã đóng
  → Người dùng click "Stop Auto" hoặc mở lại tab
  → Component gửi postMessage({ type: "STOP_INTERVAL" })
  → SW clear interval
```

### 5. Xử lý click notification
Khi người dùng click vào notification:
```
SW nhận sự kiện "notificationclick"
  → Đóng notification
  → Kiểm tra các tab đang mở (clients.matchAll)
  → Nếu có tab → focus vào tab đó
  → Nếu không có tab → mở tab mới (clients.openWindow)
```

## State quản lý
- `permission` — "granted" / "denied" / "default"
- `running` — interval đang chạy hay không
- `notificationCount` — đếm số lần gửi (lưu localStorage)

## Các lưu ý
- `set-state-in-effect`: eslint warning khi đọc `Notification.permission` trong useEffect bị suppress bằng block-level comment vì đây là trường hợp hợp lệ
- Local notifications (direct + SW interval) chỉ hoạt động khi browser đang chạy
- Web Push hoạt động ngay cả khi browser đóng hoàn toàn (push service của browser gửi đến OS)

---

## Web Push từ Backend

### Kiến trúc Web Push
```
┌──────────┐    subscribe     ┌──────────┐    store sub     ┌──────────┐
│ Browser  │ ────PushManager──→│  Next.js  │←────────────────│ in-memory │
│ (client) │                   │  API      │                 │  store    │
│ ┌──────┐ │                   │           │                 └──────────┘
│ │  SW  │ │                   │ /api/push │
│ │push  │ │                   │ /send     │──→ webpush.sendNotification()
│ │event │ │                   │           │         │
│ └──────┘ │                   └──────────┘         │
└──────────┘                                        ▼
     ▲                                      ┌──────────────┐
     │         push message                 │ Browser Push │
     └────────── through ──────────────────│ Service      │
               browser vendor              │ (FCM/Moz/APN)│
                                            └──────────────┘
```

### 1. Đăng ký Web Push (client → BE)

```tsx
// push-noti.tsx
const subscribeToPush = async () => {
  const reg = await navigator.serviceWorker.ready;

  // Lấy VAPID public key từ BE
  const { publicKey } = await fetch("/api/push/vapid-key").then(r => r.json());

  // Subscribe với browser push service
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  // Gửi subscription object lên BE để lưu
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });
};
```

**`urlBase64ToUint8Array`**: Chuyển VAPID public key từ base64 string sang `Uint8Array` — format mà `PushManager.subscribe()` yêu cầu.

### 2. VAPID Keys (`src/lib/vapid.ts`)

```ts
import webpush from "web-push";

// Lưu vào globalThis để không bị re-generate khi HMR
function getKeys() {
  if (!globalThis.__pwa_vapid_keys) {
    globalThis.__pwa_vapid_keys = webpush.generateVAPIDKeys();
  }
  return globalThis.__pwa_vapid_keys;
}

export function getVapidPublicKey(): string {
  return getKeys().publicKey;
}

export function getWebPush() {
  const keys = getKeys();
  webpush.setVapidDetails(
    "mailto:demo@pwa-sample.local",
    keys.publicKey,
    keys.privateKey
  );
  return webpush;
}
```

**Tại sao dùng `globalThis`?**
Next.js dev mode hot-reload sẽ re-execute module = re-generate VAPID keys. `globalThis` đảm bảo keys không đổi giữa các lần HMR, tránh subscription cũ bị invalid.

### 3. Subscription Store (`src/lib/subscription-store.ts`)

```ts
function getSubs(): PushSubscription[] {
  if (!globalThis.__pwa_push_subscriptions) {
    globalThis.__pwa_push_subscriptions = [];
  }
  return globalThis.__pwa_push_subscriptions;
}
```

- Lưu trữ trong memory (không database) — phù hợp cho demo
- Subscription có `endpoint`, `keys.p256dh`, `keys.auth`
- Có `addSubscription()`, `removeSubscription()` helpers

### 4. API Endpoints

**`GET /api/push/vapid-key`** — Trả về public key:
```json
{ "publicKey": "BKq0qF6EcI1NnpaI3HHdyeYX..." }
```

**`POST /api/push/subscribe`** — Lưu subscription:
```json
// Request body (từ PushManager.subscribe)
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": { "p256dh": "...", "auth": "..." }
}
```

**`DELETE /api/push/subscribe?endpoint=...`** — Xóa subscription khi unsubscribe.

**`POST /api/push/send`** — Gửi push từ BE:
```json
// Request
{ "title": "Hello", "body": "From backend!" }

// Response
{ "ok": 1, "gone": 0, "error": 0, "total": 1 }
```

### 5. Gửi push từ BE (`/api/push/send`)

```ts
const webpush = getWebPush();
const subscriptions = getSubscriptions();

const payload = JSON.stringify({
  title: "Hello from Backend",
  body: "This push was sent from the Node.js server!",
  icon: "/icon-192.png",
});

for (const sub of subscriptions) {
  try {
    await webpush.sendNotification(sub, payload);
    // thành công
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscription đã hết hạn → xóa khỏi store
      removeSubscription(sub.endpoint);
    }
  }
}
```

**Xử lý expired subscriptions:** Push service (FCM, Mozilla, Apple) có thể trả về HTTP 410 Gone nếu subscription không còn valid. BE tự động xóa subscription khỏi store.

### 6. Service Worker `push` event (`sw.ts`)

```ts
self.addEventListener("push", (event: PushEvent) => {
  let data: { title: string; body: string; icon?: string } = {
    title: "PWA Notification",
    body: "New push from backend",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/icon-192.png",
      tag: "web-push",
    })
  );
});
```

- `push` event fire ngay cả khi browser đang đóng (OS-level push)
- `event.data.json()` parse payload từ BE
- `event.waitUntil()` đảm bảo SW không bị terminated trước khi notification hiển thị
- Notification click dùng chung handler `notificationclick`

### Flow Web Push hoàn chỉnh

```
1. User mở /push, click "Subscribe to Web Push"
   → GET /api/push/vapid-key → lấy public key
   → reg.pushManager.subscribe({ applicationServerKey }) 
   → Trình duyệt gửi request đến browser push service (FCM/Moz/APN)
   → Push service trả về subscription object
   → POST /api/push/subscribe → lưu subscription vào server

2. User click "Send from Backend" (hoặc gọi API từ đâu đó)
   → POST /api/push/send { title, body }
   → BE: webpush.sendNotification(sub, payload)
   → web-push ký request bằng VAPID private key
   → Gửi đến push service endpoint (từ subscription)
   → Push service forward message đến browser
   → Browser wake up SW (nếu cần)
   → SW nhận "push" event
   → SW gọi showNotification()
   → User thấy notification trên desktop

3. Notification hết hạn → xóa tự động
   → BE detect HTTP 410 từ push service
   → Xóa subscription khỏi store
```

## State quản lý (FE)
- `permission` — "granted" / "denied" / "default"
- `intervalRunning` — interval đang chạy hay không
- `pushSubscribed` — đã subscribe Web Push chưa
- `subEndpoint` — endpoint của subscription hiện tại
- `notifTitle`, `notifBody` — nội dung notification gửi từ BE
- `sending` — đang gửi request đến BE
- `pushResult` — kết quả lần gửi/đăng ký gần nhất
