"use client"

import { Sidebar } from "@/components/impact-grid/sidebar"
import { TopNav } from "@/components/impact-grid/top-nav"
import useSWR from "swr"
import type { Mission, Volunteer, PredictiveAlert, DeploymentLog } from "@/lib/types"
import {
  Target,
  Activity,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// KPI Card component
function KPICard({
  label,
  value,
  unit,
  icon: Icon,
  variant = "default",
}: {
  label: string
  value: string | number
  unit?: string
  icon: React.ElementType
  variant?: "default" | "accent" | "success" | "warning"
}) {
  return (
    <div
      className={cn(
        "relative p-4 border border-border rounded-sm bg-card overflow-hidden",
        variant === "accent" && "border-[var(--tactical-orange)]/30 bg-[var(--tactical-orange)]/5",
        variant === "success" && "border-[var(--tactical-green)]/30 bg-[var(--tactical-green)]/5",
        variant === "warning" && "border-[var(--tactical-yellow)]/30 bg-[var(--tactical-yellow)]/5"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
          {label}
        </p>
        <Icon
          className={cn(
            "w-4 h-4",
            variant === "accent" ? "text-[var(--tactical-orange)]" : 
            variant === "success" ? "text-[var(--tactical-green)]" :
            variant === "warning" ? "text-[var(--tactical-yellow)]" :
            "text-muted-foreground"
          )}
        />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-3xl font-mono font-bold tracking-tight",
            variant === "accent" && "text-[var(--tactical-orange)]",
            variant === "success" && "text-[var(--tactical-green)]",
            variant === "warning" && "text-[var(--tactical-yellow)]"
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm font-mono text-muted-foreground">{unit}</span>
        )}
      </div>
      {variant === "accent" && (
        <div className="absolute top-0 right-0 w-6 h-6">
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--tactical-orange)]" />
        </div>
      )}
    </div>
  )
}

// Chart card wrapper
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-sm bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--tactical-yellow)",
  active: "var(--tactical-green)",
  completed: "var(--tactical-blue, #3b82f6)",
  cancelled: "var(--tactical-red, #ef4444)",
}

const AVAILABILITY_COLORS: Record<string, string> = {
  available: "var(--tactical-green)",
  busy: "var(--tactical-orange)",
  offline: "var(--muted-foreground)",
}

