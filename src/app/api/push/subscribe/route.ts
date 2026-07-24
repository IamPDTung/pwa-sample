import { NextRequest, NextResponse } from "next/server";
import { addSubscription, removeSubscription } from "@/lib/subscription-store";

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    addSubscription(subscription);
    return NextResponse.json({ ok: true, count: 1 });
  } catch {
    return NextResponse.json({ error: "Failed to store subscription" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    removeSubscription(endpoint);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove subscription" }, { status: 500 });
  }
}
