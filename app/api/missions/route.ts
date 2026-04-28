import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dataStore } from "@/lib/data-store"
import { matchVolunteers } from "@/lib/ai-processing"
import type { IntelStreamEntry } from "@/lib/types"

// GET all missions
export async function GET() {
  try {
    // Try Supabase first
    const supabase = await createClient()
    const { data: missions, error } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && missions) {
      return NextResponse.json({ success: true, data: missions })
    }

    // Fallback to data store if Supabase fails
    const fallbackMissions = dataStore.getMissions()
    return NextResponse.json({ success: true, data: fallbackMissions })
  } catch (error) {
    console.error('[v0] Missions GET error:', error)
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
    const supabase = await createClient()

    if (action === "deploy") {
      // Deploy mission - match and assign volunteers
      if (!missionId) {
        return NextResponse.json(
          { success: false, error: "Missing missionId" },
          { status: 400 }
        )
      }

      // Try Supabase first if configured
      if (supabase) {
        const { data: mission } = await supabase
          .from('missions')
          .select('*')
          .eq('id', missionId)
          .single()

        const { data: volunteers } = await supabase
          .from('volunteers')
          .select('*')

        if (mission && volunteers) {
        const matched = matchVolunteers(mission, volunteers)
        const assignedIds = matched.map(v => v.id)

        // Update mission in Supabase
        await supabase
          .from('missions')
          .update({
            status: "active",
            assigned_volunteers: assignedIds,
            updated_at: new Date().toISOString()
          })
          .eq('id', missionId)

        // Update volunteers in Supabase
        for (const volunteer of matched) {
          await supabase
            .from('volunteers')
            .update({
              availability: "busy",
              current_mission: missionId,
              updated_at: new Date().toISOString()
            })
            .eq('id', volunteer.id)
        }

        const { data: updatedMission } = await supabase
          .from('missions')
          .select('*')
          .eq('id', missionId)
          .single()

          return NextResponse.json({
            success: true,
            data: {
              mission: updatedMission,
              assigned_volunteers: matched
            }
          })
        }
      }

      // Fallback to data store
      const fallbackMission = dataStore.getMissionById(missionId)
      if (!fallbackMission) {
        return NextResponse.json(
          { success: false, error: "Mission not found" },
          { status: 404 }
        )
      }

      const fallbackVolunteers = dataStore.getVolunteers()
      const matched = matchVolunteers(fallbackMission, fallbackVolunteers)
      const assignedIds = matched.map(v => v.id)
      
      dataStore.updateMission(missionId, {
        status: "active",
        assigned_volunteers: assignedIds
      })

      for (const volunteer of matched) {
        dataStore.updateVolunteer(volunteer.id, {
          availability: "busy",
          current_mission: missionId
        })
      }

      const intelEntry: IntelStreamEntry = {
        id: `INTEL_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        source: "MISSION_CTRL",
        payload_type: "INFO",
        message: `MISSION_DEPLOYED: ${fallbackMission.title}. ${matched.length} volunteers assigned.`,
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
      if (!missionId || !volunteerId) {
        return NextResponse.json(
          { success: false, error: "Missing missionId or volunteerId" },
          { status: 400 }
        )
      }

      // Try Supabase if configured
      if (supabase) {
        const { data: mission } = await supabase
          .from('missions')
          .select('*')
          .eq('id', missionId)
          .single()

        const { data: volunteer } = await supabase
          .from('volunteers')
          .select('*')
          .eq('id', volunteerId)
          .single()

        if (mission && volunteer) {
          const updatedAssigned = [...(mission.assigned_volunteers || []), volunteerId]
          
          await supabase
            .from('missions')
            .update({ assigned_volunteers: updatedAssigned, updated_at: new Date().toISOString() })
            .eq('id', missionId)

          await supabase
            .from('volunteers')
            .update({ 
              availability: "busy", 
              current_mission: missionId,
              updated_at: new Date().toISOString()
            })
            .eq('id', volunteerId)

          const { data: updatedMission } = await supabase
            .from('missions')
            .select('*')
            .eq('id', missionId)
            .single()

          const { data: updatedVolunteer } = await supabase
            .from('volunteers')
            .select('*')
            .eq('id', volunteerId)
            .single()

          return NextResponse.json({
            success: true,
            data: { mission: updatedMission, volunteer: updatedVolunteer }
          })
        }
      }

      // Fallback to data store
      const fallbackMission = dataStore.getMissionById(missionId)
      const fallbackVolunteer = dataStore.getVolunteerById(volunteerId)

      if (!fallbackMission || !fallbackVolunteer) {
        return NextResponse.json(
          { success: false, error: "Mission or volunteer not found" },
          { status: 404 }
        )
      }

      const updatedAssigned = [...fallbackMission.assigned_volunteers, volunteerId]
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
      if (!missionId) {
        return NextResponse.json(
          { success: false, error: "Missing missionId" },
          { status: 400 }
        )
      }

      // Try Supabase if configured
      if (supabase) {
        const { data: mission } = await supabase
          .from('missions')
          .select('*')
          .eq('id', missionId)
          .single()

        if (mission) {
          await supabase
            .from('missions')
            .update({ status: "completed", updated_at: new Date().toISOString() })
            .eq('id', missionId)

          // Free up volunteers
          for (const volId of (mission.assigned_volunteers || [])) {
            const { data: vol } = await supabase
              .from('volunteers')
              .select('missions_completed')
              .eq('id', volId)
              .single()

            await supabase
              .from('volunteers')
              .update({
                availability: "available",
                current_mission: null,
                missions_completed: (vol?.missions_completed || 0) + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', volId)
          }

          const { data: updatedMission } = await supabase
            .from('missions')
            .select('*')
            .eq('id', missionId)
            .single()

          return NextResponse.json({
            success: true,
            data: { mission: updatedMission }
          })
        }
      }

      // Fallback to data store
      const fallbackMission = dataStore.getMissionById(missionId)
      if (!fallbackMission) {
        return NextResponse.json(
          { success: false, error: "Mission not found" },
          { status: 404 }
        )
      }

      dataStore.updateMission(missionId, { status: "completed" })

      for (const volId of fallbackMission.assigned_volunteers) {
        const volunteer = dataStore.getVolunteerById(volId)
        if (volunteer) {
          dataStore.updateVolunteer(volId, {
            availability: "available",
            current_mission: undefined,
            missions_completed: volunteer.missions_completed + 1
          })
        }
      }

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
    console.error("[v0] Mission POST error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process mission action" },
      { status: 500 }
    )
  }
}
