# PWA — Các trường hợp sử dụng

## UC-PWA-01: Cài đặt ứng dụng lên desktop/mobile

**Mô tả:** Người dùng truy cập website, trình duyệt hiển thị banner "Install app", người dùng click để cài đặt PWA.

**Điều kiện tiên quyết:**
- Trình duyệt hỗ trợ PWA (Chrome, Edge, Safari)
- Website được phục vụ qua HTTPS (hoặc localhost)
- Manifest.json hợp lệ, có đủ icons (192x192, 512x512)

**Các bước:**
1. Mở website tại `http://localhost:3000`
2. SW được đăng ký tự động trong nền (register-pwa.tsx)
3. Trình duyệt kiểm tra `manifest.json` → phát hiện PWA
4. Thanh địa chỉ hiển thị icon/banner "Install"
5. Click "Install" → app được thêm vào desktop/start menu
6. Mở app từ shortcut → hiển thị ở chế độ standalone (không URL bar)

**Kết quả mong đợi:** App mở ở cửa sổ riêng, có icon riêng, không có thanh địa chỉ.

---

## UC-PWA-02: Duyệt web khi online

**Mô tả:** Người dùng truy cập các trang bình thường khi có mạng.

**Các bước:**
1. Vào `/`, `/push`, `/upload`, `/virtual`, `/spreadsheet`, `/optimistic`
2. Server trả về HTML tĩnh hoặc SSR
3. SW lắng nghe navigation request → fetch từ network → cache response vào `page-navigations`

**Kết quả mong đợi:** Tất cả các trang hoạt động bình thường. SW cache từng page đã truy cập.

---

## UC-PWA-03: Duyệt web khi offline (trang đã cache)

**Mô tả:** Người dùng đã truy cập một số trang khi online, sau đó mất mạng và truy cập lại.

**Điều kiện tiên quyết:** Đã từng truy cập trang đó khi online (đã cache).

**Các bước:**
1. Khi online: vào `/optimistic` → page được cache
2. Chuyển trình duyệt sang offline mode (DevTools → Network → Offline)
3. Refresh `/optimistic` hoặc mở tab mới
4. SW: `fetch(request)` → fail (offline)
5. SW: fallback `caches.match(request)` → hit → trả về page đã cache

**Kết quả mong đợi:** Trang hiển thị bình thường như khi online.

---

## UC-PWA-04: Duyệt web khi offline (trang chưa cache)

**Mô tả:** Người dùng mất mạng và truy cập một trang chưa từng truy cập trước đó.

**Các bước:**
1. Chưa từng vào `/push` khi online
2. Chuyển offline → vào `/push`
3. SW: `fetch(request)` → fail
4. SW: `caches.match("/push")` → miss
5. SW: `caches.match("/offline.html")` → miss hoặc hit
6. SW: `caches.match("/")` → hit → trả về trang chủ (fallback)

**Kết quả mong đợi:** Hiển thị trang offline (`offline.html`) hoặc trang chủ nếu đã cache, không hiển thị lỗi "No internet".

---

## UC-PWA-05: Cập nhật Service Worker

**Mô tả:** Developer push phiên bản mới của SW, trình duyệt tự động cập nhật.

**Các bước:**
1. Developer push code mới → `public/sw.js` thay đổi
2. Người dùng mở lại website
3. Trình duyệt so sánh SW cũ vs SW mới trên server → khác biệt
4. Tải SW mới về
5. `skipWaiting: true` → SW mới activate ngay (không cần đóng tab)
6. `clientsClaim: true` → SW mới kiểm soát tất cả clients đang mở

**Kết quả mong đợi:** Người dùng luôn dùng SW mới nhất. Có thể cần refresh 1 lần để kích hoạt kiểm tra update.

**Lưu ý:** Nếu SW hoạt động sai, cần xóa thủ công trong DevTools → Application → Service Workers → Unregister.

---

## UC-PWA-06: App hoạt động ở chế độ standalone

**Mô tả:** Sau khi cài đặt PWA, người dùng mở app từ desktop shortcut.

**Các bước:**
1. Click shortcut PWA trên desktop
2. App mở ở cửa sổ riêng (không có URL bar, tab bar)
3. Display mode: standalone (set trong manifest.json)
4. Theme color: #7c3aed (tím)

**Kết quả mong đợi:** App trông giống native app, toàn màn hình, có theme màu tím.

---

## UC-PWA-07: Push notification hoạt động khi tab đóng

**Mô tả:** Sau khi bật auto interval push, đóng tab → SW vẫn gửi notification.

**Điều kiện tiên quyết:** Đã cấp quyền notification.

**Các bước:**
1. Vào `/push` → click "Enable Notification" → allow
2. Click "Start Auto" → interval 5s bắt đầu trong SW
3. Đóng tab `/push` (hoặc toàn bộ browser tab)
4. Đợi 5s
5. Notification xuất hiện trên desktop (từ SW)

**Kết quả mong đợi:** Notification vẫn gửi ngay cả khi không có tab nào mở.

---

## UC-PWA-08: Offline.html precache khi build

**Mô tả:** File `offline.html` được precache vào SW bundle khi build.

**Các bước:**
1. `npm run build`
2. `public/offline.html` được include vào `globPublicPatterns` trong `next.config.ts`
3. SW bundle (`public/sw.js`) chứa offline.html trong precache manifest
4. Khi SW activate → precache tất cả assets bao gồm offline.html
5. Người dùng offline → SW trả về `offline.html` từ precache

**Kết quả mong đợi:** `offline.html` luôn có sẵn trong cache ngay từ lần đầu tiên.
