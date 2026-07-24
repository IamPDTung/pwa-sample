# SSO (Single Sign-On) — Các trường hợp sử dụng

## UC-SSO-01: Truy cập trang SSO lần đầu

**Mô tả:** Người dùng chưa login, vào `/sso` lần đầu.

**Điều kiện tiên quyết:** Không có session cookie (`authjs.session-token`).

**Các bước:**
1. Vào `/sso` → hiển thị màn hình chọn provider
2. 2 button: "Sign in with Google" (xanh `#4285F4`, logo Google), "Sign in with GitHub" (đen `#24292e`, logo GitHub)
3. Navbar hiển thị link "Sign In"
4. Gõ trực tiếp `/sso/dashboard` → proxy redirect về `/sso`

**Kết quả mong đợi:** Hiển thị 2 provider button. Protected routes redirect về `/sso`.

---

## UC-SSO-02: Sign in with Google (OAuth thực tế)

**Mô tả:** Người dùng đăng nhập qua Google thật.

**Điều kiện tiên quyết:** Đã cấu hình `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `SSO_ADMIN_EMAILS`, `SSO_EDITOR_EMAILS`.

**Các bước:**
1. Vào `/sso`, click "Sign in with Google"
2. Browser redirect đến `https://accounts.google.com` — chọn tài khoản
3. (Lần đầu) Google hiển thị consent: "[App] wants to access your Google Account"
4. Click "Continue" → redirect về `/api/auth/callback/google`
5. Auth.js lấy email từ Google profile, so khớp với env config:
   - Email trong `SSO_ADMIN_EMAILS` → roles: `["admin", "editor", "viewer"]`
   - Email trong `SSO_EDITOR_EMAILS` → roles: `["editor", "viewer"]`
   - Email khác → roles: `["viewer"]`
6. Redirect đến `/sso/dashboard`
7. Dashboard hiển thị avatar (Google ảnh), name, email, provider "Google", role badges

**Kết quả mong đợi:** Login thành công. Role được gán tự động từ env config.

**Tình huống thay thế:**
- Email của bạn không nằm trong bất kỳ danh sách nào → chỉ có role "viewer"
- Thêm email vào `SSO_ADMIN_EMAILS`, sign out rồi sign in lại → role admin xuất hiện

---

## UC-SSO-03: Sign in với GitHub (OAuth thực tế)

**Mô tả:** Người dùng đăng nhập qua GitHub thật.

**Điều kiện tiên quyết:** Đã cấu hình `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`.

**Các bước:**
1. Vào `/sso`, click "Sign in with GitHub"
2. Browser redirect đến `https://github.com/login/oauth/authorize`
3. GitHub hiển thị: "Authorize [App] — wants to access your GitHub account"
4. Click "Authorize" → redirect về `/api/auth/callback/github`
5. Auth.js lấy email từ GitHub API (kể cả email private)
6. JWT callback so khớp email với env config để gán roles
7. Dashboard hiển thị avatar GitHub, name, email, provider "GitHub", roles

**Kết quả mong đợi:** Login qua GitHub thành công. Cùng email như Google → cùng roles.

**Lưu ý:** Nếu GitHub email khác với Google email, role có thể khác nhau — vì role gán theo email.

---

## UC-SSO-04: Lần đầu consent — Google hỏi xác nhận quyền

**Mô tả:** Lần đầu user cấp quyền cho app trên Google.

**Điều kiện tiên quyết:** Chưa từng authorize app này trên Google.

**Các bước:**
1. Click "Sign in with Google"
2. Chọn tài khoản Google
3. Google hiển thị consent screen: "[App] wants to access your Google Account"
4. Danh sách quyền: "See your personal info", "View your email address"
5. Click "Continue" → redirect về app

**Kết quả mong đợi:** Lần đầu Google hỏi consent. Các lần sau tự động redirect.

**Tình huống thay thế:** Click "Cancel" → Google redirect về app với `?error=access_denied` → hiển thị lỗi trên `/sso`.

---

## UC-SSO-05: Xem dashboard sau login

**Mô tả:** Người dùng đã login, xem dashboard.

**Điều kiện tiên quyết:** Đã login thành công.

**Các bước:**
1. Vào `/sso/dashboard`
2. Server component gọi `await auth()` → đọc session từ JWT cookie
3. Dashboard hiển thị:
   - Avatar từ OAuth profile
   - Name, email
   - Provider badge ("Google" hoặc "GitHub")
   - Role badges: [Admin], [Editor], [Viewer] (tùy env config)
   - "Sign out" button
   - Quick links: [Admin Panel] (nếu admin), [Editor Workspace] (nếu editor+)
4. `useSession()` client tự động refresh session
5. Navbar hiển thị "👤 Name ▾"

**Kết quả mong đợi:** Dashboard hiển thị đầy đủ thông tin cá nhân + roles từ env.

---

## UC-SSO-06: Truy cập Admin Panel (khi email trong SSO_ADMIN_EMAILS)

