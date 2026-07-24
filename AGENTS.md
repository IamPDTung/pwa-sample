# AGENTS.md

## Stack
- Next.js 16 (App Router, TypeScript, Tailwind CSS)
- PWA via `@serwist/next` with webpack bundling
- TanStack: Table, Virtual, Query
- web-push — server-side push notifications via browser push service
- next-auth@beta (Auth.js v5) — SSO with Google + GitHub OAuth

## Dev commands
- `npm run dev` — dev server (uses `--webpack` flag; required for serwist)
- `npm run build` — production build (also `--webpack`)
- `npm run lint` — eslint

## Architecture
- `src/app/layout.tsx` — root layout: `<RegisterPWA />` → `<SessionProvider>` → `<QueryProvider>` → `<ToastProvider>` → `<UploadProvider>` → `<Navbar />` + `{children}`
- `src/app/page.tsx` — landing page with links to all feature pages
- `src/app/push/page.tsx` — push notifications page (3 modes: direct, SW interval, Web Push from BE)
- `src/app/upload/page.tsx` — file upload test page
- `src/app/virtual/page.tsx` — virtual table (100K rows, TanStack Table + Virtual)
- `src/app/spreadsheet/page.tsx` — custom spreadsheet (formulas, CSV import/export, cell tracking)
- `src/app/optimistic/page.tsx` — CRUD with optimistic UI + rollback (TanStack Query)
- `src/app/lazy-loading/page.tsx` — lazy loading demo (next/dynamic, JS-driven lazy images, dynamic import, load more)
- `src/app/sso/` — SSO pages: sign-in (`/sso`), dashboard, admin, editor
- `src/auth.ts` — Auth.js v5 config: Google + GitHub providers, JWT callback for env-based role assignment (SSO_ADMIN_EMAILS, SSO_EDITOR_EMAILS)
- `proxy.ts` — Next.js 16 proxy (replaces middleware.ts): exports `auth as proxy`, protects /sso/dashboard, /sso/admin, /sso/editor
- `src/app/register-pwa.tsx` — client component: `window.serwist.register()` in useEffect
- `src/app/sw.ts` — service worker: navigation caching, `fetch` listener (before addEventListeners), `message` handler (START/STOP_INTERVAL, SYNC_SESSION), `push` event (Web Push from BE), `notificationclick` handler
- `src/app/api/upload/route.ts` — POST: streams raw request body to disk via `Readable.fromWeb()` + `pipeline()` (5GB-100GB)
- `src/app/api/items/route.ts` — GET/POST/PUT for CRUD items with simulated latency
- `src/app/api/items/[id]/route.ts` — DELETE item + `intentional-fail` test endpoint
- `src/app/api/table-data/route.ts` — GET: cursor pagination + server-side sort for 100K rows
- `src/app/api/push/vapid-key/route.ts` — GET: exposes VAPID public key for PushManager.subscribe()
- `src/app/api/push/subscribe/route.ts` — POST/DELETE: store/remove browser push subscriptions
- `src/app/api/push/send/route.ts` — POST: trigger web-push notifications from backend, auto-cleanup expired subs
- `src/app/api/lazy-items/route.ts` — GET: paginated items for lazy loading (200 items, 350ms latency)
- `src/app/api/sso/protected-data/route.ts` — GET: protected data (any authenticated user)
- `src/app/api/sso/admin-data/route.ts` — GET: admin-only data (role check)
- `src/app/components/navbar.tsx` — sticky nav: Home, Push, Upload, Virtual, Spreadsheet, Lazy Loading, Optimistic UI + `<SessionBanner />` (shows avatar/dropdown when logged in, "Sign In" link otherwise)
- `src/app/components/push-noti.tsx` — 3 notification modes: direct `new Notification()`, SW `setInterval`, Web Push subscription + send-from-BE UI
- `src/app/components/upload-test.tsx` — file input + XMLHttpRequest with progress bar; reads `useUpload()` context
- `src/app/components/upload-context.tsx` — context wrapping layout; upload state survives route navigation
- `src/app/components/virtual-table.tsx` — TanStack Table + Virtual, infinite scroll, offline retry, CSV export
- `src/app/components/spreadsheet.tsx` — custom editable grid, formula bar + suggestions, formula evaluation, modified cell highlight, CSV import/export
- `src/app/components/optimistic-crud.tsx` — TanStack Query mutations with optimistic cache + rollback, TanStack Table display
- `src/app/components/query-provider.tsx` — QueryClientProvider wrapper
- `src/app/components/toast.tsx` — ToastProvider + useToast(), auto-dismiss 3.5s
- `src/app/components/lazy-demo.tsx` — 4 lazy loading demos: next/dynamic widget, JS-driven lazy images, dynamic import module, load more
- `src/app/components/sso/login-form.tsx` — sign-in buttons (Google + GitHub), calls `signIn()`
- `src/app/components/sso/dashboard.tsx` — session info display: avatar, email, role badges, quick links
- `src/app/components/sso/session-banner.tsx` — navbar integration: avatar + dropdown (dashboard, admin, editor, sign out)
- `src/app/components/sso/session-provider.tsx` — wraps app in `SessionProvider`
- `src/app/components/sso/admin-panel.tsx` — mock admin dashboard (stats, user list)
- `src/app/components/sso/editor-panel.tsx` — mock editor workspace (markdown editor + preview + save/publish)
- `src/lib/vapid.ts` — VAPID key generation, cached in globalThis (survives HMR)
- `src/lib/subscription-store.ts` — in-memory push subscription store
- `src/lib/table-data.ts` — RowData, generateRow(), 100K mock rows, cursor types
- `src/lib/items-store.ts` — in-memory CRUD store with 8 seed items
- `src/lib/export-csv.ts` — CSV serialization + download trigger
- `next.config.ts` — wrapped with `withSerwistInit()`; `swSrc`, `swDest`, `register: false`, `disable` in dev
- `public/manifest.json` — PWA manifest
- `public/offline.html` — styled offline fallback page (precached via globPublicPatterns)
- `public/icon-{192,512}.png` — app icons (generated via sharp)

