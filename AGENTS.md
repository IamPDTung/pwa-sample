# AGENTS.md

## Stack
- Next.js 16 (App Router, TypeScript, Tailwind CSS)
- PWA via `@serwist/next` with webpack bundling

## Dev commands
- `npm run dev` — dev server (uses `--webpack` flag; required for serwist)
- `npm run build` — production build (also `--webpack`)
- `npm run lint` — eslint

## Architecture
- `src/app/layout.tsx` — root layout, links manifest.json, mounts `<RegisterPWA />`, wraps `<UploadProvider>` around all children
- `src/app/page.tsx` — landing page with links to /push and /upload
- `src/app/push/page.tsx` — push notifications test page
- `src/app/upload/page.tsx` — file upload test page
- `src/app/register-pwa.tsx` — client component that calls `window.serwist.register()` in useEffect
- `src/app/sw.ts` — service worker entry (compiled to `public/sw.js` by `@serwist/next`); also handles `message` events (START_INTERVAL/STOP_INTERVAL) and `notificationclick`
- `src/app/api/upload/route.ts` — POST handler: streams raw request body to disk via `Readable.fromWeb()` + `pipeline()` (no buffering, supports 5GB-100GB files)
- `src/app/components/navbar.tsx` — sticky nav with Home / Push / Upload links, highlights active route
- `src/app/components/push-noti.tsx` — two notification modes: direct `new Notification()` (tab open) + SW `setInterval` timer (tab can be closed, pings SW via postMessage)
- `src/app/components/upload-test.tsx` — file input + XMLHttpRequest upload with progress bar; reads state from `useUpload()` context
- `src/app/components/upload-context.tsx` — `UploadProvider` context wrapping layout; holds upload state (uploading/progress/fileSize/result/error) so it survives route navigation
- `next.config.ts` — wrapped with `withSerwistInit()`, sets `swSrc`, `swDest`, `register: false` (manual registration)
- `public/manifest.json` — PWA manifest
- `public/icon-{192,512}.png` — app icons (generated via sharp)

## Key gotchas
- **Must use `--webpack`** — `@serwist/next` doesn't support Turbopack
- **SW registration is manual** — `register: false` in config, called from `register-pwa.tsx` client component via `useEffect`
- **`public/sw.js` is generated** — added to eslint ignores in `eslint.config.mjs`
- **`manifest.json` must be in `public/`** for Next.js static serving
- **SW disabled in dev** — `disable: process.env.NODE_ENV !== "production"` prevents SW from intercepting webpack HMR requests and causing infinite recompile loops
- **@serwist/turbopack is installed but not used** — webpack approach is more stable for now
- **Upload state persists across routes** — `UploadProvider` wraps layout in `layout.tsx`; layout never unmounts during client-side navigation, so XHR + state survive
- **Upload API uses `as any` cast** — DOM `ReadableStream` conflicts with Node.js `ReadableStream` type; `Readable.fromWeb(request.body as any)` is the workaround
- **Push noti useEffect uses eslint-disable** — `set-state-in-effect` rule fires on reading `Notification.permission` in useEffect, but this is a legit use case (browser API not available during SSR)
- **`tsconfig.json` includes `"webworker"` lib** — needed for `ServiceWorkerGlobalScope` type in `sw.ts`
