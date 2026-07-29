"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

type ToastType = "success" | "error" | "warning" | "info";
type Toast = { id: number; type: ToastType; message: string };

const typeConfig: Record<
  ToastType,
  { icon: string; border: string; bg: string }
> = {
  success: {
    icon: "✓",
    border: "border-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  error: {
    icon: "✕",
    border: "border-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
  warning: {
    icon: "!",
    border: "border-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  info: {
    icon: "i",
    border: "border-sky-400",
    bg: "bg-sky-50 dark:bg-sky-900/20",
  },
};

const messages: Record<ToastType, string> = {
  success: "Action completed successfully!",
  error: "Something went wrong. Please try again.",
  warning: "Your session will expire soon.",
  info: "New update available. Click to learn more.",
};

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: (id: number) => void;
}) {
  const config = typeConfig[toast.type];
  const [dragX, setDragX] = useState(0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, transition: { duration: 0.2 } }}
      drag="x"
      dragConstraints={{ left: -120, right: 0 }}
      dragElastic={0.15}
      onDrag={(_, info) => setDragX(info.offset.x)}
      onDragEnd={(_, info) => {
        if (info.offset.x < -80) onClose(toast.id);
        setDragX(0);
      }}
      style={{ x: dragX }}
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border-l-4 ${config.border} ${config.bg} shadow-md w-80`}
    >
      <span className="text-sm font-bold shrink-0 mt-0.5">{config.icon}</span>
      <p className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
        {toast.message}
      </p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0"
      >
        ✕
      </button>
    </motion.div>
  );
}

export default function ToastPage() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const addToast = useCallback((type: ToastType) => {
    idRef.current += 1;
    const newToast: Toast = {
      id: idRef.current,
      type,
      message: messages[type],
    };
    setToasts((prev) => [...prev, newToast]);
    // Auto-dismiss after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  }, []);

  const closeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const types: ToastType[] = ["success", "error", "warning", "info"];

  return (
    <main className="min-h-screen py-12 px-4">
      <header className="text-center space-y-3 mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Notification Toast Stack
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Click a button to trigger a toast. Toasts stack with spring animation,
          auto-dismiss, and support swipe-to-dismiss.
        </p>
      </header>

      {/* Trigger buttons */}
      <div className="max-w-md mx-auto flex flex-wrap justify-center gap-3 mb-8">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => addToast(type)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
              type === "success"
                ? "bg-emerald-500 hover:bg-emerald-600"
                : type === "error"
                  ? "bg-red-500 hover:bg-red-600"
                  : type === "warning"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-sky-500 hover:bg-sky-600"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Toast stack — fixed position top-right */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 items-end">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={closeToast} />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state instructions */}
      <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
        Toasts appear at the top-right of the screen. Swipe left to dismiss
        early.
      </p>
    </main>
  );
}
