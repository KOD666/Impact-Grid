import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const volunteer = dataStore.getVolunteerById(id)
  if (!volunteer) {
    return NextResponse.json(
      { success: false, error: "Volunteer not found" },
      { status: 404 },
    )
  }

  const currentMission = volunteer.current_mission
    ? dataStore.getMissionById(volunteer.current_mission)
    : undefined

  const history = (volunteer.mission_history ?? [])
    .map((id) => dataStore.getMissionById(id))
    .filter((m) => m !== undefined)

  return NextResponse.json({
    success: true,
    data: { volunteer, current_mission: currentMission, mission_history: history },
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const ok = dataStore.removeVolunteer(id)
  if (!ok) {
    return NextResponse.json(
      { success: false, error: "Volunteer not found" },
      { status: 404 },
    )
  }
  return NextResponse.json({ success: true })
}
