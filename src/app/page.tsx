import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 text-center px-6 py-32">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-violet-600 shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
          <span className="text-4xl font-bold text-white">P</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome to My PWA
        </h1>

        <p className="max-w-md text-lg text-zinc-500 dark:text-zinc-400">
          A simple, installable progressive web app.
        </p>

        <div className="flex gap-3 mt-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 text-violet-700 text-sm font-medium dark:bg-violet-900/30 dark:text-violet-300">
            Offline-ready
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 text-violet-700 text-sm font-medium dark:bg-violet-900/30 dark:text-violet-300">
            Installable
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 text-violet-700 text-sm font-medium dark:bg-violet-900/30 dark:text-violet-300">
            Fast
          </span>
        </div>

        <hr className="w-48 border-zinc-200 dark:border-zinc-800" />

        <div className="flex gap-4">
          <Link
            href="/push"
            className="px-5 py-2 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            Push Notifications
          </Link>
          <Link
            href="/lazy-loading"
            className="px-5 py-2 rounded-full border border-violet-600 text-violet-600 text-sm font-medium hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
          >
            Lazy Loading
          </Link>
          <Link
            href="/spreadsheet"
            className="px-5 py-2 rounded-full border border-violet-600 text-violet-600 text-sm font-medium hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
          >
            Spreadsheet
          </Link>
          <Link
            href="/virtual"
            className="px-5 py-2 rounded-full border border-violet-600 text-violet-600 text-sm font-medium hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
          >
            Virtual Table
          </Link>
          <Link
            href="/sso"
            className="px-5 py-2 rounded-full border border-violet-600 text-violet-600 text-sm font-medium hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
          >
            SSO
          </Link>
        </div>
      </main>
    </div>
  );
}
