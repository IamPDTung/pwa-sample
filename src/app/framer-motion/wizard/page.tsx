"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSpring, useTransform } from "motion/react";

const steps = [
  {
    title: "Welcome",
    subtitle: "Let's get you set up in less than 2 minutes.",
    fields: ["name", "email"],
  },
  {
    title: "Preferences",
    subtitle: "Tell us what you're interested in.",
    fields: ["role", "plan"],
  },
  {
    title: "Confirm",
    subtitle: "Review your information before finishing.",
    fields: ["summary"],
  },
];

function StepContent({ step }: { step: (typeof steps)[number] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
        {step.title}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {step.subtitle}
      </p>

      {step.fields.map((field, fi) => (
        <motion.div
          key={field}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: fi * 0.12, duration: 0.25 }}
        >
          {field === "summary" ? (
            <div className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
              <p>
                <strong>Name:</strong> John Doe
              </p>
              <p>
                <strong>Email:</strong> john@example.com
              </p>
              <p>
                <strong>Role:</strong> Developer
              </p>
              <p>
                <strong>Plan:</strong> Pro
              </p>
            </div>
          ) : field === "name" ? (
            <input
              type="text"
              placeholder="Your name"
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            />
          ) : field === "email" ? (
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            />
          ) : field === "role" ? (
            <select className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-violet-500">
              <option>Designer</option>
              <option>Developer</option>
              <option>Product Manager</option>
            </select>
          ) : (
            <div className="flex gap-3">
              {["Basic", "Pro", "Enterprise"].map((plan) => (
                <button
                  key={plan}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    plan === "Pro"
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {plan}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

function Success() {
  return (
    <motion.div
      className="text-center space-y-4 py-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto"
      >
        <svg
          className="w-10 h-10 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.div>
      <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
        You&apos;re all set!
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Your account has been created successfully.
      </p>
      <motion.button
        onClick={() => window.location.reload()}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="px-6 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
      >
        Start Over
      </motion.button>
    </motion.div>
  );
}

export default function WizardPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const totalSteps = steps.length;

  const springProgress = useSpring(0, { stiffness: 80, damping: 15 });
  const width = useTransform(springProgress, [0, totalSteps], ["0%", "100%"]);

  const goNext = () => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    }
    if (step === totalSteps - 1) {
      setDone(true);
    }
  };

  const goBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  // Update spring when step changes
  springProgress.set(step);

  if (done) {
    return (
      <main className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-8">
          <Success />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <header className="text-center space-y-3 mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Onboarding Wizard
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Multi-step form with slide transitions, spring progress bar, and
          staggered field animations.
        </p>
      </header>

      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              Step {step + 1} of {totalSteps}
            </span>
            <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
            <motion.div
              style={{ width }}
              className="h-full rounded-full bg-violet-500"
            />
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-6">
          <AnimatePresence mode="wait">
            <StepContent key={step} step={steps[step]} />
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={goBack}
            disabled={step === 0}
            className="px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Back
          </button>
          <button
            onClick={goNext}
            className="px-5 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            {step === totalSteps - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </main>
  );
}
