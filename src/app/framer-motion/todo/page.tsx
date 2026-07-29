"use client";

import { useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  Reorder,
  useMotionValue,
  useTransform,
  animate,
  useDragControls,
} from "motion/react";

type Todo = { id: number; text: string; done: boolean; color: string };

const COLORS = [
  "#ff0088",
  "#dd00ee",
  "#9911ff",
  "#1e75f7",
  "#0cdcf7",
  "#8df0cc",
];

const START_ITEMS: Todo[] = [
  { id: 1, text: "Learn Motion for React", done: true, color: COLORS[0] },
  { id: 2, text: "Build image gallery lightbox", done: true, color: COLORS[1] },
  { id: 3, text: "Implement drag-to-reorder", done: false, color: COLORS[2] },
  { id: 4, text: "Add filter tabs with layoutId", done: false, color: COLORS[3] },
  { id: 5, text: "Ship to production", done: false, color: COLORS[4] },
];

const filters = ["All", "Active", "Done"] as const;
type Filter = (typeof filters)[number];

// ─── Content shared between draggable & static item ──────────────────

function ItemContent({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <>
      {/* Colored accent bar */}
      <div
        className="absolute left-0 top-1 bottom-1 w-1 rounded-full"
        style={{ backgroundColor: todo.color }}
      />

      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(todo.id);
        }}
        className={`ml-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        )}
      </button>

      {/* Text */}
      <div className="flex-1 relative overflow-hidden">
        <motion.span
          animate={{
            color: todo.done ? "#9ca3af" : "#374151",
          }}
          className="text-sm block dark:text-zinc-300"
        >
          {todo.text}
        </motion.span>
        <motion.div
          initial={false}
          animate={{ scaleX: todo.done ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute top-1/2 left-0 right-0 h-px bg-zinc-400 dark:bg-zinc-500 origin-left"
        />
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(todo.id);
        }}
        className="text-xs shrink-0 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
      >
        ✕
      </button>
    </>
  );
}

// ─── Draggable item (used inside Reorder.Group) ──────────────────────

const ITEM_CLASS =
  "relative flex items-center gap-3 px-4 py-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group";

function DraggableItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const shadow = useMotionValue(0);
  const boxShadowValue = useTransform(
    shadow,
    [0, 1],
    [
      "0 1px 3px rgba(0,0,0,0.08)",
      "0 10px 30px -5px rgba(0,0,0,0.2)",
    ],
  );
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={todo}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -60, scale: 0.95, transition: { duration: 0.2 } }}
      whileDrag={{
        scale: 1.04,
        zIndex: 50,
        borderRadius: "12px",
      }}
      onDragStart={() =>
        animate(shadow, 1, { type: "spring", stiffness: 300, damping: 25 })
      }
      onDragEnd={() =>
        animate(shadow, 0, { type: "spring", stiffness: 300, damping: 25 })
      }
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{ boxShadow: boxShadowValue, position: "relative" }}
      dragListener={false}
      dragControls={dragControls}
      className={ITEM_CLASS}
    >
      <ItemContent todo={todo} onToggle={onToggle} onDelete={onDelete} />

      {/* Drag handle (⋮⋮) */}
      <div
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
      </div>
    </Reorder.Item>
  );
}

// ─── Static item (used in Active / Done views) ───────────────────────

function StaticItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -60, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={ITEM_CLASS}
    >
      <ItemContent todo={todo} onToggle={onToggle} onDelete={onDelete} />
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>(START_ITEMS);
  const [filter, setFilter] = useState<Filter>("All");
  const [text, setText] = useState("");
  const colorIdx = useRef(START_ITEMS.length);
  const inputRef = useRef<HTMLInputElement>(null);

  const canReorder = filter === "All";

  const filtered = todos.filter((t) => {
    if (filter === "Active") return !t.done;
    if (filter === "Done") return t.done;
    return true;
  });

  const remaining = todos.filter((t) => !t.done).length;

  const addTodo = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: trimmed,
        done: false,
        color: COLORS[colorIdx.current % COLORS.length],
      },
    ]);
    colorIdx.current++;
    setText("");
    inputRef.current?.focus();
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t,
      );
      const uncompleted = updated.filter((t) => !t.done);
      const completed = updated.filter((t) => t.done);
      return [...uncompleted, ...completed];
    });
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <main className="min-h-screen py-12 px-4">
      <header className="text-center space-y-3 mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Animated To-Do List
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Drag to reorder, check to complete. Completed items animate to the
          bottom with strikethrough.
        </p>
      </header>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Add input */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-zinc-400"
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
                  layoutId="todo-filter-tab"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {canReorder ? (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 max-h-[420px] overflow-y-auto">
            <Reorder.Group
              axis="y"
              values={todos}
              onReorder={setTodos}
              className="p-3 space-y-2"
            >
              <AnimatePresence>
                {todos.map((todo) => (
                  <DraggableItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        ) : (
          <motion.div layout className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-zinc-400 dark:text-zinc-500 py-6"
                >
                  No{" "}
                  {filter === "Active" ? "active" : filter === "Done" ? "done" : ""}{" "}
                  tasks
                </motion.p>
              ) : (
                filtered.map((todo) => (
                  <StaticItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                  />
                ))
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          {remaining} task{remaining !== 1 ? "s" : ""} remaining
        </p>
      </div>
    </main>
  );
}
