# SSO (Single Sign-On) — Kiến trúc & Luồng hoạt động

## Tổng quan
Trang `/sso` demo hệ thống Single Sign-On thực tế qua **Auth.js v5** (`next-auth@beta`) với 2 Identity Provider: **Google** và **GitHub**. Flow OAuth 2.0 Authorization Code chính thức — user được redirect đến Google/GitHub để xác thực, sau đó quay lại app với session.

**Phạm vi:**
- **Multi-provider:** Google + GitHub (OAuth thật)
- **Role-based access:** Admin, Editor, Viewer — gán role dựa trên email khớp với env config
- **Protected routes:** `proxy.ts` (Next.js 16) + `await auth()` trong server component
- **API auth middleware:** `auth()` wrapper function của Auth.js
- **PWA angle:** offline session (SW cache + IndexedDB fallback), background sync, push + SSO identity

## Yêu cầu thiết lập từ người dùng

### 1. Auth Secret + Trust Host (bắt buộc)
Auth.js yêu cầu `AUTH_SECRET` để mã hóa session JWT và `AUTH_TRUST_HOST=true` cho chạy localhost ở chế độ production (`next start`):
```bash
npx auth secret             # Tự động tạo key (manual: node -e "require('crypto').randomBytes(32).toString('hex')")
```
Thêm vào `.env.local`:
```env
AUTH_SECRET=<generated-key>
AUTH_TRUST_HOST=true         # Required for localhost in production mode
```

