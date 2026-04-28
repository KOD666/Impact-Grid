"use client"

import { useMemo, useState, useCallback } from "react"
import { Sidebar } from "@/components/impact-grid/sidebar"
import { TopNav } from "@/components/impact-grid/top-nav"
import { CrisisMap } from "@/components/impact-grid/crisis-map"
import { PersonnelPanel } from "@/components/impact-grid/personnel-panel"
import { TaskOrderCard } from "@/components/impact-grid/task-order-card"
import { MissionDetailModal } from "@/components/impact-grid/mission-detail-modal"
import { DeployResponseBar } from "@/components/impact-grid/deploy-response-bar"
import { MissionsFilterBar, MissionsEmptyState } from "@/components/impact-grid/missions-filter-bar"
import { SuggestTeamModal } from "@/components/impact-grid/suggest-team-modal"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useMissions,
  useVolunteers,
  useDashboard,
  deployMission,
} from "@/hooks/use-dashboard"
import { useAppContext } from "@/components/providers/app-provider"
import { useRole } from "@/lib/useRole"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { Mission, Volunteer } from "@/lib/types"

export default function MissionsPage() {
  const { missions, isLoading, refresh: refreshMissions } = useMissions()
  const { volunteers: volsData, refresh: refreshVolunteers } = useVolunteers()
  const { refresh: refreshDashboard } = useDashboard()
  const { queueMissionStatus } = useAppContext()
  const { isCommander, isCoordinator } = useRole()

  const [deploying, setDeploying] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [suggestTeamMissionId, setSuggestTeamMissionId] = useState<string | null>(null)
  const [suggestTeamOpen, setSuggestTeamOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(true)
  const [filteredMissions, setFilteredMissions] = useState<Mission[]>([])

  const typedMissions = missions as Mission[]
  const typedVolunteers = volsData as Volunteer[]

  // Handle filtered results from filter bar
  const handleFiltered = useCallback((filtered: Mission[]) => {
    setFilteredMissions(filtered)
  }, [])

  // Reset filters callback for empty state
  const [filterResetKey, setFilterResetKey] = useState(0)
  const handleResetFilters = useCallback(() => {
    setFilterResetKey((k) => k + 1)
  }, [])

  const pendingMissions = filteredMissions.filter((m) => m.status === "pending")
  const activeMissions = filteredMissions.filter((m) => m.status === "active")

  const crisisMarkers = useMemo(
    () =>
      typedMissions
        .filter((m) => m.coordinates)
        .map((m) => ({
          id: m.id,
          missionId: m.id,
          label: m.title,
          lat: m.coordinates!.lat,
          lng: m.coordinates!.lng,
          urgency:
            m.urgency === "critical"
              ? 90
              : m.urgency === "high"
                ? 65
                : m.urgency === "medium"
                  ? 45
                  : 25,
          category: m.category,
        })),
    [typedMissions],
  )

  const teamMarkers = useMemo(
    () =>
      typedVolunteers
        .filter((v) => v.coordinates)
        .map((v) => {
          const mission = v.current_mission
            ? typedMissions.find((m) => m.id === v.current_mission)
            : undefined
          return {
            id: v.id,
            name: v.name,
            lat: v.coordinates!.lat,
            lng: v.coordinates!.lng,
            currentMission: mission?.title,
            destinationLat: mission?.coordinates?.lat,
            destinationLng: mission?.coordinates?.lng,
            destinationUrgency: mission
              ? mission.urgency === "critical"
                ? 90
                : mission.urgency === "high"
                  ? 65
                  : 45
              : undefined,
          }
        }),
    [typedVolunteers, typedMissions],
  )

  const handleDeploy = async (missionId: string) => {
    setDeploying(missionId)
    try {
      await deployMission(missionId)
      refreshMissions()
      refreshVolunteers()
      refreshDashboard()
    } finally {
      setDeploying(null)
    }
  }

  const handleViewDetails = (missionId: string) => {
    setDetailId(missionId)
    setDetailOpen(true)
  }

  const getStatusFromMission = (mission: Mission) => {
    if (mission.status === "active") return "ACTIVE" as const
    if (mission.urgency === "critical") return "SYS_AUTH_OK" as const
    if (mission.urgency === "high") return "LOG_PENDING" as const
    return "SCAN_ACTIVE" as const
  }

  const noFilterResults = typedMissions.length > 0 && filteredMissions.length === 0

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="lg:ml-56">
        <TopNav
          activeTab="reports"
          onReportSubmitted={() => {
            refreshMissions()
            refreshDashboard()
          }}
        />

        <div className="p-4 md:p-6 space-y-6 pb-24">
          {/* Filter Bar */}
          {typedMissions.length > 0 && (
            <MissionsFilterBar
              key={filterResetKey}
              missions={typedMissions}
              onFiltered={handleFiltered}
            />
          )}

          {/* Empty State for No Filter Results */}
          {noFilterResults ? (
            <MissionsEmptyState onReset={handleResetFilters} />
          ) : (
            <>
              {/* Collapsible Map Panel */}
              <div className="border border-border rounded-sm bg-card">
                <button
                  type="button"
                  onClick={() => setMapOpen((v) => !v)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                  aria-expanded={mapOpen}
                >
                  <span className="font-mono text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[var(--tactical-orange)]" />
                    LIVE_FIELD_MAP // {crisisMarkers.length} MISSIONS, {teamMarkers.length} TEAMS
                  </span>
                  {mapOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                {mapOpen && (
                  <CrisisMap
                    title="MISSION_OVERWATCH"
                    subtitle="Click a mission card to focus the map"
                    markers={crisisMarkers}
                    teams={teamMarkers}
                    showRoutes
                    height="380px"
                    focusId={selectedId}
                    onMarkerClick={(m) => m.missionId && setSelectedId(m.missionId)}
                    onViewMission={(id) => handleViewDetails(id)}
                    className="border-0 rounded-none"
                  />
                )}
              </div>

              {/* Side-by-side: Personnel + Active Missions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  {activeMissions.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="font-mono text-lg font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--tactical-green)] animate-pulse" />
                            ACTIVE MISSIONS
                          </h2>
                          <p className="font-mono text-xs text-muted-foreground mt-1">
                            CURRENTLY DEPLOYED: {activeMissions.length}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeMissions.map((mission) => (
                          <TaskOrderCard
                            key={mission.id}
                            priority={`ACTIVE_${mission.urgency.toUpperCase()}`}
                            title={mission.title}
                            description={mission.description}
                            personnel={`${mission.volunteers_required} VOLUNTEERS`}
                            duration={mission.time_estimate}
                            location={mission.location}
                            equipment={mission.category.toUpperCase()}
                            status="ACTIVE"
                            isActive
                            isSelected={selectedId === mission.id}
                            onSelect={() => setSelectedId(mission.id)}
                            onViewDetails={() => handleViewDetails(mission.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending Missions */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="font-mono text-lg font-bold flex items-center gap-2">
                          <span className="w-2 h-2 bg-[var(--tactical-orange)]" />
                          UNASSIGNED TASK ORDERS
                        </h2>
                        <p className="font-mono text-xs text-muted-foreground mt-1">
                          TACTICAL PRIORITY: HIGH // REQUIRED DEPLOYMENT:{" "}
                          {pendingMissions.length.toString().padStart(2, "0")}
                        </p>
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[0, 1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-56 w-full" />
                        ))}
                      </div>
                    ) : pendingMissions.length === 0 ? (
                      <p className="font-mono text-xs text-muted-foreground p-6 border border-border rounded-sm bg-card">
                        No pending missions. All task orders have been deployed.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingMissions.map((mission, index) => (
                          <TaskOrderCard
                            key={mission.id}
                            priority={`PRIORITY_${(index + 1).toString().padStart(2, "0")}`}
                            title={mission.title}
                            description={mission.description}
                            personnel={`${mission.volunteers_required} VOLUNTEERS`}
                            duration={mission.time_estimate}
                            location={mission.location}
                            equipment={mission.category.toUpperCase()}
                            status={getStatusFromMission(mission)}
                            isSelected={selectedId === mission.id}
                            isUnassigned={mission.assigned_volunteers?.length === 0}
                            onSelect={() => setSelectedId(mission.id)}
                            onSuggestTeam={
                              (isCommander || isCoordinator) && mission.assigned_volunteers?.length === 0
                                ? () => {
                                    setSuggestTeamMissionId(mission.id)
                                    setSuggestTeamOpen(true)
                                  }
                                : undefined
                            }
                            onDeploy={() => {
                              queueMissionStatus(mission.id, "active")
                              handleDeploy(mission.id)
                            }}
                            onViewDetails={() => handleViewDetails(mission.id)}
                            isDeploying={deploying === mission.id}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <PersonnelPanel volunteers={typedVolunteers} />
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <DeployResponseBar variant="floating" />

      <MissionDetailModal
        missionId={detailId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <SuggestTeamModal
        mission={
          suggestTeamMissionId
            ? typedMissions.find(m => m.id === suggestTeamMissionId) || null
            : null
        }
        open={suggestTeamOpen}
        onOpenChange={setSuggestTeamOpen}
        volunteers={typedVolunteers}
      />
    </div>
  )
}
