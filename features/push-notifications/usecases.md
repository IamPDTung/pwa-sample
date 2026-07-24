# Push Notifications — Các trường hợp sử dụng

## UC-PUSH-01: Cấp quyền notification lần đầu

**Mô tả:** Người dùng truy cập `/push` lần đầu, chưa từng cấp quyền notification.

**Điều kiện tiên quyết:** `Notification.permission === "default"`

**Các bước:**
1. Vào `/push` → UI hiển thị nút "Enable Notification"
2. Click "Enable Notification"
3. Trình duyệt hiển thị popup xin quyền (Allow / Block)
4. Click "Allow" → `Notification.permission` chuyển thành "granted"
5. UI hiển thị các nút "Send Now" và "Start Auto"

**Kết quả mong đợi:** Các tính năng notification được kích hoạt.

**Tình huống thay thế:**
- Click "Block": `permission === "denied"` → hiển thị message hướng dẫn bật lại trong browser settings
- Đóng popup mà không chọn: permission vẫn là "default", có thể xin lại

---

## UC-PUSH-02: Đã từ chối quyền trước đó

**Mô tả:** Người dùng đã từ chối quyền notification trước đó.

**Điều kiện tiên quyết:** `Notification.permission === "denied"`

**Các bước:**
1. Vào `/push`
2. UI hiển thị: "Notifications are blocked. Enable them in browser settings."
3. Không hiển thị nút "Enable Notification" (browser không cho xin lại nếu đã denied)
4. Các nút "Send Now" và "Start Auto" bị disabled

**Kết quả mong đợi:** Người dùng biết cách bật lại quyền trong browser settings.

---

## UC-PUSH-03: Gửi notification ngay lập tức (tab đang mở)

**Mô tả:** Người dùng gửi một notification để test tính năng.

**Điều kiện tiên quyết:** Permission granted, tab `/push` đang mở.

**Các bước:**
1. Click "Send Now"
2. `new Notification(...)` được gọi trực tiếp
3. Notification xuất hiện ở góc màn hình với icon app
4. Nội dung: "Direct Notification — Sent at HH:MM:SS"
5. Tag: "direct" (đảm bảo không trùng lặp)

**Kết quả mong đợi:** Notification hiển thị ngay, biến mất sau vài giây hoặc khi click.

---

## UC-PUSH-04: Bắt đầu auto notification interval

**Mô tả:** Bắt đầu chế độ tự động gửi notification mỗi 5 giây qua SW.

**Điều kiện tiên quyết:** Permission granted, SW đã đăng ký.

**Các bước:**
1. Click "Start Auto"
2. Component gửi `postMessage({ type: "START_INTERVAL" })` → SW
3. SW bắt đầu `setInterval(5000)` → gọi `showNotification()` mỗi 5s
4. UI hiển thị "Running..." và nút "Stop Auto"
5. Notification xuất hiện định kỳ với nội dung: `Time: HH:MM:SS`
6. Tag: "sw-interval" (mỗi notification mới thay thế cái cũ)

**Kết quả mong đợi:** Notification gửi liên tục mỗi 5s cho đến khi Stop.

---

## UC-PUSH-05: Auto notification khi đóng tab

**Mô tả:** Sau khi bật Auto, đóng tab `/push` → SW vẫn gửi notification.

**Điều kiện tiên quyết:** Đã click "Start Auto".

**Các bước:**
1. Tab `/push` mở, Auto đang chạy
2. Đóng tab `/push`
3. Đợi 5-10s
4. Notification vẫn xuất hiện từ SW

**Kết quả mong đợi:** SW vẫn chạy trong nền và gửi notification.

---

## UC-PUSH-06: Dừng auto notification

**Mô tả:** Người dùng dừng chế độ auto notification.

**Các bước:**
1. Mở lại tab `/push` (nếu đã đóng)
2. UI tự động kiểm tra: gửi `postMessage({ type: "STOP_INTERVAL" })` khi mount
3. Hoặc click "Stop Auto" nếu đang hiển thị nút Stop
4. SW nhận message → `clearInterval(intervalId)`
5. Notification count được lưu vào localStorage

**Kết quả mong đợi:** Không còn notification mới. Counter hiển thị số lần đã gửi.

---

## UC-PUSH-07: Click vào notification khi có tab đang mở

**Mô tả:** Người dùng click vào notification khi đã có tab PWA đang mở.

**Các bước:**
1. Đang mở tab PWA (bất kỳ trang nào)
2. Notification xuất hiện từ SW interval
3. Click vào notification

**SW xử lý:**
- `notificationclick` event → `notification.close()`
- `clients.matchAll({ type: "window" })` → tìm tab đang mở
- Có tab → `client.focus()` → focus vào tab hiện tại
- Không mở tab mới

**Kết quả mong đợi:** Chuyển đến tab PWA đang mở, không tạo tab mới.

---

## UC-PUSH-08: Click vào notification khi không có tab nào mở

**Mô tả:** Người dùng click vào notification khi không có tab PWA nào.

**Các bước:**
1. Đóng tất cả tab PWA
2. Notification xuất hiện từ SW interval
3. Click vào notification

**SW xử lý:**
- `clients.matchAll()` → mảng rỗng
- `clients.openWindow("/")` → mở tab mới tại `/`

**Kết quả mong đợi:** Mở tab mới tại trang chủ PWA.

---

## UC-PUSH-09: Đếm số lần gửi notification (localStorage)

**Mô tả:** Hệ thống đếm và hiển thị số lần đã gửi notification.

**Các bước:**
1. Mỗi lần click "Stop Auto", counter trong localStorage tăng lên 1
2. Khi load trang, đọc counter từ localStorage
3. Hiển thị: "Notifications sent in this session: N"

**Kết quả mong đợi:** Counter tồn tại qua các lần refresh trang, tăng dần theo thời gian.

---

## UC-PUSH-10: Hết hạn permission (user clears settings)

**Mô tả:** Người dùng vào browser settings thay đổi quyền notification.

**Các bước:**
1. Đang có permission "granted"
2. Vào Chrome Settings → Privacy → Site Settings → Notifications
3. Block domain PWA
4. Refresh `/push`
5. `Notification.permission` = "denied"

**Kết quả mong đợi:** UI cập nhật trạng thái, các nút bị disabled, hiển thị message hướng dẫn.