### 2. Google OAuth
1. Vào [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Tạo project → **Credentials** → **Create Credentials** → **OAuth client ID**
3. Chọn **Web application**
4. **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google`
5. Lưu **Client ID** và **Client Secret**
6. Thêm vào `.env.local`:
   ```
   AUTH_GOOGLE_ID=<your-client-id>
   AUTH_GOOGLE_SECRET=<your-client-secret>
   ```

> **Lưu ý:** Google provider có `type: "oidc"`, Auth.js tự động fetch `https://accounts.google.com/.well-known/openid-configuration` để lấy authorization/token/userinfo endpoints. Nếu mạng corporate/proxy chặn request này → lỗi `TypeError: fetch failed`. Fix: truyền explicit `authorization`, `token`, `userinfo` URLs trong auth.ts để bỏ qua OIDC discovery (đã cấu hình sẵn).

### 3. GitHub OAuth
1. Vào [GitHub Developer Settings](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**
2. **Homepage URL:** `http://localhost:3000`
3. **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Lưu **Client ID** và **Client Secret** (chỉ hiển thị 1 lần)
5. Thêm vào `.env.local`:
   ```
   AUTH_GITHUB_ID=<your-client-id>
   AUTH_GITHUB_SECRET=<your-client-secret>
   ```

### 4. Role configuration (email lists)
Thêm các biến môi trường để xác định email nào có role gì. Phân cách nhiều email bằng dấu phẩy:
```env
SSO_ADMIN_EMAILS=you@gmail.com
SSO_EDITOR_EMAILS=you@gmail.com,colleague@mycompany.com
```
- **Admin:** email khớp với `SSO_ADMIN_EMAILS` → `["admin", "editor", "viewer"]`
- **Editor:** email khớp với `SSO_EDITOR_EMAILS` → `["editor", "viewer"]`
- **Viewer:** tất cả các email khác → `["viewer"]`

Email trong danh sách admin **tự động bao gồm** editor và viewer roles (không cần liệt kê lại trong `SSO_EDITOR_EMAILS`).

## Cấu trúc file

| File | Vai trò |
|---|---|
| `src/auth.ts` | Root config: `NextAuth()` với Google + GitHub providers, JWT callback gán roles từ env |
| `src/app/api/auth/[...nextauth]/route.ts` | Route handler: re-export `handlers` từ auth.ts |
| `proxy.ts` | Next.js 16 proxy: bảo vệ route `/sso/dashboard`, `/sso/admin`, `/sso/editor`; matcher excludes `/api/*` |
| `src/app/sso/page.tsx` | Server component: màn hình chọn provider (sign-in page) |
| `src/app/sso/dashboard/page.tsx` | Server component: dashboard sau login — gọi `await auth()` |
| `src/app/sso/admin/page.tsx` | Server component: admin-only — kiểm tra role |
| `src/app/sso/editor/page.tsx` | Server component: editor+ — kiểm tra role |
| `src/app/components/sso/login-form.tsx` | Client component: nút "Sign in with Google" + "Sign in with GitHub" |
| `src/app/components/sso/dashboard.tsx` | Client component: hiển thị session info, role badges (dùng `useSession()`) |
| `src/app/components/sso/admin-panel.tsx` | Client component: admin dashboard mock |
| `src/app/components/sso/editor-panel.tsx` | Client component: editor workspace mock |
| `src/app/components/sso/session-banner.tsx` | Client component: avatar + name trong navbar khi logged in |
| `src/app/components/sso/session-provider.tsx` | Client component: `SessionProvider` wrapper cho client-side session |
| `src/app/api/sso/protected-data/route.ts` | Protected API route: dùng `auth()` wrapper |
| `src/app/api/sso/admin-data/route.ts` | Admin-only API: kiểm tra role trong handler |

## Phân quyền — Cách hoạt động

Auth.js lấy email thật từ Google/GitHub profile. JWT callback so khớp với env config để gán roles:

```ts
// auth.ts
function parseEnvList(key: string): string[] {
  const val = process.env[key]
  if (!val) return []
  return val.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
}

const adminEmails = parseEnvList("SSO_ADMIN_EMAILS")
const editorEmails = parseEnvList("SSO_EDITOR_EMAILS")

// Trong jwt callback:
jwt({ token, user, account, profile }) {
  if (user) {
    const email = user.email?.toLowerCase()
    if (email && adminEmails.includes(email)) {
      token.roles = ["admin", "editor", "viewer"]
    } else if (email && editorEmails.includes(email)) {
      token.roles = ["editor", "viewer"]
    } else {
      token.roles = ["viewer"]
    }
  }
  return token
}
```

Role được lưu trong JWT token — không cần DB lookup khi verify. Thay đổi env var chỉ có hiệu lực sau khi user **sign out rồi sign in lại** (vì role đã được ghi vào JWT cũ).

## Luồng OAuth 2.0 thực tế

### 1. Provider Selection → Redirect đến IdP thật

```
Người dùng vào /sso
  → Hiển thị 2 button: "Sign in with Google" | "Sign in with GitHub"
  → Click "Sign in with Google"
  → Gọi signIn("google") từ next-auth/react
  → Browser redirect đến https://accounts.google.com/o/oauth2/v2/auth
      ?client_id=AUTH_GOOGLE_ID
      &redirect_uri=http://localhost:3000/api/auth/callback/google
      &scope=openid+profile+email
      &response_type=code
  → User chọn/xác nhận tài khoản Google
  → (Lần đầu) Google hiển thị consent screen
  → Google redirect về /api/auth/callback/google?code=xxx
```

### 2. Callback → JWT → Role Assignment

```
/api/auth/callback/google nhận code
  → Auth.js đổi code lấy access_token + id_token từ Google
  → Gọi Google userinfo endpoint → { name, email, image }
  ↓
JWT callback:
  email = "you@gmail.com"
  SSO_ADMIN_EMAILS = "you@gmail.com"
  → adminEmails.includes("you@gmail.com") → true
  → token.roles = ["admin", "editor", "viewer"]
  ↓
Tạo session JWT (mã hóa bằng AUTH_SECRET)
  → Set cookie: authjs.session-token=<jwt>; HttpOnly; Secure; SameSite=Lax
  → Redirect về /sso/dashboard
```

### 3. Dashboard — Đọc session

```tsx
// src/app/sso/dashboard/page.tsx (server component)
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/sso")

  return <Dashboard user={session.user} />
  // session.user = { name, email, image, roles }
}
```

### 4. Logout

```
Click "Sign Out" → signOut() từ next-auth/react
  → Auth.js xóa authjs.session-token cookie
  → Redirect về /sso
  → (Không logout khỏi Google/GitHub — chỉ logout khỏi app)
```

## Role-Based Access Control

### Proxy (middleware) — Route Protection

```ts
// proxy.ts (Next.js 16)
export { auth as proxy } from "@/auth"

// Matcher: only run on page routes, exclude API routes and static files
// Auth.js's own /api/auth/[...nextauth] handler must NOT go through the proxy
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

// auth.ts — authorized callback
callbacks: {
  authorized({ auth, request }) {
    const isLoggedIn = !!auth?.user
    const path = request.nextUrl.pathname
    const isProtected = path.startsWith("/sso/dashboard")
                     || path.startsWith("/sso/admin")
                     || path.startsWith("/sso/editor")

    if (isProtected && !isLoggedIn) {
      return Response.redirect(new URL("/sso", request.nextUrl))
    }
    return true
  },
}
```

### Server Component — Kiểm tra role

```tsx
// src/app/sso/admin/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect("/sso")
  if (!session.user.roles?.includes("admin")) {
    redirect("/sso/dashboard?error=admin_required")
  }
  return <AdminPanel session={session} />
}
```

### API Route — Auth wrapper + Role check

```ts
// src/app/api/sso/admin-data/route.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const GET = auth(async function GET(req) {
  if (!req.auth?.user.roles?.includes("admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return NextResponse.json({ data: "Admin-only data" })
})
```

## Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                              /sso                                    │
│                                                                     │
│   ┌─────────────────────┐     ┌─────────────────────┐               │
│   │   Sign in with       │     │   Sign in with       │              │
│   │   🅖 Google          │     │   🐙 GitHub          │              │
│   └────────┬────────────┘     └────────┬────────────┘               │
│            │                           │                              │
│            ▼                           ▼                              │
│   accounts.google.com          github.com/login/oauth/authorize      │
│   ┌─────────────────┐        ┌──────────────────────────┐           │
│   │ Choose account  │        │ Authorize application     │           │
│   │ [Continue ▶]    │        │ [Authorize]  [Cancel]     │           │
│   └─────────────────┘        └──────────────────────────┘           │
│            │                           │                              │
│            ▼                           ▼                              │
│   /api/auth/callback/google    /api/auth/callback/github              │
│   ┌─────────────────────────────────────────────────────┐            │
│   │ Auth.js xử lý:                                      │            │
│   │  1. Đổi code → access_token                         │            │
│   │  2. Gọi userinfo endpoint → email, name, image      │            │
│   │  3. jwt callback: so email với env config           │            │
│   │     SSO_ADMIN_EMAILS, SSO_EDITOR_EMAILS             │            │
│   │  4. Gán roles → mã hóa JWT → set cookie             │            │
│   │  5. Redirect → /sso/dashboard                       │            │
│   └─────────────────────────────────────────────────────┘            │
│            │                                                          │
│            ▼                                                          │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │  /sso/dashboard                                        │       │
│   │  ┌───────────────────────────────────────────────────┐ │       │
│   │  │ 👤 Your Name                           [Sign out] │ │       │
│   │  │ you@gmail.com                                      │ │       │
│   │  │ Provider: 🅖 Google                                │ │       │
│   │  │ Roles: [Admin] [Editor] [Viewer]                   │ │       │
│   │  │ Session: active — managed by Auth.js               │ │       │
│   │  │                                                    │ │       │
│   │  │ ── Quick Links ──                                  │ │       │
│   │  │ [Admin Panel]  [Editor Workspace]                  │ │       │
│   │  └───────────────────────────────────────────────────┘ │       │
│   └─────────────────────────────────────────────────────────┘       │
│                                                                     │
│   ┌───────────────────────────┐  ┌────────────────────────────┐     │
│   │ /sso/admin (Admin only)   │  │ /sso/editor (Editor+)      │     │
│   │ - User list (mock)        │  │ - Content editor (mock)    │     │
│   │ - Session stats           │  │ - Save / Preview           │     │
│   │ - System config           │  │ - Publish (admin only)     │     │
│   └───────────────────────────┘  └────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

## PWA Angle — Chi tiết kỹ thuật

### 1. Offline Session Persistence

```
Login thành công
  → Auth.js session JWT trong cookie (HttpOnly, secure)
  → Client lưu user profile vào IndexedDB (offline fallback):
      { name, email, image, roles, provider, cachedAt }

Khi offline:
  → Server component không render được (network down)
  → SW phục vụ HTML từ navigation cache
  → Client đọc IndexedDB → hiển thị cached profile
  → Badge "⚡ Offline Mode"
  → Admin/Editor pages: link disabled, tooltip "Available online only"

Khi online trở lại:
  → Server re-render với session mới từ cookie
  → Client cập nhật IndexedDB
```

### 2. Service Worker Caching

```ts
// sw.ts — navigation cache cho SSO pages
// /sso/dashboard → network-first → cache → offline.html
// KHÔNG cache OAuth redirect URLs (callback, signin)
```

### 3. Background Sync

```
Đăng ký sync event khi login:
  navigator.serviceWorker.ready.then(reg => reg.sync.register("sso-session-check"))

SW xử lý sync:
  → fetch("/api/auth/session")
  → OK → postMessage "SESSION_OK"
  → 401 → postMessage "SESSION_EXPIRED"

Client nhận SESSION_EXPIRED:
  → Toast: "Session expired. Please sign in again."
  → Navbar về trạng thái chưa login
```

### 4. Push Notifications + SSO Identity

```
Sau SSO login:
  → Push subscription gắn với session.user.email
  → POST /api/push/subscribe gửi kèm { email }

BE gửi push:
  → POST /api/push/send { email: "you@gmail.com", title, body }
  → BE lọc subscriptions theo email → targeted push

Kết quả: Push notification cá nhân hóa, chỉ user đó nhận
```

### 5. Navbar Integration

```
Chưa login:
  [Home] ... [Optimistic UI] [Sign In]

Đã login:
  [Home] ... [Optimistic UI] [👤 Your Name ▾]
                                ├── Dashboard
                                ├── Admin Panel (→ admin)
                                ├── Editor (→ editor+)
                                └── Sign out
```

## State Management

```tsx
// Server component — đọc session trực tiếp
export default async function Dashboard() {
  const session = await auth()
  // session.user = { name, email, image, roles }
}

// Client component — useSession hook
"use client"
import { useSession } from "next-auth/react"

export function Dashboard() {
  const { data: session, status } = useSession()
  // status: "loading" | "authenticated" | "unauthenticated"
  // session tự động refresh
}

// API route — auth() wrapper
export const GET = auth(async (req) => {
  // req.auth chứa session
})
```

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | Auth.js built-in | Signin, callback, signout, session |
| GET | `/api/sso/protected-data` | Session required | Protected data (any authenticated user) |
| GET | `/api/sso/admin-data` | Session + admin role | Admin-only data |

## Các vấn đề thường gặp (Troubleshooting)

### 1. `UntrustedHost` error khi `next start` ở localhost

**Lỗi:** `[auth][error] UntrustedHost: Host must be trusted. URL was: http://localhost:3000/api/auth/...`

**Nguyên nhân:** Ở chế độ production, Auth.js yêu cầu host phải được tin tưởng. `localhost` mặc định bị từ chối.

**Fix:** Thêm vào `.env.local`:
```env
AUTH_TRUST_HOST=true
```

### 2. `TypeError: fetch failed` khi click Sign in with Google

**Lỗi:**
```
[auth][error] TypeError: fetch failed
    at node:internal/deps/undici/undici:...
    at async getAuthorizationUrl (authorization-url.js:25:35)
```

**Nguyên nhân:** Google provider có `type: "oidc"` → Auth.js tự động fetch `https://accounts.google.com/.well-known/openid-configuration` để lấy các endpoint. Mạng corporate hoặc proxy có thể chặn request này từ Node.js server.

**Fix:** Truyền explicit `authorization`, `token`, `userinfo` URLs trong cấu hình Google provider (đã được cấu hình sẵn trong `src/auth.ts`):
```ts
Google({
  clientId: process.env.AUTH_GOOGLE_ID,
  clientSecret: process.env.AUTH_GOOGLE_SECRET,
  authorization: "https://accounts.google.com/o/oauth2/v2/auth",
  token: "https://oauth2.googleapis.com/token",
  userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
})
```

### 3. Proxy xung đột với `/api/auth/*` routes

**Lỗi:** 500 Internal Server Error trên `/api/auth/error`, hoặc sign-in flow bị redirect loop.

**Nguyên nhân:** Proxy (`proxy.ts`) chạy trên tất cả các route, bao gồm cả `/api/auth/[...nextauth]`, gây xung đột với Auth.js internal handler.

**Fix:** Thêm `config.matcher` vào `proxy.ts` để exclude API routes:
```ts
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

### 4. Role không thay đổi sau khi sửa `SSO_ADMIN_EMAILS` / `SSO_EDITOR_EMAILS`

**Nguyên nhân:** Role được ghi vào JWT token tại thời điểm sign-in. JWT cũ vẫn chứa role cũ cho đến khi hết hạn hoặc user sign out.

**Fix:** Sign out hoàn toàn, sau đó sign in lại để JWT được tạo mới với role từ env config hiện tại.

## Nguyên tắc thiết kế

1. **Auth.js v5 làm backbone** — không tự viết OAuth, JWT, session management
2. **Không cần database** — Auth.js JWT strategy không cần adapter
3. **Role từ env config** — email khớp với `SSO_ADMIN_EMAILS` / `SSO_EDITOR_EMAILS` trong JWT callback
4. **PWA-first** — session offline qua IndexedDB fallback + SW cache
5. **Next.js 16 proxy** — thay thế middleware, bảo vệ route ở Edge
6. **Double check** — proxy bảo vệ route, server component + API handler kiểm tra role cụ thể
