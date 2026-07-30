"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SKILLS = {
  Frontend: [
    "React.js", "Next.js", "Vue.js", "TypeScript", "JavaScript",
    "React Native", "Redux", "Zustand", "TanStack", "TailwindCSS", "Shadcn UI",
  ],
  Backend: ["Node.js", "NestJS", "PostgreSQL", "REST API", "WebSocket", "Socket.IO"],
  "Cloud & Tools": ["AWS", "Git", "Docker", "Jira", "Figma", "Vite", "Webpack"],
  Others: [
    "Frontend Architecture", "Performance Optimization",
    "Realtime Systems", "Responsive UI", "CI/CD",
  ],
} as const;

const MILESTONES = [
  { year: "2022", title: "Project of the Year", desc: "Led frontend for company award-winning project, recognized for excellence." },
  { year: "2023", title: "Frontend Lead", desc: "Architected reusable modules, standardized UI workflows across projects." },
  { year: "2023", title: "Mentoring", desc: "Code reviews, technical support, guiding team members to level up." },
  { year: "2024", title: "Global Products", desc: "Built high-performance apps for international clients in ODC models." },
];

const LG_BULLETS = [
  "Developed enterprise-scale frontend systems with React.js & Vue.js",
  "Leveraged AWS services & AI-driven features (chatbot, recommendations)",
  "Expanded knowledge in RAG, AI Agents, and modern AI workflows",
  "Collaborated with global teams in Agile environments",
  "Delivered urgent production support in high-pressure scenarios",
];

const VMO_BULLETS = [
  "Built frontend applications using React.js & modern JavaScript",
  "Improved understanding of large-scale system architecture",
  "Collaborated with cross-functional teams for responsive UIs",
];

