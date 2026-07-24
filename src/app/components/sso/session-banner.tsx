"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"

export default function SessionBanner() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        <div className="w-16 h-4 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse hidden sm:block" />
      </div>
    )
  }

  if (status !== "authenticated" || !session?.user) {
    return (
      <Link
        href="/sso"
        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          pathname === "/sso"
            ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        }`}
      >
        Sign In
      </Link>
    )
  }

  const initials = (session.user.name ?? session.user.email ?? "?")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const isAdmin = session.user.roles?.includes("admin")
  const isEditor = session.user.roles?.includes("editor") || isAdmin

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-violet-600 text-xs font-bold text-white">
          {initials}
        </div>
        <span className="hidden sm:inline max-w-[100px] truncate">
          {session.user.name ?? session.user.email}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
              {session.user.name ?? "User"}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {session.user.email}
            </p>
          </div>

          <Link
            href="/sso/dashboard"
            onClick={() => setOpen(false)}
            className="block px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Dashboard
          </Link>

          {isAdmin && (
            <Link
              href="/sso/admin"
              onClick={() => setOpen(false)}
              className="block px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Admin Panel
            </Link>
          )}

          {isEditor && (
            <Link
              href="/sso/editor"
              onClick={() => setOpen(false)}
              className="block px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Editor
            </Link>
          )}

          <div className="border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1">
            <button
              onClick={() => {
                setOpen(false)
                signOut({ callbackUrl: "/" })
              }}
              className="block w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
