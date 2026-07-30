# GSAP Storytelling — Các trường hợp sử dụng

Nội dung source: `docs/CV.md` — CV của Phung Dinh Tung, Senior Frontend Engineer.

---

## UC-GS-01: Hero — Name + Title reveal

**Mô tả:** Người dùng vào `/gsap`, thấy Hero section với tên và chức danh animated.

**Các bước:**
1. Vào `/gsap` từ navbar hoặc URL trực tiếp
2. Hero section xuất hiện: background vàng, viền đen dày
3. Từng ký tự trong "PHUNG DINH TUNG" stagger fade-up từ dưới (mỗi ký tự delay 50ms)
4. "Senior Frontend Engineer" subtitle fade-up sau đó
5. Contact info (phone, email, address, linkedin) reveal tuần tự

**Kết quả mong đợi:** Tên xuất hiện ấn tượng với stagger, style Neo-Brutalist.

---

## UC-GS-02: Foundation — Education + Skills

**Mô tả:** Scroll xuống thấy section nền tảng: học vấn và kỹ năng.

**Các bước:**
1. Scroll từ Hero xuống
2. Section "THE FOUNDATION" vào viewport
3. Card Education (PTIT, 2017-2022) slide-in từ trái
4. 4 skill category cards (Frontend, Backend, Cloud & Tools, Others) stagger slide-in từ phải
5. Skill tags bên trong cards fade-in stagger 50ms
6. Mỗi card có viền đen dày + shadow cứng, màu xanh dương

**Kết quả mong đợi:** Cards stagger từ trái/phải, skill tags hiển thị tuần tự.

---

## UC-GS-03: Craft — VMO experience

**Mô tả:** Scroll đến section kinh nghiệm đầu tiên.

**Các bước:**
1. Scroll đến Chapter 2 "THE CRAFT"
2. Panel hiển thị: VMO logo/placeholder + "Frontend Developer" + timeline (May 2021 – May 2022)
3. 3 bullet points xuất hiện tuần tự:
   - "Built and maintained frontend applications using React.js"
   - "Improved understanding of large-scale system architecture"
   - "Collaborated with cross-functional teams"
4. Accent màu cyan, layout bất đối xứng

**Kết quả mong đợi:** Timeline role rõ ràng, bullets stagger vào.

---

## UC-GS-04: Growth — SOTATEK (Horizontal scroll)

**Mô tả:** Section bị pin, user scroll để di chuyển ngang qua các thành tựu SOTATEK.

**Các bước:**
1. Scroll đến Chapter 3 "THE GROWTH"
2. Section được pin (không scroll dọc)
3. Scroll tiếp → track di chuyển ngang, hiển thị 4 milestone cards:
   - "Project of the Year" — award badge animation
   - "Frontend Lead" — leadership card
   - "Mentoring" — team growth card
   - "Global Products" — international collaboration card
4. Parallax background (dots/stripes) di chuyển chậm hơn
5. Scroll hết ngang → unpin, tiếp tục scroll dọc

**Kết quả mong đợi:** Pin + horizontal scroll mượt, milestones hiển thị rõ.

---

## UC-GS-05: Peak — LG CNS

**Mô tả:** Section đỉnh cao với scale burst animation.

**Các bước:**
1. Scroll đến Chapter 4 "THE PEAK"
2. Background đỏ + diagonal stripes
3. 5 bullet points scale burst từ 0.3 → 1 với elastic ease:
   - "Enterprise-scale frontend systems"
   - "AWS services + AI-driven features"
   - "RAG, AI Agents, modern AI workflows"
   - "Agile + cross-project resolution"
   - "Global team collaboration"
4. Mỗi bullet delay 200ms, elastic snap
5. "5 years experience" counter tăng từ 0 → 5

**Kết quả mong đợi:** Animation bùng nổ, elastic snap ấn tượng.

---

## UC-GS-06: Continuum — Summary + Languages + "THE END"

**Mô tả:** Kết thúc với reflection và contact.

**Các bước:**
1. Scroll đến Chapter 5 "THE CONTINUUM"
2. Summary paragraph fade-in với highlight text
3. Languages: English B2 card + description slide-in
4. Contact info repeat với layout khác (cleaner)
5. "THE END" text scale từ 0 → 1 với elastic ease
6. Màu xanh lá, không khí hoàn thành

**Kết quả mong đợi:** Kết thúc nhẹ nhàng, "THE END" ấn tượng.

---

## UC-GS-07: Scroll ngược (reverse)

**Mô tả:** Scroll lên, animation reverse.

**Các bước:**
1. Sau khi scroll hết CV, scroll ngược lên
2. Ch5: "THE END" scale down, text fade out
3. Ch4: bullets scale từ 1 → 0.3
4. Ch3: horizontal scroll reverse (track di chuyển ngược)
5. Ch2: bullets fade out
6. Ch1: cards slide-out

**Kết quả mong đợi:** Reverse animation nhờ toggleActions: "play none none reset".

---

## UC-GS-08: Responsive mobile

**Mô tả:** Xem CV story trên mobile (<768px).

**Các bước:**
1. Mở /gsap trên mobile
2. Ch3 horizontal scroll → stack vertical (không pin)
3. Font size tự động giảm, padding tăng
4. Cards width 100% thay vì grid

**Kết quả mong đợi:** Layout không bể, animation vẫn mượt.

---

## UC-GS-09: Navbar navigation

**Mô tả:** "GSAP" link trong navbar dropdown "UI Animations" → điều hướng đến /gsap.

**Các bước:**
1. Click "GSAP" trong navbar
2. Trang /gsap load
3. ScrollTrigger positions đúng (không lỗi refresh)

**Kết quả mong đợi:** Không lỗi cleanup từ trang trước.
