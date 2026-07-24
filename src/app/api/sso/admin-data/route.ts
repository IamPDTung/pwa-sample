import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const GET = auth(async function GET(req) {
  if (!req.auth?.user?.roles?.includes("admin")) {
    return NextResponse.json(
      { error: "Admin role required" },
      { status: 403 }
    )
  }

  return NextResponse.json({
    message: "Admin-only data",
    stats: {
      totalUsers: 3,
      activeSessions: 1,
      uptime: "99.9%",
    },
    admin: {
      name: req.auth.user.name,
      email: req.auth.user.email,
      roles: req.auth.user.roles,
    },
  })
})
