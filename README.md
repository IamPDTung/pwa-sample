# My PWA — Progressive Web App Sample

Dự án PWA mẫu xây dựng bằng Next.js 16, demo các tính năng: cài đặt PWA, push notifications (local + Web Push từ Backend), upload file lớn (stream), bảng ảo 100K rows, bảng tính (spreadsheet), CRUD với optimistic UI + rollback.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS)
- **TanStack** Table, Virtual, Query
- **@serwist/next** — PWA bundling (webpack)
- **web-push** — Web Push từ backend qua browser push service

## Routes

| Route | Mô tả | Backend API |
|---|---|---|
| `/` | Landing page | — |
| `/push` | Push notifications: direct + SW interval + Web Push từ BE | `GET /api/push/vapid-key`, `POST /api/push/subscribe`, `POST /api/push/send` |
| `/upload` | Upload file lớn (stream, 5-100GB) | `POST /api/upload` |
| `/virtual` | Bảng ảo 100K dòng, infinite scroll, server-side sort | `GET /api/table-data` |
| `/spreadsheet` | Bảng tính client-only: edit ô, công thức, CSV import/export | — |
| `/optimistic` | CRUD với optimistic UI + rollback (TanStack Query) | `GET/POST/PUT /api/items`, `DELETE /api/items/[id]` |

## Cấu trúc thư mục

```
src/app/
├── layout.tsx                 # Root layout: <RegisterPWA> → <QueryProvider> → <ToastProvider> → <UploadProvider>
├── page.tsx                   # Landing page
├── globals.css                # Tailwind + animations
├── register-pwa.tsx           # Client component: window.serwist.register()
├── sw.ts                      # SW source → public/sw.js
├── api/
│   ├── items/                 # CRUD API (optimistic)
│   ├── push/
│   │   ├── vapid-key/route.ts # GET VAPID public key
│   │   ├── subscribe/route.ts # POST/DELETE push subscriptions
│   │   └── send/route.ts      # POST trigger push from BE
│   ├── table-data/            # 100K rows pagination
│   └── upload/                # Stream upload
├── components/
│   ├── navbar.tsx             # 6-link navigation
│   ├── push-noti.tsx          # Direct + SW interval + Web Push UI
│   ├── upload-context.tsx     # Upload state context
│   ├── upload-test.tsx        # File input + XHR progress bar
│   ├── virtual-table.tsx      # TanStack Table + Virtual
│   ├── spreadsheet.tsx        # Custom editable grid + formula eval
│   ├── optimistic-crud.tsx    # TanStack Query mutations
│   ├── query-provider.tsx     # QueryClient provider
│   └── toast.tsx              # Toast notification system
├── lib/
│   ├── vapid.ts               # VAPID key generation (globalThis cache)
│   ├── subscription-store.ts  # In-memory push subscription store
│   ├── table-data.ts          # Mock data + types
│   ├── items-store.ts         # In-memory CRUD store
│   └── export-csv.ts          # CSV serialization
├── push/                      # Trang push
├── upload/                    # Trang upload
├── virtual/                   # Trang virtual table
├── spreadsheet/               # Trang spreadsheet
└── optimistic/                # Trang optimistic CRUD
```

## Tính năng

### Push Notifications (3 chế độ)

| Chế độ | Cách hoạt động | Cần tab mở? | Cần browser mở? |
|---|---|---|---|
| **Send Now** | `new Notification()` trực tiếp | Có | Có |
| **Auto (SW interval)** | `postMessage` → SW `setInterval` 5s | Không | Có |
| **Web Push (BE)** | BE gửi qua browser push service (FCM/Moz/APN) | Không | **Không** (OS-level) |

Web Push flow: Frontend `PushManager.subscribe()` → gửi subscription lên BE → BE `webpush.sendNotification()` → push service → SW `push` event → notification. Hoạt động ngay cả khi browser đóng hoàn toàn.

### Upload File Lớn

- XMLHttpRequest + `upload.onprogress` → progress bar real-time
- Backend: `Readable.fromWeb(request.body)` → `pipeline()` → disk (không buffer RAM, hỗ trợ 5-100GB)
- State upload tồn tại qua route navigation (UploadProvider context)

### Bảng Ảo 100K Dòng

- TanStack Table (columns, sorting) + TanStack Virtual (chỉ render dòng trong viewport)
- Cursor-based pagination, server-side sort
- Offline: data đã load vẫn hiển thị, nút Retry khi mất mạng
- Export CSV dữ liệu đã load

### Spreadsheet

- Editable grid 30×10, formula bar + suggestions dropdown (SUM, AVERAGE, COUNT, MAX, MIN, IF)
- Formula evaluation (range + arithmetic), cell modification tracking (amber highlight)
- CSV import/export, add row/col

### Optimistic CRUD

- TanStack Query `useMutation` với `onMutate` (snapshot + optimistic update) / `onError` (rollback) / `onSettled` (refetch)
- Add/update status/delete items, animation mờ cho item đang pending
- Toast notifications (context-based, auto-dismiss 3.5s)
- Test rollback: `DELETE /api/items/intentional-fail`

## Providers wrapping (layout.tsx)

```
<html>
  <body>
    <RegisterPWA />           ← Đăng ký service worker
    <QueryProvider>           ← TanStack Query
      <ToastProvider>         ← Toast system
        <UploadProvider>      ← Upload state context
          <Navbar />
          {children}
```

## Dev commands

| Command | Mô tả |
|---|---|
| `npm run dev` | Dev server (SW disabled — tránh HMR loop) |
| `npm run build` | Production build |
| `npm start` | Chạy production → test PWA thật |
| `npm run lint` | ESLint |

## Lưu ý quan trọng

- **Phải dùng `--webpack`** — `@serwist/next` chưa hỗ trợ Turbopack
- **SW bị tắt khi dev** — `disable: NODE_ENV !== "production"`
- **Muốn test SW/PWA:** `npm run build && npm start`
- **SW đăng ký thủ công** — `register: false` → `window.serwist.register()` từ client component
- **`sw.js` sinh tự động** — không sửa tay, đã thêm vào eslint ignore
- **`tsconfig.json` có `"webworker"` lib** — cho `ServiceWorkerGlobalScope` type
- **Web Push: browser phải hỗ trợ** — Chrome/Edge/Firefox đều có sẵn. Safari cần PWA đã cài đặt.

## Tài liệu chi tiết

Xem `features/README.md` và các thư mục con:
- `features/pwa/` — Kiến trúc PWA + 8 use cases
- `features/push-notifications/` — Kiến trúc push (local + Web Push) + 19 use cases
- `features/upload/` — Kiến trúc upload + 10 use cases
- `features/virtual-table/` — Kiến trúc bảng ảo + 9 use cases
- `features/spreadsheet/` — Kiến trúc bảng tính + 14 use cases
- `features/optimistic-crud/` — Kiến trúc CRUD + 14 use cases
