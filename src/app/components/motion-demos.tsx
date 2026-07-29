"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
        <span className="text-violet-500">{number}.</span> {title}
      </h2>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 bg-white dark:bg-zinc-900">
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  1. Enter & Exit                                                   */
/* ------------------------------------------------------------------ */
function EnterExit() {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Box animates in with fade + scale when mounted, animates out when
        unmounted via <code>AnimatePresence</code>.
      </p>
      <button
        onClick={() => setShow(!show)}
        className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
      >
        {show ? "Hide" : "Show"}
      </button>
      <div className="h-20 flex items-center justify-center">
        <AnimatePresence>
          {show && (
            <motion.div
              key="box"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="w-20 h-20 rounded-xl bg-violet-500 shadow-lg"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Hover & Tap                                                    */
/* ------------------------------------------------------------------ */
function HoverTap() {
  const cards = [
    { label: "Hover me", color: "bg-emerald-500" },
    { label: "Tap me", color: "bg-amber-500" },
    { label: "Both", color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Cards scale up on hover, scale down on tap. Works on desktop (hover) and
        mobile (tap).
      </p>
      <div className="flex gap-4 flex-wrap">
        {cards.map((c) => (
          <motion.button
            key={c.label}
            whileHover={{ scale: 1.1, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
            whileTap={{ scale: 0.93 }}
            className={`${c.color} w-32 h-24 rounded-xl text-white font-semibold text-sm shadow-md`}
          >
            {c.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Drag                                                           */
/* ------------------------------------------------------------------ */
function DragDemo() {
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Drag the box inside its container. Elastic snap-back at edges. Scales up
        while dragging.
      </p>
      <div
        ref={constraintsRef}
        className="w-full h-48 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50"
      >
        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.15}
          whileDrag={{ scale: 1.12 }}
          className="w-16 h-16 rounded-xl bg-violet-500 shadow-lg cursor-grab active:cursor-grabbing"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  4. Scroll-triggered                                               */
/* ------------------------------------------------------------------ */
function ScrollTriggered() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Cards fade in + slide up when scrolled into view. Each card has a
        staggered delay. Only triggers once.
      </p>
      <div className="grid sm:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className="h-20 rounded-lg bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800"
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  5. Scroll-linked                                                  */
/* ------------------------------------------------------------------ */
function ScrollLinked() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Progress bar fills as you scroll past this section. The image below has
        a parallax effect.
      </p>
      <div className="sticky top-0 z-10 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <motion.div
          style={{ scaleX, transformOrigin: "left" }}
          className="h-full bg-violet-500"
        />
      </div>
      <div
        ref={ref}
        className="h-64 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"
      >
        <motion.div
          style={{ y: parallaxY }}
          className="text-6xl select-none"
        >
          🎯
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  6. Layout animation                                               */
/* ------------------------------------------------------------------ */
function LayoutAnim() {
  const initial = ["🐶", "🐱", "🐰", "🦊", "🐼", "🐨"];
  const [items, setItems] = useState(initial);
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Overview", "Details", "Settings"];

  const shuffle = useCallback(() => {
    setItems((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Shuffle grid */}
      <div className="space-y-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Click shuffle: cards animate smoothly to new positions via the{" "}
          <code>layout</code> prop (FLIP).
        </p>
        <button
          onClick={shuffle}
          className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          Shuffle
        </button>
        <div className="grid grid-cols-3 gap-3">
          {items.map((emoji) => (
            <motion.div
              key={emoji}
              layout
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-2xl"
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Shared layout tabs */}
      <div className="space-y-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Shared <code>layoutId</code>: underline slides between tabs.
        </p>
        <div className="flex gap-0 relative border-b border-zinc-200 dark:border-zinc-700">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`relative px-5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === i
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {tab}
              {activeTab === i && (
                <motion.div
                  layoutId="underline"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500"
                />
              )}
            </button>
          ))}
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Showing:{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {tabs[activeTab]}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  7. Variants & Stagger                                             */
/* ------------------------------------------------------------------ */
const menuVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.06, staggerDirection: -1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } },
};

function VariantsDemo() {
  const [visible, setVisible] = useState(true);
  const items = ["Home", "About", "Services", "Portfolio", "Contact"];

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Menu list staggers in/out using variants + <code>staggerChildren</code>.
        Toggle direction via <code>staggerDirection</code>.
      </p>
      <button
        onClick={() => setVisible(!visible)}
        className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
      >
        {visible ? "Hide" : "Show"}
      </button>
      <AnimatePresence>
        {visible && (
          <motion.ul
            variants={menuVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-1.5 max-w-xs"
          >
            {items.map((item) => (
              <motion.li
                key={item}
                variants={itemVariants}
                className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
              >
                {item}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  8. Keyframes & SVG                                                */
/* ------------------------------------------------------------------ */
function SVGKeyframes() {
  const [key, setKey] = useState(0);
  const [bounceKey, setBounceKey] = useState(0);

  return (
    <div className="space-y-6">
      {/* SVG draw-on */}
      <div className="space-y-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          SVG circle draws on via <code>pathLength</code>. Click replay to
          reset.
        </p>
        <button
          onClick={() => setKey((k) => k + 1)}
          className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          Replay
        </button>
        <div className="flex justify-center">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <motion.circle
              key={key}
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
            />
          </svg>
        </div>
      </div>

      {/* Spring bounce */}
      <div className="space-y-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Box bounces with spring physics on click.
        </p>
        <button
          onClick={() => setBounceKey((k) => k + 1)}
          className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
        >
          Bounce
        </button>
        <div className="flex items-center justify-center h-20">
          <motion.div
            key={bounceKey}
            animate={{ y: [0, -50, 0] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-14 h-14 rounded-xl bg-amber-400 shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main exports                                                       */
/* ------------------------------------------------------------------ */

export default function MotionDemos() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <Section number={1} title="Enter &amp; Exit">
        <EnterExit />
      </Section>
      <Section number={2} title="Hover &amp; Tap">
        <HoverTap />
      </Section>
      <Section number={3} title="Drag">
        <DragDemo />
      </Section>
      <Section number={4} title="Scroll-triggered">
        <ScrollTriggered />
      </Section>
      <Section number={5} title="Scroll-linked">
        <ScrollLinked />
      </Section>
      <Section number={6} title="Layout Animation">
        <LayoutAnim />
      </Section>
      <Section number={7} title="Variants &amp; Stagger">
        <VariantsDemo />
      </Section>
      <Section number={8} title="SVG &amp; Keyframes">
        <SVGKeyframes />
      </Section>
    </div>
  );
}
