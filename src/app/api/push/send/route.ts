import { NextRequest, NextResponse } from "next/server";
import { getSubscriptions } from "@/lib/subscription-store";
import { getWebPush } from "@/lib/vapid";

interface PushSub {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = body?.title || "PWA Notification";
    const msg = body?.body || "Sent from the backend!";
    const target = body?.target || "all";

    const payload = JSON.stringify({
      title,
      body: msg,
      icon: "/icon-192.png",
    });

    const webpush = getWebPush();
    const subscriptions = getSubscriptions();

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No subscriptions. Subscribe on the client first." },
        { status: 400 }
      );
    }

    const results: { ok: number; gone: number; error: number } = {
      ok: 0,
      gone: 0,
      error: 0,
    };

    const expiredEndpoints: string[] = [];

    for (const sub of subscriptions) {
      if (target !== "all" && sub.endpoint !== target) continue;

      try {
        await webpush.sendNotification(sub as unknown as PushSub, payload);
        results.ok++;
      } catch (err: unknown) {
        const error = err as { statusCode?: number };
        if (error.statusCode === 410 || error.statusCode === 404) {
          results.gone++;
          expiredEndpoints.push(sub.endpoint);
        } else {
          results.error++;
        }
      }
    }

    for (const endpoint of expiredEndpoints) {
      const subs = getSubscriptions();
      const idx = subs.findIndex((s) => s.endpoint === endpoint);
      if (idx >= 0) subs.splice(idx, 1);
    }

    return NextResponse.json({ ...results, total: subscriptions.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to send push: ${message}` }, { status: 500 });
  }
}
