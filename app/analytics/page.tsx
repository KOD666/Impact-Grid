"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/impact-grid/sidebar"
import { TopNav } from "@/components/impact-grid/top-nav"
import { useMissions, useVolunteers, usePredictions } from "@/hooks/use-dashboard"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import {
  Target,
  Zap,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Activity,
} from "lucide-react"
import type { Mission, Volunteer, PredictiveAlert } from "@/lib/types"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Status colors matching the design system
const STATUS_COLORS: Record<string, string> = {
  pending: "var(--tactical-yellow)",
  active: "var(--tactical-blue)",
  completed: "var(--tactical-green)",
  cancelled: "var(--tactical-red)",
  failed: "var(--tactical-red)",
}

const AVAILABILITY_COLORS: Record<string, string> = {
  available: "var(--tactical-green)",
  busy: "var(--tactical-orange)",
  offline: "#6b7280",
}

export default function AnalyticsPage() {
  const { missions, isLoading: missionsLoading } = useMissions()
  const { volunteers, isLoading: volunteersLoading } = useVolunteers()
  const { alerts, isLoading: alertsLoading } = usePredictions()
  const { data: deployData } = useSWR("/api/deploy", fetcher, { refreshInterval: 10000 })

  const typedMissions = missions as Mission[]
  const typedVolunteers = volunteers as Volunteer[]
  const typedAlerts = alerts as PredictiveAlert[]
  const deployments = deployData?.data || []

  // Compute KPI stats
  const kpiStats = useMemo(() => {
    const totalMissions = typedMissions.length
    const activeMissions = typedMissions.filter((m) => m.status === "active").length
    const busyVolunteers = typedVolunteers.filter((v) => v.availability === "busy").length

    // Avg response time: missions with assigned volunteers - time from creation to first assignment
    // Since we don't track assignment time, we'll show "—" for now or compute based on active missions
    const avgResponseTime = "—"

    return {
      totalMissions,
      activeMissions,
      busyVolunteers,
      avgResponseTime,
    }
  }, [typedMissions, typedVolunteers])

  // Mission status breakdown for chart
  const missionStatusData = useMemo(() => {
    const counts: Record<string, number> = { pending: 0, active: 0, completed: 0, cancelled: 0 }
    typedMissions.forEach((m) => {
      if (counts[m.status] !== undefined) counts[m.status]++
    })
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: status.toUpperCase(),
        value: count,
        color: STATUS_COLORS[status] || "#6b7280",
      }))
  }, [typedMissions])

  // Volunteer availability data
  const volunteerAvailabilityData = useMemo(() => {
    const counts: Record<string, number> = { available: 0, busy: 0, offline: 0 }
    typedVolunteers.forEach((v) => {
      if (counts[v.availability] !== undefined) counts[v.availability]++
    })
    return Object.entries(counts).map(([status, count]) => ({
      name: status.toUpperCase(),
      value: count,
      color: AVAILABILITY_COLORS[status] || "#6b7280",
    }))
  }, [typedVolunteers])

  // Top skills chart data
  const topSkillsData = useMemo(() => {
    const skillCounts: Record<string, number> = {}
    typedVolunteers.forEach((v) => {
      v.skills.forEach((skill) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1
      })
    })
    return Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({
        name: skill.toUpperCase(),
        count,
      }))
  }, [typedVolunteers])

  // Alerts by type
  const alertsSummary = useMemo(() => {
    const counts: Record<string, number> = { critical_event: 0, logistics_alert: 0, advisory: 0 }
    typedAlerts.forEach((a) => {
      if (counts[a.type] !== undefined) counts[a.type]++
    })
    return {
      critical: counts.critical_event,
      logistics: counts.logistics_alert,
      advisory: counts.advisory,
      total: typedAlerts.length,
    }
  }, [typedAlerts])

  const isLoading = missionsLoading || volunteersLoading || alertsLoading

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="lg:ml-56">
        <TopNav activeTab="analytics" />

        <div className="p-4 md:p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-xl font-bold tracking-tight">ANALYTICS_DASHBOARD</h1>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                OPERATIONAL METRICS // REAL-TIME DATA
              </p>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-mono text-xs">SYNCING...</span>
              </div>
            )}
          </div>

          {/* KPI Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="TOTAL_MISSIONS"
              value={kpiStats.totalMissions}
              icon={Target}
              subLabel="ALL TIME"
            />
            <KPICard
              label="ACTIVE_MISSIONS"
              value={kpiStats.activeMissions}
              icon={Zap}
              variant="accent"
              subLabel="CURRENTLY RUNNING"
            />
            <KPICard
              label="VOLUNTEERS_DEPLOYED"
              value={kpiStats.busyVolunteers}
              icon={Users}
              subLabel="CURRENTLY BUSY"
            />
            <KPICard
              label="AVG_RESPONSE_TIME"
              value={kpiStats.avgResponseTime}
              icon={Clock}
              unit={kpiStats.avgResponseTime !== "—" ? "HRS" : undefined}
              subLabel="CREATION TO ASSIGNMENT"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mission Status Breakdown */}
            <div className="border border-border rounded-sm bg-card p-4">
              <h2 className="font-mono text-xs font-bold text-muted-foreground mb-4 tracking-wider">
                MISSION_STATUS_BREAKDOWN
              </h2>
              {missionStatusData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={missionStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {missionStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a1a",
                          border: "1px solid #333",
                          borderRadius: "2px",
                          fontFamily: "monospace",
                          fontSize: "11px",
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontFamily: "monospace", fontSize: "10px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground font-mono text-xs">
                  NO MISSION DATA
                </div>
              )}
            </div>

            {/* Volunteer Availability */}
            <div className="border border-border rounded-sm bg-card p-4">
              <h2 className="font-mono text-xs font-bold text-muted-foreground mb-4 tracking-wider">
                VOLUNTEER_AVAILABILITY
              </h2>
              {volunteerAvailabilityData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volunteerAvailabilityData} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 10, fontFamily: "monospace" }}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a1a",
                          border: "1px solid #333",
                          borderRadius: "2px",
                          fontFamily: "monospace",
                          fontSize: "11px",
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                        {volunteerAvailabilityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground font-mono text-xs">
                  NO VOLUNTEER DATA
                </div>
              )}
            </div>

            {/* Top Skills Chart */}
            <div className="border border-border rounded-sm bg-card p-4">
              <h2 className="font-mono text-xs font-bold text-muted-foreground mb-4 tracking-wider">
                TOP_SKILLS_DISTRIBUTION
              </h2>
              {topSkillsData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSkillsData} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 9, fontFamily: "monospace" }}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a1a",
                          border: "1px solid #333",
                          borderRadius: "2px",
                          fontFamily: "monospace",
                          fontSize: "11px",
                        }}
                      />
                      <Bar dataKey="count" fill="var(--tactical-orange)" radius={[0, 2, 2, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground font-mono text-xs">
                  NO SKILL DATA
                </div>
              )}
            </div>

            {/* Alerts Summary */}
            <div className="border border-border rounded-sm bg-card p-4">
              <h2 className="font-mono text-xs font-bold text-muted-foreground mb-4 tracking-wider">
                ALERTS_SUMMARY
              </h2>
              <div className="space-y-3">
                <AlertSummaryRow
                  label="CRITICAL_EVENTS"
                  count={alertsSummary.critical}
                  color="var(--tactical-red)"
                  icon={AlertTriangle}
                />
                <AlertSummaryRow
                  label="LOGISTICS_ALERTS"
                  count={alertsSummary.logistics}
                  color="var(--tactical-yellow)"
                  icon={Activity}
                />
                <AlertSummaryRow
                  label="ADVISORIES"
                  count={alertsSummary.advisory}
                  color="var(--tactical-blue)"
                  icon={CheckCircle2}
                />
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">TOTAL_OPEN_ALERTS</span>
                    <span className="font-mono text-lg font-bold text-[var(--tactical-orange)]">
                      {alertsSummary.total}
                    </span>
                  </div>
                </div>
                <Link
                  href="/"
                  className="block w-full mt-4 px-4 py-2 text-center font-mono text-xs border border-[var(--tactical-orange)] text-[var(--tactical-orange)] hover:bg-[var(--tactical-orange)]/10 rounded-sm transition-colors"
                >
                  VIEW_IN_DASHBOARD
                </Link>
              </div>
            </div>
          </div>

          {/* Deployment History Timeline */}
          <div className="border border-border rounded-sm bg-card p-4">
            <h2 className="font-mono text-xs font-bold text-muted-foreground mb-4 tracking-wider">
              DEPLOYMENT_HISTORY_TIMELINE
            </h2>
            {deployments.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {deployments.slice(0, 10).map(
                  (log: {
                    id: string
                    timestamp: string
                    summary: string
                    changes: {
                      missions_updated: number
                      volunteers_updated: number
                      logistics_updated: number
                      alerts_generated: number
                    }
                  }) => (
                    <div key={log.id} className="flex gap-4 items-start">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-[var(--tactical-orange)] shrink-0" />
                        <div className="w-px h-full bg-border min-h-[40px]" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="font-mono text-[9px] px-1.5 py-0.5 bg-muted rounded">
                            {log.id}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-foreground">{log.summary}</p>
                        <div className="flex gap-3 mt-2">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            <span className="text-[var(--tactical-blue)]">
                              {log.changes.missions_updated}
                            </span>{" "}
                            missions
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            <span className="text-[var(--tactical-green)]">
                              {log.changes.volunteers_updated}
                            </span>{" "}
                            volunteers
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            <span className="text-[var(--tactical-yellow)]">
                              {log.changes.logistics_updated}
                            </span>{" "}
                            logistics
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground font-mono text-xs">
                NO DEPLOYMENT LOGS RECORDED
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// KPI Card Component
function KPICard({
  label,
  value,
  unit,
  icon: Icon,
  subLabel,
  variant = "default",
}: {
  label: string
  value: string | number
  unit?: string
  icon: React.ElementType
  subLabel?: string
  variant?: "default" | "accent"
}) {
  return (
    <div
      className={`relative p-4 border rounded-sm bg-card overflow-hidden ${
        variant === "accent"
          ? "border-[var(--tactical-orange)]/30 bg-[var(--tactical-orange)]/5"
          : "border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
          {label}
        </p>
        <Icon
          className={`w-4 h-4 ${
            variant === "accent" ? "text-[var(--tactical-orange)]" : "text-muted-foreground"
          }`}
        />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-3xl font-mono font-bold tracking-tight ${
            variant === "accent" ? "text-[var(--tactical-orange)]" : ""
          }`}
        >
          {value}
        </span>
        {unit && <span className="text-sm font-mono text-muted-foreground">{unit}</span>}
      </div>
      {subLabel && (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--tactical-green)]" />
          {subLabel}
        </p>
      )}
      {variant === "accent" && (
        <div className="absolute top-0 right-0 w-6 h-6">
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--tactical-orange)]" />
        </div>
      )}
    </div>
  )
}

// Alert Summary Row Component
function AlertSummaryRow({
  label,
  count,
  color,
  icon: Icon,
}: {
  label: string
  count: number
  color: string
  icon: React.ElementType
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-sm hover:bg-muted/20 transition-colors">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-sm flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="font-mono text-xs">{label}</span>
      </div>
      <span className="font-mono text-lg font-bold" style={{ color }}>
        {count}
      </span>
    </div>
  )
}
