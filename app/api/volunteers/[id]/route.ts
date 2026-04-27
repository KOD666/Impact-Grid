import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dataStore } from "@/lib/data-store"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  // Try Supabase first
  const supabase = await createClient()
  const { data: volunteer, error } = await supabase
    .from('volunteers')
    .select('*')
    .eq('id', id)
    .single()

  if (!error && volunteer) {
    let currentMission = undefined
    if (volunteer.current_mission) {
      const { data: mission } = await supabase
        .from('missions')
        .select('*')
        .eq('id', volunteer.current_mission)
        .single()
      currentMission = mission
    }

    return NextResponse.json({
      success: true,
      data: { volunteer, current_mission: currentMission, mission_history: [] },
    })
  }

  // Fallback to data store
  const fallbackVolunteer = dataStore.getVolunteerById(id)
  if (!fallbackVolunteer) {
    return NextResponse.json(
      { success: false, error: "Volunteer not found" },
      { status: 404 },
    )
  }

  const fallbackMission = fallbackVolunteer.current_mission
    ? dataStore.getMissionById(fallbackVolunteer.current_mission)
    : undefined

  const history = (fallbackVolunteer.mission_history ?? [])
    .map((historyId) => dataStore.getMissionById(historyId))
    .filter((m) => m !== undefined)

  return NextResponse.json({
    success: true,
    data: { volunteer: fallbackVolunteer, current_mission: fallbackMission, mission_history: history },
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  // Try Supabase first
  const supabase = await createClient()
  const { error } = await supabase
    .from('volunteers')
    .delete()
    .eq('id', id)

  if (!error) {
    return NextResponse.json({ success: true })
  }

  // Fallback to data store
  const ok = dataStore.removeVolunteer(id)
  if (!ok) {
    return NextResponse.json(
      { success: false, error: "Volunteer not found" },
      { status: 404 },
    )
  }
  return NextResponse.json({ success: true })
}
