"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

const photos = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  src: `https://picsum.photos/seed/gallery${i + 1}/800/600`,
  thumb: `https://picsum.photos/seed/gallery${i + 1}/300/200`,
  title: `Photo ${i + 1}`,
}));

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export default function GalleryPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);
  const selectedPhoto = photos.find((p) => p.id === selectedId);

  const goNext = useCallback(() => {
    if (!selectedId) return;
    setDirection(1);
    setSelectedId(selectedId === photos.length ? 1 : selectedId + 1);
  }, [selectedId]);

  const goPrev = useCallback(() => {
    if (!selectedId) return;
    setDirection(-1);
    setSelectedId(selectedId === 1 ? photos.length : selectedId - 1);
  }, [selectedId]);

  const openPhoto = (id: number) => {
    setDirection(0);
    setSelectedId(id);
  };

  // Keyboard nav
  useEffect(() => {
    if (!selectedId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, goNext, goPrev]);

  return (
    <main className="min-h-screen py-12 px-4">
      <header className="text-center space-y-3 mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Image Gallery + Lightbox
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Shared element transition via <code>layoutId</code>. Click to zoom,
          arrow keys or buttons to navigate with slide animation.
        </p>
      </header>

      {/* Thumbnail grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            layoutId={`photo-${photo.id}`}
            onClick={() => openPhoto(photo.id)}
            className="rounded-xl overflow-hidden cursor-pointer border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumb}
              alt={photo.title}
              className="w-full h-40 object-cover"
            />
            <p className="p-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {photo.title}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedId(null)}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 text-lg"
            >
              ✕
            </button>

            {/* Prev */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all text-2xl"
            >
              ‹
            </button>

            {/* Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all text-2xl"
            >
              ›
            </button>

            {/* Image with slide transition */}
            <div
              className="max-w-[85vw] max-h-[80vh] flex items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={selectedPhoto.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="rounded-xl overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedPhoto.src}
                    alt={selectedPhoto.title}
                    className="max-w-[85vw] max-h-[80vh] object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Title + counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <motion.p
                key={`title-${selectedPhoto.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-white/80 text-sm font-medium"
              >
                {selectedPhoto.title}
              </motion.p>
              <span className="text-white/40 text-xs">
                {selectedPhoto.id} / {photos.length}
              </span>
            </div>

            {/* Keyboard hint */}
            <p className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/25 text-xs">
              ← → arrow keys &bull; Esc to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
