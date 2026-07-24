"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { LazyItem } from "@/lib/lazy-items";

const HeavyWidget = dynamic(() => import("./lazy/_heavy-widget"), {
  loading: () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3" />
      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
      <div className="h-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3" />
    </div>
  ),
});

const IMAGE_COUNT = 100;

export default function LazyDemo() {
  // Section 1: Component Lazy Loading
  const [showWidget, setShowWidget] = useState(false);

  // Section 2: Image Gallery
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const imageRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  // Section 3: On-Demand Module
  const [moduleLoading, setModuleLoading] = useState(false);
  const [moduleResult, setModuleResult] = useState<{
    itemsProcessed: number;
    groupsFound: number;
    topCategories: { name: string; count: number; pct: string }[];
    summary: string;
  } | null>(null);
  const [moduleLoadTime, setModuleLoadTime] = useState<number | null>(null);

  // Section 4: Load More
  const [items, setItems] = useState<LazyItem[]>([]);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [fetchTime, setFetchTime] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // IntersectionObserver for lazy images
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(
              (entry.target as HTMLElement).dataset?.imageIndex
            );
            if (!Number.isNaN(idx)) {
              setLoadedImages((prev) => new Set([...prev, idx]));
            }
          }
        }
      },
      { rootMargin: "200px" }
    );

    imageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Set ref for each image wrapper
  const setImageRef = (idx: number) => (el: HTMLDivElement | null) => {
    imageRefs.current.set(idx, el);
  };

  // On-demand module import
  const handleLoadModule = async () => {
    setModuleLoading(true);
    setModuleLoadTime(null);
    const start = performance.now();

    try {
      const { processLargeData } = await import(
        "./lazy/_heavy-processor"
      );
      const result = processLargeData();
      setModuleResult(result);
    } finally {
      setModuleLoadTime(Math.round(performance.now() - start));
      setModuleLoading(false);
    }
  };

  // Load more items
  const loadMore = async () => {
    setLoadingMore(true);
    setLoadError(null);
    const start = performance.now();

    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/lazy-items?page=${nextPage}&limit=10`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setPage(nextPage);
      setHasMore(data.hasMore);
      setFetchTime(Math.round(performance.now() - start));
    } catch (err: unknown) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load"
      );
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Section 1: Component Code-Splitting */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-violet-500 uppercase tracking-wider">
          Component Code-Splitting
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          This heavy widget is loaded via <code>next/dynamic</code>.
          Open the Network tab and filter JS to see the chunk load.
        </p>

        {!showWidget ? (
          <button
            onClick={() => setShowWidget(true)}
            className="px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            Show Heavy Widget
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Widget loaded
              </span>
              <button
                onClick={() => setShowWidget(false)}
                className="px-3 py-1 rounded-full text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Hide
              </button>
            </div>
            <HeavyWidget />
          </div>
        )}
      </div>

      {/* Section 2: Lazy Image Gallery */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-violet-500 uppercase tracking-wider">
          Lazy Image Gallery
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Images use <code>loading=&quot;lazy&quot;</code>.
          Observer tracks which have entered the viewport.
        </p>

        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {loadedImages.size} / {IMAGE_COUNT} images loaded
          {loadedImages.size === IMAGE_COUNT && (
            <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-medium">
              — All done!
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[400px] overflow-y-auto rounded-lg">
          {Array.from({ length: IMAGE_COUNT }, (_, i) => {
            const loaded = loadedImages.has(i);
            return (
              <div
                key={i}
                ref={setImageRef(i)}
                data-image-index={i}
                className={`aspect-[4/3] rounded-lg overflow-hidden border transition-colors ${
                  loaded
                    ? "border-emerald-300 dark:border-emerald-800"
                    : "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"
                }`}
              >
                {loaded ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`https://picsum.photos/400/300?random=${i}`}
                    alt={`Random ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-700">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                      #{i + 1}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: On-Demand Module Import */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-violet-500 uppercase tracking-wider">
          On-Demand Module Import
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          A heavy computation module imported via{" "}
          <code>await import(...)</code> only when the button is clicked.
        </p>

        {!moduleResult ? (
          <button
            onClick={handleLoadModule}
            disabled={moduleLoading}
            className="px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {moduleLoading ? "Loading..." : "Load Heavy Module"}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Module loaded
              </span>
              <button
                onClick={handleLoadModule}
                disabled={moduleLoading}
                className="px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-300 transition-colors"
              >
                {moduleLoading ? "Running..." : "Run Again"}
              </button>
            </div>

            {moduleLoadTime !== null && (
              <p className="text-xs text-zinc-400">
                {moduleLoadTime === 0
                  ? "Cached — no network request"
                  : `Module loaded in ${moduleLoadTime}ms`}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-2">
                <p className="text-[10px] text-zinc-400 uppercase">
                  Processed
                </p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {moduleResult.itemsProcessed.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-2">
                <p className="text-[10px] text-zinc-400 uppercase">Groups</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {moduleResult.groupsFound}
                </p>
              </div>
            </div>

            <div className="space-y-1 max-h-[120px] overflow-y-auto">
              {moduleResult.topCategories.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {cat.name}
                  </span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-medium">
                    {cat.count.toLocaleString()} ({cat.pct})
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {moduleResult.summary}
            </p>
          </div>
        )}
      </div>

      {/* Section 4: Load More */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-violet-500 uppercase tracking-wider">
          Load More Data
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Paginated data loaded in batches of 10 from the API. Click the
          button to fetch the next page.
        </p>

        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Showing {items.length} of 200 items
          {!hasMore && items.length > 0 && (
            <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-medium">
              — All loaded!
            </span>
          )}
          {fetchTime !== null && !loadError && (
            <span className="ml-2 text-zinc-400">
              (fetched in {fetchTime}ms)
            </span>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-1 max-h-[300px] overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.map((item) => (
              <div
                key={item.id}
                className="px-3 py-2 bg-white dark:bg-zinc-950"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    #{item.id}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                  {item.description}
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  {item.createdAt}
                </p>
              </div>
            ))}
          </div>
        )}

        {loadError && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {loadError} — check connection and try again
          </p>
        )}

        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        )}
      </div>
    </div>
  );
}
