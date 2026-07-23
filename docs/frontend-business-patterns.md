# Frontend Business Patterns — Reference

Tổng hợp các pattern FE thường gặp trong business app, kèm ví dụ code React.

---

## 1. Optimistic UI + Rollback

```jsx
function useOptimisticList(initialItems) {
  const [items, setItems] = useState(initialItems);

  async function addItem(newItem) {
    const tempId = 'temp-' + Date.now();
    const optimisticItem = { ...newItem, id: tempId, status: 'pending' };

    setItems(prev => [...prev, optimisticItem]);

    try {
      const saved = await api.createItem(newItem);
      setItems(prev => prev.map(i => i.id === tempId ? saved : i));
    } catch (err) {
      setItems(prev => prev.filter(i => i.id !== tempId));
      toast.error('Không thể thêm, vui lòng thử lại');
    }
  }

  return { items, addItem };
}
```

> Gắn `id` tạm + `status` để biết item nào đang "chờ", tránh xóa nhầm item thật khi rollback.

---

## 2. Draft Autosave

```jsx
function useDraftForm(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(value));
    }, 500);
    return () => clearTimeout(timer);
  }, [value, key]);

  const clearDraft = () => localStorage.removeItem(key);

  return [value, setValue, clearDraft];
}
```

> Dùng IndexedDB thay localStorage nếu form có file/ảnh (localStorage giới hạn ~5MB, đồng bộ, block main thread).

---

## 3. Debounce search-as-you-type (hủy request cũ)

```jsx
function useSearch(query) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) return setResults([]);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${query}`, { signal: controller.signal });
        setResults(await res.json());
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return results;
}
```

> Không abort request cũ → race condition, kết quả query trước ghi đè kết quả query sau.

---

## 4. Multi-step Wizard (state machine)

```jsx
const steps = ['info', 'address', 'payment', 'review'];

function wizardReducer(state, action) {
  switch (action.type) {
    case 'NEXT':
      return { ...state, step: Math.min(state.step + 1, steps.length - 1) };
    case 'BACK':
      return { ...state, step: Math.max(state.step - 1, 0) };
    case 'UPDATE_DATA':
      return { ...state, data: { ...state.data, ...action.payload } };
    case 'GOTO':
      return { ...state, step: steps.indexOf(action.target) };
    default:
      return state;
  }
}

function useWizard() {
  const [state, dispatch] = useReducer(wizardReducer, { step: 0, data: {} });
  return { current: steps[state.step], state, dispatch };
}
```

> Reducer tập trung logic chuyển step một chỗ — dễ test, dễ thêm validate trước `NEXT`.

---

## 5. Multi-tab sync

```js
const channel = new BroadcastChannel('auth');

function logout() {
  localStorage.removeItem('token');
  channel.postMessage({ type: 'LOGOUT' });
}

channel.onmessage = (event) => {
  if (event.data.type === 'LOGOUT') {
    window.location.href = '/login';
  }
};
```

---

## 6. Virtualization cho list lớn

```jsx
import { useVirtualizer } from '@tanstack/react-virtual';

function BigList({ items }) {
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: 500, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(row => (
          <div key={row.key} style={{
            position: 'absolute', top: 0, left: 0, width: '100%',
            transform: `translateY(${row.start}px)`, height: row.size,
          }}>
            {items[row.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

> Chỉ render ~15-20 DOM node dù list có 100.000 item.

---

## 7. Unsaved changes warning

```jsx
function useUnsavedChangesWarning(isDirty) {
  useEffect(() => {
    const handler = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}
```

> `beforeunload` chỉ chặn reload/đóng tab. Với SPA cần chặn cả navigate nội bộ, dùng `useBlocker` (React Router).

---

## 8. Idempotent submit

```jsx
function useIdempotentSubmit() {
  const idempotencyKey = useRef(crypto.randomUUID());

  async function submit(data) {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey.current },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  return submit;
}
```

> Disable button không đủ (F5 vẫn gửi lại được). Key phải sinh 1 lần, giữ nguyên tới khi submit thành công.

---

## 9. Permission-based rendering (RBAC)

```jsx
const PermissionContext = createContext([]);

function Can({ permission, children, fallback = null }) {
  const permissions = useContext(PermissionContext);
  return permissions.includes(permission) ? children : fallback;
}

// <Can permission="invoice:delete"><button>Xóa</button></Can>
```

> Ẩn UI chỉ là UX, không phải bảo mật — backend vẫn phải check quyền lại.

---

## 10. Feature flag runtime

```jsx
function useFeatureFlag(flagKey) {
  const flags = useContext(FeatureFlagContext);
  return flags[flagKey] ?? false;
}

// {useFeatureFlag('new-checkout-flow') ? <NewCheckout /> : <OldCheckout />}
```

> Hữu ích cho A/B test, canary release theo %, hoặc tắt khẩn cấp tính năng lỗi mà không cần rollback code.

---

## 11. Retry với exponential backoff

```jsx
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
      const delay = Math.min(1000 * 2 ** attempt, 8000) + Math.random() * 200;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

> Thêm jitter (`Math.random() * 200`) để tránh nhiều client cùng retry một lúc ("thundering herd").

---

## 12. Copy-to-clipboard với fallback

```jsx
async function copyText(text, onSuccess) {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess?.();
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    onSuccess?.();
  }
}
```

---

## 13. Table state (sort/filter) lưu vào URL

```jsx
function useTableState() {
  const [params, setParams] = useSearchParams();

  const sort = params.get('sort') ?? 'createdAt';
  const order = params.get('order') ?? 'desc';

  function setSort(field) {
    const newOrder = sort === field && order === 'asc' ? 'desc' : 'asc';
    setParams(prev => {
      prev.set('sort', field);
      prev.set('order', newOrder);
      return prev;
    });
  }

  return { sort, order, setSort };
}
```

> Lưu vào URL thay vì state để share link/reload trang vẫn giữ đúng filter — quan trọng cho dashboard, admin panel.

---

## 14. Toast queue

```jsx
function useToastQueue(maxVisible = 3) {
  const [toasts, setToasts] = useState([]);

  function addToast(message, type = 'info') {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }].slice(-maxVisible));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }

  return { toasts, addToast };
}
```

---

## Chưa triển khai chi tiết (đào sâu sau)

- **Conflict resolution UI** — khi 2 người sửa cùng lúc (real-time collab)
- **Dynamic form builder** — schema-driven form, JSON schema → UI
- **Offline-first / local-first** với CRDT
- **Real-time collaborative cursor/presence** (kiểu Figma, Google Docs)
