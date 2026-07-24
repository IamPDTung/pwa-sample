"use client"

import type { Session } from "next-auth"
import { useState } from "react"

export default function EditorPanel({ session }: { session: Session }) {
  const [content, setContent] = useState(
    "# Welcome to the Editor\n\nStart writing your content here...\n\n## Features\n- Live preview\n- Auto-save drafts\n- Markdown support\n"
  )
  const [saved, setSaved] = useState(false)
  const isAdmin = session.user?.roles?.includes("admin")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Editor Workspace
        </h1>
        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-500/20">
          Editor+
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Content <span className="text-zinc-400">(Markdown)</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              setSaved(false)
            }}
            rows={16}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Preview
          </label>
          <div className="w-full h-[360px] rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900 overflow-auto">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {renderMarkdown(content)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSaved(true)}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
        >
          Save Draft
        </button>
        <button
          onClick={() => window.open("about:blank")}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
        >
          Preview
        </button>
        <button
          disabled={!isAdmin}
          title={isAdmin ? "Publish content" : "Admin role required to publish"}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
        >
          Publish
        </button>
        {saved && (
          <span className="inline-flex items-center text-sm text-emerald-600 dark:text-emerald-400">
            Draft saved
          </span>
        )}
      </div>
    </div>
  )
}

function renderMarkdown(text: string) {
  return text
    .split("\n")
    .map((line, i) => {
      if (line.startsWith("## ")) {
        return (
          <h2
            key={i}
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1 mt-3"
          >
            {line.slice(3)}
          </h2>
        )
      }
      if (line.startsWith("# ")) {
        return (
          <h1
            key={i}
            className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1 mt-3"
          >
            {line.slice(2)}
          </h1>
        )
      }
      if (line.startsWith("- ")) {
        return (
          <li
            key={i}
            className="ml-4 text-sm text-zinc-600 dark:text-zinc-400 list-disc"
          >
            {line.slice(2)}
          </li>
        )
      }
      if (line.trim() === "") {
        return <div key={i} className="h-2" />
      }
      return (
        <p key={i} className="text-sm text-zinc-600 dark:text-zinc-400">
          {line}
        </p>
      )
    })
}
