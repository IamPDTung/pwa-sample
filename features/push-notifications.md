# Push Notifications

## Tổng quan
Trang `/push` cho phép kiểm tra 2 chế độ push notification trên trình duyệt:
1. **Gửi ngay** — dùng `new Notification()` API (yêu cầu tab đang mở)
2. **Tự động (interval)** — SW gửi định kỳ mỗi 5 giây qua `postMessage`

## Cấu trúc file

| File | Vai trò |
|---|---|
| `src/app/push/page.tsx` | Server component, render `<PushNoti />` |
| `src/app/components/push-noti.tsx` | Client component, toàn bộ logic push |
| `src/app/sw.ts` | SW message handler + notificationclick handler |

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
- SW chỉ gửi notification khi trình duyệt đang mở (không phải push server thực sự)
- Để push notification khi browser đóng hoàn toàn, cần Web Push API + `web-push` npm package (backend)
