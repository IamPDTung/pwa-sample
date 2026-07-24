import { NextResponse } from "next/server";
import { getVapidPublicKey } from "@/lib/vapid";

export async function GET() {
  return NextResponse.json({ publicKey: getVapidPublicKey() });
}
