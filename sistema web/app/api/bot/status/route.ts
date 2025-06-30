import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Mock bot status - replace with actual bot status logic
  const status = {
    isRunning: Math.random() > 0.5,
    isConnected: Math.random() > 0.3,
    qrCode: Math.random() > 0.7 ? "/placeholder.svg?height=256&width=256" : null,
    lastActivity: new Date(),
    messagesCount: Math.floor(Math.random() * 1000),
    uptime: Math.floor(Math.random() * 86400), // seconds
  }

  return NextResponse.json(status)
}
