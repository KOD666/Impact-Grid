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
import { Skeleton } from "@/components/ui/skeleton"
import {
  useMissions,
  useVolunteers,
  useDashboard,
  deployMission,
} from "@/hooks/use-dashboard"
import { useAppContext } from "@/components/providers/app-provider"
import { suggestVolunteers } from "@/lib/allocate"
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import type { Mission, Volunteer } from "@/lib/types"

export default function MissionsPage() {
  const { missions, isLoading, refresh: refreshMissions } = useMissions()
  const { volunteers, refresh: refreshVolunteers } = useVolunteers()
  const { refresh: refreshDashboard } = useDashboard()
  const { queueMissionStatus, role } = useAppContext()

  const [deploying, setDeploying] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(true)
  const [filteredMissions, setFilteredMissions] = useState<Mission[]>([])
  const [suggestMissionId, setSuggestMissionId] = useState<string | null>(null)
  const [suggestedTeam, setSuggestedTeam] = useState<any[]>([])
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createTitle, setCreateTitle] = useState("")
  const [createLocation, setCreateLocation] = useState("")
  const [createPriority, setCreatePriority] = useState<"low" | "medium" | "high" | "critical">("medium")
  const [createDescription, setCreateDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [titleError, setTitleError] = useState("")

  const typedMissions = missions as Mission[]
  const typedVolunteers = volunteers as Volunteer[]

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

  const handleSuggestTeam = (missionId: string) => {
    const mission = typedMissions.find((m) => m.id === missionId)
    if (!mission) return

    console.log("[v0] Volunteers in context:", typedVolunteers)

    const suggestions = suggestVolunteers(typedVolunteers, {
      coordinates: mission.coordinates,
      requiredSkills: [mission.category],
      urgency: mission.urgency,
      volunteersNeeded: mission.volunteers_required,
    })

    console.log("[v0] Suggested team result:", suggestions)

    setSuggestedTeam(suggestions)
    setSuggestMissionId(missionId)
    setDetailId(missionId)
    setDetailOpen(true)
  }

  const getStatusFromMission = (mission: Mission) => {
    if (mission.status === "active") return "ACTIVE" as const
    if (mission.urgency === "critical") return "SYS_AUTH_OK" as const
    if (mission.urgency === "high") return "LOG_PENDING" as const
    return "SCAN_ACTIVE" as const
  }

  const handleAssignVolunteer = async (volunteerId: string, missionId: string) => {
    try {
      const res = await fetch(`/api/volunteers/${volunteerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_mission: missionId,
          availability: "busy",
        }),
      })
      if (res.ok) {
        refreshVolunteers()
        refreshMissions()
      }
    } catch (error) {
      console.error("[v0] Failed to assign volunteer:", error)
    }
  }

  const handleCreateMission = async () => {
    setTitleError("")
    if (!createTitle.trim()) {
      setTitleError("Title is required")
      return
    }

    const { role } = useAppContext()
    const canCreate = role === "commander" || role === "coordinator"
    if (!canCreate) return

    setCreating(true)
    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          mission: {
            title: createTitle,
            location: createLocation,
            category: "other",
            volunteers_required: 3,
            time_estimate: "TBD",
            urgency: createPriority,
            description: createDescription,
          },
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.data) {
          refreshMissions()
          refreshDashboard()
          setCreateModalOpen(false)
          setCreateTitle("")
          setCreateLocation("")
          setCreatePriority("medium")
          setCreateDescription("")
        }
      }
    } catch (error) {
      console.error("[v0] Failed to create mission:", error)
    } finally {
      setCreating(false)
    }
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
          {/* Header with Create Button */}
          <div className="flex items-center justify-between">
            <h1 className="font-mono text-sm font-semibold text-muted-foreground">
              {typedMissions.length} missions
            </h1>
            {role === "commander" || role === "coordinator" ? (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2 bg-[var(--tactical-orange)] text-black font-mono text-xs tracking-wider rounded-sm hover:bg-[var(--tactical-orange)]/90 transition-all"
              >
                NEW_MISSION
              </button>
            ) : null}
          </div>

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
                        {pendingMissions.map((mission, index) => {
                          const isUnassigned = !mission.assigned_volunteers || mission.assigned_volunteers.length === 0
                          return (
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
                              onSelect={() => setSelectedId(mission.id)}
                              onDeploy={() => {
                                queueMissionStatus(mission.id, "active")
                                handleDeploy(mission.id)
                              }}
                              onViewDetails={() => handleViewDetails(mission.id)}
                              isDeploying={deploying === mission.id}
                              isUnassigned={isUnassigned}
                              showSuggestTeam={isUnassigned}
                              onSuggestTeam={() => handleSuggestTeam(mission.id)}
                            />
                          )
                        })}
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

      {/* Create Mission Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setCreateModalOpen(false)}
          />
          <div className="relative bg-card border border-border rounded-sm w-full max-w-md shadow-lg">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h2 className="font-mono text-lg font-bold text-foreground">
                NEW_MISSION
              </h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Title Field */}
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1">
                  TITLE <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => {
                    setCreateTitle(e.target.value)
                    setTitleError("")
                  }}
                  placeholder="Mission title"
                  className="w-full px-3 py-2 border border-border rounded-sm bg-card text-foreground font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--tactical-orange)]"
                />
                {titleError && (
                  <p className="font-mono text-xs text-red-400 mt-1">{titleError}</p>
                )}
              </div>

              {/* Location Field */}
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1">
                  LOCATION
                </label>
                <input
                  type="text"
                  value={createLocation}
                  onChange={(e) => setCreateLocation(e.target.value)}
                  placeholder="Mission location"
                  className="w-full px-3 py-2 border border-border rounded-sm bg-card text-foreground font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--tactical-orange)]"
                />
              </div>

              {/* Priority Dropdown */}
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1">
                  PRIORITY
                </label>
                <select
                  value={createPriority}
                  onChange={(e) => setCreatePriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-border rounded-sm bg-card text-foreground font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--tactical-orange)]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Description Field */}
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1">
                  DESCRIPTION
                </label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Mission description (optional)"
                  className="w-full px-3 py-2 border border-border rounded-sm bg-card text-foreground font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--tactical-orange)] resize-none h-24"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
              <button
                onClick={() => setCreateModalOpen(false)}
                disabled={creating}
                className="px-4 py-2 border border-border font-mono text-xs tracking-wider rounded-sm hover:bg-muted transition-all disabled:opacity-50"
              >
                CANCEL
              </button>
              <button
                onClick={handleCreateMission}
                disabled={creating}
                className="px-4 py-2 bg-[var(--tactical-orange)] text-black font-mono text-xs tracking-wider rounded-sm hover:bg-[var(--tactical-orange)]/90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                CREATE
              </button>
            </div>
          </div>
        </div>
      )}

      <MissionDetailModal
        missionId={detailId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        suggestedTeam={suggestedTeam}
        onAssignVolunteer={handleAssignVolunteer}
      />
    </div>
  )
}
