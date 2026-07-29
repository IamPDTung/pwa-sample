import MotionDemos from "@/app/components/motion-demos";

export const metadata = {
  title: "Framer Motion — Motion Animation Demos",
  description:
    "Showcase 8 animation techniques with Motion for React: enter/exit, gestures, drag, scroll, layout, variants, SVG path.",
};

export default function FramerMotionPage() {
  return (
    <main className="min-h-screen py-12 px-4">
      <header className="text-center space-y-3 mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Framer Motion Demos
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          8 animation techniques powered by{" "}
          <span className="font-semibold text-violet-600 dark:text-violet-400">
            Motion for React
          </span>
          {" "}(previously Framer Motion). Scroll, click, drag, and hover to see
          them in action.
        </p>
      </header>
      <MotionDemos />
    </main>
  );
}
