import ThreeJSLoader from "../components/threejs-loader";

export default function ThreeJSPage() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 text-center px-6 py-16 max-w-6xl mx-auto w-full">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Three.js
          </h1>
          <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
            Interactive 3D cube — drag to rotate, scroll to zoom, right-click to
            pan. Built with{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              @react-three/fiber
            </span>
            .
          </p>
        </div>

        <ThreeJSLoader />

        <div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
            Drag — Rotate
          </span>
          <span className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
            Scroll — Zoom
          </span>
          <span className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
            Right-click — Pan
          </span>
          <span className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
            Idle — Auto-rotate
          </span>
        </div>
      </main>
    </div>
  );
}
