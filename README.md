# Tài liệu dự án My PWA

Dự án Progressive Web App (PWA) đơn giản xây dựng bằng Next.js 16 — cho phép cài đặt ứng dụng web lên desktop giống như YouTube.

---

## Cấu trúc thư mục

```
pwa-sample/
├── public/
│   ├── manifest.json              ← Cấu hình PWA (tên app, icon, theme color...)
│   ├── icon-192.png               ← Icon 192x192 (dùng khi cài đặt)
│   ├── icon-512.png               ← Icon 512x512 (dùng trên splash screen)
│   └── sw.js                      ← Service Worker output (tự động sinh từ sw.ts)
├── src/
│   └── app/
│       ├── layout.tsx             ← Layout gốc: manifest, RegisterPWA, Navbar, UploadProvider
│       ├── page.tsx               ← Landing page: logo + 2 link tới /push và /upload
│       ├── push/
│       │   └── page.tsx           ← Trang Push Notifications
│       ├── upload/
│       │   └── page.tsx           ← Trang Upload File Test
│       ├── api/upload/
│       │   └── route.ts           ← BE: POST handler stream file → disk (không buffer)
│       ├── components/
│       │   ├── navbar.tsx         ← Header navigation (Home / Push / Upload)
│       │   ├── push-noti.tsx      ← Push notification component (2 chế độ)
│       │   ├── upload-test.tsx    ← FE upload: chọn file + progress bar
│       │   └── upload-context.tsx ← Context giữ state upload xuyên suốt các route
│       ├── register-pwa.tsx       ← Client Component: đăng ký Service Worker
│       ├── sw.ts                  ← Mã nguồn Service Worker (webpack → sw.js)
│       └── globals.css            ← Styles toàn cục (Tailwind CSS v4)
├── next.config.ts                 ← Cấu hình Next.js + tích hợp @serwist/next
├── uploads/                       ← Thư mục chứa file upload (tự động tạo)
├── package.json                   ← Scripts và dependencies
├── README.md                      ← Tài liệu này
└── AGENTS.md                      ← Hướng dẫn cho AI agent làm việc với repo
```

---

## 3 Routes

| Route | Chức năng |
|-------|-----------|
| `/` | Landing page — logo, mô tả PWA, badge, 2 nút dẫn tới các trang con |
| `/push` | Test push notification offline: 2 chế độ (direct + SW interval) |
| `/upload` | Test upload file lớn: FE chọn file → progress bar → BE stream ra `uploads/` |
| `/api/upload` | API POST nhận file upload (BE — dynamic route) |

---

## Luồng hoạt động PWA (How it works)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BUILD TIME (npm run build)                  │
│                                                                     │
│  sw.ts (mã nguồn SW)  ──→  @serwist/webpack-plugin  ──→  sw.js    │
│                              (webpack build step)         (output)  │
│                              - Quét public/ để tìm file              │
│                              - Tạo precache manifest                 │
│                              - Nhúng vào sw.js                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      RUNTIME (trình duyệt người dùng)               │
│                                                                     │
│  1. Người dùng mở http://localhost:3000                             │
│                         │                                           │
│                         ▼                                           │
│  2. Next.js server trả về HTML của layout.tsx                       │
│     - <head> chứa <link rel="manifest" href="/manifest.json">       │
│     - Navbar render 3 link (Home / Push / Upload)                   │
│                         │                                           │
│                         ▼                                           │
│  3. Trình duyệt đọc manifest.json                                   │
│     - Biết app tên là "My PWA"                                      │
│     - Biết icon cần dùng: icon-192.png, icon-512.png                │
│     - Biết theme color: #7c3aed (tím)                               │
│                         │                                           │
│                         ▼                                           │
│  4. Trang load xong → RegisterPWA component mount                   │
│     → window.serwist.register() đăng ký sw.js làm Service Worker     │
│                         │                                           │
│                         ▼                                           │
│  5. Service Worker (sw.js) bắt đầu hoạt động                        │
│     - Precache tất cả static assets                                 │
│     - Runtime caching (defaultCache)                                │
│     - Xử lý push event → hiển thị desktop notification              │
│     - Xử lý message event (START_INTERVAL / STOP_INTERVAL)          │
│                         │                                           │
│                         ▼                                           │
│  6. Trình duyệt phát hiện PWA đủ điều kiện                          │
│     ✓ Có manifest.json hợp lệ                                       │
│     ✓ Có Service Worker đã đăng ký                                  │
│     ✓ Phục vụ qua HTTPS (hoặc localhost)                            │
│                         │                                           │
│                         ▼                                           │
│  7. Hiển thị nút "Install" trên thanh địa chỉ                       │
│     ┌──────────────────────────────────────────────┐                │
│     │  🔒 localhost:3000       [⬇ Install]  ☆  ⋮  │                │
│     └──────────────────────────────────────────────┘                │
│                         │                                           │
│                         ▼                                           │
│  8. Người dùng nhấn Install                                        │
│     - App được cài lên desktop với icon tím chữ "P"                 │
│     - Mở trong cửa sổ standalone (không có thanh địa chỉ)           │
│     - Hoạt động offline nhờ Service Worker cache                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tính năng Push Notification (2 chế độ)

