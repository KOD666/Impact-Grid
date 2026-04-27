import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import { processReportText, calculateUrgencyScore, generateMission, detectPatterns } from "@/lib/ai-processing"
import type { Report, IntelStreamEntry } from "@/lib/types"

// GET all reports
export async function GET() {
  try {
    const reports = dataStore.getReports()
    return NextResponse.json({ success: true, data: reports })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}

// POST - Submit new report
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { text, location, coordinates } = body

    if (!text || !location) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: text, location" },
        { status: 400 }
      )
    }

    // AI Processing: Extract structured data from report text
    const processed = processReportText(text, location)
    
    // Calculate urgency score
    const urgencyScore = calculateUrgencyScore(processed)

    // Create report object
    const report: Report = {
      id: `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      location,
      category: processed.category,
      urgency_score: urgencyScore,
      urgency_signals: processed.urgency_signals,
      people_affected: processed.people_affected,
      vulnerable_groups: processed.vulnerable_groups,
      timestamp: new Date().toISOString(),
      status: "processed",
      coordinates
    }

    // Add to store
    dataStore.addReport(report)

    // Add to intel stream
    const intelEntry: IntelStreamEntry = {
      id: `INTEL_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      source: "REPORT_SYS",
      payload_type: urgencyScore >= 70 ? "ALERT" : urgencyScore >= 40 ? "WARN" : "INFO",
      message: `NEW_REPORT: ${processed.category.toUpperCase()} situation in ${location}. Urgency: ${urgencyScore}`,
      status: urgencyScore >= 70 ? "action_req" : "logged"
    }
    dataStore.addIntelEntry(intelEntry)

    // Check for patterns and generate alerts
    const allReports = dataStore.getReports()
    const newAlerts = detectPatterns(allReports)
    for (const alert of newAlerts) {
      // Only add if not already exists
      const existingAlerts = dataStore.getAlerts()
      if (!existingAlerts.find(a => a.title === alert.title)) {
        dataStore.addAlert(alert)
      }
    }

    // Auto-generate mission if urgency is high
    let generatedMission = null
    if (urgencyScore >= 60) {
      generatedMission = generateMission(report)
      dataStore.addMission(generatedMission)
      dataStore.updateReport(report.id, { status: "mission_created" })
    }

    return NextResponse.json({
      success: true,
      data: {
        report,
        processed: {
          category: processed.category,
          urgency_score: urgencyScore,
          urgency_signals: processed.urgency_signals,
          people_affected: processed.people_affected,
          vulnerable_groups: processed.vulnerable_groups,
          keywords: processed.extracted_keywords
        },
        mission: generatedMission,
        alerts_triggered: newAlerts.length
      }
    })
  } catch (error) {
    console.error("Error processing report:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process report" },
      { status: 500 }
    )
  }
}
