"use client"

import { Sidebar } from "@/components/impact-grid/sidebar"
import { TopNav } from "@/components/impact-grid/top-nav"
import { TacticalMap } from "@/components/impact-grid/tactical-map"
import { PersonnelPanel } from "@/components/impact-grid/personnel-panel"
import { TaskOrderCard } from "@/components/impact-grid/task-order-card"
import { Asterisk } from "lucide-react"
import { useMissions, useVolunteers, useDashboard, deployMission } from "@/hooks/use-dashboard"
import { useState } from "react"

export default function MissionsPage() {
  const { missions, refresh: refreshMissions } = useMissions()
  const { volunteers, refresh: refreshVolunteers } = useVolunteers()
  const { refresh: refreshDashboard } = useDashboard()
  const [deploying, setDeploying] = useState<string | null>(null)

  const pendingMissions = missions.filter((m: { status: string }) => m.status === "pending")
  const activeMissions = missions.filter((m: { status: string }) => m.status === "active")

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

  const getStatusFromMission = (mission: { status: string; urgency: string }) => {
    if (mission.status === "active") return "ACTIVE" as const
    if (mission.urgency === "critical") return "SYS_AUTH_OK" as const
    if (mission.urgency === "high") return "LOG_PENDING" as const
    return "SCAN_ACTIVE" as const
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-56">
        <TopNav activeTab="reports" onReportSubmitted={() => { refreshMissions(); refreshDashboard(); }} />
        
        <div className="p-6 space-y-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Map */}
            <div className="col-span-8">
              <TacticalMap 
                title="SITUATIONAL_AWARENESS // ALPHA_VIEW"
                showCoords={true}
                markers={missions.map((m: { id: string; location: string; coordinates?: { lat: number; lng: number }; urgency: string }) => ({
                  id: m.id,
                  label: m.location,
                  coordinates: m.coordinates,
                  type: m.urgency === "critical" ? "critical" as const : m.urgency === "high" ? "active_mission" as const : "logistics_hub" as const
                }))}
              />
            </div>
            
            {/* Right Column - Personnel */}
            <div className="col-span-4">
              <PersonnelPanel volunteers={volunteers} />
            </div>
          </div>

          {/* Active Missions */}
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

              <div className="grid grid-cols-3 gap-4">
                {activeMissions.slice(0, 3).map((mission: { id: string; title: string; description: string; volunteers_required: number; time_estimate: string; location: string; category: string; urgency: string; status: string }) => (
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
                    isActive={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pending Task Orders Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-mono text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-[var(--tactical-orange)]" />
                  UNASSIGNED TASK ORDERS
                </h2>
                <p className="font-mono text-xs text-muted-foreground mt-1">
                  TACTICAL PRIORITY: HIGH // REQUIRED DEPLOYMENT: {pendingMissions.length.toString().padStart(2, "0")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-border font-mono text-xs tracking-wider rounded-sm hover:bg-muted transition-all">
                  FILTER_ALL
                </button>
                <button className="px-4 py-2 border border-border font-mono text-xs tracking-wider rounded-sm hover:bg-muted transition-all">
                  SORT_PRIORITY
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {pendingMissions.slice(0, 6).map((mission: { id: string; title: string; description: string; volunteers_required: number; time_estimate: string; location: string; category: string; urgency: string; status: string }, index: number) => (
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
                  onDeploy={() => handleDeploy(mission.id)}
                  isDeploying={deploying === mission.id}
                />
              ))}
            </div>
          </div>

          {/* Footer Status Bar */}
          <div className="fixed bottom-0 left-56 right-0 h-10 border-t border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-6">
            <div className="flex items-center gap-6 font-mono text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--tactical-green)] animate-pulse" />
                NETWORK_ACTIVE
              </span>
              <span>ENCRYPTION: <span className="text-foreground">AES-256-HIGH</span></span>
              <span>OPERATORS: <span className="text-foreground">{volunteers.filter((v: { availability: string }) => v.availability === "available").length}_ACTIVE</span></span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[10px]">
              <span className="text-[var(--tactical-orange)]">44.1299 // 21.0922</span>
              <span className="text-muted-foreground">{new Date().toLocaleTimeString("en-US", { hour12: false })} UTC</span>
            </div>
          </div>

          {/* Floating Action Button */}
          <div className="fixed bottom-16 right-6">
            <button className="w-14 h-14 rounded-full bg-[var(--tactical-orange)] text-primary-foreground flex items-center justify-center shadow-lg hover:brightness-110 transition-all">
              <Asterisk className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-[var(--tactical-green)] rounded-sm font-mono text-[8px] font-bold">
                BOT_INIT
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