export default function GsapStory() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const ch3TrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      window.scrollTo(0, 0);

      /* ---- HERO ---- */
      gsap.from("#hero .char", {
        y: 120,
        opacity: 0,
        stagger: 0.05,
        duration: 0.9,
        ease: "power4.out",
        scrollTrigger: { trigger: "#hero", start: "top center+=100" },
      });

      gsap.from("#hero .subtitle", {
        y: 50,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: "#hero", start: "top center+=60" },
      });

      gsap.from("#hero .contact-chip", {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: { trigger: "#hero", start: "top center" },
      });

      /* ---- CH1: FOUNDATION ---- */
      gsap.from("#ch1-header", {
        y: -40,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: "#ch1", start: "top bottom-=100", toggleActions: "play none none reset" },
      });

      const eduCard = document.querySelector("#edu-card");
      if (eduCard) {
        gsap.from(eduCard, {
          scrollTrigger: { trigger: "#ch1", start: "top center+=50", toggleActions: "play none none reset" },
          x: -120, opacity: 0, duration: 0.7, ease: "back.out(1.4)",
        });
      }

      const skillCards = gsap.utils.toArray("#ch1 .skill-card");
      skillCards.forEach((card, i) => {
        gsap.from(card as HTMLElement, {
          scrollTrigger: { trigger: "#ch1", start: "top center+=50", toggleActions: "play none none reset" },
          scale: 0.7, opacity: 0, duration: 0.6, delay: i * 0.12, ease: "back.out(1.4)",
        });
      });

      gsap.from("#ch1 .skill-tag", {
        scrollTrigger: { trigger: "#ch1", start: "top center", toggleActions: "play none none reset" },
        scale: 0, opacity: 0, stagger: 0.04, duration: 0.35, ease: "back.out(2)",
      });

      /* ---- CH2: THE CRAFT ---- */
      const ch2Tl = gsap.timeline({
        scrollTrigger: { trigger: "#ch2", start: "top center", toggleActions: "play none none reset" },
      });
      ch2Tl.from("#ch2 .role-badge", { x: -80, opacity: 0, duration: 0.6, ease: "power3.out" });
      ch2Tl.from("#ch2 .timeline-chip", { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(2)" }, "-=0.2");
      ch2Tl.from("#ch2 .vmo-bullet", { x: 30, opacity: 0, stagger: 0.15, duration: 0.5, ease: "power2.out" }, "-=0.1");

      /* ---- CH3: GROWTH (horizontal scroll) ---- */
      const track = ch3TrackRef.current;
      if (track) {
        const scrollDist = track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: -scrollDist,
          ease: "none",
          scrollTrigger: {
            trigger: "#ch3",
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${track.scrollWidth - window.innerWidth + 200}`,
            invalidateOnRefresh: true,
          },
        });
      }

      gsap.from("#ch3 .milestone-card", {
        scrollTrigger: { trigger: "#ch3", start: "top top", end: "bottom bottom", scrub: 0.5 },
        scale: 0.7, opacity: 0, stagger: 0.3, duration: 1,
      });

      /* ---- CH4: THE PEAK ---- */
      const ch4Tl = gsap.timeline({
        scrollTrigger: { trigger: "#ch4", start: "top center", toggleActions: "play none none reset" },
      });
      ch4Tl.from("#ch4 .stat-card", {
        scale: 0.2, opacity: 0, stagger: 0.2, duration: 0.8, ease: "elastic.out(1, 0.4)",
      });
      ch4Tl.from("#ch4 .lg-bullet", {
        x: -40, opacity: 0, stagger: 0.15, duration: 0.5, ease: "power3.out",
      }, "-=0.3");

      const counterEl = document.querySelector("#ch4 .counter");
      if (counterEl) {
        gsap.fromTo(counterEl, { innerText: 0 }, {
          innerText: 5,
          duration: 2,
          snap: { innerText: 1 },
          ease: "power2.out",
          scrollTrigger: { trigger: "#ch4", start: "top center", toggleActions: "play none none reset" },
        });
      }

      /* ---- CH5: CONTINUUM ---- */
      gsap.from("#ch5 .summary-card", {
        scrollTrigger: { trigger: "#ch5", start: "top center+=100" },
        y: 80, opacity: 0, duration: 0.9, ease: "power4.out",
      });

      gsap.from("#ch5 .lang-card", {
        scrollTrigger: { trigger: "#ch5", start: "top center+=50" },
        x: 100, opacity: 0, duration: 0.7, ease: "power3.out",
      });

      gsap.from("#ch5 .the-end", {
        scrollTrigger: { trigger: "#ch5", start: "center center+=40" },
        scale: 0, rotate: -15, opacity: 0, duration: 0.9, ease: "elastic.out(1, 0.4)",
      });

      gsap.from("#ch5 .end-contact", {
        scrollTrigger: { trigger: "#ch5", start: "center center" },
        y: 40, opacity: 0, stagger: 0.08, duration: 0.5, ease: "power2.out",
      });
    }, scopeRef);

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, []);

  return (
    <main ref={scopeRef} className="bg-[#F5F5F5] text-black overflow-x-hidden">
      {/* ================================================================
          CHAPTER 0 — HERO
          ================================================================ */}
      <section
        id="hero"
        className="min-h-screen flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d4d4d4 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        {/* Decorative block */}
        <div className="absolute top-12 right-12 w-28 h-28 bg-yellow-400 border-4 border-black rotate-12 shadow-[6px_6px_0px_0px_#000] hidden lg:block" />
        <div className="absolute bottom-20 left-10 w-20 h-20 bg-cyan-400 border-4 border-black -rotate-6 shadow-[6px_6px_0px_0px_#000] hidden lg:block" />

        <h1
          id="hero-title"
          className="text-6xl sm:text-7xl lg:text-9xl font-black tracking-tighter text-center leading-none mb-8"
        >
          {"PHUNG DINH TUNG".split("").map((ch, i) => (
            <span key={i} className="char inline-block">
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </h1>

        <p className="subtitle text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-600 mb-12">
          Senior Frontend Engineer
        </p>

        {/* Contact chips */}
        <div id="hero-contact" className="flex flex-wrap gap-3 justify-center max-w-2xl">
          {[
            { label: "Phone", val: "+84-384991766", color: "bg-yellow-400" },
            { label: "Email", val: "phungdinh.tung.ptit@gmail.com", color: "bg-cyan-400" },
            { label: "Address", val: "Ha Noi, Viet Nam", color: "bg-purple-400" },
            { label: "Portfolio", val: "linkedin.com/in/pdtung/", color: "bg-green-400" },
          ].map((c) => (
            <div
              key={c.label}
              className={`contact-chip ${c.color} border-3 border-black px-4 py-2 font-bold text-sm shadow-[4px_4px_0px_0px_#000]`}
            >
              <span className="text-zinc-600 text-xs">{c.label}: </span>
              {c.val}
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Scroll</span>
          <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
            <rect x="1" y="1" width="18" height="26" rx="9" stroke="#000" strokeWidth="2.5" />
            <circle cx="10" cy="10" r="3" fill="#000" />
          </svg>
        </div>
      </section>

      {/* ================================================================
          CHAPTER 1 — THE FOUNDATION
          ================================================================ */}
      <section id="ch1" className="min-h-screen py-24 px-6 lg:px-16">
        <h2 id="ch1-header" className="text-5xl sm:text-7xl font-black mb-4 tracking-tighter">
          <span className="bg-blue-500 text-white px-4 py-1 border-4 border-black shadow-[6px_6px_0px_0px_#000] inline-block">
            THE
          </span>{" "}
          <br className="sm:hidden" />
          <span className="bg-blue-500 text-white px-4 py-1 border-4 border-black shadow-[6px_6px_0px_0px_#000] inline-block mt-2 sm:mt-0">
            FOUNDATION
          </span>
        </h2>

        <div className="grid lg:grid-cols-5 gap-6 mt-12">
          {/* Education */}
          <div
            id="edu-card"
            className="card lg:col-span-2 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 hover:shadow-[10px_10px_0px_0px_#000] transition-shadow"
          >
            <div className="text-xs font-black uppercase tracking-widest text-blue-500 mb-3">
              Education
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-1">
              Posts and Telecommunications
              <br />
              Institute of Technology
            </h3>
            <p className="text-lg font-bold text-zinc-500 mb-2">PTIT</p>
            <div className="inline-block bg-blue-500 text-white px-3 py-1 border-2 border-black font-bold text-sm">
              Bachelor of IT &middot; 2017–2022
            </div>
          </div>

          {/* Skill cards */}
          {(Object.keys(SKILLS) as (keyof typeof SKILLS)[]).map((cat) => (
            <div
              key={cat}
              className="skill-card bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-5 hover:shadow-[10px_10px_0px_0px_#000] transition-shadow"
            >
              <div className="text-xs font-black uppercase tracking-widest text-blue-500 mb-3">{cat}</div>
              <div className="flex flex-wrap gap-1.5">
                {SKILLS[cat].map((sk) => (
                  <span
                    key={sk}
                    className="skill-tag inline-block bg-zinc-100 border-2 border-black px-2 py-0.5 text-xs font-bold hover:bg-blue-500 hover:text-white transition-colors cursor-default"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          CHAPTER 2 — THE CRAFT
          ================================================================ */}
      <section
        id="ch2"
        className="min-h-screen flex items-center py-24 px-6 lg:px-16"
        style={{
          backgroundImage:
            "radial-gradient(circle, #cffafe 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="max-w-3xl mx-auto w-full">
          <h2 className="text-5xl sm:text-7xl font-black mb-4 tracking-tighter">
            <span className="bg-cyan-400 text-black px-4 py-1 border-4 border-black shadow-[6px_6px_0px_0px_#000] inline-block">
              THE
            </span>{" "}
            <br className="sm:hidden" />
            <span className="bg-cyan-400 text-black px-4 py-1 border-4 border-black shadow-[6px_6px_0px_0px_#000] inline-block">
              CRAFT
            </span>
          </h2>

          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 mt-8">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <div className="role-badge bg-cyan-400 text-black px-4 py-2 border-3 border-black font-black text-lg shadow-[4px_4px_0px_0px_#000]">
                VMO
              </div>
              <div className="timeline-chip bg-black text-white px-3 py-1 font-bold text-sm border-2 border-black">
                Frontend Developer
              </div>
              <div className="timeline-chip bg-zinc-200 text-black px-3 py-1 font-bold text-sm border-2 border-black">
                May 2021 – May 2022
              </div>
            </div>

            <ul className="space-y-3">
              {VMO_BULLETS.map((b, i) => (
                <li key={i} className="vmo-bullet flex items-start gap-3">
                  <span className="text-cyan-500 font-black text-lg mt-0.5">&rarr;</span>
                  <span className="font-semibold text-zinc-700">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ================================================================
          CHAPTER 3 — THE GROWTH (horizontal scroll)
          ================================================================ */}
      <section id="ch3" className="overflow-hidden bg-purple-50">
        <div className="h-screen flex items-center">
          <div className="w-full px-6 lg:px-16">
            <h2 className="text-5xl sm:text-7xl font-black mb-8 tracking-tighter">
              <span className="bg-purple-500 text-white px-4 py-1 border-4 border-black shadow-[6px_6px_0px_0px_#000] inline-block">
                THE
              </span>{" "}
              <br className="sm:hidden" />
              <span className="bg-purple-500 text-white px-4 py-1 border-4 border-black shadow-[6px_6px_0px_0px_#000] inline-block">
                GROWTH
              </span>
            </h2>

            <div className="text-lg font-bold text-zinc-500 mb-6 uppercase tracking-widest">
              SOTATEK &middot; Frontend Lead &middot; May 2022 – Sep 2024
            </div>

            {/* Horizontal track */}
            <div ref={ch3TrackRef} className="flex gap-6" style={{ width: "max-content" }}>
              {MILESTONES.map((m) => (
                <div
                  key={m.title}
                  className="milestone-card bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 w-[320px] flex-shrink-0"
                >
                  <div className="text-5xl font-black text-purple-500 mb-2">{m.year}</div>
                  <h3 className="text-xl font-black mb-2">{m.title}</h3>
                  <p className="text-sm font-semibold text-zinc-600">{m.desc}</p>
                </div>
              ))}

              {/* End marker */}
              <div className="w-[200px] flex-shrink-0 flex items-center justify-center">
                <div className="bg-black text-white px-6 py-3 border-4 border-black font-black text-lg rotate-3 shadow-[6px_6px_0px_0px_#A855F7] whitespace-nowrap">
                  &rarr; LG CNS &rarr;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          CHAPTER 4 — THE PEAK
          ================================================================ */}
      <section
        id="ch4"
        className="min-h-screen py-24 px-6 lg:px-16 relative overflow-hidden"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-30deg, transparent, transparent 20px, rgba(239,68,68,0.06) 20px, rgba(239,68,68,0.06) 40px)",
          backgroundColor: "#FEF2F2",
        }}
      >
        <h2 className="text-5xl sm:text-7xl font-black mb-16 tracking-tighter">
          <span className="bg-red-500 text-white px-4 py-1 border-4 border-black shadow-[6px_6px_0px_0px_#000] inline-block">
            THE
          </span>{" "}
          <br className="sm:hidden" />
          <span className="bg-red-500 text-white px-4 py-1 border-4 border-black shadow-[6px_6px_0px_0px_#000] inline-block">
            PEAK
          </span>
        </h2>

        {/* Stat cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-14 max-w-3xl mx-auto">
          {[
            { label: "Years Experience", value: "5+", color: "bg-red-400" },
            { label: "Enterprise Projects", value: "10+", color: "bg-red-500" },
            { label: "Technologies", value: "20+", color: "bg-red-600" },
          ].map((s) => (
            <div
              key={s.label}
              className={`stat-card ${s.color} border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 text-white text-center`}
            >
              <div className="text-4xl sm:text-5xl font-black">{s.value}</div>
              <div className="text-sm font-bold mt-1 opacity-90">{s.label}</div>
            </div>
          ))}
        </div>

        {/* LG CNS detail */}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="bg-red-500 text-white px-5 py-2 border-4 border-black font-black text-xl shadow-[6px_6px_0px_0px_#000]">
              LG CNS
            </div>
            <div className="bg-black text-white px-4 py-2 border-4 border-black font-bold text-sm">
              Fullstack Developer
            </div>
            <div className="bg-zinc-200 text-black px-4 py-2 border-4 border-black font-bold text-sm">
              Sep 2024 – Present
            </div>
          </div>

          <ul className="space-y-3">
            {LG_BULLETS.map((b, i) => (
              <li key={i} className="lg-bullet flex items-start gap-3">
                <span className="text-red-500 font-black text-xl mt-0.5">&rarr;</span>
                <span className="font-semibold text-zinc-800">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================================================================
          CHAPTER 5 — THE CONTINUUM
          ================================================================ */}
      <section id="ch5" className="min-h-screen py-24 px-6 lg:px-16 bg-[#F0FDF4]">
        <h2 className="text-5xl sm:text-7xl font-black mb-16 tracking-tighter">
          <span className="bg-green-500 text-white px-4 py-1 border-4 border-black shadow-[6px_6px_0px_0px_#000] inline-block">
            THE
          </span>{" "}
          <br className="sm:hidden" />
          <span className="bg-green-500 text-white px-4 py-1 border-4 border-black shadow-[6px_6px_0px_0px_#000] inline-block">
            CONTINUUM
          </span>
        </h2>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Summary */}
          <div className="summary-card bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8">
            <h3 className="text-2xl font-black mb-4 text-green-600">Summary</h3>
            <p className="font-semibold text-zinc-700 leading-relaxed">
              Frontend-focused FullStack Developer with{" "}
              <span className="bg-green-400 text-black px-1 border-2 border-black font-black">
                5 years of experience
              </span>{" "}
              building scalable web applications using React.js, Next.js,
              TypeScript, and modern frontend ecosystems.
            </p>
            <p className="font-semibold text-zinc-700 leading-relaxed mt-3">
              Experienced in frontend architecture, performance optimization,
              realtime systems, and cross-functional collaboration with global
              clients. Proven ability to lead frontend initiatives and adapt to
              modern technologies including{" "}
              <span className="bg-yellow-400 text-black px-1 border-2 border-black font-black">
                AWS & AI
              </span>
              .
            </p>
          </div>

          {/* Languages */}
          <div className="lang-card bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6">
            <h3 className="text-xl font-black mb-2 text-green-600">Languages</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-green-400 text-black px-4 py-1.5 border-3 border-black font-black text-lg shadow-[3px_3px_0px_0px_#000]">
                English
              </div>
              <div className="bg-zinc-200 text-black px-3 py-1 border-2 border-black font-bold text-sm">
                Aptis B2 (Reading & Listening)
              </div>
              <span className="text-sm font-bold text-zinc-500">
                Comfortable with technical documentation & international meetings
              </span>
            </div>
          </div>

          {/* THE END */}
          <div className="text-center pt-12">
            <div className="the-end inline-block bg-black text-green-400 px-10 py-5 border-4 border-black shadow-[10px_10px_0px_0px_#22C55E] text-6xl sm:text-8xl font-black rotate-2">
              THE END
            </div>
          </div>

          {/* Final contact */}
          <div className="flex flex-wrap gap-2 justify-center pt-8">
            {[
              { label: "Phone", val: "+84-384991766" },
              { label: "Email", val: "phungdinh.tung.ptit@gmail.com" },
              { label: "Portfolio", val: "linkedin.com/in/pdtung/" },
            ].map((c) => (
              <div
                key={c.label}
                className="end-contact bg-zinc-100 border-3 border-black px-4 py-2 font-bold text-sm shadow-[4px_4px_0px_0px_#22C55E]"
              >
                <span className="text-zinc-500">{c.label}: </span>
                {c.val}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
