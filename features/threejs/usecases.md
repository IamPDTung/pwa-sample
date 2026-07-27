# Three.js — Các trường hợp sử dụng

## UC-3D-01: Xem Car Viewer với 5 mẫu xe trên bản đồ cỏ

**Mô tả:** Người dùng vào trang Three.js và thấy car viewer với 5 mẫu xe thể thao trên bản đồ xanh.

**Các bước:**
1. Vào `/threejs`
2. Trang hiển thị skeleton "Loading 3D scene..." trong ~1-2 giây
3. Canvas 500px hiển thị: xe Red Coupe trên bản đồ cỏ xanh 80×80
4. Bản đồ có 35 cây (thân nâu + tán xanh) và 250 bụi cỏ rải rác
5. Grid màu xanh đậm chia ô trên mặt đất
6. Bên dưới canvas: thanh selector 5 thumbnail
7. Camera ở góc nhìn từ trên cao, bám theo xe

**Kết quả mong đợi:** Xe 3D + bản đồ cỏ + cây + cỏ hiển thị rõ ràng. Thanh selector hoạt động.

---

## UC-3D-02: Chọn mẫu xe khác

**Mô tả:** Người dùng click vào thumbnail để đổi xe. Xe mới xuất hiện tại vị trí gốc (0,0).

**Các bước:**
1. Đang lái Red Coupe trên bản đồ
2. Click "Blue Sedan" trong thanh selector
3. Red Coupe biến mất, Blue Sedan xuất hiện tại (0, 0) hướng +Z
4. Thumbnail Blue Sedan highlight violet
5. Lái Blue Sedan đi một đoạn
6. Click "Yellow Racer"
7. Xe đua vàng xuất hiện tại (0, 0) với spoiler đặc trưng

**Kết quả mong đợi:** Chuyển đổi xe tức thì. Xe mới luôn bắt đầu tại gốc tọa độ.

---

## UC-3D-03: Lái xe bằng phím mũi tên

**Mô tả:** Người dùng dùng arrow keys để lái xe quanh bản đồ.

**Các bước:**
1. Nhấn `↑` — xe chạy thẳng về phía trước (hướng +Z)
2. Nhấn giữ `↑` — xe tiếp tục chạy tốc độ 8u/s
3. Nhấn `↓` — xe lùi ngược lại
4. Camera tự động bám theo vị trí xe (lerp mượt)

**Kết quả mong đợi:** Xe phản hồi ngay với phím. ↑ = tiến, ↓ = lùi đúng hướng đầu xe.

---

## UC-3D-04: Lái xe trái/phải

**Mô tả:** Người dùng dùng `←` `→` để lái xe sang trái/phải.

**Các bước:**
1. Nhấn `←` — xe xoay sang trái (CCW, rotation tăng)
2. Nhấn đồng thời `←` + `↑` — xe vừa xoay trái vừa chạy (cua trái)
3. Nhấn `→` + `↑` — xe cua phải
4. Nhấn `↓` + `←` — xe vừa lùi vừa xoay

**Kết quả mong đợi:** Xe cua mượt, hướng di chuyển luôn là hướng đầu xe.

---

## UC-3D-05: Va chạm với cây

**Mô tả:** Xe không thể đi xuyên qua cây trên bản đồ.

**Các bước:**
1. Lái xe thẳng về phía một cái cây
2. Khi xe chạm cây (distance < 3.3) → xe dừng lại, không đi xuyên qua
3. Nhấn `←` hoặc `→` để xoay xe, sau đó `↑` để tránh cây
4. Xe vẫn có thể xoay khi đứng sát cây (rotation không bị chặn)

**Kết quả mong đợi:** Cây là chướng ngại vật. Xe phải lái vòng để tránh.

---

## UC-3D-06: Đi xuyên qua cỏ

**Mô tả:** Xe có thể đi xuyên qua các bụi cỏ trên bản đồ.

**Các bước:**
1. Lái xe thẳng qua một vùng có nhiều bụi cỏ
2. Xe đi xuyên qua cỏ bình thường, không bị chặn
3. Cỏ vẫn hiển thị bình thường sau khi xe đi qua

**Kết quả mong đợi:** Cỏ là yếu tố trang trí, không ảnh hưởng đến chuyển động.

---

## UC-3D-07: Camera bám theo xe

**Mô tả:** Camera tự động di chuyển theo xe với hiệu ứng lerp mượt.

**Các bước:**
1. Lái xe chạy thẳng về phía trước
2. Camera từ từ trượt theo vị trí xe (factor 0.12)
3. Kéo chuột để xoay camera quanh xe khi đang chạy
4. Scroll để zoom gần/xa (3-20 units)
5. Right-click + drag để pan camera

**Kết quả mong đợi:** Camera luôn hướng về xe. Có thể tự do điều chỉnh góc nhìn khi xe đang chạy.

---

