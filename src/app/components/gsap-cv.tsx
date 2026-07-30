"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: "5+", label: "Years Experience" },
  { value: "20+", label: "Technologies" },
  { value: "3", label: "Enterprises" },
  { value: "10+", label: "Major Projects" },
] as const;

const SKILLS_ALL = [
  "React.js", "Next.js", "Vue.js", "TypeScript", "JavaScript", "React Native",
  "Redux", "Zustand", "TanStack", "TailwindCSS", "Shadcn UI",
  "Node.js", "NestJS", "PostgreSQL", "REST API", "WebSocket", "Socket.IO",
  "AWS", "Docker", "Git", "CI/CD", "Figma", "Vite", "Webpack",
  "Frontend Architecture", "Performance Optimization", "Realtime Systems",
];

const EXPERIENCES = [
  {
    company: "LG CNS",
    role: "Fullstack Developer",
    period: "Sep 2024 – Present",
    accent: "#0F766E",
    bullets: [
      "Architecting enterprise-scale frontend systems with React.js & Vue.js, serving thousands of users across IoT platforms.",
      "Leading AWS-powered, AI-driven features: chatbot, recommendation engines, and intelligent automation.",
      "Pioneering RAG & AI Agent implementations in production — bridging cutting-edge AI with frontend UX.",
      "Driving cross-project resolutions in Agile environments, collaborating with global HQ teams.",
    ],
  },
  {
    company: "SOTATEK",
    role: "Frontend Lead",
    period: "May 2022 – Sep 2024",
    accent: "#7C3AED",
    bullets: [
      "Led frontend for \"Project of the Year\" award-winning product — recognized for technical excellence.",
      "Architected reusable module system adopted across 5+ projects, reducing new-project bootstrap by 40%.",
      "Built realtime dashboards, interactive data interfaces, and high-performance mobile apps for global clients.",
      "Mentored junior developers through code reviews, pairing sessions, and knowledge-sharing workshops.",
    ],
  },
  {
    company: "VMO",
    role: "Frontend Developer",
    period: "May 2021 – May 2022",
    accent: "#0891B2",
    bullets: [
      "Built responsive, maintainable frontend apps using React.js and modern JavaScript tooling.",
      "Deepened expertise in large-scale architecture, debugging, and performance profiling.",
      "Collaborated across design, backend, and QA teams to ship polished, on-time deliverables.",
    ],
  },
];

const SKILL_CATEGORIES = [
  {
    title: "Frontend",
    skills: ["React.js", "Next.js", "Vue.js", "TypeScript", "JavaScript", "React Native", "Redux", "Zustand", "TanStack", "TailwindCSS", "Shadcn UI"],
    emoji: "🎨",
  },
  {
    title: "Backend",
    skills: ["Node.js", "NestJS", "PostgreSQL", "REST API", "WebSocket", "Socket.IO"],
    emoji: "⚙️",
  },
  {
    title: "Cloud & DevOps",
    skills: ["AWS", "Docker", "Git", "CI/CD", "Vite", "Webpack", "Figma"],
    emoji: "☁️",
  },
  {
    title: "Architecture",
    skills: ["Frontend Architecture", "Performance Optimization", "Realtime Systems", "Responsive UI"],
    emoji: "🏗️",
  },
];

