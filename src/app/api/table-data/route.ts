import { NextRequest, NextResponse } from "next/server";
import {
  generateRow,
  type RowData,
  type CursorPayload,
  type TableResponse,
  type ColumnKey,
} from "../../lib/table-data";

const TOTAL = 100_000;

let _cache: RowData[] | null = null;

function getAllRows(): RowData[] {
  if (!_cache) {
    _cache = Array.from({ length: TOTAL }, (_, i) => generateRow(i + 1));
  }
  return _cache;
}

function encodeCursor(cursor: CursorPayload): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

function decodeCursor(encoded: string): CursorPayload {
  return JSON.parse(Buffer.from(encoded, "base64url").toString());
}

function getComparator(key: ColumnKey, order: "asc" | "desc") {
  const dir = order === "asc" ? 1 : -1;
  return (a: RowData, b: RowData) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    return a.id < b.id ? -1 : 1;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50),
    200,
  );

  const sort = searchParams.get("sort") ?? "id";
  const order = (searchParams.get("order") ?? "asc") as "asc" | "desc";
  const cursorStr = searchParams.get("cursor");

  const isKey = (k: string): k is ColumnKey => {
    return [
      "id", "name", "email", "age", "city",
      "country", "status", "joinDate", "revenue",
    ].includes(k);
  };

  const sortKey: ColumnKey = isKey(sort) ? sort : "id";
  const sortOrder = order === "desc" ? "desc" : "asc";

  const allRows = getAllRows();
  const comparator = getComparator(sortKey, sortOrder);
  const sorted = [...allRows].sort(comparator);

  let startIndex = 0;
  if (cursorStr) {
    try {
      const cursor = decodeCursor(cursorStr);
      const found = sorted.findIndex((r) => r.id === cursor.id);
      if (found >= 0) {
        startIndex = found + 1;
      }
    } catch {
      // invalid cursor, start from beginning
    }
  }

  const slice = sorted.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < sorted.length;

  const nextCursor =
    slice.length > 0 && hasMore
      ? encodeCursor({ id: slice[slice.length - 1].id })
      : null;

  const body: TableResponse = { rows: slice, nextCursor, hasMore };

  return NextResponse.json(body);
}
