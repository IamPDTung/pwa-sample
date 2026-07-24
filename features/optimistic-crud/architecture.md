# Optimistic UI + Rollback

## Tổng quan
Trang `/optimistic` demo pattern **Optimistic UI** — thay đổi hiển thị ngay lập tức trước khi server xác nhận. Nếu server báo lỗi, UI tự động rollback về trạng thái cũ.

Sử dụng **TanStack Query** (`useMutation` với `onMutate` / `onError` / `onSettled`) để quản lý server state và optimistic updates.

## Cấu trúc file

| File | Vai trò |
|---|---|
| `src/app/optimistic/page.tsx` | Server component |
| `src/app/components/optimistic-crud.tsx` | Client component: bảng + form + mutations |
| `src/app/components/query-provider.tsx` | Provider: QueryClient instance |
| `src/app/components/toast.tsx` | Hệ thống toast notification |
| `src/app/api/items/route.ts` | BE API: GET list, POST create, PUT update |
| `src/app/api/items/[id]/route.ts` | BE API: DELETE item |
| `src/app/lib/items-store.ts` | BE: in-memory data store |

## Mô hình dữ liệu

```ts
interface Item {
  id: string;
  title: string;
  status: "active" | "inactive" | "draft";
  createdAt: string; // "YYYY-MM-DD"
}
```

- 8 items mẫu được seed sẵn trong store
- ID tự tăng (bắt đầu từ 9 sau seed data)
- API có độ trễ giả lập 300-400ms để thấy rõ optimistic update

## Luồng hoạt động

### 1. Load danh sách (Query)
```
Trang load
  → useQuery({ queryKey: ["items"], queryFn: fetch("/api/items") })
  → GET /api/items → trả về 8 items (sau 400ms delay)
  → items = [...] → TanStack Table render bảng
  → Hiển thị loading spinner trong lúc chờ
```

### 2. Thêm item (Optimistic Add)
```
User gõ "New feature" → click Add
  → addMutation.mutate({ title: "New feature", status: "draft" })
  ↓
  ┌─ onMutate (CHẠY NGAY, trước khi gửi request)
  │  → cancelQueries(["items"]) — hủy mọi refetch đang chạy
  │  → getQueryData(["items"]) — snapshot dữ liệu hiện tại
  │  → setQueryData(["items"], old => [optimisticItem, ...old])
  │     optimisticItem có id = "optimistic-{timestamp}"
  │  → return { prev: snapshot } — lưu để rollback nếu cần
  │
  │  **UI cập nhật NGAY LẬP TỨC: dòng mới xuất hiện (mờ 60%)**
  │
  ├─ mutationFn (CHẠY SONG SONG, gửi request)
  │  → POST /api/items { title, status }
  │  → Server thêm item thật, trả về item có id thật
  │
  ├─ Nếu THÀNH CÔNG (onSuccess):
  │  → toast.success("Item added") — toast xanh
  │  → Clear input, focus lại
  │
  ├─ Nếu LỖI (onError):
  │  → setQueryData(["items"], ctx.prev) — ROLLBACK về snapshot cũ
  │  → toast.error("Failed to add item") — toast đỏ
  │  → Dòng optimistic biến mất
  │
  └─ onSettled (LUÔN CHẠY):
     → invalidateQueries(["items"]) — refetch để đồng bộ
     → Dòng optimistic (id tạm) được thay bằng dòng thật (id server)
```

### 3. Đổi trạng thái (Optimistic Update)
```
User chọn status mới từ dropdown
  → mutation.mutate(newStatus)
  ↓
  ┌─ onMutate:
  │  → Snapshot items hiện tại
  │  → setQueryData: items.map(i => i.id === id ? {...i, status} : i)
  │  **UI: dropdown đổi màu ngay lập tức**
  │
  ├─ mutationFn: PUT /api/items { id, status }
  │
  ├─ onError:
  │  → Rollback về snapshot cũ
  │  → toast.error("Failed to update status")
  │
  └─ onSettled: invalidateQueries → đồng bộ
```

### 4. Xóa item (Optimistic Delete)
```
User click "Delete"
  → mutation.mutate()
  ↓
  ┌─ onMutate:
  │  → setQueryData: items.filter(i => i.id !== id)
  │  **UI: dòng biến mất ngay lập tức**
  │
  ├─ mutationFn: DELETE /api/items/{id}
  │
  ├─ onError:
  │  → Rollback: setQueryData về snapshot cũ (dòng xuất hiện lại)
  │  → toast.error("Failed to delete")
  │
  └─ onSettled: invalidateQueries
```

## Test rollback
API có endpoint đặc biệt để test:
- `DELETE /api/items/intentional-fail` → luôn trả về HTTP 500
- Thêm item với bất kỳ title nào → xóa bằng cách gọi API với id "intentional-fail":
  1. Add item → xuất hiện ngay (optimistic)
  2. Sau 300ms, server trả lỗi → item biến mất + toast đỏ

Hoặc: tắt mạng sau khi click Add → request fail → rollback.

## Toast System

```tsx
// Hiển thị toast
const toast = useToast();
toast.success("Done");
toast.error("Failed");
toast.info("Processing...");
```

- Context-based: bất kỳ component con nào cũng gọi được
- Auto-dismiss sau 3.5 giây
- Animation: slideUp từ dưới lên
- Stack nhiều toast (fixed bottom-right)

## QueryClient Configuration
```tsx
new QueryClient({
  defaultOptions: {
    queries: { staleTime: 10_000, retry: 1 },
  },
});
```

- `staleTime: 10s` — data được coi là fresh trong 10 giây, không refetch khi component re-mount
- `retry: 1` — retry 1 lần nếu query fail
- Mutations không retry (để test rollback dễ hơn)

## Flow tổng thể

```
┌──────────────────────────────────────────────────────┐
│                     BROWSER                          │
│  ┌──────────┐   ┌──────────────┐   ┌────────────┐  │
│  │ Form     │   │  Query Cache  │   │  Toast     │  │
│  │ (input)  │   │  ["items"]    │   │  System    │  │
│  └────┬─────┘   └──────┬───────┘   └─────┬──────┘  │
│       │                │                 │          │
│       │  mutate()      │                 │          │
│       ├───────────────►│                 │          │
│       │                │ onMutate:       │          │
│       │                │ - snapshot      │          │
│       │                │ - optimistic    │          │
│       │                │   update        │          │
│       │                │                 │          │
│       │  UI re-render  │                 │          │
│       │◄───────────────│ (new data)      │          │
│       │                │                 │          │
│       │                │ mutationFn:     │          │
│       │                │ fetch() ────────┼──► API  │
│       │                │                 │    ┌───┐│
│       │                │◄────────────────┼────│BE ││
│       │                │                 │    └───┘│
│       │                │ onSuccess:      │          │
│       │                │ ├─ invalidate   │          │
│       │                │ └─ toast ──────►│          │
│       │                │                 │          │
│       │    HOẶC nếu fail:               │          │
│       │                │ onError:        │          │
│       │                │ ├─ rollback     │          │
│       │  UI rollback ◄─│ └─ toast ──────►│          │
│       │                │                 │          │
│       │                │ onSettled:      │          │
│       │                │ invalidate ─────┼──► API  │
│       │  UI đồng bộ◄───│◄────────────────┼──── get │
└──────────────────────────────────────────────────────┘
```
