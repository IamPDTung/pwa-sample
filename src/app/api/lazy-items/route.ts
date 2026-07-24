import { NextRequest, NextResponse } from "next/server";
import { generateLazyItems, TOTAL_ITEMS } from "@/lib/lazy-items";

const allItems = generateLazyItems(TOTAL_ITEMS);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(
    Math.max(1, Number(searchParams.get("limit")) || 10),
    50
  );

  const start = (page - 1) * limit;
  const slice = allItems.slice(start, start + limit);

  await new Promise((r) => setTimeout(r, 350));

  return NextResponse.json({
    items: slice,
    total: TOTAL_ITEMS,
    page,
    limit,
    hasMore: start + limit < TOTAL_ITEMS,
  });
}
