import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import type { LogisticsTask } from "@/lib/types"

export async function GET() {
  try {
    const tasks = dataStore.getLogistics()
    return NextResponse.json({ success: true, data: tasks })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch logistics tasks" },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body as { id: string } & Partial<LogisticsTask>

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing task id" },
        { status: 400 },
      )
    }

    if (updates.status === "delivered" && !updates.delivered_at) {
      updates.delivered_at = new Date().toISOString()
    }

    const updated = dataStore.updateLogistics(id, updates)
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update logistics task" },
      { status: 500 },
    )
  }
}
