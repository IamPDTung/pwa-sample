# Framer Motion — Các trường hợp sử dụng

## A. Main page — /framer-motion (14 use cases hiện có)

### UC-FM-01: Xem trang load 8 section demo

**Mô tả:** Người dùng vào trang Framer Motion và thấy 8 section demo animation.

**Các bước:**
1. Vào `/framer-motion`
2. Trang hiển thị heading "Framer Motion Demos" + intro
3. 8 section render theo thứ tự: Enter/Exit, Hover/Tap, Drag, Scroll-triggered, Scroll-linked, Layout, Variants, SVG
4. Các section scroll-triggered (4, 5) animate khi scroll tới

**Kết quả mong đợi:** Tất cả 8 section hiển thị rõ ràng, layout gọn gàng, dark mode hoạt động.

---

### UC-FM-02: Toggle show/hide box (enter/exit animation)

**Mô tả:** Người dùng click nút để show/hide box với animation mượt.

**Các bước:**
1. Section 1 hiển thị nút "Show" + vùng trống
2. Click "Show" → box xuất hiện: fade-in + scale từ 0.8 → 1 (300ms)
3. Click "Hide" → box biến mất: fade-out + scale 1 → 0.8 (300ms)
4. Click liên tục nhanh → animation interrupt mượt (không bị stuck)

**Kết quả mong đợi:** Box xuất hiện/biến mất mượt mà, không nhảy.

---

### UC-FM-03: Hover/tap card (gesture animation)

**Mô tả:** Người dùng hover/tap card để thấy gesture animation.

**Các bước:**
1. Section 2 hiển thị 3 card grid
2. Hover (desktop) vào card → card phóng to 1.1× + shadow sâu hơn
3. Click/tap card → card thu nhỏ 0.93× (tap feedback)
4. Di chuyển chuột sang card khác → card trước về bình thường, card mới phóng to

**Kết quả mong đợi:** Gesture mượt, phản hồi tức thì. Trên mobile, `whileTap` thay thế hover.

---

### UC-FM-04: Drag box trong container

**Mô tả:** Người dùng kéo box trong vùng giới hạn.

**Các bước:**
1. Container dashed border + box ở giữa
2. Click + giữ box → box phóng to 1.12× (whileDrag)
3. Kéo box → di chuyển nhưng không ra khỏi container
4. Kéo ra biên → snap lại trong vùng (elastic 0.15)

**Kết quả mong đợi:** Drag mượt, giới hạn hoạt động đúng, elastic feedback.

---

### UC-FM-05: Scroll → card fade-in stagger

**Mô tả:** 9 card fade-in + slide-up theo thứ tự khi scroll tới.

**Các bước:**
1. Card ban đầu ẩn (opacity 0, y 40)
2. Scroll tới section → card fade-in stagger mỗi 80ms
3. Scroll lên xuống lại → không re-animate (`viewport.once: true`)

**Kết quả mong đợi:** Stagger mượt, chỉ trigger 1 lần.

---

### UC-FM-06: Scroll → progress bar + parallax

**Mô tả:** Progress bar ngang + parallax image sync với scroll.

**Các bước:**
1. Progress bar sticky top, ban đầu scaleX = 0
2. Scroll xuống → progress bar kéo dần đầy 100%
3. Parallax emoji di chuyển chậm hơn scroll

**Kết quả mong đợi:** Sync chính xác, mượt, không lag.

---

### UC-FM-07: Shuffle grid (layout animation FLIP)

**Mô tả:** 6 emoji card reorder với spring FLIP animation.

**Các bước:**
1. Click "Shuffle" → card trượt mượt đến vị trí mới
2. Click nhanh liên tục → animation interrupt mượt

**Kết quả mong đợi:** Không nhảy/nhấp, `layout` prop tự động FLIP.

---

### UC-FM-08: Tab indicator trượt (shared layout)

**Mô tả:** Underline `layoutId` trượt giữa các tab.

**Các bước:**
1. 3 tab: "Overview" (active), "Details", "Settings"
2. Click tab khác → underline trượt mượt đến tab mới

**Kết quả mong đợi:** Underline trượt mượt, `layoutId` chia sẻ layout.

---

### UC-FM-09: Menu stagger với direction toggle

**Mô tả:** Menu 5 item stagger in/out.

**Các bước:**
1. Click "Show" → list stagger xuất hiện từ trên xuống
2. Click "Hide" → list stagger biến mất từ dưới lên (`staggerDirection: -1`)

**Kết quả mong đợi:** Stagger forward/reverse hoạt động.

---

### UC-FM-10: SVG path draw-on animation

**Mô tả:** SVG circle vẽ path (`pathLength`) + replay.

**Các bước:**
1. Circle vẽ từ 0 → 1 pathLength trong 1.8s
2. Click "Replay" → reset + vẽ lại từ đầu

**Kết quả mong đợi:** Path draw-on mượt, replay hoạt động.

---

### UC-FM-11: Spring bounce box

**Mô tả:** Box bounce với spring physics.

