import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AdminPanel from "../../components/sso/admin-panel"

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect("/sso")
  if (!session.user?.roles?.includes("admin")) {
    redirect("/sso/dashboard?error=admin_required")
  }

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-950 px-6 py-12">
      <div className="w-full max-w-3xl mx-auto">
        <AdminPanel session={session} />
      </div>
    </div>
  )
}
