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

---

## Web Push (BE → Browser)

## UC-PUSH-11: Subscribe Web Push

**Mô tả:** Người dùng đăng ký nhận push notification từ backend.

**Điều kiện tiên quyết:** Permission granted, SW đã đăng ký.

**Các bước:**
1. Vào `/push`, permission = granted
2. Xem section "Web Push (from Backend)"
3. Click "Subscribe to Web Push"
4. Frontend: `GET /api/push/vapid-key` → lấy VAPID public key
5. Frontend: `reg.pushManager.subscribe({ applicationServerKey })` → đăng ký với browser push service
6. Frontend: `POST /api/push/subscribe` → gửi subscription lên server
7. Server lưu subscription vào memory store
8. UI hiển thị "Subscribed to Web Push", nút chuyển thành "Unsubscribe"

**Kết quả mong đợi:** Subscription được lưu trên server. Có thể nhận push từ BE.

---

## UC-PUSH-12: Gửi push từ Backend (browser đang mở)

**Mô tả:** Backend gửi push notification, browser đang mở tab.

**Điều kiện tiên quyết:** Đã subscribe Web Push.

**Các bước:**
1. Nhập title và body trong form Web Push
2. Click "Send from Backend"
3. `POST /api/push/send { title, body }`
4. Server: `webpush.sendNotification(sub, payload)` → gửi đến FCM/Moz/APN
5. Push service forward message đến browser
6. SW nhận `push` event → gọi `showNotification()`
7. Notification xuất hiện với title và body đã nhập

**Kết quả mong đợi:** Notification hiển thị chính xác nội dung đã nhập từ BE.

---

## UC-PUSH-13: Gửi push từ Backend (browser đóng hoàn toàn)

**Mô tả:** Backend gửi push notification khi không có tab browser nào mở.

**Điều kiện tiên quyết:** Đã subscribe Web Push. Browser không chạy.

**Các bước:**
1. Subscribe Web Push
2. Đóng tất cả tab PWA, đóng hoàn toàn browser (Exit Chrome/Edge)
3. Dùng công cụ khác (Postman, curl) gọi `POST /api/push/send`
4. Push service gửi message đến OS notification system
5. OS hiển thị notification (Windows notification center, macOS Notification Center)
6. Click notification → browser mở + tab PWA mở

**Kết quả mong đợi:** Notification vẫn đến dù browser đã đóng hoàn toàn. Đây là điểm khác biệt lớn nhất so với SW interval.

**Lưu ý:** Cần browser chạy nền (background service) — Chrome/Edge mặc định có. Một số OS (iOS Safari) có thể yêu cầu PWA đã được cài đặt.

---

## UC-PUSH-14: Unsubscribe Web Push

**Mô tả:** Người dùng hủy đăng ký Web Push.

**Các bước:**
1. Đang subscribed → hiển thị nút "Unsubscribe"
2. Click "Unsubscribe"
3. Frontend: `subscription.unsubscribe()` → hủy với browser push service
4. Frontend: `DELETE /api/push/subscribe?endpoint=...` → xóa trên server
5. Nút chuyển thành "Subscribe to Web Push"
6. Hiển thị "Unsubscribed from Web Push"

**Kết quả mong đợi:** Subscription bị xóa cả phía client và server. Không còn nhận push.

---

## UC-PUSH-15: Subscription hết hạn — tự động cleanup

**Mô tả:** Subscription trên push service hết hạn hoặc bị revoke, server tự động xóa.

**Các bước:**
1. Có subscription cũ trong store (ví dụ: từ session trước, VAPID key đã đổi)
2. Gọi `POST /api/push/send`
3. Push service trả về HTTP 410 Gone cho subscription cũ
4. Server catch error → xóa subscription khỏi store
5. Response: `{ ok: 0, gone: 1, error: 0 }`

**Kết quả mong đợi:** Subscription lỗi thời bị xóa tự động. Store luôn sạch.

---

## UC-PUSH-16: Gửi push khi chưa subscribe

**Mô tả:** Cố gắng gửi push nhưng chưa có subscription nào.

**Các bước:**
1. Chưa subscribe Web Push (hoặc đã unsubscribe)
2. Click "Send from Backend"
3. Server trả về 400: `{ error: "No subscriptions. Subscribe on the client first." }`

**Kết quả mong đợi:** Thông báo rõ ràng yêu cầu subscribe trước.

---

## UC-PUSH-17: Notification click từ Web Push

**Mô tả:** User click vào notification được gửi từ Web Push.

**Các bước:**
1. Web Push notification xuất hiện (tag: "web-push")
2. Click vào notification
3. SW xử lý `notificationclick` (dùng chung handler):
   - Đóng notification
   - Focus vào tab đang mở hoặc mở tab mới tại `/`

**Kết quả mong đợi:** Hành vi giống với local notification click.

---

## UC-PUSH-18: VAPID key tự động tạo & persist

**Mô tả:** VAPID keys được tự động generate khi server start và persist trong suốt lifetime.

**Các bước:**
1. Server start lần đầu → `webpush.generateVAPIDKeys()` → lưu vào `globalThis`
2. HMR reload (dev mode) → module re-execute → keys đã có trong `globalThis` → không generate lại
3. Client subscribe → dùng public key từ `globalThis`
4. Server restart → keys mới được generate (subscription cũ mất hiệu lực)

**Kết quả mong đợi:** Keys không đổi trong dev HMR loop. Subscription không bị invalid khi code thay đổi.

**Lưu ý:** Production nên lưu VAPID keys trong biến môi trường (env vars) để không bị thay đổi giữa các lần deploy.

---

## UC-PUSH-19: End-to-end flow: subscribe → close browser → push → receive

**Mô tả:** Test đầy đủ flow Web Push từ subscribe đến nhận notification.

**Điều kiện tiên quyết:** Permission granted.

**Các bước:**
1. Subscribe Web Push (UC-PUSH-11)
2. Gửi 1 push để verify (UC-PUSH-12) → nhận notification OK
3. Đóng hoàn toàn browser (Exit, không minimize)
4. Gọi `curl -X POST http://localhost:3000/api/push/send -H "Content-Type: application/json" -d '{"title":"Test","body":"Browser closed!"}'`
5. Đợi vài giây
6. Notification xuất hiện trên desktop (Windows/macOS)

**Kết quả mong đợi:** Push hoạt động xuyên suốt, kể cả khi browser đã đóng. Đây là điểm mạnh nhất của Web Push API.