**Các bước:**
1. Click "Bounce" → box bounce y: [0, -50, 0]
2. Click lại → bounce tiếp

**Kết quả mong đợi:** Spring physics tự nhiên.

---

### UC-FM-12: Mobile touch gestures

**Mô tả:** Gesture hoạt động trên mobile qua touch.

**Các bước:**
1. Mở `/framer-motion` trên điện thoại
2. Tap card → `whileTap` (hover không hoạt động trên touch)
3. Touch + kéo box → drag hoạt động
4. Scroll → card fade-in stagger

**Kết quả mong đợi:** Touch gestures mượt. `whileTap` thay thế hover.

---

### UC-FM-13: Dark mode compatibility

**Mô tả:** Layout + animation hoạt động đúng ở dark mode.

**Các bước:**
1. Bật dark mode → vào `/framer-motion`
2. Nền section tối, border tối, text contrast tốt
3. Animation không bị ảnh hưởng bởi mode

**Kết quả mong đợi:** Tailwind `dark:` classes nhất quán.

---

### UC-FM-14: Performance — 60fps

**Mô tả:** Animation chạy ở 60fps mượt mà.

**Các bước:**
1. Toggle, hover, drag, scroll nhanh liên tục
2. FPS meter: ≥ 60fps ổn định

**Kết quả mong đợi:** Hardware-accelerated transforms (x, y, scale, opacity).

---

## B. Sub-pages (12 use cases — đã build)

### Sub-page: /framer-motion/gestures

#### UC-FM-15: Xem Gestures page

**Mô tả:** Người dùng vào trang Gestures chuyên sâu.

**Các bước:**
1. Vào menu "UI Animations" → hover "Framer Motion" → click "Gestures"
2. Trang hiển thị 4 section: Hover & Tap, Gesture Presets, Drag, Drag + Rotate
3. Navbar highlight menu Framer Motion active

**Kết quả mong đợi:** Trang load đúng, menu active đúng.

---

#### UC-FM-16: Hover & Tap gesture presets

**Mô tả:** Demo các preset gesture khác nhau.

**Các bước:**
1. Section 1 hiển thị 3 card: Hover me, Tap me, Both
2. Section 2 hiển thị 3 preset: Scale + Rotate, Skew, Float Up
3. Hover từng card → animation tương ứng

**Kết quả mong đợi:** Mỗi preset có animation khác nhau, mượt mà.

---

#### UC-FM-17: Drag với rotation

**Mô tả:** Box vừa drag vừa rotate.

**Các bước:**
1. Section 4 hiển thị box màu cam với chữ "DRAG"
2. Kéo box → `whileDrag={{ rotate: 15 }}` xoay box 15°
3. Constraints: left/right 80px, top/bottom 50px

**Kết quả mong đợi:** Drag + rotate đồng thời mượt.

---

### Sub-page: /framer-motion/scroll

#### UC-FM-18: Xem Scroll page

**Mô tả:** Người dùng vào trang Scroll chuyên sâu.

**Các bước:**
1. Vào "UI Animations" → "Framer Motion" → "Scroll"
2. Trang hiển thị 4 section + sticky progress bar global

**Kết quả mong đợi:** Trang load đúng, progress bar hoạt động.

---

#### UC-FM-19: Staggered fade-in list

**Mô tả:** List item xuất hiện từng cái khi scroll.

**Các bước:**
1. Section 2 hiển thị 8 list item, mỗi item delay 100ms
2. Scroll tới → item fade-in + slide từ trái sang

**Kết quả mong đợi:** 8 item stagger mượt, chỉ trigger 1 lần.

---

#### UC-FM-20: Scale reveal grid

**Mô tả:** Grid card scale từ 0.8 lên 1 khi vào viewport.

**Các bước:**
1. Section 3 hiển thị 6 card màu sắc khác nhau
2. Scroll tới → card scale-up stagger 100ms

**Kết quả mong đợi:** Scale reveal mượt, màu sắc đa dạng.

---

#### UC-FM-21: Parallax với useTransform

**Mô tả:** Emoji + text di chuyển parallax khi scroll.

**Các bước:**
1. Section 4 hiển thị emoji 🌄 + text "Scroll to see parallax"
2. Scroll → emoji di chuyển chậm hơn (y: 0% → -30%), text chậm hơn nữa (y: 0% → -15%)

**Kết quả mong đợi:** Parallax 2 tầng mượt, không lag.

---

### Sub-page: /framer-motion/layout

#### UC-FM-22: Xem Layout page

**Mô tả:** Người dùng vào trang Layout chuyên sâu.

**Các bước:**
1. Vào "UI Animations" → "Framer Motion" → "Layout"
2. Trang hiển thị 5 section: FLIP Shuffle, Shared Layout Tab, Variants Stagger, SVG, Spring

**Kết quả mong đợi:** Trang load đúng, 5 section hoạt động.

---

#### UC-FM-23: SVG rectangle draw-on

**Mô tả:** Hình chữ nhật vẽ path song song với circle.

**Các bước:**
1. Section 4 hiển thị 2 SVG: circle + rounded rectangle
2. Click "Replay" → cả 2 shape vẽ pathLength song song
3. Rectangle delay 0.3s so với circle

