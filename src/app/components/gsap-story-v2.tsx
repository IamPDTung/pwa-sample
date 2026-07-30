"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GsapStoryContent from "./gsap-story-content";

gsap.registerPlugin(ScrollTrigger);

const DOTS = [
  { id: "hero", label: "Home" },
  { id: "ch1", label: "Foundation" },
  { id: "ch2", label: "Craft" },
  { id: "ch3", label: "Growth" },
  { id: "ch4", label: "Peak" },
  { id: "ch5", label: "Continuum" },
];

const COLORS = ["#F5F5F5", "#fff", "#A5F3FC", "#F3E8FF", "#FEF2F2", "#F0FDF4"];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const target = el.getBoundingClientRect().top + window.scrollY;
  const proxy = { y: window.scrollY };
  gsap.to(proxy, {
    y: target,
    duration: 0.5,
    ease: "power2.inOut",
    onUpdate: () => window.scrollTo(0, proxy.y),
  });
}

export default function GsapStoryV2() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const ch3TrackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      window.scrollTo(0, 0);

      /* ---- HERO ---- */
      gsap.from("#hero .char", {
        y: 120, opacity: 0, stagger: 0.05, duration: 0.9, ease: "power4.out",
        scrollTrigger: { trigger: "#hero", start: "top center+=100" },
      });
      gsap.from("#hero .subtitle", {
        y: 50, opacity: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: "#hero", start: "top center+=60" },
      });
      gsap.from("#hero .contact-chip", {
        y: 30, opacity: 0, stagger: 0.08, duration: 0.5, ease: "power2.out",
        scrollTrigger: { trigger: "#hero", start: "top center" },
      });

      /* ---- CH1 ---- */
      gsap.from("#ch1-header", {
        y: -40, opacity: 0, duration: 0.6, ease: "power3.out",
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

      /* ---- CH2 ---- */
      const ch2Tl = gsap.timeline({
        scrollTrigger: { trigger: "#ch2", start: "top center", toggleActions: "play none none reset" },
      });
      ch2Tl.from("#ch2 .role-badge", { x: -80, opacity: 0, duration: 0.6, ease: "power3.out" });
      ch2Tl.from("#ch2 .timeline-chip", { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(2)" }, "-=0.2");
      ch2Tl.from("#ch2 .vmo-bullet", { x: 30, opacity: 0, stagger: 0.15, duration: 0.5, ease: "power2.out" }, "-=0.1");

      /* ---- CH3 ---- */
      const track = ch3TrackRef.current;
      if (track) {
        const scrollDist = track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: -scrollDist, ease: "none",
          scrollTrigger: {
            trigger: "#ch3", pin: true, scrub: 1, start: "top top",
            end: () => `+=${track.scrollWidth - window.innerWidth + 200}`,
            invalidateOnRefresh: true,
          },
        });
      }
      gsap.from("#ch3 .milestone-card", {
        scrollTrigger: { trigger: "#ch3", start: "top top", end: "bottom bottom", scrub: 0.5 },
        scale: 0.7, opacity: 0, stagger: 0.3, duration: 1,
      });

      /* ---- CH4 ---- */
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
          innerText: 5, duration: 2, snap: { innerText: 1 }, ease: "power2.out",
          scrollTrigger: { trigger: "#ch4", start: "top center", toggleActions: "play none none reset" },
        });
      }

      /* ---- CH5 ---- */
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

      /* ---- Dot tracking ---- */
      DOTS.forEach((dot, i) => {
        ScrollTrigger.create({
          trigger: `#${dot.id}`,
          start: "top 40%",
          end: "bottom 40%",
          onEnter: () => setActiveIdx(i),
          onEnterBack: () => setActiveIdx(i),
        });
      });

    }, scopeRef);

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, []);

  return (
    <>
      {/* Dot navigation */}
      <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {DOTS.map((dot, i) => (
          <button
            key={dot.id}
            onClick={() => scrollToId(dot.id)}
            className="group flex items-center gap-3"
            title={dot.label}
          >
            <span
              className={`text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                i === activeIdx
                  ? "opacity-100 translate-x-0 text-black"
                  : "opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 text-zinc-500"
              }`}
            >
              {dot.label}
            </span>
            <div
              className={`w-3 h-3 rounded-full border-2 border-black transition-all duration-300 ${
                i === activeIdx ? "scale-150" : "scale-100 opacity-50 group-hover:opacity-100"
              }`}
              style={{ backgroundColor: i === activeIdx ? "#000" : COLORS[i] }}
            />
          </button>
        ))}
      </nav>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-zinc-200">
        <div
          className="h-full bg-black transition-all duration-300"
          style={{ width: `${(activeIdx / (DOTS.length - 1)) * 100}%` }}
        />
      </div>

      <GsapStoryContent scopeRef={scopeRef} ch3TrackRef={ch3TrackRef} />
    </>
  );
}
