import { NextRequest, NextResponse } from "next/server";
import { getItems, addItem, updateItem } from "@/app/lib/items-store";

export async function GET() {
  await new Promise((r) => setTimeout(r, 400));
  return NextResponse.json(getItems());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  await new Promise((r) => setTimeout(r, 300));
  const item = addItem({
    title: body.title.trim(),
    status: body.status ?? "draft",
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (!body.id?.trim()) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }
  await new Promise((r) => setTimeout(r, 300));
  const item = updateItem(body.id, {
    title: body.title?.trim(),
    status: body.status,
  });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}
