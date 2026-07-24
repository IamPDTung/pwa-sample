import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const GET = auth(async function GET(req) {
  return NextResponse.json({
    message: "This is protected data",
    user: {
      name: req.auth?.user?.name,
      email: req.auth?.user?.email,
      roles: req.auth?.user?.roles,
    },
  })
})
