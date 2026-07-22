import VirtualTable from "../components/virtual-table";

export default function VirtualPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 text-center px-6 py-12 w-full">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Virtual Table
        </h1>
        <p className="max-w-md text-lg text-zinc-500 dark:text-zinc-400">
          100,000 rows rendered with TanStack Table + Virtual.
        </p>
        <VirtualTable />
      </main>
    </div>
  );
}
