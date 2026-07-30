# GSAP Storytelling — Kiến trúc & Luồng hoạt động

## Tổng quan
Trang `/gsap` là một **storytelling CV page** dựng từ `docs/CV.md` — kể hành trình sự nghiệp của **Phung Dinh Tung, Senior Frontend Engineer** qua scroll-driven animations với **GSAP ScrollTrigger**. Phong cách thiết kế: **Neo-Brutalist** — viền dày đen, shadow cứng, màu sắc đậm, bố cục bất đối xứng.

## Nội dung (6 chapters)

| Chapter | Nội dung CV | Visual tone | Màu chủ đạo |
|---|---|---|---|
| 0 — HERO | Name + Title + Contact | Bold intro, staggered reveal | Yellow |
| 1 — FOUNDATION | Education + Technical Skills | Nền tảng vững chắc, card grid | Blue |
| 2 — CRAFT | VMO — Frontend Developer | Khởi đầu hành trình, thô mộc | Cyan |
| 3 — GROWTH | SOTATEK — Lead / "Project of the Year" | Phát triển, mentor, award | Purple/Magenta |
| 4 — PEAK | LG CNS — Fullstack, AWS, AI, IoT | Đỉnh cao, enterprise-scale | Red |
| 5 — CONTINUUM | Summary + Languages | Kết thúc, reflection, "THE END" | Green |

## Cấu trúc file

| File | Vai trò |
|---|---|
| `src/app/gsap/page.tsx` | Server component: metadata + import `<GsapStory />` |
| `src/app/components/gsap-story.tsx` | Client component: 6 chapters + GSAP animation code |
| `docs/CV.md` | Source content — CV của Phung Dinh Tung |

## Các gói sử dụng

| Gói | Vai trò |
|---|---|
| `gsap` | Animation engine: `gsap.from()`, `gsap.to()`, `gsap.fromTo()`, `gsap.timeline()` |
| `gsap/ScrollTrigger` | Scroll-driven: trigger, pin, scrub, batch, toggleActions |

## GSAP APIs sử dụng

### Hero — Staggered character reveal
```js
gsap.from("#hero-title span.char", {
  y: 100, opacity: 0, stagger: 0.05, duration: 0.8,
  ease: "power4.out",
  scrollTrigger: { trigger: "#hero", start: "top center" }
});
```

### Ch1 (Foundation) — Card grid slide-in
```js
gsap.utils.toArray("#ch1 .card").forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: { trigger: "#ch1", start: "top center+=100", toggleActions: "play none none reset" },
    x: i % 2 ? 100 : -100, opacity: 0, duration: 0.7,
    delay: i * 0.1, ease: "back.out(1.4)"
  });
});
```

### Ch2 (Craft) — Timeline fade-in
```js
const ch2Tl = gsap.timeline({
  scrollTrigger: { trigger: "#ch2", start: "top center", toggleActions: "play none none reset" }
});
ch2Tl.from("#ch2 .highlight", { scale: 0.8, opacity: 0, stagger: 0.15, duration: 0.6 });
```

### Ch3 (Growth) — Horizontal scroll
```js
gsap.to("#ch3 .track", {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: "#ch3", pin: true, scrub: 1,
    start: "top top",
    end: () => `+=${track.scrollWidth - window.innerWidth}`
  }
});
```

### Ch4 (Peak) — Scale burst + counter
```js
const ch4Tl = gsap.timeline({
  scrollTrigger: { trigger: "#ch4", start: "top center", toggleActions: "play none none reset" }
});
ch4Tl.fromTo("#ch4 .stat", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.2, duration: 0.8, ease: "elastic.out(1,0.5)" });
```

### Ch5 (Continuum) — Settle + final reveal
```js
gsap.from("#ch5 .end-card", {
  scrollTrigger: { trigger: "#ch5", start: "top center" },
  y: 80, opacity: 0, duration: 1, ease: "power4.out"
});
```

## Neo-Brutalist Design Tokens

| Token | Tailwind | Usage |
|---|---|---|
| Thick border | `border-4 border-black` | Cards, panels |
| Hard shadow | `shadow-[6px_6px_0px_0px_#000]` | Depth |
| Hover shadow | `hover:shadow-[8px_8px_0px_0px_#000]` | Interactive |
| Yellow accent | `bg-yellow-400`, `text-yellow-400` | Hero |
| Blue accent | `bg-blue-500` | Foundation |
| Cyan accent | `bg-cyan-400` | Craft |
| Purple accent | `bg-purple-500` | Growth |
| Red accent | `bg-red-500` | Peak |
| Green accent | `bg-green-500` | Final |
| Halftone bg | CSS `radial-gradient` dots | Section backgrounds |
| Diagonal stripes | CSS `repeating-linear-gradient` | Peak section |

## Gotchas kỹ thuật

1. **`"use client"` bắt buộc** — GSAP chỉ chạy trong browser.
2. **`gsap.registerPlugin(ScrollTrigger)`** trước khi dùng ScrollTrigger.
3. **`gsap.context()`** bọc toàn bộ animation, auto-cleanup khi unmount.
4. **ScrollTrigger.refresh()** sau mount để update vị trí (dynamic DOM).
5. **Horizontal scroll** — pin section + scrub `x` trên track, `end` dùng function để tính toán động.
6. **toggleActions: "play none none reset"** cho animation replay khi scroll ngược.
7. **Chỉ animate `transform` + `opacity`** — GPU-accelerated, tránh layout thrashing.
8. **Không dùng `useLayoutEffect`** trong SSR Next.js — dùng `useEffect` thay thế.