## Key gotchas
- **Must use `--webpack`** — `@serwist/next` doesn't support Turbopack
- **SW registration is manual** — `register: false` in config, called from `register-pwa.tsx` via `useEffect`
- **`public/sw.js` is generated** — added to eslint ignores in `eslint.config.mjs`
- **`manifest.json` must be in `public/`** for Next.js static serving
- **SW disabled in dev** — `disable: process.env.NODE_ENV !== "production"` prevents SW from intercepting webpack HMR requests and causing infinite recompile loops
- **Fetch listener registered BEFORE `serwist.addEventListeners()`** — our `respondWith()` for same-origin navigation wins over serwist's internal handler, avoiding `ERR_FAILED`
- **Upload state persists across routes** — `UploadProvider` wraps layout; layout never unmounts during client-side navigation, so XHR + state survive
- **Upload API uses `as any` cast** — DOM `ReadableStream` conflicts with Node.js `ReadableStream` type
- **Push noti useEffect uses eslint-disable** — `set-state-in-effect` on `Notification.permission` is a legit client-only API read
- **`tsconfig.json` includes `"webworker"` lib** — needed for `ServiceWorkerGlobalScope` type in `sw.ts`
- **VAPID keys cached in `globalThis`** — prevents re-generation during HMR (dev mode); production should use env vars
- **Web Push subscriptions stored in-memory** — lost on server restart; production needs a database
- **`PushManager.subscribe()` type conflict** — `webworker` lib's `Uint8Array<ArrayBufferLike>` vs DOM's `ArrayBufferView<ArrayBuffer>`; resolved by omitting explicit return type on `urlBase64ToUint8Array`
- **Expired push subscriptions auto-cleaned** — `POST /api/push/send` catches HTTP 410/404 from push service and removes stale subscriptions
- **SSO requires env setup** — `AUTH_SECRET` generated via `npx auth secret` or random hex, plus `AUTH_GOOGLE_ID/SECRET` and `AUTH_GITHUB_ID/SECRET` from respective OAuth consoles
- **Roles assigned via env email lists** — `SSO_ADMIN_EMAILS` and `SSO_EDITOR_EMAILS` (comma-separated), matched in JWT callback; unlisted emails get viewer role
- **Role change requires re-login** — roles are written into JWT at sign-in; updating env vars only takes effect after sign out + sign in
- **Next.js 16 uses `proxy.ts`** — renamed from `middleware.ts`; exports `auth as proxy` for edge route protection
- **`AUTH_TRUST_HOST=true` required for localhost production** — in `next start` mode, Auth.js rejects untrusted hosts; set this env var or add `trustHost: true` to config
