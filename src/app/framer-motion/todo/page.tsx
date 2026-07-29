"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "motion/react";

type Todo = { id: number; text: string; done: boolean };

const filters = ["All", "Active", "Done"] as const;
type Filter = (typeof filters)[number];

const ITEM_HEIGHT = 52;
const START_ITEMS: Todo[] = [
  { id: 1, text: "Learn Motion for React", done: true },
  { id: 2, text: "Build image gallery lightbox", done: true },
  { id: 3, text: "Implement drag-to-reorder", done: false },
  { id: 4, text: "Add filter tabs with layoutId", done: false },
  { id: 5, text: "Ship to production", done: false },
];

function DropZone() {
  return (
    <motion.div
      layout
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: ITEM_HEIGHT, opacity: 1 }}
      exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
      className="rounded-lg border-2 border-dashed border-violet-400 bg-violet-100/60 dark:bg-violet-900/20 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-xs text-violet-500 dark:text-violet-400 font-medium"
      >
        Drop here
      </motion.div>
    </motion.div>
  );
}

function TodoItem({
  todo,
  index,
  isSource,
  canReorder,
  onToggle,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  onReorder,
}: {
  todo: Todo;
  index: number;
  isSource: boolean;
  canReorder: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onDragStart: () => void;
  onDragOver: (idx: number) => void;
  onDragEnd: () => void;
  onReorder: (from: number, to: number) => void;
}) {
  const accumulatedOffset = useRef(0);
  const [showDelete, setShowDelete] = useState(false);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragControls = useDragControls();

  const stepsFromOffset = (offset: number) => Math.round(offset / ITEM_HEIGHT);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={
        isSource
          ? { opacity: 0.3, scale: 0.98 }
          : { opacity: 1, y: 0, scale: 1 }
      }
      exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.2 } }}
      drag={canReorder ? "y" : false}
      dragControls={dragControls}
      dragSnapToOrigin
      dragElastic={0.3}
      dragListener={false}
      whileDrag={{
        scale: 1.03,
        zIndex: 50,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      }}
      onDragStart={() => {
        accumulatedOffset.current = 0;
        onDragStart();
      }}
      onDrag={(_, info) => {
        accumulatedOffset.current = info.offset.y;
        const targetIdx = index + stepsFromOffset(info.offset.y);
        onDragOver(Math.max(0, Math.min(targetIdx, START_ITEMS.length - 1)));
      }}
      onDragEnd={() => {
        const steps = stepsFromOffset(accumulatedOffset.current);
        const clamped = Math.max(
          -index,
          Math.min(steps, START_ITEMS.length - 1 - index),
        );
        if (clamped !== 0) {
          onReorder(index, index + clamped);
        }
        accumulatedOffset.current = 0;
        onDragEnd();
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`flex items-center gap-3 px-3 py-3 rounded-lg bg-white dark:bg-zinc-800 border shadow-sm relative group ${
        isSource
          ? "border-dashed border-violet-300 dark:border-violet-700"
          : "border-zinc-200 dark:border-zinc-700"
      }`}
    >
      {/* Drag handle */}
      {canReorder && (
        <button
          className="cursor-grab active:cursor-grabbing text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 shrink-0 select-none touch-none"
          onPointerDown={(e) => {
            e.preventDefault();
            dragControls.start(e);
          }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="5" r="1.5" />
            <circle cx="15" cy="5" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="19" r="1.5" />
            <circle cx="15" cy="19" r="1.5" />
          </svg>
        </button>
      )}

      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          todo.done
            ? "bg-emerald-500 border-emerald-500"
            : "border-zinc-300 dark:border-zinc-600 hover:border-emerald-400"
        }`}
      >
        {todo.done && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </motion.svg>
        )}
      </button>

      {/* Text */}
      <span
        className={`flex-1 text-sm ${
          todo.done
            ? "line-through text-zinc-400 dark:text-zinc-500"
            : "text-zinc-700 dark:text-zinc-300"
        }`}
      >
        {todo.text}
      </span>

      {/* Delete button */}
      <button
        onPointerDown={() => {
          if (deleteTimer.current) clearTimeout(deleteTimer.current);
          setShowDelete(true);
        }}
        onPointerUp={() => {
          deleteTimer.current = setTimeout(() => setShowDelete(false), 1500);
        }}
        onClick={() => onDelete(todo.id)}
        className={`text-xs shrink-0 transition-all ${
          showDelete
            ? "text-red-500 scale-110"
            : "text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100"
        }`}
      >
        ✕
      </button>
    </motion.div>
  );
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>(START_ITEMS);
  const [filter, setFilter] = useState<Filter>("All");
  const [text, setText] = useState("");
  const [dragSourceIdx, setDragSourceIdx] = useState<number | null>(null);
  const [dragTargetIdx, setDragTargetIdx] = useState<number | null>(null);

  const canReorder = filter === "All";
  const isDragging = dragSourceIdx !== null;

  const addTodo = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text: trimmed, done: false },
    ]);
    setText("");
  }, [text]);

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const reorderTodo = (from: number, to: number) => {
    setTodos((prev) => {
      const arr = [...prev];
      const [removed] = arr.splice(from, 1);
      arr.splice(to, 0, removed);
      return arr;
    });
  };

  const filtered = todos.filter((t) => {
    if (filter === "Active") return !t.done;
    if (filter === "Done") return t.done;
    return true;
  });

  const reorderFiltered = (filteredFrom: number, filteredTo: number) => {
    const fullIndices = filtered.map((f) =>
      todos.findIndex((t) => t.id === f.id),
    );
    reorderTodo(fullIndices[filteredFrom], fullIndices[filteredTo]);
  };

  const remaining = todos.filter((t) => !t.done).length;

  // Derived: target index for spacer (skip if same as source)
  const spacerIdx =
    isDragging && dragTargetIdx !== null && dragTargetIdx !== dragSourceIdx
      ? dragTargetIdx
      : null;

  return (
    <main className="min-h-screen py-12 px-4">
      <header className="text-center space-y-3 mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Animated To-Do List
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Add, check, reorder <em>(drag ⋮⋮ handle)</em>, and delete items with
          spring animations. Filter tabs with <code>layoutId</code>.
        </p>
      </header>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Add input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={addTodo}
            className="px-5 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            Add
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-0 relative border-b border-zinc-200 dark:border-zinc-700">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                filter === f
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {f}
              {filter === f && (
                <motion.div
                  layoutId="todo-filter"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <motion.div layout className="space-y-2">
          <AnimatePresence mode="popLayout">
            {/* Spacer at drop target */}
            {spacerIdx !== null && spacerIdx === 0 && <DropZone key="spacer" />}

            {filtered.map((todo, idx) => (
              <motion.div key={todo.id} layout>
                <TodoItem
                  todo={todo}
                  index={idx}
                  isDragging={isDragging}
                  isSource={dragSourceIdx === idx}
                  canReorder={canReorder}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onDragStart={() => {
                    setDragSourceIdx(idx);
                    setDragTargetIdx(idx);
                  }}
                  onDragOver={(targetIdx) => setDragTargetIdx(targetIdx)}
                  onDragEnd={() => {
                    setDragSourceIdx(null);
                    setDragTargetIdx(null);
                  }}
                  onReorder={reorderFiltered}
                />
                {/* Spacer after this item */}
                {spacerIdx !== null && spacerIdx === idx + 1 && (
                  <DropZone key={`spacer-${idx}`} />
                )}
              </motion.div>
            ))}

            {/* Spacer at end */}
            {spacerIdx !== null &&
              spacerIdx === filtered.length &&
              filtered.length > 0 && (
                <DropZone key="spacer-end" />
              )}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-zinc-400 dark:text-zinc-500 py-6">
            No{" "}
            {filter === "Active" ? "active" : filter === "Done" ? "done" : ""}{" "}
            tasks
          </p>
        )}

        {canReorder && filtered.length > 1 && (
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
            Drag ⋮⋮ handle to reorder &bull; Hover for delete
          </p>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          {remaining} task{remaining !== 1 ? "s" : ""} remaining
        </p>
      </div>
    </main>
  );
}
