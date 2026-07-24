import LazyDemo from "../components/lazy-demo";

export default function LazyLoadingPage() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 text-center px-6 py-16 max-w-6xl mx-auto w-full">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Lazy Loading
          </h1>
          <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400">
            4 techniques to reduce initial bundle size and load resources on
            demand.
          </p>
        </div>
        <LazyDemo />
      </main>
    </div>
  );
}
