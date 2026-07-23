"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useState, useRef, useCallback } from "react";
import type { Item } from "../lib/items-store";
import { useToast } from "./toast";

type DraftItem = Pick<Item, "title" | "status">;

const columns: ColumnDef<Item>[] = [
  { accessorKey: "title", header: "Title", size: 300 },
  {
    accessorKey: "status",
    header: "Status",
    size: 100,
    cell: ({ getValue, row }) => {
      const id = row.original.id;
      return (
        <StatusSelect id={id} current={getValue<Item["status"]>()} />
      );
    },
  },
  { accessorKey: "createdAt", header: "Created", size: 100 },
  {
    id: "actions",
    header: "",
    size: 80,
    cell: ({ row }) => <DeleteButton id={row.original.id} />,
  },
];

function StatusSelect({ id, current }: { id: string; current: Item["status"] }) {
  const qc = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: (status: Item["status"]) =>
      fetch("/api/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to update");
        return r.json();
      }),
    onMutate: async (newStatus) => {
      await qc.cancelQueries({ queryKey: ["items"] });
      const prev = qc.getQueryData<Item[]>(["items"]);
      qc.setQueryData<Item[]>(["items"], (old) =>
        old?.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["items"], ctx.prev);
      toast.error("Failed to update status");
    },
    onSuccess: () => toast.success("Status updated"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });

  const statuses: Item["status"][] = ["active", "inactive", "draft"];
  const colors: Record<Item["status"], string> = {
    active:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    inactive:
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    draft:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <select
      value={current}
      onChange={(e) => mutation.mutate(e.target.value as Item["status"])}
      className={
        "text-xs font-medium rounded-full px-2 py-0.5 border-0 outline-none cursor-pointer appearance-none " +
        colors[current]
      }
      style={{ backgroundImage: "none" }}
    >
      {statuses.map((s) => (
        <option key={s} value={s} className="text-zinc-700 bg-white dark:bg-zinc-800">
          {s}
        </option>
      ))}
    </select>
  );
}

function DeleteButton({ id }: { id: string }) {
  const qc = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () =>
      fetch("/api/items/" + id, { method: "DELETE" }).then((r) => {
        if (!r.ok) throw new Error("Failed to delete");
        return r.json();
      }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["items"] });
      const prev = qc.getQueryData<Item[]>(["items"]);
      qc.setQueryData<Item[]>(["items"], (old) => old?.filter((i) => i.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["items"], ctx.prev);
      toast.error("Failed to delete");
    },
    onSuccess: () => toast.success("Deleted"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });

  return (
    <button
      onClick={() => mutation.mutate()}
      className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
    >
      Delete
    </button>
  );
}

export default function OptimisticCRUD() {
  const qc = useQueryClient();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [newTitle, setNewTitle] = useState("");

  const { data: items = [], isLoading, isError } = useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: () => fetch("/api/items").then((r) => r.json()),
  });

  const addMutation = useMutation({
    mutationFn: (draft: DraftItem) =>
      fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to add");
        return r.json() as Promise<Item>;
      }),
    onMutate: async (draft) => {
      await qc.cancelQueries({ queryKey: ["items"] });
      const prev = qc.getQueryData<Item[]>(["items"]);
      const optimistic: Item = {
        ...draft,
        id: "optimistic-" + Date.now(),
        createdAt: new Date().toISOString().slice(0, 10),
      };
      qc.setQueryData<Item[]>(["items"], (old) => [optimistic, ...(old ?? [])]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["items"], ctx.prev);
      toast.error("Failed to add item");
    },
    onSuccess: () => {
      toast.success("Item added");
      setNewTitle("");
      inputRef.current?.focus();
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });

  const handleAdd = useCallback(() => {
    const title = newTitle.trim();
    if (!title) return;
    addMutation.mutate({ title, status: "draft" });
  }, [newTitle, addMutation]);

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="New item title..."
          className="flex-1 px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder:text-zinc-400"
        />
        <button
          onClick={handleAdd}
          disabled={!newTitle.trim() || addMutation.isPending}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 transition-colors"
        >
          {addMutation.isPending ? "Adding..." : "Add"}
        </button>
      </div>

      {isLoading && (
        <p className="text-sm text-zinc-400 text-center py-8">Loading...</p>
      )}

      {isError && (
        <p className="text-sm text-red-500 text-center py-4">
          Failed to load items. Check your connection.
        </p>
      )}

      {!isLoading && !isError && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="bg-zinc-50 dark:bg-zinc-800/50">
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700"
                      style={{ width: h.getSize() }}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-zinc-400">
                    No items yet. Add one above.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const isOptimistic = row.original.id.startsWith("optimistic-");
                  return (
                    <tr
                      key={row.id}
                      className={
                        "border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors " +
                        (isOptimistic ? "opacity-60" : "")
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-zinc-400 text-center">
        Optimistic UI: changes appear instantly. If the server rejects, the UI
        rolls back. Try disabling your network after adding an item.
      </p>
    </div>
  );
}
