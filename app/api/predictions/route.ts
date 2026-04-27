import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import { detectPatterns } from "@/lib/ai-processing"

// GET all predictions/alerts
export async function GET() {
  try {
    const alerts = dataStore.getAlerts()
    return NextResponse.json({ success: true, data: alerts })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch predictions" },
      { status: 500 }
    )
  }
}

// POST - Manually trigger pattern detection
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { time_window_hours = 48 } = body

    const reports = dataStore.getReports()
    const newAlerts = detectPatterns(reports, time_window_hours)

    // Add new alerts that don't already exist
    const existingAlerts = dataStore.getAlerts()
    let addedCount = 0

    for (const alert of newAlerts) {
      if (!existingAlerts.find(a => a.title === alert.title)) {
        dataStore.addAlert(alert)
        addedCount++
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        analyzed_reports: reports.length,
        patterns_detected: newAlerts.length,
        new_alerts_added: addedCount,
        alerts: dataStore.getAlerts()
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to run pattern detection" },
      { status: 500 }
    )
  }
}
