"use client";

import dynamic from "next/dynamic";

const CarViewer = dynamic(() => import("./car-viewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div
        className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm bg-zinc-100 dark:bg-zinc-800 animate-pulse flex items-center justify-center"
        style={{ height: 450 }}
      >
        <span className="text-zinc-400 dark:text-zinc-500 text-sm">
          Loading 3D scene...
        </span>
      </div>
    </div>
  ),
});

export default function ThreeJSLoader() {
  return <CarViewer />;
}
