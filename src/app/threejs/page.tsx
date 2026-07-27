import ThreeJSLoader from "../components/threejs-loader";

export default function ThreeJSPage() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 text-center px-6 py-16 max-w-6xl mx-auto w-full">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Three.js — Car Viewer
          </h1>
          <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
            Choose a sports car below and explore it — drag to rotate,
            scroll to zoom, right-click to pan.
          </p>
        </div>

        <ThreeJSLoader />
      </main>
    </div>
  );
}
