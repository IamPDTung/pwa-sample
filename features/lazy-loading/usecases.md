# Lazy Loading — Các trường hợp sử dụng

## UC-LL-01: Toggle heavy component — xem chunk load trong Network tab

**Mô tả:** Người dùng bật/tắt component nặng để quan sát code-splitting trong thực tế.

**Các bước:**
1. Vào `/lazy-loading`
2. Mở DevTools → Network tab → lọc JS
3. Click "Show Heavy Widget"
4. Quan sát Network tab: một file .js chunk mới được tải
5. UI hiển thị skeleton placeholder (animate-pulse) trong lúc load
6. Chunk load xong → HeavyWidget render với bảng dữ liệu
7. Click "Hide Heavy Widget" → component unmount
8. Click "Show Heavy Widget" lần nữa → chunk đã cache, load ngay

**Kết quả mong đợi:** Network tab hiển thị rõ ràng thời điểm chunk JS được tải. Lần 2 không có request mới.

---

## UC-LL-02: Scroll image gallery — ảnh chỉ load khi vào viewport (JS-driven)

**Mô tả:** Người dùng scroll qua grid ảnh, quan sát ảnh chỉ được download khi sắp hiển thị. Không dùng `loading="lazy"` — thay vào đó, không có `<img>` tag nào cho đến khi IntersectionObserver fire.

**Các bước:**
1. Vào `/lazy-loading`, xem section "Lazy Image Gallery"
2. Quan sát grid 100 placeholder xám: mỗi ô hiển thị số `#1`, `#2`, ... `#100` — KHÔNG có ảnh, KHÔNG có network request
3. Mở DevTools → Network → lọc Img → thấy **0 requests**
4. Counter hiển thị: "0 / 100 images loaded"
5. Chờ vài giây — Observer fire cho các ô trong viewport + 200px margin
6. Placeholder được thay bằng `<img src="...">` → browser bắt đầu download
7. Network tab: requests xuất hiện, counter tăng lên ~15-25
8. Scroll chậm xuống dưới → placeholder mới vào viewport → observer fire → request mới trong Network tab
9. Counter tăng dần: 28, 35, 42...
10. Scroll lên trên → ảnh đã load vẫn hiển thị

**Kết quả mong đợi:** Ảnh CHỈ download khi placeholder vào viewport. Network tab hiển thị request xuất hiện real-time khi scroll. Không có request nào lúc load trang.

---

## UC-LL-03: Tải toàn bộ ảnh bằng cách scroll hết

**Mô tả:** Người dùng scroll hết grid để load toàn bộ 100 ảnh.

**Các bước:**
1. Bắt đầu với "0 / 100 images loaded"
2. Scroll từ từ xuống cuối grid
3. Quan sát: placeholder #N chuyển thành ảnh thật, Network tab hiển thị request mới
4. Counter tăng từ 0 → 25 → 50 → 75 → 100
5. Khi tất cả ảnh đã load: "100 / 100 images loaded — All done!"
6. Cuộn lại đầu trang — tất cả ảnh vẫn hiển thị (đã render)

**Kết quả mong đợi:** Hiển thị "All done!" khi 100/100 ảnh đã load. Mỗi ảnh chỉ download 1 lần.

---

## UC-LL-04: Import heavy module on demand

**Mô tả:** Người dùng click để import module nặng, quan sát thời gian import và network request.

**Các bước:**
1. Vào section "On-Demand Module Import"
2. DevTools Network tab đang mở
3. Click "Load Heavy Module"
4. Button disabled + "Loading..." text
5. Network tab: thấy chunk .js của heavy-processor được tải
6. Module load xong → kết quả hiển thị: "Processed 50000 items in XXms"
7. Load time hiển thị: "Module loaded in 142ms"

**Kết quả mong đợi:** Import thành công, hiển thị kết quả + thời gian import.

---

## UC-LL-05: Chạy lại module đã import (cached)

**Mô tả:** Sau khi import lần đầu, module được cache — không có network request mới.

**Các bước:**
1. Đã load module lần 1 (UC-LL-04)
2. Click "Run Again"
3. Module không tải lại từ network (đã cache)
4. Kết quả chạy lại: "Processed 50000 items in XXms"
5. Load time: "cached load: 0ms"

**Kết quả mong đợi:** Không có request JS mới trong Network tab. Thời gian import ≈ 0ms.

---

## UC-LL-06: Load more items — page 1

**Mô tả:** Người dùng load batch dữ liệu đầu tiên từ API.

**Các bước:**
1. Vào section "Load More Data"
2. Hiển thị: "No items loaded yet"
3. Click "Load More"
4. Button hiển thị spinner "Loading..."
5. Sau ~400ms → 10 items hiển thị
6. Counter: "Showing 10 of 200 items"
7. Fetch time: "Fetched in 387ms"

**Kết quả mong đợi:** Load thành công, hiển thị thời gian fetch.

---

## UC-LL-07: Load more items — tiếp tục đến hết

**Mô tả:** Người dùng click "Load More" nhiều lần cho đến khi hết dữ liệu.

