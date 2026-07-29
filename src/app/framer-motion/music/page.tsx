"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

const playlist = [
  { id: 1, title: "Summer Vibes", artist: "Chillwave", duration: "3:42" },
  { id: 2, title: "Night Drive", artist: "Synthpop", duration: "4:15" },
  { id: 3, title: "Ocean Breeze", artist: "Ambient", duration: "2:58" },
  { id: 4, title: "City Lights", artist: "Lo-fi", duration: "3:20" },
  { id: 5, title: "Stargazing", artist: "Electronic", duration: "5:01" },
];

function Equalizer() {
  return (
    <div className="flex items-end gap-0.5 h-8">
      {[0.4, 0.8, 0.3, 1.0, 0.5, 0.7, 0.2, 0.9].map((h, i) => (
        <motion.div
          key={i}
          animate={{ height: [h * 0.3, h, h * 0.3] }}
          transition={{
            duration: 0.5 + h * 0.4,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.1,
            ease: "easeInOut",
          }}
          className="w-1 bg-emerald-500 rounded-full"
          style={{ height: `${h * 100}%` }}
        />
      ))}
    </div>
  );
}

export default function MusicPage() {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(playlist[0]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [progress, setProgress] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  const handleBarClick = (e: React.MouseEvent) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setProgress(pct);
  };

  return (
    <main className="min-h-screen py-12 px-4">
      <header className="text-center space-y-3 mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Music Player Mini-App
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Spinning album art, play/pause morph, seek bar, expandable playlist,
          and equalizer bars.
        </p>
      </header>

      <div className="max-w-sm mx-auto">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg p-6 space-y-6">
          {/* Album art */}
          <div className="flex justify-center">
            <motion.div
              animate={playing ? { rotate: 360 } : { rotate: 0 }}
              transition={
                playing
                  ? { duration: 8, repeat: Infinity, ease: "linear" }
                  : { duration: 0.3 }
              }
              className="w-48 h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-zinc-700"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://picsum.photos/seed/music${current.id}/400/400`}
                alt={current.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Track info */}
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
              {current.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {current.artist}
            </p>
          </div>

          {/* Seek bar */}
          <div className="space-y-2">
            <div
              ref={barRef}
              onClick={handleBarClick}
              className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 cursor-pointer relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-y-0 left-0 bg-violet-500 rounded-full"
                style={{ width: `${progress}%` }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-violet-500 shadow"
                style={{ left: `${progress}%`, marginLeft: -6 }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>{Math.floor((progress / 100) * 3)}:42</span>
              <span>3:42</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Prev */}
            <button
              onClick={() => {
                const idx = playlist.findIndex((s) => s.id === current.id);
                setCurrent(
                  playlist[idx === 0 ? playlist.length - 1 : idx - 1]
                );
                setProgress(0);
              }}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* Play/Pause — SVG morph */}
            <button
              onClick={() => setPlaying(!playing)}
              className="w-14 h-14 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                {playing ? (
                  <motion.g
                    key="pause"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </motion.g>
                ) : (
                  <motion.g
                    key="play"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <path d="M8 5v14l11-7z" />
                  </motion.g>
                )}
              </svg>
            </button>

            {/* Next */}
            <button
              onClick={() => {
                const idx = playlist.findIndex((s) => s.id === current.id);
                setCurrent(
                  playlist[idx === playlist.length - 1 ? 0 : idx + 1]
                );
                setProgress(0);
              }}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          {/* Equalizer */}
          <div className="flex justify-center">
            <Equalizer />
          </div>

          {/* Playlist toggle */}
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <span>Playlist ({playlist.length} tracks)</span>
            <motion.svg
              animate={{ rotate: showPlaylist ? 180 : 0 }}
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>

          {/* Playlist */}
          <AnimatePresence>
            {showPlaylist && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-1 pt-1">
                  {playlist.map((track) => (
                    <motion.button
                      key={track.id}
                      layout
                      onClick={() => {
                        setCurrent(track);
                        setProgress(0);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                        current.id === track.id
                          ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className="text-xs w-8 text-zinc-400">
                        {String(track.id).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-xs text-zinc-400">{track.artist}</p>
                      </div>
                      <span className="text-xs text-zinc-400">
                        {track.duration}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
