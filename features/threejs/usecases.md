# Three.js — Các trường hợp sử dụng

## UC-3D-01: Xem Car Viewer với 5 mẫu xe

**Mô tả:** Người dùng vào trang Three.js và thấy car viewer với 5 mẫu xe thể thao.

**Các bước:**
1. Vào `/threejs`
2. Trang hiển thị skeleton "Loading 3D scene..." trong ~1-2 giây
3. Canvas 3D hiển thị: xe Red Coupe màu đỏ trên mặt phẳng xám với studio lighting
4. Bên dưới canvas: thanh selector với 5 thumbnail (màu sắc + tên xe)
5. Active car (Red Coupe) được highlight với viền violet
6. Xe tự xoay chậm (auto-rotate)
7. Bóng đổ mềm (contact shadows) hiển thị dưới xe

**Kết quả mong đợi:** Xe 3D hiển thị rõ ràng với studio lighting chuyên nghiệp. Thanh selector hoạt động.

---

## UC-3D-02: Chọn mẫu xe khác

**Mô tả:** Người dùng click vào thumbnail để đổi xe.

**Các bước:**
1. Đang hiển thị Red Coupe
2. Click "Blue Sedan" trong thanh selector
3. Red Coupe biến mất, Blue Sedan xuất hiện (không animation transition)
4. Thumbnail Blue Sedan được highlight violet, Red Coupe trở về bình thường
5. Click tiếp "Yellow Racer"
6. Xe đua vàng xuất hiện với spoiler đặc trưng

**Kết quả mong đợi:** Chuyển đổi xe tức thì. Highlight di chuyển theo xe đã chọn.

---

## UC-3D-03: Kéo chuột để xoay xe

**Mô tả:** Người dùng drag chuột trái để xoay xe.

**Các bước:**
1. Xe đang tự xoay (auto-rotate)
2. Click chuột trái + giữ + kéo sang trái
3. Xe xoay theo hướng kéo
4. Auto-rotate tạm dừng trong khi kéo
5. Thả chuột → dừng ở góc hiện tại, auto-rotate tiếp tục

**Kết quả mong đợi:** Xe xoay mượt mà theo chuyển động chuột. Có thể nhìn mọi góc: trước, sau, hông, trên.

---

## UC-3D-04: Scroll để zoom

**Mô tả:** Người dùng scroll để phóng to/thu nhỏ xe.

**Các bước:**
1. Scroll lên → zoom in, xe to dần (tối thiểu 4 units)
2. Scroll xuống → zoom out, xe nhỏ dần (tối đa 14 units)
3. Không thể zoom vào quá gần

**Kết quả mong đợi:** Zoom mượt mà với min/max distance limits.

---

## UC-3D-05: Right-click để pan

**Mô tả:** Người dùng di chuyển góc nhìn bằng right-click.

**Các bước:**
1. Right-click + giữ + kéo
2. Camera di chuyển ngang/dọc, xe giữ vị trí tương đối

**Kết quả mong đợi:** Pan mượt mà.

---

## UC-3D-06: Nhìn các chi tiết xe

**Mô tả:** Người dùng zoom-in và xoay để xem chi tiết từng mẫu xe.

**Các bước:**
1. Chọn Yellow Racer
2. Zoom-in + xoay để nhìn từ phía sau → thấy spoiler
3. Chọn Orange Muscle
4. Zoom-in nhìn phía trước → thấy đèn pha (headlights) phát sáng vàng
5. Xoay nhìn phía sau → thấy đèn hậu (taillights) đỏ
6. Chọn Blue Sedan
7. Nhìn từ hông → cabin kính màu đen, wheel hub xám

**Kết quả mong đợi:** Tất cả chi tiết (headlights, taillights, spoiler, wheels) hiển thị rõ khi zoom-in.

---

## UC-3D-07: Code splitting — bundle chỉ tải khi vào trang

**Mô tả:** Three.js + drei bundle được tách riêng, chỉ tải khi người dùng vào `/threejs`.

**Các bước:**
1. Ở trang Home, mở DevTools → Network tab
2. Lọc JS, refresh → không thấy file three.js
3. Click "Three.js" trong dropdown UI Animations
4. Skeleton hiển thị "Loading 3D scene..."
5. Network tab: thấy chunk .js của car-viewer được tải
6. Bundle load xong → canvas hiển thị xe

**Kết quả mong đợi:** Bundle Three.js không tải ở các trang khác.

---

## UC-3D-08: Tương tác trên mobile (touch)

**Mô tả:** Người dùng chọn xe và xoay trên điện thoại/tablet.

**Các bước:**
1. Mở `/threejs` trên thiết bị di động
2. Canvas + selector hiển thị trong viewport mobile (responsive)
3. Swipe selector nếu nhiều xe (flex-wrap)
4. 1 ngón swipe trên canvas → xoay xe
5. 2 ngón pinch → zoom
6. 2 ngón drag → pan
7. Click thumbnail → đổi xe

**Kết quả mong đợi:** Touch gesture hoạt động mượt mà.

---

## UC-3D-09: Performance — FPS ổn định

**Mô tả:** Scene 3D chạy mượt mà ở 60fps.

**Các bước:**
1. Vào `/threejs`
2. Xe tự xoay mượt mà
3. Click đổi xe liên tục → phản hồi ngay
4. Kéo xoay → mượt, không lag
5. Mở DevTools → FPS meter: 60fps ổn định

**Kết quả mong đợi:** 60fps ổn định. Mỗi xe chỉ có ~10 mesh primitives, rất nhẹ.
