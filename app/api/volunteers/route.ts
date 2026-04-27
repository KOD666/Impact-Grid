import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import { matchVolunteers } from "@/lib/ai-processing"

// GET all volunteers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const missionId = searchParams.get("match_mission")

    if (missionId) {
      // Return matched volunteers for a specific mission
      const mission = dataStore.getMissionById(missionId)
      if (!mission) {
        return NextResponse.json(
          { success: false, error: "Mission not found" },
          { status: 404 }
        )
      }

      const volunteers = dataStore.getVolunteers()
      const matched = matchVolunteers(mission, volunteers)

      return NextResponse.json({
        success: true,
        data: {
          mission_id: missionId,
          matched_volunteers: matched,
          total_required: mission.volunteers_required
        }
      })
    }

    const volunteers = dataStore.getVolunteers()
    return NextResponse.json({ success: true, data: volunteers })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch volunteers" },
      { status: 500 }
    )
  }
}

// PATCH - Update volunteer status
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { volunteerId, availability, location, skills } = body

    if (!volunteerId) {
      return NextResponse.json(
        { success: false, error: "Missing volunteerId" },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = {}
    if (availability) updates.availability = availability
    if (location) updates.location = location
    if (skills) updates.skills = skills

    const updated = dataStore.updateVolunteer(volunteerId, updates)
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Volunteer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update volunteer" },
      { status: 500 }
    )
  }
}
