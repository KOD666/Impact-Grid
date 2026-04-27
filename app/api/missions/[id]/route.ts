import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const mission = dataStore.getMissionById(id)
  if (!mission) {
    return NextResponse.json(
      { success: false, error: "Mission not found" },
      { status: 404 },
    )
  }

  const assignedVolunteers = mission.assigned_volunteers
    .map((vid) => dataStore.getVolunteerById(vid))
    .filter((v) => v !== undefined)

  const sourceReports = mission.source_reports
    .map((rid) => dataStore.getReportById(rid))
    .filter((r) => r !== undefined)

  return NextResponse.json({
    success: true,
    data: {
      mission,
      assigned_volunteers: assignedVolunteers,
      source_reports: sourceReports,
    },
  })
}
