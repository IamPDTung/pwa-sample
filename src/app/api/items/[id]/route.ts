import { NextRequest, NextResponse } from "next/server";
import { deleteItem } from "@/app/lib/items-store";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await new Promise((r) => setTimeout(r, 300));

  if (id === "intentional-fail") {
    return NextResponse.json({ error: "Simulated failure" }, { status: 500 });
  }

  const ok = deleteItem(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
