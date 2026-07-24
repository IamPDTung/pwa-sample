"use client"

import type { Session } from "next-auth"

export default function AdminPanel({ session }: { session: Session }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Admin Panel
        </h1>
        <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-500/20">
          Admin Only
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Users</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">3</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Active Sessions
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">1</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Uptime
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            99.9%
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            System Users
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-4 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Name
              </th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Email
              </th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400">
                Roles
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr>
              <td className="px-4 py-2.5 text-zinc-900 dark:text-zinc-50">
                {session.user?.name ?? "Admin User"}
              </td>
              <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">
                {session.user?.email}
              </td>
              <td className="px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    Admin
                  </span>
                  <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Editor
                  </span>
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Viewer
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
          Current Admin Session
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Logged in as <strong>{session.user?.email}</strong> with full admin
          privileges. This session will expire on{" "}
          {session.expires
            ? new Date(session.expires).toLocaleString()
            : "N/A"}.
        </p>
      </div>
    </div>
  )
}
