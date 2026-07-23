import OptimisticCRUD from "../components/optimistic-crud";

export default function OptimisticPage() {
  return (
    <main className="flex-1 p-6 pt-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          Optimistic CRUD
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Changes appear instantly. On failure, the UI rolls back. TanStack
          Query handles the state.
        </p>
      </div>
      <OptimisticCRUD />
    </main>
  );
}