| Chế độ | Cách hoạt động | Offline? | Cần tab mở? |
|--------|---------------|----------|-------------|
| **Send Now (tab open)** | `new Notification()` gọi trực tiếp từ page | Có | Có |
| **Start Auto (every 5s)** | Gửi message cho SW → SW chạy `setInterval` mỗi 5s | Có | Không (miễn browser mở) |

Flow:
```
User click → requestPermission() → nếu granted:
  ├── Send Now: new Notification(...)
  └── Start Auto: SW.postMessage({ type: "START_INTERVAL" })
       → SW: setInterval → showNotification() mỗi 5s
       → Click noti → focus/refocus tab
```

---

## Tính năng Upload File (BE + FE)

### FE (upload-test.tsx)
```
User chọn file → UploadTest hiện file size
  → Click Upload → XMLHttpRequest.send(file)
  → xhr.upload.onprogress → cập nhật progress bar %
  → xhr.onload → hiển thị kết quả
  → UploadProvider context giữ state xuyên suốt các route
```

### BE (api/upload/route.ts)
```
POST /api/upload
  → Đọc Content-Length + x-file-name header
  → Readable.fromWeb(request.body) chuyển Web Stream → Node Stream
  → pipeline(nodeStream, fs.createWriteStream(uploads/file))
  → KHÔNG buffer vào RAM → hỗ trợ file 5GB-100GB
  → KHÔNG block event loop
```

---

## Chi tiết các file quan trọng

### `public/manifest.json` — "Chứng minh thư" của PWA

| Trường | Ý nghĩa |
|--------|---------|
| `name` | Tên đầy đủ của app (hiển thị khi cài đặt) |
| `short_name` | Tên ngắn (dùng khi không đủ chỗ) |
| `start_url` | URL mở khi người dùng click icon desktop |
| `display` | `standalone` — mở không có thanh địa chỉ (giống app) |
| `theme_color` | Màu thanh toolbar khi mở app |
| `background_color` | Màu nền splash screen khi app đang load |
| `icons` | Danh sách icon 192 và 512 |

### `src/app/sw.ts` — Service Worker

```
Serwist() với:
  - precacheEntries:  danh sách file tĩnh từ build (tự động sinh)
  - skipWaiting:      SW mới không chờ tab cũ đóng
  - clientsClaim:     SW kiểm soát tất cả client ngay lập tức
  - runtimeCaching:   chiến lược cache động (defaultCache)
Listener thêm:
  - message:    START_INTERVAL / STOP_INTERVAL → điều khiển timer noti
  - push:       (sẵn sàng cho web-push sau này)
  - notificationclick: click noti → focus/reopen tab
```

### `src/app/components/upload-context.tsx` — State upload toàn cục

```
UploadProvider bọc toàn bộ layout
  → state (uploading, progress, fileSize, result, error) sống xuyên suốt route
  → useUpload() hook cho component con đọc/ghi state
  → XHR reference giữ ở ref → vẫn chạy khi component mount/unmount
```

### `next.config.ts` — Cấu hình Next.js

```ts
withSerwistInit({
  swSrc: "src/app/sw.ts",                              // File nguồn SW
  swDest: "public/sw.js",                              // File output (tự động sinh)
  disable: process.env.NODE_ENV !== "production",      // TẮT SW khi dev
  register: false,                                     // Đăng ký thủ công
  globPublicPatterns: [...]                            // File nào cần precache
})
```

---

## Các lệnh cần nhớ

| Lệnh | Mô tả |
|------|------|
| `npm run dev` | Chạy dev server (SW bị tắt — tránh loop với webpack HMR) |
| `npm run build` | Build production (SW được bật) |
| `npm start` | Chạy production build → test PWA thật |
| `npm run lint` | Kiểm tra code quality (eslint) |

---

## Lưu ý quan trọng

| Vấn đề | Giải thích |
|--------|------------|
| **Phải dùng `--webpack`** | `@serwist/next` chưa hỗ trợ Turbopack |
| **SW bị tắt khi dev** | `disable: NODE_ENV !== "production"` — tránh SW bắt webpack HMR gây loop vô hạn |
| **Muốn test SW trên dev** | Build production: `npm run build && npm start` |
| **`sw.js` là file sinh tự động** | Không sửa tay, đã thêm vào eslint ignore |
| **`manifest.json` phải ở `public/`** | Next.js chỉ serve static từ thư mục này |
| **Đăng ký SW là thủ công** | `register: false` → `window.serwist.register()` từ client component |
| **Upload state không mất khi đổi route** | `UploadProvider` context wrap toàn bộ layout — layout không unmount |
| **Upload file lớn không block** | Dùng stream (`pipeline`) → không buffer vào RAM |
| **Noti offline cần browser mở** | SW interval chạy khi browser còn sống (dù tab đóng). Push thật (web-push) cần internet |
