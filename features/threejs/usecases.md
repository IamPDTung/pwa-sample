# Three.js — Các trường hợp sử dụng

## UC-3D-01: Xem khối lập phương 3D

**Mô tả:** Người dùng vào trang Three.js và thấy khối lập phương 3D.

**Các bước:**
1. Vào `/threejs`
2. Trang hiển thị skeleton "Loading 3D scene..." trong ~1-2 giây
3. Canvas 3D hiển thị: cube màu tím trên mặt phẳng xám
4. Lưới (grid) và trục tọa độ (axes) hiển thị bên dưới
5. Cube tự xoay chậm (auto-rotate)
6. Bóng đổ của cube hiển thị trên mặt đất

**Kết quả mong đợi:** Cube 3D màu violet hiển thị rõ ràng với ánh sáng và bóng đổ tự nhiên.

---

## UC-3D-02: Kéo chuột để xoay cube

**Mô tả:** Người dùng drag chuột trái để xoay khối lập phương.

**Các bước:**
1. Cube đang tự xoay (auto-rotate)
2. Click chuột trái + giữ + kéo sang trái
3. Cube xoay theo hướng kéo (OrbitControls rotate)
4. Auto-rotate tạm dừng trong khi kéo
5. Thả chuột → cube dừng ở góc hiện tại, auto-rotate tiếp tục

**Kết quả mong đợi:** Cube xoay mượt mà theo chuyển động chuột.

---

## UC-3D-03: Scroll để zoom

**Mô tả:** Người dùng scroll để phóng to/thu nhỏ.

**Các bước:**
1. Scroll lên (hoặc pinch-out trên trackpad) → zoom in, cube to dần
2. Scroll xuống (pinch-in) → zoom out, cube nhỏ dần
3. Không thể zoom quá gần (< 3 units từ tâm)
4. Không thể zoom quá xa (> 12 units từ tâm)

**Kết quả mong đợi:** Zoom hoạt động mượt mà với giới hạn min/max distance.

---

## UC-3D-04: Right-click để pan

**Mô tả:** Người dùng di chuyển góc nhìn bằng right-click.

**Các bước:**
1. Right-click + giữ + kéo
2. Camera di chuyển ngang/dọc, cube trượt theo
3. Grid và mặt đất di chuyển cùng camera
4. Thả chuột → dừng pan, auto-rotate tiếp tục

**Kết quả mong đợi:** Pan mượt mà, camera di chuyển trong không gian 2D.

---

## UC-3D-05: Auto-rotate khi không tương tác

**Mô tả:** Cube tự xoay chậm khi người dùng không tương tác.

**Các bước:**
1. Mở trang, không chạm vào canvas
2. Cube xoay chậm quanh trục Y với tốc độ 1.2 rad/s
3. Di chuyển con trỏ ra khỏi vùng canvas
4. Cube vẫn tiếp tục tự xoay
5. Sau vài giây → cube đã xoay được 1 vòng

**Kết quả mong đợi:** Auto-rotate hoạt động liên tục, dừng trong lúc user kéo, tiếp tục sau khi thả.

---

## UC-3D-06: Code splitting — bundle chỉ tải khi vào trang

**Mô tả:** Three.js bundle được tách riêng, chỉ tải khi người dùng vào `/threejs`.

**Các bước:**
1. Ở trang Home, mở DevTools → Network tab
2. Lọc JS, refresh → không thấy file three.js
3. Click "Three.js" trong dropdown UI Animations
4. Skeleton hiển thị "Loading 3D scene..."
5. Network tab: thấy chunk .js của threejs-scene được tải
6. Bundle load xong → canvas hiển thị

**Kết quả mong đợi:** Bundle Three.js không được tải ở các trang khác, chỉ tải khi vào `/threejs`.

---

## UC-3D-07: Tương tác trên mobile (touch)

**Mô tả:** Người dùng tương tác với cube trên điện thoại/tablet.

**Các bước:**
1. Mở `/threejs` trên thiết bị di động
2. Canvas hiển thị trong viewport mobile (responsive)
3. 1 ngón tay swipe → xoay cube
4. 2 ngón pinch → zoom in/out
5. 2 ngón drag → pan

**Kết quả mong đợi:** Touch gesture hoạt động mượt mà (OrbitControls hỗ trợ touch mặc định).

---

## UC-3D-08: Dark mode — giao diện nhất quán

**Mô tả:** Trang Three.js hiển thị đúng trong cả light và dark mode.

**Các bước:**
1. Mở `/threejs` ở light mode
2. Nền trang: `bg-zinc-50`, text: `text-zinc-900`, mô tả: `text-zinc-500`
3. Border canvas: `border-zinc-200`
4. Chuyển sang dark mode (OS setting hoặc class)
5. Nền trang: `dark:bg-zinc-950`, text: `dark:text-zinc-50`
6. Border canvas: `dark:border-zinc-700`
7. Canvas nền: `#fafafa` (không đổi — giữ trắng cho dễ nhìn 3D)

**Kết quả mong đợi:** Giao diện đồng nhất với theme hệ thống, canvas luôn dễ nhìn.

---

## UC-3D-09: Performance — FPS ổn định

**Mô tả:** Scene 3D chạy mượt mà ở 60fps.

**Các bước:**
1. Vào `/threejs`
2. Cube tự xoay mượt mà, không giật lag
3. Kéo xoay → phản hồi ngay, không delay
4. Scroll zoom → mượt, không nhảy bước
5. Mở DevTools → Performance → FPS meter: 60fps ổn định
6. Scene đơn giản (1 cube + 1 ground + 3 lights) → nhẹ, không ngốn GPU

**Kết quả mong đợi:** 60fps ổn định trên desktop. Mobile >30fps.
