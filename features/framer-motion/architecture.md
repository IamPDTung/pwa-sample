# Framer Motion — Kiến trúc & Luồng hoạt động

## Tổng quan
Trang `/framer-motion` là một **showcase demo** trình bày 8 kỹ thuật animation phổ biến với Motion for React (trước đây là Framer Motion). Có thêm 3 sub-pages chuyên sâu: Gestures, Scroll, Layout. Navbar hỗ trợ nested dropdown cho Framer Motion với 3 sub-items.

## Lưu ý package
- Framer Motion đã **rebrand thành Motion**. Package npm mới là `motion` (không phải `framer-motion`).
- Import path cho React: `import { motion, AnimatePresence, useScroll, useTransform } from "motion/react"`
- Docs: https://motion.dev/docs/react

## Mục tiêu kỹ thuật
- **8 section demo** trên main page — mỗi section độc lập, có toggle/btn để replay animation
- **3 sub-pages** — `/framer-motion/gestures`, `/framer-motion/scroll`, `/framer-motion/layout`
- **Nested dropdown navbar** — Framer Motion item có sub-menu với 3 mục con
- **Client-side** — mọi animation dùng `motion.*` phải trong `"use client"` component
- **Responsive** — hoạt động trên mobile (touch gestures) và desktop (hover)
- **Dark mode** — dùng Tailwind classes `dark:` có sẵn của project
- **Không cần API backend** — toàn bộ animation client-only

## Trạng thái hiện tại (đã build)

### Cấu trúc file

| File | Vai trò |
|---|---|
| `src/app/framer-motion/page.tsx` | Server component: heading + intro + `<MotionDemos />` (8 section) |
| `src/app/framer-motion/gestures/page.tsx` | Client component: Hover & Tap + Drag demos (4 sections) |
| `src/app/framer-motion/scroll/page.tsx` | Client component: Scroll-triggered + Parallax demos (4 sections) |
| `src/app/framer-motion/layout/page.tsx` | Client component: FLIP shuffle + shared layout + variants + SVG (5 sections) |
| `src/app/components/motion-demos.tsx` | Client component: section wrapper + 8 section demo chính |
| `src/app/components/navbar.tsx` | Navbar với nested dropdown: Framer Motion → Gestures, Scroll, Layout |

### Routes hiện có

| Route | Nội dung | Sections |
|---|---|---|
| `/framer-motion` | Main overview: 8 kỹ thuật animation | Enter/Exit, Hover/Tap, Drag, Scroll-triggered, Scroll-linked, Layout, Variants, SVG/Keyframes |
| `/framer-motion/gestures` | Gesture animations | Hover & Tap, Gesture Presets, Drag, Drag + Rotate |
| `/framer-motion/scroll` | Scroll animations | Scroll-triggered, Stagger List, Scale Reveal, Parallax |
| `/framer-motion/layout` | Layout + advanced | FLIP Shuffle, Shared Layout Tab, Variants Stagger, SVG Draw-on, Spring Keyframes |

### Navbar nested dropdown

```
UI Animations ▾
├── Three.js
├── Framer Motion  ▶
│   ├── Gestures
│   ├── Scroll
│   └── Layout
└── GSAP
```

- Type: `NavItem = { href: string; label: string; children?: NavItem[] }`
- Sub-dropdown mở bên phải khi hover, đóng khi mouse leave
- Mobile: children hiển thị indented bên dưới parent link
- `openSubDropdown` state + `onMouseEnter`/`onMouseLeave`
- `activeItem` detection kiểm tra cả `pathname === item.href` lẫn `item.children?.some(c => pathname === c.href)`

### Các gói sử dụng

| Gói | Vai trò |
|---|---|
| `motion` | Animation library (rebrand từ framer-motion): `<motion />`, `AnimatePresence`, `useScroll` |
| `react` | Hooks: `useState`, `useRef`, `useEffect` |

## 8 Section demo (main page)

### Section 1 — Enter & Exit animation
- **Props:** `initial`, `animate`, `exit`, `AnimatePresence`
- **Demo:** Box xuất hiện khi click "Show", biến mất mượt khi click "Hide"

### Section 2 — Hover & Tap gestures
- **Props:** `whileHover`, `whileTap`
- **Demo:** Card phóng to + nâng shadow khi hover, thu nhỏ khi tap

### Section 3 — Drag
- **Props:** `drag`, `dragConstraints`, `dragElastic`, `whileDrag`
- **Demo:** Box draggable trong container giới hạn, phóng to khi đang kéo

### Section 4 — Scroll-triggered (whileInView)
- **Props:** `whileInView`, `viewport`, `initial`
- **Demo:** 9 card fade-in + slide-up stagger khi scroll tới (`delay: i * 0.08`)

### Section 5 — Scroll-linked (useScroll)
- **Hooks:** `useScroll`, `useTransform`
- **Demo:** Progress bar sticky + parallax emoji