**Kết quả mong đợi:** 2 shape draw-on đồng bộ, màu sắc khác nhau.

---

#### UC-FM-24: Spring keyframe với rotate

**Mô tả:** Box bounce + rotate cùng lúc.

**Các bước:**
1. Section 5 hiển thị box màu amber
2. Click "Bounce" → box animate y: [0, -60, 0, -30, 0] + rotate: [0, 10, -10, 5, 0]

**Kết quả mong đợi:** Bounce + rotate keyframe hoạt động đồng thời.

---

#### UC-FM-25: Navbar nested dropdown hover

**Mô tả:** Người dùng hover vào Framer Motion trong navbar để thấy sub-menu.

**Các bước:**
1. Hover "UI Animations" → dropdown mở
2. Hover "Framer Motion" → sub-menu xuất hiện bên phải (Gestures, Scroll, Layout)
3. Click "Gestures" → navigate đến `/framer-motion/gestures`
4. Click-outside → đóng tất cả dropdown
5. Trên mobile: sub-items indented bên dưới parent link

**Kết quả mong đợi:** Sub-menu mở/đóng mượt, navigation đúng, click-outside hoạt động.

---

#### UC-FM-26: Navbar active state cho sub-pages

**Mô tả:** Menu Framer Motion hiển thị active khi đang ở sub-page.

**Các bước:**
1. Vào `/framer-motion/scroll`
2. Menu "UI Animations" highlight violet (active)
3. Khi hover "Framer Motion" trong dropdown → "Scroll" sub-item highlight

**Kết quả mong đợi:** Active state chính xác cho parent và sub-item.

---

## C. Ý tưởng real-world (5 use cases — chưa build)

### UC-FM-27: Image Gallery + Lightbox (shared layoutId)

**Mô tả:** Grid ảnh → click → zoom full-screen lightbox với shared element transition.

**Các bước (dự kiến):**
1. Grid hiển thị 9 ảnh thumbnail
2. Click ảnh → ảnh zoom từ vị trí grid lên full-screen lightbox (`layoutId`)
3. Swipe trái/phải để đổi ảnh (`drag="x"`)
4. Pinch-to-zoom ảnh
5. Click backdrop hoặc nút X → ảnh thu về vị trí grid

**Motion APIs:** `layoutId`, `AnimatePresence`, `drag`, `useTransform`

---

### UC-FM-28: Animated To-Do List (layout + drag)

**Mô tả:** To-do list với add/check/delete animation mượt.

**Các bước (dự kiến):**
1. Nhập text + Enter → item spring/fade in từ top
2. Click checkbox → item strikethrough + scale down + fade
3. Kéo item để reorder → `layout` FLIP animate các item khác
4. Swipe item sang phải → delete với threshold (trượt ra + collapse)
5. Tab All/Active/Done → `layoutId` underline trượt

**Motion APIs:** `layout`, `AnimatePresence`, `drag`, variants, shared layout

---

### UC-FM-29: Multi-Step Onboarding Wizard (AnimatePresence mode)

**Mô tả:** Form wizard 3-4 bước với slide transition + progress bar.

**Các bước (dự kiến):**
1. Step 1 hiển thị fields, step indicator 1/4
2. Click "Next" → slide left transition sang step 2
3. Progress bar tăng mượt (`useSpring`)
4. Fields animate in với stagger trên mỗi step mới
5. Step cuối → success animation (checkmark + confetti)

**Motion APIs:** `AnimatePresence` mode, spring, stagger variants

---

### UC-FM-30: Notification Toast Stack (AnimatePresence + drag)

**Mô tả:** Hệ thống toast notification xếp chồng.

**Các bước (dự kiến):**
1. Click nút "Show Success/Error/Warning" → toast xuất hiện từ top-right
2. Toast fade in + slide vào với spring
3. Toast cũ bị đẩy xuống (`layout`)
4. Auto-dismiss sau 4s → exit animation (fade out + slide ra phải)
5. Swipe sang phải để dismiss thủ công

**Motion APIs:** `AnimatePresence`, `drag`, spring layout, exit

---

### UC-FM-31: Music Player Mini-App (SVG morph + infinite animate)

**Mô tả:** UI music player với album art spin, play/pause morph.

**Các bước (dự kiến):**
1. Album art spin (`rotate: 360`, `repeat: Infinity`)
2. Click play/pause → SVG path morph (play icon ↔ pause icon)
3. Seek bar: drag thanh progress để tua
4. Playlist: click để expand/collapse với `layout`
5. Equalizer bars: random height animate loop

**Motion APIs:** SVG path morph, `layout`, drag, `repeat: Infinity`

---

## Tổng kết số lượng use cases

| Category | Count | Status |
|---|---|---|
| A. Main page (/framer-motion) | 14 | Đã build |
| B. Sub-pages (gestures, scroll, layout) | 12 | Đã build |
| C. Real-world ideas (chưa build) | 5 | Planned |
| **Tổng** | **31** | 26 built, 5 planned |