**Các bước:**
1. Sau page 1 (10 items)
2. Click "Load More" → 20 items, "Showing 20 of 200"
3. Click "Load More" → 30 items, "Showing 30 of 200"
4. ...tiếp tục click thêm 17 lần nữa
5. Sau 20 lần: "Showing 200 of 200 items — All loaded!"
6. Nút "Load More" biến mất

**Kết quả mong đợi:** Load đúng 200 items. Nút biến mất khi hết dữ liệu.

---

## UC-LL-08: Load more khi mất mạng (offline)

**Mô tả:** Click "Load More" khi không có kết nối mạng.

**Các bước:**
1. Đã load 20 items
2. Chuyển offline (DevTools → Network → Offline)
3. Click "Load More"
4. Fetch fail → hiển thị lỗi "Failed to load — check your connection"
5. 20 items đã load vẫn hiển thị
6. Nút "Load More" vẫn sẵn sàng để retry

**Kết quả mong đợi:** Dữ liệu đã load không bị mất. Có thể retry khi online lại.

---

## UC-LL-09: Bật lại mạng và retry Load More

**Mô tả:** Sau khi mất mạng, bật lại và load tiếp.

**Các bước:**
1. Đang ở trạng thái lỗi sau UC-LL-08
2. Bật mạng trở lại
3. Click "Load More"
4. Fetch thành công → 10 items mới được append
5. Lỗi biến mất, counter cập nhật: "Showing 30 of 200"

**Kết quả mong đợi:** Tiếp tục load bình thường, không cần reload trang.

---

## UC-LL-10: Xem kích thước chunk JS trong DevTools

**Mô tả:** Developer kiểm tra kích thước các chunk được tạo bởi code-splitting.

**Các bước:**
1. Build production: `npm run build`
2. Vào `/lazy-loading`
3. DevTools → Network → JS → filter "heavy"
4. Click "Show Heavy Widget" → thấy chunk JS ~X KB
5. Click "Load Heavy Module" → thấy chunk JS ~Y KB
6. DevTools → Coverage → record → thấy JS nào đã execute

**Kết quả mong đợi:** Chỉ JS cần thiết được tải. Các chunk được tách riêng, không nằm trong bundle chính.

---

## UC-LL-11: Skeleton placeholder không gây layout shift

**Mô tả:** Khi heavy component đang load, skeleton placeholder giữ đúng kích thước.

**Các bước:**
1. Click "Show Heavy Widget"
2. Trong lúc load, skeleton hiển thị với kích thước cố định
3. Component load xong → thay thế skeleton → không có layout shift
4. Các phần khác của trang không bị nhảy

**Kết quả mong đợi:** Cumulative Layout Shift (CLS) = 0 cho section này.

---

## UC-LL-12: Responsive image grid

**Mô tả:** Image gallery thay đổi số cột theo kích thước màn hình.

**Các bước:**
1. Desktop (1280px): grid 5 cột
2. Resize xuống 1024px: grid 4 cột
3. Tablet (768px): grid 3 cột
4. Mobile (480px): grid 2 cột

**Kết quả mong đợi:** Grid responsive, ảnh co giãn phù hợp, counter vẫn chính xác.

---

## UC-LL-13: Navigate away và quay lại — state giữ nguyên

**Mô tả:** Chuyển trang rồi quay lại `/lazy-loading`, các state được giữ.

**Các bước:**
1. Load 30 items, bật heavy widget, load module
2. Click Navbar → chuyển đến `/push`
3. Click Navbar → quay lại `/lazy-loading`
4. Component re-mount (state reset về mặc định)

**Kết quả mong đợi:** State reset — đây là hành vi mặc định của React (component unmount → state mất). Có thể ghi chú rằng cần state management (context/query) nếu muốn persist.

**Lưu ý:** Đây là điểm khác biệt với virtual table (cũng reset khi chuyển trang). Nếu cần persist, wrap bằng context provider.

---

## UC-LL-14: Không có network request ảnh nào khi load trang

**Mô tả:** Kiểm tra rằng không có ảnh nào được download khi trang vừa load (chưa scroll).

**Các bước:**
1. Mở DevTools → Network → tab Img (hoặc lọc "picsum")
2. Reload trang `/lazy-loading` (Ctrl+Shift+R)
3. Ngay sau khi load: Network tab Img trống — **0 requests**
4. Quan sát grid: tất cả placeholder hiển thị số `#1` → `#100`, nền xám
5. Counter: "0 / 100 images loaded"
6. Đợi 2-3 giây — IntersectionObserver fire cho các ô trong viewport
7. Network tab: thấy request picsum xuất hiện (chỉ các ảnh trong viewport + 200px margin)
8. Counter tăng lên ~20

**Kết quả mong đợi:** Zero ảnh download khi load trang. Chỉ download khi placeholder vào viewport.

**Tại sao không dùng `loading="lazy"`:** `loading="lazy"` là browser hint, không đảm bảo. Browser có thể quyết định download tất cả ảnh. Cách JS-driven: không có `<img>` tag = không có `src` = browser không thể download.
