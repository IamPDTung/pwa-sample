# Kiến trúc tổng quan

## Stack công nghệ
- **Next.js 16** (App Router, TypeScript, Tailwind CSS)
- **PWA** qua `@serwist/next` (webpack bundling, KHÔNG dùng Turbopack)
- **TanStack** ecosystem: Table, Virtual, Query

## Cấu trúc thư mục
```
src/app/
├── layout.tsx              # Root layout: providers + navbar + children
├── page.tsx                # Landing page
├── globals.css             # Tailwind + keyframes
├── register-pwa.tsx        # Client component: gọi window.serwist.register()
├── sw.ts                   # Service worker source → compiled ra public/sw.js
├── api/                    # API routes (BE)
│   ├── items/              # CRUD items (optimistic UI)
│   ├── table-data/         # Bảng ảo 100k rows
│   └── upload/             # Upload file lớn
├── components/             # Shared components (đều "use client")
│   ├── navbar.tsx
│   ├── push-noti.tsx
│   ├── upload-context.tsx
│   ├── upload-test.tsx
│   ├── virtual-table.tsx
│   ├── spreadsheet.tsx
│   ├── optimistic-crud.tsx
│   ├── query-provider.tsx
│   └── toast.tsx
├── lib/                    # Shared logic
│   ├── table-data.ts       # Types + mock data cho bảng ảo
│   ├── items-store.ts      # In-memory CRUD store
│   └── export-csv.ts       # CSV serialization
├── push/                   # Trang push notifications
├── upload/                 # Trang upload file
├── virtual/                # Trang bảng ảo
├── spreadsheet/            # Trang bảng tính
└── optimistic/             # Trang CRUD lạc quan
├── lazy-loading/           # Trang lazy loading demo
```

## Tài liệu tính năng

Mỗi tính năng có thư mục riêng trong `features/` gồm 2 file:

| File | Nội dung |
|---|---|
| `architecture.md` | Mô tả cách code hoạt động, luồng dữ liệu, state, cấu trúc file, sơ đồ flow |
| `usecases.md` | Tất cả các trường hợp sử dụng (user scenarios), điều kiện, các bước, kết quả mong đợi |

```
features/
├── README.md                     ← file này
├── pwa/
│   ├── architecture.md           ← Kiến trúc PWA, SW, manifest, offline caching
│   └── usecases.md               ← 8 use cases: cài đặt, online, offline, update SW, ...
├── push-notifications/
│   ├── architecture.md           ← Kiến trúc push: direct + interval, SW message handler
│   └── usecases.md               ← 10 use cases: xin quyền, gửi ngay, auto, click noti, ...
├── upload/
│   ├── architecture.md           ← Kiến trúc upload: XHR progress, streaming, context
│   └── usecases.md               ← 10 use cases: file nhỏ/lớn, mất mạng, chuyển trang, ...
├── virtual-table/
│   ├── architecture.md           ← Kiến trúc bảng ảo: cursor pagination, virtual scroll, sort
│   └── usecases.md               ← 9 use cases: scroll, sort, export CSV, offline, retry, ...
├── spreadsheet/
│   ├── architecture.md           ← Kiến trúc bảng tính: grid model, formula eval, edit flow
│   └── usecases.md               ← 14 use cases: chỉnh sửa ô, SUM/AVERAGE, import/export, ...
├── optimistic-crud/
│   ├── architecture.md           ← Kiến trúc CRUD: mutations, optimistic update, rollback
│   └── usecases.md               ← 14 use cases: add/update/delete, rollback, toast, refetch, ...
└── lazy-loading/
    ├── architecture.md           ← Kiến trúc lazy loading: code-splitting, dynamic import, lazy images
    └── usecases.md               ← 13 use cases: toggle widget, scroll images, import module, load more, ...
```

## Providers & wrapping order
```
<html>
  <body>
    <RegisterPWA />          ← đăng ký service worker
    <QueryProvider>          ← TanStack Query client
      <ToastProvider>        ← hệ thống toast notification
        <UploadProvider>     ← context giữ state upload (XHR, progress)
          <Navbar />
          {children}          ← nội dung trang
        </UploadProvider>
      </ToastProvider>
    </QueryProvider>
  </body>
</html>
```

## Các trang / routes

| Route | Mô tả | API backend |
|---|---|---|
| `/` | Landing page, link đến các trang khác | Không |
| `/push` | Push notifications (local + SW interval) | Không |
| `/upload` | Upload file lớn (stream, hỗ trợ 5-100GB) | `POST /api/upload` |
| `/virtual` | Bảng ảo 100k rows, infinite scroll | `GET /api/table-data` |
| `/spreadsheet` | Bảng tính có thể chỉnh sửa, import/export CSV, gợi ý công thức | Không (client-only) |
| `/optimistic` | CRUD với optimistic UI + rollback | `GET/POST/PUT /api/items`, `DELETE /api/items/[id]` |
| `/lazy-loading` | Demo code-splitting, lazy images, dynamic import, load more | `GET /api/lazy-items` |

## Các nguyên tắc thiết kế chung
1. **Mọi component UI đều là "use client"** — import trực tiếp từ server component page
2. **Offline-first** — các tính năng hoạt động khi mất mạng (service worker cache, local state)
3. **Tránh setState trong useEffect** — dùng lazy initializer hoặc derive từ state có sẵn
4. **Ref cho giá trị không cần re-render** — isLoadingRef, hasMoreRef, errorRef
5. **API routes giả lập độ trễ** — setTimeout để demo optimistic UI