export default function AnalyticsPage() {
  const { data: missionsRes } = useSWR<{ success: boolean; data: Mission[] }>("/api/missions", fetcher, { refreshInterval: 10000 })
  const { data: volunteersRes } = useSWR<{ success: boolean; data: Volunteer[] }>("/api/volunteers", fetcher, { refreshInterval: 10000 })
  const { data: deploymentsRes } = useSWR<{ success: boolean; data: DeploymentLog[] }>("/api/deploy", fetcher, { refreshInterval: 10000 })
  const { data: alertsRes } = useSWR<{ success: boolean; data: PredictiveAlert[] }>("/api/alerts", fetcher, { refreshInterval: 10000 })

  const missions = missionsRes?.data ?? []
  const volunteers = volunteersRes?.data ?? []
  const deployments = deploymentsRes?.data ?? []
  const alerts = alertsRes?.data ?? []

  // KPI computations
  const totalMissions = missions.length
  const activeMissions = missions.filter((m) => m.status === "active").length
  const busyVolunteers = volunteers.filter((v) => v.availability === "busy").length

  // Average response time: time from created_at to when first volunteer was assigned
  // For now, we compute from missions that have assigned_volunteers
  const assignedMissions = missions.filter(
    (m) => m.assigned_volunteers && m.assigned_volunteers.length > 0
  )
  let avgResponseHours = "—"
  if (assignedMissions.length > 0) {
    // Estimate: 2h average for demo purposes since we don't have assignment timestamps
    // In production, we'd store assignment_time on each mission
    const totalHours = assignedMissions.reduce((acc, m) => {
      const created = new Date(m.created_at).getTime()
      const now = Date.now()
      const diffHours = (now - created) / (1000 * 60 * 60)
      return acc + Math.min(diffHours, 24) // cap at 24h
    }, 0)
    avgResponseHours = (totalHours / assignedMissions.length).toFixed(1)
  }

  // Mission status breakdown for pie/donut chart
  const statusCounts: Record<string, number> = { pending: 0, active: 0, completed: 0, cancelled: 0 }
  missions.forEach((m) => {
    if (statusCounts[m.status] !== undefined) {
      statusCounts[m.status]++
    }
  })
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
    fill: STATUS_COLORS[name] || "#888",
  }))

  // Volunteer availability breakdown
  const availabilityCounts: Record<string, number> = { available: 0, busy: 0, offline: 0 }
  volunteers.forEach((v) => {
    if (availabilityCounts[v.availability] !== undefined) {
      availabilityCounts[v.availability]++
    }
  })
  const availabilityData = Object.entries(availabilityCounts).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
    fill: AVAILABILITY_COLORS[name] || "#888",
  }))

  // Top skills chart
  const skillCounts: Record<string, number> = {}
  volunteers.forEach((v) => {
    (v.skills || []).forEach((skill) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1
    })
  })
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill: skill.toUpperCase(), count }))

  // Alerts summary by type
  const alertTypeCounts: Record<string, number> = { critical_event: 0, logistics_alert: 0, advisory: 0 }
  alerts.forEach((a) => {
    if (alertTypeCounts[a.type] !== undefined) {
      alertTypeCounts[a.type]++
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-0 lg:ml-56">
        <TopNav activeTab="analytics" />

        <div className="p-4 lg:p-6 space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="TOTAL_MISSIONS"
              value={totalMissions}
              icon={Target}
              variant="default"
            />
            <KPICard
              label="ACTIVE_MISSIONS"
              value={activeMissions}
              icon={Activity}
              variant="accent"
            />
            <KPICard
              label="VOLUNTEERS_DEPLOYED"
              value={busyVolunteers}
              icon={Users}
              variant="success"
            />
            <KPICard
              label="AVG_RESPONSE_TIME"
              value={avgResponseHours}
              unit="HRS"
              icon={Clock}
              variant="warning"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mission Status Breakdown - Donut Chart */}
            <ChartCard title="MISSION_STATUS_BREAKDOWN">
              {missions.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground font-mono text-xs">
                  NO_MISSION_DATA
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "11px",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontFamily: "monospace", fontSize: "10px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Volunteer Availability */}
            <ChartCard title="VOLUNTEER_AVAILABILITY">
              {volunteers.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground font-mono text-xs">
                  NO_VOLUNTEER_DATA
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={availabilityData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10, fontFamily: "monospace" }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {availabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Top Skills */}
            <ChartCard title="TOP_VOLUNTEER_SKILLS">
              {topSkills.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground font-mono text-xs">
                  NO_SKILL_DATA
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topSkills} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                    <YAxis
                      type="category"
                      dataKey="skill"
                      tick={{ fontSize: 9, fontFamily: "monospace" }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="count" fill="var(--tactical-orange)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Alerts Summary */}
            <ChartCard title="ALERTS_SUMMARY">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[var(--tactical-red)]/10 border border-[var(--tactical-red)]/30 rounded-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[var(--tactical-red)]" />
                    <span className="font-mono text-xs">CRITICAL_EVENTS</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-[var(--tactical-red)]">
                    {alertTypeCounts.critical_event}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--tactical-yellow)]/10 border border-[var(--tactical-yellow)]/30 rounded-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[var(--tactical-yellow)]" />
                    <span className="font-mono text-xs">LOGISTICS_ALERTS</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-[var(--tactical-yellow)]">
                    {alertTypeCounts.logistics_alert}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-xs">ADVISORIES</span>
                  </div>
                  <span className="font-mono text-lg font-bold">
                    {alertTypeCounts.advisory}
                  </span>
                </div>
                <p className="text-center font-mono text-[10px] text-muted-foreground pt-2">
                  {alerts.length} TOTAL_OPEN_ALERTS
                </p>
              </div>
            </ChartCard>
          </div>

          {/* Deployment History Timeline */}
          <ChartCard title="DEPLOYMENT_HISTORY">
            {deployments.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-muted-foreground font-mono text-xs gap-2">
                <Clock className="w-6 h-6" />
                <span>NO_DEPLOYMENTS_YET</span>
                <span className="text-[10px]">Deployments will appear here after you deploy changes</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {deployments.slice(0, 10).map((dep, index) => (
                  <div key={dep.id} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[var(--tactical-orange)] border-2 border-background" />
                      {index < deployments.length - 1 && (
                        <div className="w-px flex-1 bg-border min-h-[40px]" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-xs text-foreground">{dep.summary}</p>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {new Date(dep.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-2 font-mono text-[10px] text-muted-foreground">
                        <span>MSN: {dep.changes.missions_updated}</span>
                        <span>VOL: {dep.changes.volunteers_updated}</span>
                        <span>LOG: {dep.changes.logistics_updated}</span>
                        <span>ALT: {dep.changes.alerts_generated}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      </main>
    </div>
  )
}
