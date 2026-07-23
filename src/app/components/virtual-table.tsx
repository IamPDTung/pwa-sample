"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type RowData, type TableResponse } from "../lib/table-data";
import { downloadCSV } from "../lib/export-csv";

const PAGE_LIMIT = 50;

const columns: ColumnDef<RowData>[] = [
  { accessorKey: "id", header: "#", size: 64 },
  { accessorKey: "name", header: "Name", size: 180 },
  {
    accessorKey: "email",
    header: "Email",
    size: 240,
    cell: ({ getValue }) => (
      <span className="text-violet-600 dark:text-violet-400">
        {getValue<string>()}
      </span>
    ),
  },
  { accessorKey: "age", header: "Age", size: 64 },
  { accessorKey: "city", header: "City", size: 130 },
  { accessorKey: "country", header: "Country", size: 120 },
  {
    accessorKey: "status",
    header: "Status",
    size: 100,
    cell: ({ getValue }) => {
      const s = getValue<string>();
      const colors: Record<string, string> = {
        Active:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        Inactive:
          "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
        Pending:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      };
      return (
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[s] ?? ""}`}
        >
          {s}
        </span>
      );
    },
  },
  { accessorKey: "joinDate", header: "Join Date", size: 120 },
  {
    accessorKey: "revenue",
    header: "Revenue",
    size: 120,
    cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
  },
];

export default function VirtualTable() {
  const [rows, setRows] = useState<RowData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const errorRef = useRef(false);
  const errorCountRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    errorRef.current = error !== null;
  }, [error]);

  const fetchPage = useCallback(async () => {
    if (isLoadingRef.current) return;
    if (!hasMoreRef.current) return;
    if (errorRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_LIMIT));

      const s = sorting[0];
      if (s) {
        params.set("sort", s.id);
        params.set("order", s.desc ? "desc" : "asc");
      }

      const cursor = cursorRef.current;
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/table-data?${params}`, {
        signal: ac.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: TableResponse = await res.json();

      setRows((prev) => [...prev, ...data.rows]);
      cursorRef.current = data.nextCursor;
      setHasMore(data.hasMore);
      hasMoreRef.current = data.hasMore;
      errorCountRef.current = 0;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      errorCountRef.current += 1;
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [sorting]);

  const resetAll = useCallback(() => {
    abortRef.current?.abort();
    setRows([]);
    cursorRef.current = null;
    setHasMore(true);
    hasMoreRef.current = true;
    setError(null);
    errorCountRef.current = 0;
  }, []);

  useEffect(() => {
    resetAll();
  }, [sorting, resetAll]);

  useEffect(() => {
    if (rows.length === 0 && hasMore && !isLoadingRef.current && !errorRef.current) {
      fetchPage();
    }
  }, [rows.length, hasMore, fetchPage]);

  const handleRetry = useCallback(() => {
    setError(null);
    fetchPage();
  }, [fetchPage]);

  const handleExportCSV = useCallback(() => {
    downloadCSV(rows, `table-export-${rows.length}-rows.csv`);
  }, [rows]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows: tableRows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: tableRows.length + (hasMore ? 1 : 0),
    getScrollElement: useCallback(() => containerRef.current, []),
    estimateSize: () => 40,
    overscan: 15,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    if (virtualItems.length === 0) return;
    const lastIdx = virtualItems[virtualItems.length - 1].index;
    if (lastIdx >= tableRows.length - 10 && hasMore && !isLoadingRef.current && !errorRef.current) {
      fetchPage();
    }
  }, [virtualItems, tableRows.length, hasMore, fetchPage]);

  const loadedCount = tableRows.length;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-zinc-500">
          {loadedCount.toLocaleString()} rows loaded{hasMore ? "..." : ""}
        </p>
        {rows.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 text-sm text-red-600 dark:text-red-400 mb-2">
          <span>Error: {error}</span>
          <button
            onClick={handleRetry}
            className="px-3 py-1 rounded-md bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-auto bg-white dark:bg-zinc-900"
        style={{ height: "70vh" }}
      >
        <table className="w-full border-collapse table-fixed">
          <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-zinc-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 select-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: " \u2191",
                        desc: " \u2193",
                      }[header.column.getIsSorted() as string] ?? null}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody
            className="relative"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {virtualItems.map((virtualRow) => {
              const isLoader = virtualRow.index >= tableRows.length;
              const row = isLoader ? null : tableRows[virtualRow.index];

              return (
                <tr
                  key={isLoader ? "loader" : row!.id}
                  className="absolute top-0 left-0 w-full flex border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {isLoader ? (
                    <td
                      colSpan={columns.length}
                      className="flex items-center justify-center text-sm text-zinc-400 py-2"
                    >
                      {hasMore ? "Loading..." : `End — ${loadedCount.toLocaleString()} rows`}
                    </td>
                  ) : (
                    row!.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-0 flex items-center text-sm text-zinc-700 dark:text-zinc-300 truncate"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