### Section 6 — Layout animation
- **Props:** `layout`, `layoutId`
- **Demo 1:** 6 card grid shuffle với spring FLIP
- **Demo 2:** 3 tab indicator trượt qua `layoutId="underline"`

### Section 7 — Variants & stagger
- **Props:** `variants`, `staggerChildren`, `staggerDirection: -1` cho exit
- **Demo:** Menu 5 item stagger in/out với direction toggle

### Section 8 — Keyframes & SVG path
- **Props:** keyframe arrays `[]`, `pathLength`
- **Demo:** SVG circle draw-on + spring bounce box

## Section wrapper (reusable)
```tsx
function Section({ number, title, children }: {
  number: number; title: string; children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">
        <span className="text-violet-500">{number}.</span> {title}
      </h2>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 bg-white dark:bg-zinc-900">
        {children}
      </div>
    </section>
  );
}
```

## Gotchas & lưu ý kỹ thuật

1. **`"use client"` bắt buộc** — mọi component dùng `motion.*` phải là client component.
2. **Import path mới** — `from "motion/react"` (KHÔNG phải `from "framer-motion"`).
3. **`AnimatePresence` cần `key`** — mỗi motion component con phải có `key` unique.
4. **`whileInView` + `viewport.once: true`** — chỉ trigger 1 lần.
5. **`useScroll` cần target** — mặc định track window scroll.
6. **`layout` prop + `transform`** — tránh kết hợp với `animate={{ x/y }}`.
7. **Drag cần `dragConstraints`** — ref đến container hoặc `{ left, right, top, bottom }`.
8. **SSR safe** — `useScroll` trả về 0 ở server, render với fallback.
9. **Performance** — ưu tiên animate `transform` và `opacity` (hardware-accelerated).
10. **Touch gestures** — `whileTap` thay thế `whileHover` trên mobile.

## Luồng hoạt động

### Page load
```
Người dùng vào /framer-motion
  → page.tsx (Server Component): heading + intro
  → <MotionDemos /> (Client Component) mount
  → 8 section render lần lượt
  → Scroll-triggered sections animate khi vào viewport
```

### Tương tác từng section
- Section 1: click "Show/Hide" → `useState` toggle → AnimatePresence mount/unmount box
- Section 2: hover/tap card → `whileHover`/`whileTap` tự kích hoạt
- Section 3: drag box → Motion capture gesture + giới hạn bởi `dragConstraints`
- Section 4: scroll tới → `whileInView` fire → card fade-in stagger
- Section 5: scroll → `useScroll` emit `scrollYProgress` → `useTransform` → progress bar scale
- Section 6: click "Shuffle" → `useState` shuffle array → `layout` FLIP animate
- Section 7: click "Toggle" → `custom` prop thay đổi → variants forward/reverse
- Section 8: click "Replay" → `key` reset → SVG path draw-on từ đầu

---

## Ý tưởng cho các trang tiếp theo (5 real-world use cases)

### 1. Image Gallery + Lightbox
- Grid ảnh → click ảnh → zoom full-screen lightbox qua `layoutId` (shared element transition)
- Swipe trái/phải qua `drag="x"` + `dragSnapToOrigin` để đổi ảnh
- Pinch-to-zoom với `drag` + `scale`
- Exit animation trở về vị trí grid ban đầu
- **Motion APIs:** `layoutId`, `AnimatePresence`, `drag`, `useTransform`

### 2. Animated To-Do List
- Thêm item → spring/fade in từ top
- Check off → strikethrough + scale down + opacity fade
- Reorder → `layout` FLIP animation khi shuffle
- Swipe to delete → `drag="x"` với threshold, item trượt ra + collapse
- Tab filter (All / Active / Done) → shared `layoutId` underline
- **Motion APIs:** `layout`, `AnimatePresence`, `drag`, variants, shared layout

### 3. Multi-Step Onboarding Wizard
- 3-4 step form, slide left/right transitions giữa các bước
- Progress bar animates mượt (`useSpring` trên percentage)
- Fields animate in với stagger trên mỗi step
- "Success" confetti/checkmark animation ở bước cuối
- **Motion APIs:** `AnimatePresence` với mode, spring progress, stagger variants

### 4. Notification Toast Stack
- Nhiều toast xếp chồng với spring animation
- Auto-dismiss sau X giây (exit animation)
- Swipe right để dismiss thủ công
- Các loại khác nhau (success/error/warning) với màu sắc tương ứng
- **Motion APIs:** `AnimatePresence`, `drag`, spring layout, exit animations

### 5. Music Player Mini-App
- Album art spins (`animate rotate 360` với `repeat: Infinity`)
- Play/pause button morphs (SVG `<motion.path>` morph)
- Seek bar với drag
- Playlist expand/collapse với `layout`
- Equalizer bars animate
- **Motion APIs:** SVG morph, layout, drag, infinite animation
