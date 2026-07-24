"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SessionBanner from "./sso/session-banner";

const links = [
  { href: "/", label: "Home" },
  { href: "/push", label: "Push Notifications" },
  { href: "/upload", label: "Upload File" },
  { href: "/virtual", label: "Virtual Table" },
  { href: "/spreadsheet", label: "Spreadsheet" },
  { href: "/lazy-loading", label: "Lazy Loading" },
  { href: "/optimistic", label: "Optimistic UI" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-violet-600 hover:text-violet-700"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
            P
          </span>
          My PWA
        </Link>

        <ul className="flex gap-1">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
          <SessionBanner />
        </ul>
      </nav>
    </header>
  );
}
