"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GsapStoryContent from "./gsap-story-content";

gsap.registerPlugin(ScrollTrigger);

export default function GsapStoryV5() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const ch3TrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      window.scrollTo(0, 0);

      /* ---- HERO — cinematic reveals ---- */
      gsap.from("#hero .char", {
        y: 150,
        rotateX: -90,
        opacity: 0,
        stagger: 0.04,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: { trigger: "#hero", start: "top center+=150" },
      });

      gsap.from("#hero .subtitle", {
        y: 80,
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: "power4.out",
        scrollTrigger: { trigger: "#hero", start: "top center+=80" },
      });

      const contactChips = gsap.utils.toArray("#hero .contact-chip");
      contactChips.forEach((chip, i) => {
        gsap.from(chip as HTMLElement, {
          y: 60,
          rotate: i % 2 === 0 ? -10 : 10,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: "#hero", start: "top center+=30" },
        });
      });

      /* CH1 — Foundation: section-level parallax + staggered cards */
      gsap.from("#ch1-header", {
        y: -60,
        opacity: 0,
        duration: 0.7,
        ease: "power4.out",
        scrollTrigger: { trigger: "#ch1", start: "top bottom-=120", toggleActions: "play none none reset" },
      });

      const eduCard = document.querySelector("#edu-card");
      if (eduCard) {
        gsap.from(eduCard, {
          scrollTrigger: { trigger: "#ch1", start: "top center+=80", toggleActions: "play none none reset" },
          x: -200,
          rotateY: 30,
          opacity: 0,
          duration: 0.9,
          ease: "power4.out",
        });
      }

      const skillCards = gsap.utils.toArray("#ch1 .skill-card");
      skillCards.forEach((card, i) => {
        gsap.from(card as HTMLElement, {
          scrollTrigger: { trigger: "#ch1", start: "top center+=60", toggleActions: "play none none reset" },
          y: 100,
          scale: 0.5,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.15,
          ease: "power3.out",
        });
      });

      gsap.from("#ch1 .skill-tag", {
        scrollTrigger: { trigger: "#ch1", start: "top center", toggleActions: "play none none reset" },
        scale: 0,
        rotate: 45,
        opacity: 0,
        stagger: 0.03,
        duration: 0.3,
        ease: "back.out(2)",
      });

      /* CH2 — entrance from sides */
      gsap.from("#ch2 .role-badge", {
        scrollTrigger: { trigger: "#ch2", start: "top center+=80", toggleActions: "play none none reset" },
        x: -200,
        opacity: 0,
        duration: 0.7,
        ease: "power4.out",
      });

      const ch2Tl = gsap.timeline({
        scrollTrigger: { trigger: "#ch2", start: "top center+=40", toggleActions: "play none none reset" },
      });
      ch2Tl.from("#ch2 .timeline-chip", {
        scale: 0, rotate: 180, opacity: 0, duration: 0.6, ease: "back.out(1.7)",
      });
      ch2Tl.from("#ch2 .vmo-bullet", {
        x: -60, opacity: 0, stagger: 0.12, duration: 0.4, ease: "power3.out",
      }, "-=0.2");

      /* CH3 — horizontal (keep original) + enhanced parallax */
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
        scrollTrigger: { trigger: "#ch3", start: "top top", end: "bottom bottom", scrub: 0.8 },
        y: 100,
        scale: 0.5,
        rotate: -5,
        opacity: 0,
        stagger: 0.4,
        duration: 1,
        ease: "power2.out",
      });

      /* CH4 — elastic bounce + counter */
      gsap.from("#ch4 .stat-card", {
        scrollTrigger: { trigger: "#ch4", start: "top center+=100", toggleActions: "play none none reset" },
        y: 150,
        scale: 0.3,
        rotate: 15,
        opacity: 0,
        stagger: 0.25,
        duration: 1,
        ease: "elastic.out(1, 0.5)",
      });

      gsap.from("#ch4 .lg-bullet", {
        scrollTrigger: { trigger: "#ch4", start: "top center+=40", toggleActions: "play none none reset" },
        x: -100,
        opacity: 0,
        stagger: 0.2,
        duration: 0.6,
        ease: "power4.out",
      });

      /* ---- CH5 — grand finale ---- */
      gsap.from("#ch5 .summary-card", {
        scrollTrigger: { trigger: "#ch5", start: "top center+=120" },
        y: 120,
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
      });

      gsap.from("#ch5 .lang-card", {
        scrollTrigger: { trigger: "#ch5", start: "top center+=80" },
        x: 150,
        opacity: 0,
        duration: 0.8,
        ease: "power4.out",
      });

      gsap.from("#ch5 .the-end", {
        scrollTrigger: { trigger: "#ch5", start: "center center+=80" },
        scale: 0,
        rotate: -25,
        opacity: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.5)",
      });

      gsap.from("#ch5 .end-contact", {
        scrollTrigger: { trigger: "#ch5", start: "center center" },
        y: 60,
        scale: 0.8,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "back.out(1.4)",
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