**Mô tả:** User có role Admin truy cập `/sso/admin`.

**Điều kiện tiên quyết:** Email nằm trong danh sách `SSO_ADMIN_EMAILS`.

**Các bước:**
1. Login với email có trong `SSO_ADMIN_EMAILS`
2. Dashboard hiển thị role [Admin]
3. Click "Admin Panel" hoặc vào `/sso/admin`
4. Server component kiểm tra `session.user.roles.includes("admin")` → OK
5. Admin panel hiển thị mock: "Admin Dashboard — System Overview"

**Kết quả mong đợi:** Truy cập admin page thành công.

---

## UC-SSO-07: Truy cập bị từ chối — email không trong SSO_ADMIN_EMAILS

**Mô tả:** User không có role admin cố truy cập `/sso/admin`.

**Điều kiện tiên quyết:** Email không nằm trong `SSO_ADMIN_EMAILS`.

**Các bước:**
1. Login với email thông thường → role `["viewer"]`
2. Dashboard: không có link "Admin Panel", không có role [Admin]
3. Gõ trực tiếp `/sso/admin`
4. Server component: `await auth()` → session tồn tại nhưng `!roles.includes("admin")`
5. `redirect("/sso/dashboard?error=admin_required")`
6. Dashboard hiển thị toast: "Access denied — Admin role required"

**Kết quả mong đợi:** Redirect về dashboard với message lỗi.

---

## UC-SSO-08: Truy cập Editor Workspace (khi email trong SSO_EDITOR_EMAILS)

**Mô tả:** User role Editor+ truy cập `/sso/editor`.

**Điều kiện tiên quyết:** Email nằm trong `SSO_ADMIN_EMAILS` hoặc `SSO_EDITOR_EMAILS`.

**Các bước:**
1. Login với email có trong `SSO_EDITOR_EMAILS` → role `["editor", "viewer"]`
2. Vào `/sso/editor` — server component kiểm tra role → OK
3. Editor panel hiển thị mock text editor + "Save Draft" + "Preview"
4. "Publish" button disabled: tooltip "Admin only"

**Kết quả mong đợi:** Editor truy cập được workspace. Publish chỉ cho Admin.

---

## UC-SSO-09: Session hết hạn

**Mô tả:** Session JWT hết hạn (Auth.js mặc định 30 ngày).

**Điều kiện tiên quyết:** Đã login, session expired.

**Các bước:**
1. Session hết hạn
2. Truy cập `/sso/dashboard` → `await auth()` trả về `null`
3. Server component redirect về `/sso`
4. Navbar: avatar biến mất, hiển thị "Sign In"

**Kết quả mong đợi:** Redirect về login. Sign in lại để lấy session mới.

---

## UC-SSO-10: Sign out

**Mô tả:** Chủ động logout khỏi app.

**Điều kiện tiên quyết:** Đã login.

**Các bước:**
1. Dashboard hoặc navbar dropdown → "Sign out"
2. Gọi `signOut()` → Auth.js xóa cookie
3. Redirect về `/sso`
4. Navbar hiển thị "Sign In"
5. Truy cập `/sso/dashboard` → proxy redirect về `/sso`

**Lưu ý:** Sign out chỉ logout khỏi app, KHÔNG logout khỏi Google/GitHub. Lần sau click "Sign in with Google" sẽ tự động đăng nhập không cần nhập password (nếu chưa revoke app trong Google settings).

**Kết quả mong đợi:** Session app bị xóa, Google/GitHub session vẫn tồn tại.

---

## UC-SSO-11: Cùng email, khác provider — cùng roles

**Mô tả:** Login Google và GitHub với cùng địa chỉ email → nhận cùng roles.

**Điều kiện tiên quyết:** Google và GitHub account dùng chung email (VD: `you@gmail.com` set làm GitHub primary email).

**Các bước:**
1. Login Google với email `you@gmail.com` (trong `SSO_ADMIN_EMAILS`) → roles `["admin", "editor", "viewer"]`
2. Dashboard: provider = Google
3. Sign out
4. Login GitHub với email `you@gmail.com` → roles vẫn là `["admin", "editor", "viewer"]`
5. Dashboard: provider = GitHub, roles giữ nguyên

**Kết quả mong đợi:** Role dựa trên email, không phụ thuộc provider. Cùng email = cùng role.

---

## UC-SSO-12: Thay đổi env role config

**Mô tả:** Thay đổi `SSO_ADMIN_EMAILS` hoặc `SSO_EDITOR_EMAILS`, sign in lại để role mới có hiệu lực.

**Điều kiện tiên quyết:** Đã login.

**Các bước:**
1. Hiện tại email trong `SSO_EDITOR_EMAILS` → role `["editor", "viewer"]`
2. Thêm email vào `SSO_ADMIN_EMAILS` trong `.env.local`, restart dev server
3. Sign out
4. Sign in lại → role `["admin", "editor", "viewer"]`
5. Dashboard hiển thị full role badges

**Kết quả mong đợi:** Role thay đổi sau khi re-login (vì JWT cũ vẫn chứa role cũ).

