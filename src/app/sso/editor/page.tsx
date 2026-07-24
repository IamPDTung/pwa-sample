import { auth } from "@/auth"
import { redirect } from "next/navigation"
import EditorPanel from "../../components/sso/editor-panel"

export default async function EditorPage() {
  const session = await auth()
  if (!session) redirect("/sso")
  if (
    !session.user?.roles?.includes("editor") &&
    !session.user?.roles?.includes("admin")
  ) {
    redirect("/sso/dashboard?error=editor_required")
  }

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-950 px-6 py-12">
      <div className="w-full max-w-3xl mx-auto">
        <EditorPanel session={session} />
      </div>
    </div>
  )
}