export default function GsapCv() {
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      window.scrollTo(0, 0);

      /* ---- HERO ---- */
      gsap.from("#cv-hero .char", {
        y: 100, opacity: 0, stagger: 0.04, duration: 0.8, ease: "power4.out",
        scrollTrigger: { trigger: "#cv-hero", start: "top center" },
      });
      gsap.from("#cv-hero .title-reveal", {
        y: 40, opacity: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: "#cv-hero", start: "top center+=40" },
      });
      gsap.from("#cv-hero .tagline", {
        y: 30, opacity: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: "#cv-hero", start: "top center+=20" },
      });

      /* ---- STATS ---- */
      gsap.from("#cv-stats .stat-item", {
        scale: 0.3, opacity: 0, stagger: 0.15, duration: 0.8,
        ease: "elastic.out(1, 0.5)",
        scrollTrigger: { trigger: "#cv-stats", start: "top bottom-=80", toggleActions: "play none none reset" },
      });

      /* ---- ABOUT ---- */
      gsap.from("#cv-about .about-text", {
        y: 60, opacity: 0, duration: 0.9, ease: "power4.out",
        scrollTrigger: { trigger: "#cv-about", start: "top bottom-=100", toggleActions: "play none none reset" },
      });

      /* ---- SKILLS ---- */
      gsap.from("#cv-skills .skill-card", {
        y: 50, opacity: 0, stagger: 0.12, duration: 0.7, ease: "back.out(1.4)",
        scrollTrigger: { trigger: "#cv-skills", start: "top bottom-=80", toggleActions: "play none none reset" },
      });

      /* ---- EXPERIENCE ---- */
      const expCards = gsap.utils.toArray("#cv-exp .exp-card");
      expCards.forEach((card, i) => {
        gsap.from(card as HTMLElement, {
          scrollTrigger: { trigger: "#cv-exp", start: "top center+=50", toggleActions: "play none none reset" },
          x: i % 2 === 0 ? -80 : 80, opacity: 0, rotation: i % 2 === 0 ? -2 : 2,
          duration: 0.8, delay: i * 0.2, ease: "power3.out",
        });
      });

      gsap.from("#cv-exp .exp-bullet", {
        scrollTrigger: { trigger: "#cv-exp", start: "top center", toggleActions: "play none none reset" },
        x: -20, opacity: 0, stagger: 0.08, duration: 0.4, ease: "power2.out",
      });

      /* ---- EDUCATION ---- */
      gsap.from("#cv-edu .edu-card", {
        y: 60, opacity: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: "#cv-edu", start: "top bottom-=80", toggleActions: "play none none reset" },
      });

      /* ---- CONTACT ---- */
      gsap.from("#cv-contact .contact-item", {
        y: 30, opacity: 0, stagger: 0.1, duration: 0.5, ease: "power2.out",
        scrollTrigger: { trigger: "#cv-contact", start: "top bottom-=60", toggleActions: "play none none reset" },
      });
    }, scopeRef);

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, []);

  return (
    <main ref={scopeRef} className="bg-[#FDFBF7] text-[#1A1A1A] overflow-x-hidden">
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee-scroll 28s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }

        .blob-shape {
          border-radius: 40% 60% 60% 40% / 40% 50% 50% 60%;
        }
      `}</style>

      {/* ==============================================================
          HERO
          ============================================================== */}
      <section id="cv-hero" className="relative min-h-screen flex flex-col items-center justify-center px-6 py-32 overflow-hidden">
        {/* Blob decorations */}
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] blob-shape opacity-[0.07]"
          style={{ background: "#0F766E" }}
        />
        <div
          className="absolute -bottom-60 -left-32 w-[500px] h-[500px] blob-shape opacity-[0.05]"
          style={{ background: "#C9A96E", borderRadius: "50% 40% 60% 50% / 50% 60% 40% 50%" }}
        />

        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-center leading-none mb-6">
          {"PHUNG DINH TUNG".split("").map((ch, i) => (
            <span key={i} className="char inline-block">
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </h1>

        <p className="title-reveal text-xl sm:text-2xl md:text-3xl font-bold tracking-wide mb-4" style={{ color: "#0F766E" }}>
          Senior Frontend Engineer
        </p>

        <p className="tagline text-base sm:text-lg text-zinc-500 font-medium max-w-xl text-center leading-relaxed">
          Crafting scalable, high-performance web experiences —
          <br className="hidden sm:block" />
          from{" "}
          <span className="font-bold text-zinc-700">Vietnam</span>{" "}
          to the{" "}
          <span className="font-bold text-zinc-700">world</span>.
        </p>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Scroll</span>
          <div className="w-[1px] h-10 bg-zinc-300 rounded-full" />
        </div>
      </section>

      {/* ==============================================================
          STATS
          ============================================================== */}
      <section id="cv-stats" className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="stat-item bg-white rounded-3xl p-6 md:p-8 text-center border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter" style={{ color: "#0F766E" }}>
                {s.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider mt-2">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==============================================================
          ABOUT
          ============================================================== */}
      <section id="cv-about" className="relative py-20 px-6">
        {/* Organic divider top */}
        <svg className="absolute top-0 left-0 w-full h-16 text-[#FDFBF7] -translate-y-full" viewBox="0 0 1440 64" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" />
        </svg>

        <div className="max-w-3xl mx-auto">
          <div className="about-text bg-white rounded-3xl p-8 md:p-12 border border-zinc-100 shadow-sm">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-6">
              About{" "}
              <span style={{ color: "#0F766E" }}>Me</span>
            </h2>
            <div className="space-y-4 text-zinc-600 font-medium leading-relaxed text-base sm:text-lg">
              <p>
                A passionate Frontend-Focused FullStack Developer with{" "}
                <span className="font-black text-[#1A1A1A]" style={{ background: "linear-gradient(180deg, transparent 60%, #C9A96E33 60%)" }}>
                  5+ years of experience
                </span>{" "}
                architecting web applications that balance beauty with performance. I specialize in the
                React ecosystem — Next.js, TypeScript, TanStack — combined with a strong backend
                foundation in Node.js, NestJS, and PostgreSQL.
              </p>
              <p>
                At{" "}
                <span className="font-black text-[#0F766E]">LG CNS</span>, I build
                enterprise-scale frontend systems powered by AWS and AI. At{" "}
                <span className="font-black" style={{ color: "#7C3AED" }}>SOTATEK</span>, I led
                the frontend for a{" "}
                <span className="font-black text-[#1A1A1A]" style={{ background: "linear-gradient(180deg, transparent 60%, #C9A96E33 60%)" }}>
                  \u201CProject of the Year\u201D
                </span>{" "}
                award-winning product. I thrive at the intersection of{" "}
                <span className="font-semibold text-[#1A1A1A]">engineering rigor</span> and{" "}
                <span className="font-semibold text-[#1A1A1A]">creative problem-solving</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Organic divider bottom */}
        <svg className="absolute bottom-0 left-0 w-full h-16 text-[#FDFBF7] translate-y-full rotate-180" viewBox="0 0 1440 64" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" />
        </svg>
      </section>

      {/* ==============================================================
          SKILLS
          ============================================================== */}
      <section id="cv-skills" className="py-20 px-6">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-center mb-12">
          Technical{" "}
          <span style={{ color: "#0F766E" }}>Skills</span>
        </h2>

        {/* Skill category cards */}
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {SKILL_CATEGORIES.map((cat) => (
            <div
              key={cat.title}
              className="skill-card bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{cat.emoji}</span>
                <h3 className="font-black text-sm uppercase tracking-wider text-zinc-400">{cat.title}</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-block bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-zinc-600 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors cursor-default"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Skills marquee */}
        <div className="relative overflow-hidden py-6 border-y border-zinc-200">
          <div className="flex gap-8 animate-marquee whitespace-nowrap" style={{ width: "max-content" }}>
            {[...SKILLS_ALL, ...SKILLS_ALL].map((sk, i) => (
              <span
                key={i}
                className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-200 select-none"
                style={i % 2 === 0 ? { color: "#0F766E", opacity: 0.15 } : { opacity: 0.08 }}
              >
                {sk}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ==============================================================
          EXPERIENCE
          ============================================================== */}
      <section id="cv-exp" className="py-20 px-6">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-center mb-4">
          Work{" "}
          <span style={{ color: "#0F766E" }}>Experience</span>
        </h2>
        <p className="text-center text-zinc-400 font-medium mb-14 text-sm uppercase tracking-widest">
          2021 → Present · 5+ Years
        </p>

        <div className="max-w-3xl mx-auto space-y-8">
          {EXPERIENCES.map((exp) => (
            <div
              key={exp.company}
              className="exp-card bg-white rounded-3xl p-6 md:p-8 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: exp.accent }}
                />
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">{exp.company}</h3>
              </div>
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <span className="font-bold text-sm" style={{ color: exp.accent }}>
                  {exp.role}
                </span>
                <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
                  {exp.period}
                </span>
              </div>
              <ul className="space-y-3">
                {exp.bullets.map((b, j) => (
                  <li key={j} className="exp-bullet flex items-start gap-3">
                    <span
                      className="flex-shrink-0 mt-1 w-2 h-2 rounded-full"
                      style={{ background: exp.accent }}
                    />
                    <span className="text-sm sm:text-base font-medium text-zinc-600 leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ==============================================================
          EDUCATION & LANGUAGES
          ============================================================== */}
      <section id="cv-edu" className="py-20 px-6" style={{ background: "linear-gradient(180deg, #FDFBF7 0%, #F5F2EB 100%)" }}>
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
          {/* Education */}
          <div className="edu-card bg-white rounded-3xl p-6 md:p-8 border border-zinc-100 shadow-sm">
            <div className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">
              Education
            </div>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black text-white mb-4"
              style={{ background: "#0F766E" }}
            >
              PT
            </div>
            <h3 className="text-xl font-black tracking-tight mb-1">
              Posts and Telecommunications
              <br />
              Institute of Technology
            </h3>
            <p className="text-sm font-semibold text-zinc-400 mb-3">PTIT</p>
            <div
              className="inline-block rounded-full px-4 py-1.5 text-xs font-bold"
              style={{ background: "#0F766E15", color: "#0F766E" }}
            >
              Bachelor of IT · 2017–2022
            </div>
          </div>

          {/* Languages */}
          <div className="edu-card bg-white rounded-3xl p-6 md:p-8 border border-zinc-100 shadow-sm">
            <div className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">
              Languages
            </div>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black text-white mb-4"
              style={{ background: "#C9A96E" }}
            >
              EN
            </div>
            <h3 className="text-xl font-black tracking-tight mb-1">English</h3>
            <p className="text-sm font-semibold text-zinc-400 mb-3">Aptis B2 (Reading & Listening)</p>
            <p className="text-sm font-medium text-zinc-500 leading-relaxed">
              Comfortable with technical documentation, client meetings, and
              international team collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* ==============================================================
          CONTACT
          ============================================================== */}
      <section id="cv-contact" className="py-24 px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
          Let&apos;s{" "}
          <span style={{ color: "#0F766E" }}>Work</span>{" "}
          Together
        </h2>
        <p className="text-zinc-400 font-medium mb-10 max-w-md mx-auto">
          Open to exciting opportunities and collaborations.
        </p>

        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          {[
            { label: "Phone", value: "+84-384991766", icon: "📞" },
            { label: "Email", value: "phungdinh.tung.ptit@gmail.com", icon: "✉️" },
            { label: "Location", value: "Ha Noi, Viet Nam", icon: "📍" },
            { label: "Portfolio", value: "linkedin.com/in/pdtung/", icon: "🔗" },
          ].map((c) => (
            <div
              key={c.label}
              className="contact-item flex items-center gap-3 bg-white rounded-2xl px-5 py-3 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-lg">{c.icon}</span>
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{c.label}</div>
                <div className="text-sm font-bold text-zinc-700">{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom blob */}
        <div className="mt-20 relative">
          <div
            className="mx-auto w-48 h-48 blob-shape opacity-[0.04]"
            style={{ background: "#0F766E" }}
          />
          <p className="text-xs font-bold text-zinc-300 uppercase tracking-[0.3em] mt-6">
            &copy; 2025 Phung Dinh Tung
          </p>
        </div>
      </section>
    </main>
  );
}
