import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dataStore } from "@/lib/data-store"
import { matchVolunteers } from "@/lib/ai-processing"

// GET all volunteers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const missionId = searchParams.get("match_mission")

    // Try Supabase first
    const supabase = await createClient()
    const { data: volunteers, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && volunteers) {
      if (missionId) {
        // Return matched volunteers for a specific mission
        const { data: mission } = await supabase
          .from('missions')
          .select('*')
          .eq('id', missionId)
          .single()

        if (!mission) {
          return NextResponse.json(
            { success: false, error: "Mission not found" },
            { status: 404 }
          )
        }

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

      return NextResponse.json({ success: true, data: volunteers })
    }

    // Fallback to data store
    if (missionId) {
      const mission = dataStore.getMissionById(missionId)
      if (!mission) {
        return NextResponse.json(
          { success: false, error: "Mission not found" },
          { status: 404 }
        )
      }

      const fallbackVolunteers = dataStore.getVolunteers()
      const matched = matchVolunteers(mission, fallbackVolunteers)

      return NextResponse.json({
        success: true,
        data: {
          mission_id: missionId,
          matched_volunteers: matched,
          total_required: mission.volunteers_required
        }
      })
    }

    const fallbackVolunteers = dataStore.getVolunteers()
    return NextResponse.json({ success: true, data: fallbackVolunteers })
  } catch (error) {
    console.error('[v0] Volunteers GET error:', error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch volunteers" },
      { status: 500 }
    )
  }
}

// POST - Add new volunteer
export async function POST(request: Request) {
  try {
    const volunteer = await request.json()

    if (!volunteer.id || !volunteer.name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Try Supabase first
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('volunteers')
      .insert({
        id: volunteer.id,
        name: volunteer.name,
        location: volunteer.location || 'Unknown',
        skills: volunteer.skills || [],
        availability: volunteer.availability || 'available',
        clearance_level: volunteer.clearance_level || 1,
        missions_completed: volunteer.missions_completed || 0,
        joined_at: volunteer.joined_at || new Date().toISOString().split('T')[0],
        contact_email: volunteer.contact_email || '',
        contact_phone: volunteer.contact_phone || '',
      })
      .select()
      .single()

    if (!error && data) {
      return NextResponse.json({ success: true, data })
    }

    // Fallback to data store
    const added = dataStore.addVolunteer(volunteer)
    return NextResponse.json({ success: true, data: added })
  } catch (error) {
    console.error('[v0] Volunteers POST error:', error)
    return NextResponse.json(
      { success: false, error: "Failed to add volunteer" },
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

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (availability) updates.availability = availability
    if (location) updates.location = location
    if (skills) updates.skills = skills

    // Try Supabase first
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('volunteers')
      .update(updates)
      .eq('id', volunteerId)
      .select()
      .single()

    if (!error && data) {
      return NextResponse.json({ success: true, data })
    }

    // Fallback to data store
    const updated = dataStore.updateVolunteer(volunteerId, updates)
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Volunteer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[v0] Volunteers PATCH error:', error)
    return NextResponse.json(
      { success: false, error: "Failed to update volunteer" },
      { status: 500 }
    )
  }
}