## UC-3D-08: Không rơi khỏi bản đồ

**Mô tả:** Xe bị giới hạn trong phạm vi bản đồ 80×80.

**Các bước:**
1. Lái xe về phía rìa bản đồ
2. Khi xe chạm rìa (cách biên 3 units) → dừng lại, không đi tiếp được
3. Xoay xe và chạy hướng khác — bình thường

**Kết quả mong đợi:** Xe luôn nằm trong bản đồ, không rơi ra ngoài.

---

## UC-3D-09: Code splitting — bundle chỉ tải khi vào trang

**Mô tả:** Three.js bundle được tách riêng, chỉ tải khi người dùng vào `/threejs`.

**Các bước:**
1. Ở trang Home, mở DevTools → Network tab
2. Lọc JS, refresh → không thấy file three.js
3. Click "Three.js" trong dropdown UI Animations
4. Skeleton hiển thị "Loading 3D scene..."
5. Network tab: thấy chunk .js của car-viewer được tải
6. Bundle load xong → canvas hiển thị

**Kết quả mong đợi:** Bundle Three.js không tải ở các trang khác.

---

## UC-3D-10: Tương tác trên mobile (touch)

**Mô tả:** Người dùng chọn xe và xem trên điện thoại/tablet.

**Các bước:**
1. Mở `/threejs` trên thiết bị di động
2. Canvas + selector hiển thị responsive
3. Touch drag để xoay camera
4. Pinch để zoom
5. Không có arrow keys trên mobile — người dùng chỉ xem và xoay camera

**Kết quả mong đợi:** Touch gesture hoạt động mượt mà.

---

## UC-3D-11: Nhìn chi tiết xe

**Mô tả:** Người dùng zoom-in để xem chi tiết từng mẫu xe.

**Các bước:**
1. Chọn Yellow Racer → scroll zoom-in → thấy spoiler sau
2. Chọn Orange Muscle → nhìn phía trước → headlights phát sáng vàng
3. Nhìn phía sau bất kỳ xe nào → taillights đỏ
4. Nhìn từ hông → cabin kính đen, hub bánh xe xám

**Kết quả mong đợi:** Tất cả chi tiết hiển thị rõ khi zoom-in.

---

## UC-3D-12: Performance — FPS ổn định

**Mô tả:** Scene 3D chạy mượt mà với 35 cây + 250 bụi cỏ.

**Các bước:**
1. Vào `/threejs`
2. Lái xe vòng quanh bản đồ
3. Camera lerp mượt theo xe
4. Mở DevTools → FPS meter: 60fps ổn định

**Kết quả mong đợi:** 60fps ổn định kể cả khi render 35 cây + 250 cỏ.

---

## UC-3D-13: Thu thập nhẫn vàng trên bản đồ

**Mô tả:** Người dùng lái xe đến vị trí nhẫn vàng để thu thập. Điểm tăng và nhẫn mới xuất hiện ở nơi khác.

**Các bước:**
1. Trên bản đồ có 10 nhẫn vàng (torus) nằm ngang, xoay tại chỗ, lơ lửng ở y=0.3
2. Lái xe về phía một nhẫn vàng
3. Khi xe chạm nhẫn (distance < 5.0) → nhẫn biến mất
4. Điểm `🏆 Rings: N` tăng lên 1
5. Nhẫn mới xuất hiện ở vị trí ngẫu nhiên khác (cách xa xe ≥12 units)
6. Lặp lại — lái xe thu thập các nhẫn khác trên bản đồ

**Kết quả mong đợi:** Nhẫn biến mất + điểm tăng + nhẫn mới spawn. Tổng nhẫn luôn = 10.

---

## UC-3D-14: Âm thanh "ting tong" khi thu thập nhẫn

**Mô tả:** Khi xe chạm nhẫn, phát âm thanh 2 tông qua Web Audio API.

**Các bước:**
1. Bật âm thanh máy tính/loa
2. Lái xe chạm một nhẫn
3. Nghe âm "ting" (cao, 880Hz) → "tong" (thấp, 660Hz) trong ~280ms
4. Chạm 2 nhẫn liên tiếp → mỗi lần phát âm thanh riêng

**Kết quả mong đợi:** Âm thanh ting-tong rõ ràng, không bị chồng lấn, độ trễ thấp.

---

## UC-3D-15: Điểm tích lũy qua các lần đổi xe

**Mô tả:** Điểm nhẫn không bị reset khi người dùng đổi xe.

**Các bước:**
1. Thu thập 3 nhẫn với Red Coupe → điểm = 3
2. Click chọn Blue Sedan
3. Điểm vẫn là 3
4. Thu thập thêm 2 nhẫn với Blue Sedan → điểm = 5
5. Click chọn Yellow Racer
6. Điểm vẫn là 5

**Kết quả mong đợi:** Điểm tích lũy toàn session, không mất khi đổi xe.
