import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import { detectPatterns } from "@/lib/ai-processing"
import type { DeploymentLog, IntelStreamEntry } from "@/lib/types"

interface PendingChanges {
  missionAssignments?: Record<string, string[]> // missionId -> volunteerIds
  missionStatusUpdates?: Record<string, "active" | "completed" | "pending" | "cancelled">
  volunteerUpdates?: Record<
    string,
    Partial<{
      availability: "available" | "busy" | "offline"
      location: string
      coordinates: { lat: number; lng: number }
      current_mission: string | undefined
    }>
  >
  logisticsUpdates?: Record<
    string,
    Partial<{
      status: "pending" | "en_route" | "delivered"
      team: string
      eta: string
    }>
  >
}

export async function GET() {
  return NextResponse.json({ success: true, data: dataStore.getDeployments() })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { changes?: PendingChanges }
    const changes = body.changes ?? {}

    let missionsUpdated = 0
    let volunteersUpdated = 0
    let logisticsUpdated = 0

    // Mission status updates
    if (changes.missionStatusUpdates) {
      for (const [id, status] of Object.entries(changes.missionStatusUpdates)) {
        const updated = dataStore.updateMission(id, { status })
        if (updated) missionsUpdated++
      }
    }

    // Mission assignments - assign each volunteer and mark them busy
    if (changes.missionAssignments) {
      for (const [missionId, volunteerIds] of Object.entries(
        changes.missionAssignments,
      )) {
        const mission = dataStore.getMissionById(missionId)
        if (!mission) continue
        const merged = Array.from(
          new Set([...(mission.assigned_volunteers ?? []), ...volunteerIds]),
        )
        dataStore.updateMission(missionId, {
          assigned_volunteers: merged,
          status: "active",
        })
        missionsUpdated++

        for (const vid of volunteerIds) {
          dataStore.updateVolunteer(vid, {
            availability: "busy",
            current_mission: missionId,
          })
          volunteersUpdated++
        }
      }
    }

    // Volunteer updates
    if (changes.volunteerUpdates) {
      for (const [id, updates] of Object.entries(changes.volunteerUpdates)) {
        const updated = dataStore.updateVolunteer(id, updates)
        if (updated) volunteersUpdated++
      }
    }

    // Logistics updates
    if (changes.logisticsUpdates) {
      for (const [id, updates] of Object.entries(changes.logisticsUpdates)) {
        if (updates.status === "delivered") {
          ;(updates as Record<string, unknown>).delivered_at = new Date().toISOString()
        }
        const updated = dataStore.updateLogistics(id, updates)
        if (updated) logisticsUpdated++
      }
    }

    // Predictive alert recheck
    const reports = dataStore.getReports()
    const newAlerts = detectPatterns(reports)
    let alertsGenerated = 0
    const existing = dataStore.getAlerts()
    for (const alert of newAlerts) {
      if (!existing.find((a) => a.title === alert.title)) {
        dataStore.addAlert(alert)
        alertsGenerated++
      }
    }

    const summary = `Deploy: ${missionsUpdated} missions, ${volunteersUpdated} volunteers, ${logisticsUpdated} logistics, ${alertsGenerated} alerts`

    const log: DeploymentLog = {
      id: `DEP_${Date.now()}`,
      timestamp: new Date().toISOString(),
      summary,
      changes: {
        missions_updated: missionsUpdated,
        volunteers_updated: volunteersUpdated,
        logistics_updated: logisticsUpdated,
        alerts_generated: alertsGenerated,
      },
    }
    dataStore.addDeployment(log)

    const intel: IntelStreamEntry = {
      id: `INTEL_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      source: "DEPLOY_CTRL",
      payload_type: "SYS",
      message: `FIELD_DEPLOYMENT_COMPLETE :: ${summary}`,
      status: "logged",
    }
    dataStore.addIntelEntry(intel)

    return NextResponse.json({ success: true, data: log })
  } catch (error) {
    console.error("[deploy] error", error)
    return NextResponse.json(
      { success: false, error: "Deployment failed" },
      { status: 500 },
    )
  }
}
