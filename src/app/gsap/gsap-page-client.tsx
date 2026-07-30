"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import GsapStory from "@/app/components/gsap-story";

const GsapStoryV1 = dynamic(() => import("@/app/components/gsap-story-v1"));
const GsapStoryV2 = dynamic(() => import("@/app/components/gsap-story-v2"));
const GsapStoryV3 = dynamic(() => import("@/app/components/gsap-story-v3"));
const GsapStoryV4 = dynamic(() => import("@/app/components/gsap-story-v4"));
const GsapStoryV5 = dynamic(() => import("@/app/components/gsap-story-v5"));

const VERSIONS = [
  { key: "default", label: "Classic", desc: "Original animations, natural scroll" },
  { key: "v1", label: "V1 \u00b7 Snap", desc: "Wheel hijack: one tick = one section" },
  { key: "v2", label: "V2 \u00b7 Dots", desc: "Side dot navigation + progress bar" },
  { key: "v3", label: "V3 \u00b7 Threshold", desc: "Directional snap after 35% threshold" },
  { key: "v4", label: "V4 \u00b7 Buttons", desc: "Arrow keys + prev/next buttons" },
  { key: "v5", label: "V5 \u00b7 Cinematic", desc: "Rich animations, parallax, no snap" },
] as const;

export function GsapPageClient() {
  const [version, setVersion] = useState<string>("default");

  const renderStory = () => {
    switch (version) {
      case "v1": return <GsapStoryV1 />;
      case "v2": return <GsapStoryV2 />;
      case "v3": return <GsapStoryV3 />;
      case "v4": return <GsapStoryV4 />;
      case "v5": return <GsapStoryV5 />;
      default: return <GsapStory />;
    }
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-[100] flex flex-col gap-1">
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] p-2 flex flex-col gap-1 min-w-[220px]">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2 py-1">
            Scroll Behavior
          </div>
          {VERSIONS.map((v) => (
            <button
              key={v.key}
              onClick={() => setVersion(v.key)}
              className={`text-left px-2 py-1.5 text-xs font-bold border-2 border-black transition-all ${
                version === v.key
                  ? "bg-black text-white shadow-[2px_2px_0px_0px_#FACC15]"
                  : "bg-zinc-100 hover:bg-zinc-200"
              }`}
            >
              <div>{v.label}</div>
              <div className={`text-[10px] font-medium ${version === v.key ? "text-zinc-300" : "text-zinc-500"}`}>
                {v.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {renderStory()}
    </>
  );
}
