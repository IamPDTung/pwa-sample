import PushNoti from "../components/push-noti";

export default function PushPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 text-center px-6 py-32">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Push Notifications
        </h1>
        <p className="max-w-md text-lg text-zinc-500 dark:text-zinc-400">
          Test local push notifications and Web Push from the backend — no cloud service required.
        </p>
        <PushNoti />
      </main>
    </div>
  );
}
