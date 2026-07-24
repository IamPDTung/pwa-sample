import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import DashboardView from "../../components/sso/dashboard"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/sso")

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-950 px-6 py-12">
      <div className="w-full max-w-2xl mx-auto">
        <Suspense
          fallback={
            <div className="animate-pulse space-y-4">
              <div className="h-24 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-20 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            </div>
          }
        >
          <DashboardView session={session} />
        </Suspense>
      </div>
    </div>
  )
}