---

## UC-SSO-13: PWA Offline Session — mở app khi không có mạng

**Mô tả:** Đã login, tắt mạng, mở PWA — vẫn thấy cached profile.

**Điều kiện tiên quyết:** Đã login, PWA cài đặt, SW cache dashboard.

**Các bước:**
1. Login thành công — client lưu `{ name, email, image, roles }` vào IndexedDB
2. Tắt Wi-Fi
3. Mở PWA → `/sso/dashboard`
4. SW phục vụ HTML từ cache
5. Server component không render (offline) → SW trả HTML cached
6. Client đọc IndexedDB → hiển thị cached profile
7. Badge: "⚡ Offline Mode"
8. Admin/Editor links disabled: "Available online only"

**Kết quả mong đợi:** Dashboard hiển thị profile cached khi offline.

---

## UC-SSO-14: Background Sync — Kiểm tra session khi online lại

**Mô tả:** Sau khi offline, SW tự động kiểm tra session.

**Điều kiện tiên quyết:** Đã đăng ký sync event `sso-session-check`.

**Các bước:**
1. Login, sau đó offline một thời gian
2. Bật lại mạng → browser trigger background sync
3. SW gọi `fetch('/api/auth/session')`
4. Session OK → `postMessage` "SESSION_OK" → không làm gì
5. Session expired → `postMessage` "SESSION_EXPIRED" → toast: "Session expired"

**Kết quả mong đợi:** Tự động phát hiện session expired khi online lại.

---

## UC-SSO-15: Push Notification theo user (SSO + Push)

**Mô tả:** Push subscription gắn với email từ SSO session.

**Điều kiện tiên quyết:** Đã login SSO, push permission granted.

**Các bước:**
1. Login → push subscription gửi kèm `email: "you@gmail.com"`
2. Login tab khác với email khác → push subscription riêng
3. `POST /api/push/send { email: "you@gmail.com", title: "Hello", body: "..." }`
4. Chỉ thiết bị của email đó nhận notification

**Kết quả mong đợi:** Push notification cá nhân hóa theo email SSO.

---

## UC-SSO-16: Gọi Protected API với session

**Mô tả:** Client gọi API protected, session cookie tự động gửi.

**Điều kiện tiên quyết:** Đã login.

**Các bước:**
1. Client gọi `GET /api/sso/protected-data`
2. Cookie `authjs.session-token` tự động gửi
3. `auth()` wrapper verify JWT → `req.auth` có session
4. API trả về: `{ message: "Protected data", user: { name, email, roles } }`

**Kết quả mong đợi:** API trả về data khi session valid.

---

## UC-SSO-17: API Role Check — Non-admin gọi Admin API → 403

**Mô tả:** User không có admin role gọi admin-only API.

**Điều kiện tiên quyết:** Email không trong `SSO_ADMIN_EMAILS`.

**Các bước:**
1. Login với role viewer/editor
2. Client gọi `GET /api/sso/admin-data`
3. `auth()` wrapper OK → handler kiểm tra `!roles.includes("admin")`
4. Trả về `403 Forbidden`: `{ error: "Admin role required" }`

**Kết quả mong đợi:** 403 Forbidden.

---

## UC-SSO-18: Proxy redirect — gõ thẳng URL protected khi chưa login

**Mô tả:** Chưa login, gõ `/sso/admin` → proxy redirect về `/sso`.

**Điều kiện tiên quyết:** Không có session cookie.

**Các bước:**
1. Mở tab, gõ `http://localhost:3000/sso/admin`
2. `proxy.ts` chạy → `auth` không tồn tại
3. `authorized` callback: `!auth` → redirect `/sso`
4. Browser load `/sso`

**Kết quả mong đợi:** Redirect tự động, không thấy nội dung protected.

---

## UC-SSO-19: Navbar hiển thị trạng thái session trên mọi trang

**Mô tả:** Navbar phản ánh session state qua `useSession()`.

**Điều kiện tiên quyết:** `SessionProvider` wrap layout.

**Các bước:**
1. Chưa login → "Sign In"
2. Login → avatar + name + dropdown:
   - Dashboard
   - Admin Panel (nếu admin)
   - Editor (nếu editor+)
   - Sign out
3. Điều hướng sang trang khác → avatar vẫn hiển thị
4. Sign out → về "Sign In"

**Kết quả mong đợi:** Navbar cập nhật real-time, role-conditional menu items.

---

## UC-SSO-20: Multiple tabs — session chia sẻ tự động

**Mô tả:** Tab mới tự động nhận session từ cookie.

**Điều kiện tiên quyết:** 2 tab cùng origin.

**Các bước:**
1. Tab 1: login → cookie `authjs.session-token` được set
2. Tab 2: refresh hoặc truy cập `/sso/dashboard`
3. Cookie đã tồn tại → tab 2 hiển thị dashboard với cùng user

**Kết quả mong đợi:** Session chia sẻ giữa các tab qua cookie.
