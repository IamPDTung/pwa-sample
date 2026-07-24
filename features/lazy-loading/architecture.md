# Lazy Loading — Kiến trúc & Luồng hoạt động

## Tổng quan
Trang `/lazy-loading` demo 4 kỹ thuật lazy loading khác nhau để giảm kích thước bundle ban đầu, cải thiện thời gian load trang. Tận dụng `next/dynamic`, JS-driven image lazy loading (không `src` cho đến khi cần), dynamic `import()` và paginated data loading.

## Mục tiêu kỹ thuật
- **Code splitting** — component chỉ tải khi cần, visible trong Network tab
- **Lazy images** — JS-driven: không có `<img>` tag cho đến khi IntersectionObserver fire
- **On-demand module** — import động heavy module khi người dùng click
- **Paginated data** — load dữ liệu theo batch, không clone API virtual table

## Cấu trúc file

| File | Vai trò |
|---|---|
| `src/app/lazy-loading/page.tsx` | Server component, render `<LazyDemo />` |
| `src/app/components/lazy-demo.tsx` | Client component: toàn bộ 4 section + state |
| `src/app/components/lazy/_heavy-widget.tsx` | Fake component nặng — mô phỏng bundle lớn |
| `src/app/components/lazy/_heavy-processor.ts` | Module tính toán nặng — mô phỏng heavy computation |
| `src/app/api/lazy-items/route.ts` | API GET `?page=N&limit=N` — danh sách phân trang |
| `src/lib/lazy-items.ts` | Mock data: sinh danh sách items có thể phân trang (VD: 200 items) |

## 4 kỹ thuật lazy loading

### 1. Component Lazy Loading (`next/dynamic`)

**Kỹ thuật:** Dùng `next/dynamic` để tách component thành chunk riêng, chỉ load khi render.

```tsx
import dynamic from "next/dynamic";

const HeavyWidget = dynamic(() => import("./lazy/_heavy-widget"), {
  loading: () => <Skeleton />,  // placeholder khi đang load
  ssr: false,                   // không render trên server
});
```

**Flow:**
```
Trang load → <LazyDemo /> mount
  → HeavyWidget chưa được import
  → Khi user toggle "Show Component"
  → dynamic import bắt đầu → browser tải chunk JS
  → Skeleton hiển thị (animate-pulse)
  → Chunk load xong → HeavyWidget mount
  → Network tab: thấy chunk .js file được tải
  → Khi user toggle "Hide" → HeavyWidget unmount
  → Toggle lại "Show" → chunk đã cache, load ngay (không request mới)
```

**HeavyWidget nội dung:** Infrastructure Metrics Dashboard với:
- 100 dòng metric data (server, metric, min/avg/max/p99, timestamp)
- 7 server cards hiển thị avg
- 3 stat cards (uptime, alert, deploy)
- Mục đích: tăng kích thước file chunk (~3KB JSX) để thấy rõ network request

**State trong LazyDemo:**
```tsx
const [showWidget, setShowWidget] = useState(false);
const [widgetLoadTime, setWidgetLoadTime] = useState<number | null>(null);
// Ghi nhận thời điểm toggle → thời điểm chunk load xong
```

### 2. Image Gallery (JS-Driven Lazy Loading)

**Kỹ thuật:** Không đặt `src` cho `<img>` ban đầu. Dùng `IntersectionObserver` để swap từ placeholder xám → `<img>` thật khi ảnh sắp vào viewport. Khác với `loading="lazy"` (chỉ là hint cho browser, vẫn có thể download hết khi load trang).

