"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import SessionBanner from "./sso/session-banner";

type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

const categories: {
  key: string;
  label: string;
  items: NavItem[];
}[] = [
  {
    key: "pwa" as const,
    label: "PWA Features",
    items: [
      { href: "/push", label: "Push Notifications" },
      { href: "/upload", label: "Upload Files" },
      { href: "/lazy-loading", label: "Lazy Loading" },
    ],
  },
  {
    key: "data" as const,
    label: "Data & UI",
    items: [
      { href: "/virtual", label: "Virtual Table" },
      { href: "/spreadsheet", label: "Spreadsheet" },
      { href: "/optimistic", label: "Optimistic UI" },
    ],
  },
  {
    key: "anim" as const,
    label: "UI Animations",
    items: [
      { href: "/threejs", label: "Three.js" },
      {
        href: "/framer-motion",
        label: "Framer Motion",
        children: [
          { href: "/framer-motion/gallery", label: "Gallery" },
          { href: "/framer-motion/todo", label: "To-Do" },
          { href: "/framer-motion/wizard", label: "Wizard" },
          { href: "/framer-motion/toast", label: "Toast" },
          { href: "/framer-motion/music", label: "Music" },
        ],
      },
      {
        href: "/gsap",
        label: "GSAP",
        children: [
          { href: "/gsap/cv", label: "CV" },
        ],
      },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);

  const pwaRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<HTMLDivElement>(null);

  const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
    pwa: pwaRef,
    data: dataRef,
    anim: animRef,
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (pwaRef.current?.contains(target)) return;
      if (dataRef.current?.contains(target)) return;
      if (animRef.current?.contains(target)) return;
      setOpenDropdown(null);
      setOpenSubDropdown(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMobileOpen(false);
    setOpenDropdown(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pathname]);

  const linkClass = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-violet-600 hover:text-violet-700 shrink-0"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
            P
          </span>
          <span className="hidden sm:inline">My PWA</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>

          {categories.map((cat) => {
            const isOpen = openDropdown === cat.key;
            const activeItem = cat.items.some(
              (i) =>
                pathname === i.href ||
                i.children?.some((c) => pathname === c.href),
            );

            return (
              <div className="relative" key={cat.key} ref={refMap[cat.key]}>
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : cat.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isOpen || activeItem
                      ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {cat.label}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="absolute left-0 top-full mt-1 w-48 rounded-lg border border-zinc-200 bg-white py-1.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                    {cat.items.map((item: NavItem) =>
                      item.children ? (
                        <div
                          key={item.href}
                          className="relative"
                          onMouseEnter={() => setOpenSubDropdown(item.href)}
                          onMouseLeave={() => setOpenSubDropdown(null)}
                        >
                          <Link
                            href={item.href}
                            className={`flex items-center justify-between px-3 py-1.5 text-sm mx-1 rounded-md transition-colors ${
                              pathname === item.href
                                ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            }`}
                          >
                            {item.label}
                            <svg
                              className="w-3 h-3 ml-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                          {openSubDropdown === item.href && (
                            <div className="absolute left-full top-0 ml-1 w-36 rounded-lg border border-zinc-200 bg-white py-1.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={`block px-3 py-1.5 text-sm mx-1 rounded-md transition-colors ${
                                    pathname === child.href
                                      ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                  }`}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block px-3 py-1.5 text-sm mx-1 rounded-md transition-colors ${
                            pathname === item.href
                              ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                              : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <SessionBanner />
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <SessionBanner />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950">
          <div className="px-4 py-3 space-y-1">
            <Link href="/" className={`block ${linkClass("/")}`}>
              Home
            </Link>
            <Link href="/sso" className={`block ${linkClass("/sso")}`}>
              SSO
            </Link>
            {categories.map((cat) => (
              <div key={cat.label}>
                <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {cat.label}
                </p>
                {cat.items.map((item: NavItem) => (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className={`block ${linkClass(item.href)}`}
                    >
                      {item.label}
                    </Link>
                    {item.children?.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block pl-7 ${linkClass(child.href)}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
