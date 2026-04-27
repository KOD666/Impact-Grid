import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

// GET dashboard data (aggregated view)
export async function GET() {
  try {
    const reports = dataStore.getReports()
    const missions = dataStore.getMissions()
    const volunteers = dataStore.getVolunteers()
    const alerts = dataStore.getAlerts()
    const intelStream = dataStore.getIntelStream()
    const resources = dataStore.getResources()
    const metrics = dataStore.getMetrics()

    // Calculate additional metrics
    const activeMissions = missions.filter(m => m.status === "active")
    const pendingMissions = missions.filter(m => m.status === "pending")
    const availableVolunteers = volunteers.filter(v => v.availability === "available")
    const criticalAlerts = alerts.filter(a => a.type === "critical_event")

    // Urgency distribution
    const urgencyDistribution = {
      critical: reports.filter(r => r.urgency_score >= 75).length,
      high: reports.filter(r => r.urgency_score >= 50 && r.urgency_score < 75).length,
      medium: reports.filter(r => r.urgency_score >= 25 && r.urgency_score < 50).length,
      low: reports.filter(r => r.urgency_score < 25).length
    }

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {}
    for (const report of reports) {
      categoryBreakdown[report.category] = (categoryBreakdown[report.category] || 0) + 1
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          ...metrics,
          reports_today: reports.filter(r => 
            new Date(r.timestamp).toDateString() === new Date().toDateString()
          ).length,
          active_missions: activeMissions.length,
          pending_missions: pendingMissions.length,
          available_volunteers: availableVolunteers.length,
          critical_alerts: criticalAlerts.length
        },
        urgency_distribution: urgencyDistribution,
        category_breakdown: categoryBreakdown,
        recent_reports: reports.slice(0, 5),
        active_missions: activeMissions,
        pending_missions: pendingMissions,
        alerts: alerts.slice(0, 5),
        intel_stream: intelStream.slice(0, 10),
        resources,
        volunteers: volunteers.map(v => ({
          id: v.id,
          name: v.name,
          availability: v.availability,
          clearance_level: v.clearance_level,
          current_mission: v.current_mission
        }))
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
