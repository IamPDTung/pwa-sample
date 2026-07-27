"use client";

import dynamic from "next/dynamic";

const ThreeJSScene = dynamic(() => import("./threejs-scene"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full max-w-2xl mx-auto rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm bg-zinc-100 dark:bg-zinc-800 animate-pulse flex items-center justify-center"
      style={{ height: 500 }}
    >
      <span className="text-zinc-400 dark:text-zinc-500 text-sm">
        Loading 3D scene...
      </span>
    </div>
  ),
});

export default function ThreeJSLoader() {
  return <ThreeJSScene />;
}
