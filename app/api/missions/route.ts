import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import { matchVolunteers } from "@/lib/ai-processing"
import type { IntelStreamEntry } from "@/lib/types"

// GET all missions
export async function GET() {
  try {
    const missions = dataStore.getMissions()
    return NextResponse.json({ success: true, data: missions })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch missions" },
      { status: 500 }
    )
  }
}

// POST - Create mission or deploy volunteers
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, missionId, volunteerId } = body

    if (action === "deploy") {
      // Deploy mission - match and assign volunteers
      if (!missionId) {
        return NextResponse.json(
          { success: false, error: "Missing missionId" },
          { status: 400 }
        )
      }

      const mission = dataStore.getMissionById(missionId)
      if (!mission) {
        return NextResponse.json(
          { success: false, error: "Mission not found" },
          { status: 404 }
        )
      }

      // Get matched volunteers
      const volunteers = dataStore.getVolunteers()
      const matched = matchVolunteers(mission, volunteers)

      // Assign volunteers to mission
      const assignedIds = matched.map(v => v.id)
      dataStore.updateMission(missionId, {
        status: "active",
        assigned_volunteers: assignedIds
      })

      // Update volunteer availability
      for (const volunteer of matched) {
        dataStore.updateVolunteer(volunteer.id, {
          availability: "busy",
          current_mission: missionId
        })
      }

      // Add to intel stream
      const intelEntry: IntelStreamEntry = {
        id: `INTEL_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        source: "MISSION_CTRL",
        payload_type: "INFO",
        message: `MISSION_DEPLOYED: ${mission.title}. ${matched.length} volunteers assigned.`,
        status: "logged"
      }
      dataStore.addIntelEntry(intelEntry)

      return NextResponse.json({
        success: true,
        data: {
          mission: dataStore.getMissionById(missionId),
          assigned_volunteers: matched
        }
      })
    }

    if (action === "assign") {
      // Manually assign a specific volunteer
      if (!missionId || !volunteerId) {
        return NextResponse.json(
          { success: false, error: "Missing missionId or volunteerId" },
          { status: 400 }
        )
      }

      const mission = dataStore.getMissionById(missionId)
      const volunteer = dataStore.getVolunteerById(volunteerId)

      if (!mission || !volunteer) {
        return NextResponse.json(
          { success: false, error: "Mission or volunteer not found" },
          { status: 404 }
        )
      }

      // Add volunteer to mission
      const updatedAssigned = [...mission.assigned_volunteers, volunteerId]
      dataStore.updateMission(missionId, { assigned_volunteers: updatedAssigned })
      dataStore.updateVolunteer(volunteerId, {
        availability: "busy",
        current_mission: missionId
      })

      return NextResponse.json({
        success: true,
        data: {
          mission: dataStore.getMissionById(missionId),
          volunteer: dataStore.getVolunteerById(volunteerId)
        }
      })
    }

    if (action === "complete") {
      // Complete a mission
      if (!missionId) {
        return NextResponse.json(
          { success: false, error: "Missing missionId" },
          { status: 400 }
        )
      }

      const mission = dataStore.getMissionById(missionId)
      if (!mission) {
        return NextResponse.json(
          { success: false, error: "Mission not found" },
          { status: 404 }
        )
      }

      // Update mission status
      dataStore.updateMission(missionId, { status: "completed" })

      // Free up volunteers
      for (const volId of mission.assigned_volunteers) {
        const volunteer = dataStore.getVolunteerById(volId)
        if (volunteer) {
          dataStore.updateVolunteer(volId, {
            availability: "available",
            current_mission: undefined,
            missions_completed: volunteer.missions_completed + 1
          })
        }
      }

      // Update metrics
      const metrics = dataStore.getMetrics()
      dataStore.updateMetrics({ active_missions: metrics.active_missions - 1 })

      return NextResponse.json({
        success: true,
        data: { mission: dataStore.getMissionById(missionId) }
      })
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error processing mission action:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process mission action" },
      { status: 500 }
    )
  }
}