```tsx
const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

// JSX: render placeholder khi chưa load, <img> khi đã vào viewport
{loaded ? (
  <img src={`https://picsum.photos/400/300?random=${i}`} alt={...} />
) : (
  <div className="bg-zinc-200 dark:bg-zinc-700">
    <span>#{i + 1}</span>
  </div>
)}
```

**Tại sao không dùng `loading="lazy"`?**
`loading="lazy"` là browser hint — không đảm bảo ảnh không được download trước. Browser có thể quyết định download tất cả ảnh ngay khi load trang (đặc biệt khi không có explicit dimensions). Cách JS-driven: không có `src` thì browser không thể download → zero network request cho đến khi observer fire.

**Flow:**
```
Trang load → grid 100 placeholder xám (#1 → #100)
  → KHÔNG có <img> tag nào → không có network request ảnh
  → IntersectionObserver theo dõi từng placeholder
  ↓
User scroll xuống
  → Placeholder sắp vào viewport (200px margin)
  → Observer fire → setLoadedImages → re-render
  → Placeholder được thay bằng <img src="...">
  → Browser bắt đầu download ảnh → hiển thị
  → Network tab: thấy request mới xuất hiện
  → Border chuyển sang xanh (đã load)
  → Counter cập nhật: "25 / 100 images loaded"
  ↓
User scroll tiếp
  → Ảnh mới load dần, counter tăng
  ↓
Scroll lên đầu → ảnh đã load vẫn hiển thị (đã cache trong DOM)
```

**Nguồn ảnh:** `https://picsum.photos/400/300?random=N` — mỗi ảnh có seed khác nhau.

**Cấu trúc grid:** CSS grid responsive: 2 cột mobile, 3 tablet, 4 desktop, 5 wide. Có scroll container với `max-h-[400px]`.

### 3. On-Demand Module Import

**Kỹ thuật:** `await import("./heavy-processor")` — dynamic import khi user click.

```tsx
const handleLoadModule = async () => {
  setModuleLoading(true);
  const start = performance.now();

  const { processLargeData } = await import("./lazy/_heavy-processor");
  const result = processLargeData();

  const duration = Math.round(performance.now() - start);
  setModuleResult(result);
  setModuleLoadTime(duration);
  setModuleLoading(false);
};
```

**HeavyProcessor nội dung:**
- Module giả lập tính toán nặng: generate 50.000 records, group by category, aggregate stats
- Export duy nhất hàm `processLargeData()` trả về object:
  ```ts
  {
    itemsProcessed: 50000,
    groupsFound: 10,          // 10 categories
    topCategories: [          // top 5 by count
      { name: "Infrastructure", count: 5000, pct: "10.0%" },
      ...
    ],
    summary: "Processed 50,000 records across 10 categories. Active: 16,667... Total value: ..."
  }
  ```

**Flow:**
```
User click "Load Heavy Module"
  → Button disabled + spinner
  → Browser tải chunk JS của heavy-processor
  → Network tab: thấy chunk .js file
  → Module load xong → gọi processLargeData()
  → Hiển thị kết quả + thời gian import (ms)
  → Button trở lại bình thường
  ↓
Click "Run Again"
  → Module đã load (cache) → chỉ chạy lại hàm
  → Không có network request mới
  → Hiển thị kết quả + "cached load: 0ms"
```

### 4. Load More (Paginated Data)

**Kỹ thuật:** Load dữ liệu từng batch bằng nút "Load More" (khác với virtual table — dùng explicit button thay vì scroll trigger).

```tsx
const [items, setItems] = useState<LazyItem[]>([]);
const [page, setPage] = useState(0);
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);
const [fetchTime, setFetchTime] = useState<number | null>(null);

const loadMore = async () => {
  setLoading(true);
  const start = performance.now();

  const nextPage = page + 1;
  const res = await fetch(`/api/lazy-items?page=${nextPage}&limit=10`);
  const data = await res.json();

  setItems(prev => [...prev, ...data.items]);
  setPage(nextPage);
  setHasMore(data.hasMore);
  setFetchTime(Math.round(performance.now() - start));
  setLoading(false);
};
```

**API Backend (`/api/lazy-items`):**
```ts
// GET ?page=N&limit=N
// Trả về:
{
  items: Item[],       // slice của mảng
  total: number,       // tổng số items (200)
  page: number,        // trang hiện tại
  hasMore: boolean     // còn trang nữa không
}
```

- Mock data: 200 items (id, title, description, timestamp)
- Mỗi request có độ trễ giả lập 300-400ms (giống items API)
- `limit` mặc định = 10, tối đa = 50

**Flow:**
```
Trang load → items = [], page = 0
  → Hiển thị "No items loaded yet"
  → Nút "Load More" sẵn sàng
  ↓
User click "Load More"
  → fetch /api/lazy-items?page=1&limit=10
  → Spinner trên nút
  → API trả về 10 items + hasMore=true
  → Hiển thị 10 items trong danh sách
  → Counter: "Showing 10 of 200 items"
  ↓
User click "Load More" lần nữa
  → fetch /api/lazy-items?page=2&limit=10
  → Append 10 items → danh sách có 20 items
  → Counter: "Showing 20 of 200 items"
  ↓
... lặp lại cho đến khi hasMore = false
  → Nút "Load More" biến mất
  → Hiển thị "All 200 items loaded"
```

## State management trong LazyDemo

```tsx
// Section 1: Component Lazy
const [showWidget, setShowWidget] = useState(false);

// Section 2: Images
const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
const imageRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

// Section 3: Module Import
const [moduleLoading, setModuleLoading] = useState(false);
const [moduleResult, setModuleResult] = useState<ProcessResult | null>(null);
const [moduleLoadTime, setModuleLoadTime] = useState<number | null>(null);

// Section 4: Load More
const [items, setItems] = useState<LazyItem[]>([]);
const [page, setPage] = useState(0);
const [loadingMore, setLoadingMore] = useState(false);
const [hasMore, setHasMore] = useState(true);
const [fetchTime, setFetchTime] = useState<number | null>(null);
const [loadError, setLoadError] = useState<string | null>(null);
```

## Giao diện

```
┌─────────────────────────────────────────────────────────────┐
│  Lazy Loading                                               │
│    4 code-splitting & lazy loading techniques               │
├──────────────────────┬──────────────────────────────────────┤
│  Component Code-     │  Lazy Image Gallery                  │
│  Splitting           │                                      │
│                      │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│  [Show Heavy Widget] │  │ #1  │ │ #2  │ │ #3  │ │ #4  │ │ #5  ││
│                      │  └────┘ └────┘ └────┘ └────┘ └────┘│
│  ┌──────────────┐    │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│  │ skeleton...  │    │  │ 🖼  │ │ #7  │ │ 🖼  │ │ 🖼  │ │ #10 ││
│  └──────────────┘    │  └────┘ └────┘ └────┘ └────┘ └────┘│
│                      │  ...                                 │
│                      │  25 / 100 images loaded              │
├──────────────────────┼──────────────────────────────────────┤
│  On-Demand Import    │  Load More Data                      │
│                      │                                      │
│  [Load Heavy Module] │  ┌──────────────────────────────┐   │
│                      │  │ Item 1 — Description text... │   │
│  Result:             │  │ Item 2 — Description text... │   │
│  Processed 50000     │  │ Item 3 — Description text... │   │
│  items in 42ms       │  │ ...                          │   │
│                      │  └──────────────────────────────┘   │
│                      │  Showing 10 of 200 items             │
│                      │  [Load More]                         │
└──────────────────────┴──────────────────────────────────────┘
```
