"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GsapStoryContent from "./gsap-story-content";

gsap.registerPlugin(ScrollTrigger);

const SECTION_IDS = ["hero", "ch1", "ch2", "ch3", "ch4", "ch5"];
const SECTION_LABELS = ["Home", "Foundation", "Craft", "Growth", "Peak", "Continuum"];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const target = el.getBoundingClientRect().top + window.scrollY;
  const proxy = { y: window.scrollY };
  gsap.to(proxy, {
    y: target,
    duration: 0.5,
    ease: "power3.inOut",
    onUpdate: () => window.scrollTo(0, proxy.y),
  });
}

export default function GsapStoryV4() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const ch3TrackRef = useRef<HTMLDivElement>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  const goNext = useCallback(() => {
    if (currentIdx < SECTION_IDS.length - 1) {
      scrollToId(SECTION_IDS[currentIdx + 1]);
    }
  }, [currentIdx]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) {
      scrollToId(SECTION_IDS[currentIdx - 1]);
    }
  }, [currentIdx]);

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

      /* ---- Track active section ---- */
      SECTION_IDS.forEach((id, i) => {
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: "top 40%",
          end: "bottom 40%",
          onEnter: () => setCurrentIdx(i),
          onEnterBack: () => setCurrentIdx(i),
        });
      });

    }, scopeRef);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKey);

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", handleKey);
      ctx.revert();
    };
  }, [goNext, goPrev]);

  return (
    <>
      {/* Bottom navigation bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-full px-2 py-1.5">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="px-3 py-1 font-black text-sm border-2 border-black bg-zinc-100 hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-full"
        >
          &uarr; Prev
        </button>

        <span className="px-2 text-xs font-black text-zinc-400 uppercase tracking-widest min-w-[80px] text-center">
          {SECTION_LABELS[currentIdx]}
        </span>

        <button
          onClick={goNext}
          disabled={currentIdx === SECTION_IDS.length - 1}
          className="px-3 py-1 font-black text-sm border-2 border-black bg-black text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-full"
        >
          Next &darr;
        </button>
      </div>

      {/* Page counter */}
      <div className="fixed top-4 right-4 z-50 bg-white border-2 border-black px-3 py-1 font-black text-xs shadow-[3px_3px_0px_0px_#000]">
        {currentIdx + 1} / {SECTION_IDS.length}
      </div>

      <GsapStoryContent scopeRef={scopeRef} ch3TrackRef={ch3TrackRef} />
    </>
  );
}
