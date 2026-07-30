"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GsapStoryContent from "./gsap-story-content";

gsap.registerPlugin(ScrollTrigger);

export default function GsapStoryV3() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const ch3TrackRef = useRef<HTMLDivElement>(null);

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

      /* ---- Directional threshold snap ---- */
      const sections = gsap.utils.toArray<HTMLElement>("section[id]");
      const THRESHOLD = 0.35;

      ScrollTrigger.create({
        trigger: scopeRef.current,
        start: "top top",
        end: "bottom bottom",
        snap: {
          snapTo: (_progress) => {
            const scrollTop = window.scrollY;
            const viewH = window.innerHeight;

            let nearest = 0;
            let minDist = Infinity;

            sections.forEach((section) => {
              const rect = section.getBoundingClientRect();
              const top = rect.top + scrollTop;
              const dist = Math.abs(scrollTop - top);

              if (dist < minDist) {
                minDist = dist;
                nearest = top / (document.documentElement.scrollHeight - viewH);
              }
            });

            const minThreshold = viewH * THRESHOLD;
            if (minDist < minThreshold) {
              return nearest;
            }

            return _progress;
          },
          duration: 0.45,
          delay: 0.2,
          ease: "power3.inOut",
        },
      });

    }, scopeRef);

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, []);

  return <GsapStoryContent scopeRef={scopeRef} ch3TrackRef={ch3TrackRef} />;
}
