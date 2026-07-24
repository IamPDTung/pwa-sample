"use client"

import type { Session } from "next-auth"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function DashboardView({ session }: { session: Session }) {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const isAdmin = session.user?.roles?.includes("admin")
  const isEditor =
    session.user?.roles?.includes("editor") ||
    session.user?.roles?.includes("admin")

  return (
    <div className="space-y-6">
      {error === "admin_required" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          Access denied — Admin role required
        </div>
      )}
      {error === "editor_required" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          Access denied — Editor role required
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          {session.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt=""
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-violet-600 text-white text-xl font-bold">
              {getInitials(session.user?.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 truncate">
              {session.user?.name ?? "Unknown"}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
              {session.user?.email}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {session.user?.roles?.includes("admin") && (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-500/20">
              Admin
            </span>
          )}
          {session.user?.roles?.includes("editor") && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-500/20">
              Editor
            </span>
          )}
          {session.user?.roles?.includes("viewer") && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-500/20">
              Viewer
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isAdmin && (
          <Link
            href="/sso/admin"
            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 hover:border-red-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-700 transition-colors"
          >
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                Admin Panel
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                System management &amp; config
              </p>
            </div>
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Admin
            </span>
          </Link>
        )}

        {isEditor && (
          <Link
            href="/sso/editor"
            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 hover:border-amber-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-700 transition-colors"
          >
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                Editor Workspace
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Write &amp; preview content
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Editor+
            </span>
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
          Session details
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500 dark:text-zinc-400">Provider</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-50">
              {session.user?.image ? getProviderName(session) : "Unknown"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500 dark:text-zinc-400">Session ID</dt>
            <dd className="font-mono text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[180px]">
              {getSessionId(session)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500 dark:text-zinc-400">Expires</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-50">
              {session.expires
                ? new Date(session.expires).toLocaleDateString()
                : "Managed by Auth.js"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
            <dd className="font-medium text-emerald-600 dark:text-emerald-400">
              Active
            </dd>
          </div>
        </dl>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/sso" })}
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}

function getProviderName(session: Session): string {
  const img = session.user?.image ?? ""
  if (img.includes("googleusercontent")) return "Google"
  if (img.includes("githubusercontent")) return "GitHub"
  return "OAuth"
}

function getSessionId(session: Session): string {
  const user = session.user as unknown as Record<string, unknown>
  if (user.sub && typeof user.sub === "string") {
    return user.sub.slice(0, 16)
  }
  return session.user?.email?.slice(0, 12) ?? "..."
}
