import type { RowData } from "./table-data";

const CSV_HEADERS: (keyof RowData)[] = [
  "id",
  "name",
  "email",
  "age",
  "city",
  "country",
  "status",
  "joinDate",
  "revenue",
];

function escapeCSV(value: unknown): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function rowsToCSV(rows: RowData[]): string {
  const header = CSV_HEADERS.map((h) => escapeCSV(h)).join(",");
  const body = rows
    .map((row) => CSV_HEADERS.map((h) => escapeCSV(row[h])).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

export function downloadCSV(rows: RowData[], filename = "export.csv") {
  const csv = rowsToCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
