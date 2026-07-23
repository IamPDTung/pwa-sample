# Bảng Ảo — Virtual Table (100K Rows)

## Tổng quan
Trang `/virtual` hiển thị bảng dữ liệu 100.000 dòng với:
- **TanStack Table** — quản lý cột, header, sorting
- **TanStack Virtual** — chỉ render các dòng đang hiển thị (virtual scrolling)
- **Cursor-based pagination** — load thêm dữ liệu khi scroll đến cuối
- **Server-side sorting** — sort được xử lý trên API
- **Export CSV** — tải dữ liệu đã load về file CSV

## Cấu trúc file

| File | Vai trò |
|---|---|
| `src/app/virtual/page.tsx` | Server component, render `<VirtualTable />` |
| `src/app/components/virtual-table.tsx` | Client component: bảng + scroll + sort + export |
| `src/app/api/table-data/route.ts` | API GET: cursor pagination với sorting |
| `src/app/lib/table-data.ts` | Types + mock data generator (100k rows) |
| `src/app/lib/export-csv.ts` | CSV serialization + download trigger |

## Luồng hoạt động

### 1. Khởi tạo
```tsx
const [rows, setRows] = useState<RowData[]>([]);
const [hasMore, setHasMore] = useState(true);
const cursorRef = useRef<string | null>(null);
```

- `rows` — dữ liệu đã load (append dần khi scroll)
- `hasMore` — còn dữ liệu để load không
- `cursorRef` — vị trí hiện tại trong danh sách (id của dòng cuối đã load)

### 2. Fetch dữ liệu (cursor pagination)
```tsx
const fetchPage = useCallback(async () => {
  if (isLoadingRef.current || !hasMoreRef.current || errorRef.current) return;

  // Build URL params
  const params = new URLSearchParams();
  params.set("limit", "50");
  if (sorting[0]) {
    params.set("sort", sorting[0].id);
    params.set("order", sorting[0].desc ? "desc" : "asc");
  }
  if (cursorRef.current) params.set("cursor", cursorRef.current);

  const res = await fetch(`/api/table-data?${params}`);

  // Append rows, update cursor
  const data: TableResponse = await res.json();
  setRows((prev) => [...prev, ...data.rows]);
  cursorRef.current = data.nextCursor;
  setHasMore(data.hasMore);
}, [sorting]);
```

### 3. API Backend (sort + pagination)
```tsx
// api/table-data/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
  const sort = searchParams.get("sort");
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";
  const cursor = searchParams.get("cursor");

  // Lấy toàn bộ 100k rows (module-scoped cache)
  const allRows = getRows();

  // Sort
  const sorted = sort
    ? [...allRows].sort((a, b) => {
        const [av, bv] = order === "desc" ? [b[sort], a[sort]] : [a[sort], b[sort]];
        if (typeof av === "number") return av - (bv as number);
        return String(av).localeCompare(String(bv));
      })
    : allRows;

  // Tìm vị trí cursor
  let startIndex = 0;
  if (cursor) {
    const payload = JSON.parse(Buffer.from(cursor, "base64url").toString());
    const found = sorted.findIndex((r) => r.id === payload.id);
    if (found >= 0) startIndex = found + 1;
  }

  // Trả về N rows tiếp theo
  const slice = sorted.slice(startIndex, startIndex + limit);
  const nextCursor = slice.length > 0
    ? Buffer.from(JSON.stringify({ id: slice[slice.length - 1].id })).toString("base64url")
    : null;

  return NextResponse.json({
    rows: slice,
    nextCursor,
    hasMore: startIndex + limit < sorted.length,
  });
}
```

**Tại sao cursor dùng base64?**
Cursor là `{ id: number }` được encode thành base64url để truyền qua URL param. Thực tế chỉ cần truyền raw `id` nhưng dùng base64 để dễ mở rộng nếu sau này cần compound cursor.

### 4. Virtual Scrolling (TanStack Virtual)
```tsx
const rowVirtualizer = useVirtualizer({
  count: tableRows.length + (hasMore ? 1 : 0), // +1 cho loading indicator
  getScrollElement: () => containerRef.current,
  estimateSize: () => 40, // Mỗi dòng cao 40px
  overscan: 15,            // Render thêm 15 dòng ngoài viewport
});
```

- **count**: số dòng ảo = dòng đã load + 1 (nếu còn dữ liệu để load)
- **estimateSize**: ước lượng chiều cao mỗi dòng
- **overscan**: render thêm dòng bên ngoài viewport để scroll mượt hơn

### 5. Infinite Scroll Trigger
```tsx
useEffect(() => {
  if (virtualItems.length === 0) return;
  const lastIdx = virtualItems[virtualItems.length - 1].index;
  // Khi dòng cuối cùng hiển thị cách dòng đã load < 10 → fetch thêm
  if (lastIdx >= tableRows.length - 10 && hasMore && !isLoadingRef.current && !errorRef.current) {
    fetchPage();
  }
}, [virtualItems, tableRows.length, hasMore, fetchPage]);
```

**Lưu ý:** Dùng `isLoadingRef` và `errorRef` thay vì `isLoading` state để tránh re-trigger infinite loop. Khi fetch fail, `isLoading` toggle true→false sẽ re-fire effect → loop vô hạn.

### 6. Xử lý lỗi & offline
```tsx
// fetchPage có guard:
if (errorRef.current) return; // Không fetch khi đang có lỗi

// Khi fetch fail:
errorCountRef.current += 1;
setError(err.message);

// UI hiển thị nút Retry:
{error && (
  <button onClick={handleRetry}>Retry</button>
)}
```

Khi mất mạng:
- Fetch fail → set error → errorRef.current = true → chặn auto fetch
- Hiển thị nút Retry để người dùng thử lại thủ công
- Dữ liệu đã load vẫn hiển thị bình thường

### 7. Export CSV
```tsx
const handleExportCSV = () => {
  downloadCSV(rows, `table-export-${rows.length}-rows.csv`);
};
```

- Chỉ export dữ liệu đã load (không phải toàn bộ 100k)
- Nút hiển thị khi có ít nhất 1 dòng dữ liệu

## Flow tổng thể

```
Trang load
  → rows.length = 0, hasMore = true
  → useEffect triggers fetchPage()
  → API trả về 50 rows + cursor + hasMore
  → setRows([...50 rows])
  → TanStack Virtual render ~20 dòng trong viewport
  ↓
User scroll xuống
  → virtualItems cập nhật (các dòng mới xuất hiện)
  → useEffect checks: lastIdx >= rows.length - 10?
  → Có → fetchPage() với cursor
  → API trả về 50 rows tiếp theo
  → setRows(prev => [...prev, ...50]) → 100 rows
  ↓
User sort cột "Name" ↑
  → setSorting([{ id: "name", desc: false }])
  → resetAll() → rows = [], cursor = null, hasMore = true
  → fetchPage() với sort=name&order=asc
  → Bắt đầu load lại từ đầu với thứ tự mới
  ↓
User click "Export CSV"
  → downloadCSV(rows) → tạo blob → trigger download
```
