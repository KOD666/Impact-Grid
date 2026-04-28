"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/impact-grid/sidebar"
import { TopNav } from "@/components/impact-grid/top-nav"
import { DashboardStats } from "@/components/impact-grid/stats-card"
import { CrisisMap } from "@/components/impact-grid/crisis-map"
import { LiveIntelStream } from "@/components/impact-grid/live-intel-stream"
import { PredictiveAlerts } from "@/components/impact-grid/predictive-alerts"
import { ResourceMatrix } from "@/components/impact-grid/resource-matrix"
import { useDashboard, useReports, useMissions, useGdacsDisasters } from "@/hooks/use-dashboard"
import { DeployResponseBar } from "@/components/impact-grid/deploy-response-bar"
import type { Report, Mission, IntelStreamEntry } from "@/lib/types"

export default function DashboardPage() {
  const { data, refresh } = useDashboard()
  const { reports } = useReports()
  const { missions } = useMissions()
  const { markers: gdacsMarkers } = useGdacsDisasters()
  const router = useRouter()

  const [filteredIntel, setFilteredIntel] = useState<IntelStreamEntry[] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleIntelFilter = useCallback((filtered: IntelStreamEntry[] | null, query: string) => {
    setFilteredIntel(filtered)
    setSearchQuery(query)
  }, [])

  const markers = (reports as Report[])
    .filter((r) => r.coordinates)
    .map((r) => {
      const linkedMission = (missions as Mission[]).find((m) =>
        m.source_reports.includes(r.id),
      )
      return {
        id: r.id,
        label: r.location,
        lat: r.coordinates!.lat,
        lng: r.coordinates!.lng,
        urgency: r.urgency_score,
        category: r.category,
        people_affected: r.people_affected,
        missionId: linkedMission?.id,
      }
    })

  // Use filtered intel if searching, otherwise use original
  const displayedIntel = filteredIntel !== null ? filteredIntel : (data?.intel_stream || [])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="lg:ml-56">
        <TopNav 
          activeTab="reports" 
          onReportSubmitted={refresh}
          intelStream={data?.intel_stream}
          onIntelFilter={handleIntelFilter}
        />

        <div className="p-4 md:p-6 space-y-6">
          {/* Stats Cards */}
          <DashboardStats data={data?.metrics} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Map & Intel */}
            <div className="lg:col-span-8 space-y-6">
              <CrisisMap
                title="GEOSPATIAL_INTEL // SYNC: ACTIVE"
                subtitle={`${markers.length} ACTIVE MARKERS`}
                markers={markers}
                externalMarkers={gdacsMarkers}
                height="380px"
                showExternalFeeds={true}
                onViewMission={(missionId) => router.push(`/missions/${missionId}`)}
              />
              <LiveIntelStream 
                entries={displayedIntel} 
                searchQuery={searchQuery}
                emptyMessage={searchQuery ? `No results for "${searchQuery}"` : undefined}
              />
            </div>

            {/* Right Column - Alerts & Resources */}
            <div className="lg:col-span-4 space-y-6">
              <PredictiveAlerts alerts={data?.alerts} />
              <ResourceMatrix resources={data?.resources} />
            </div>
          </div>

          <div className="h-8" />
        </div>
      </main>

      <DeployResponseBar variant="floating" />
    </div>
  )
}
