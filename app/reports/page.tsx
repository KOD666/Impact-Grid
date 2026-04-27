"use client"

import { Sidebar } from "@/components/impact-grid/sidebar"
import { TopNav } from "@/components/impact-grid/top-nav"
import { DeployResponseBar } from "@/components/impact-grid/deploy-response-bar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useDashboard,
  useMissions,
  useVolunteers,
  useReports,
  useLogistics,
  usePredictions,
} from "@/hooks/use-dashboard"
import { Download, FileText, Users, Truck, AlertTriangle, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Mission, Volunteer, Report, LogisticsTask, PredictiveAlert } from "@/lib/types"

export default function ReportsPage() {
  const { data, isLoading: loadingDash } = useDashboard()
  const { missions } = useMissions()
  const { volunteers } = useVolunteers()
  const { reports } = useReports()
  const { tasks } = useLogistics()
  const { alerts } = usePredictions()

  const typedMissions = missions as Mission[]
  const typedVolunteers = volunteers as Volunteer[]
  const typedReports = reports as Report[]
  const typedTasks = tasks as LogisticsTask[]
  const typedAlerts = alerts as PredictiveAlert[]

  const activeMissions = typedMissions.filter((m) => m.status === "active").length
  const completedMissions = typedMissions.filter((m) => m.status === "completed").length
  const pendingMissions = typedMissions.filter((m) => m.status === "pending").length

  const availableVolunteers = typedVolunteers.filter((v) => v.availability === "available").length
  const busyVolunteers = typedVolunteers.filter((v) => v.availability === "busy").length

  const deliveredTasks = typedTasks.filter((t) => t.status === "delivered").length
  const enRouteTasks = typedTasks.filter((t) => t.status === "en_route").length
  const pendingTasks = typedTasks.filter((t) => t.status === "pending").length

  const activeAlerts = typedAlerts.filter((a) => a.status !== "dismissed").length
  const criticalAlerts = typedAlerts.filter((a) => a.severity === "critical").length

  const handlePrint = () => {
    window.print()
  }

  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "medium",
  })

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="lg:ml-56">
        <TopNav activeTab="reports" />

        <div className="p-4 md:p-6 space-y-6 pb-24">
          {/* Action Bar (hidden on print) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
            <div>
              <h1 className="font-mono text-xl font-bold tracking-tight">
                OPERATIONS_REPORT
              </h1>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                Generated {generatedAt}
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--tactical-orange)] text-primary-foreground font-mono text-xs font-semibold tracking-wider rounded-sm hover:brightness-110 transition-all"
            >
              <Download className="w-4 h-4" />
              DOWNLOAD_PDF_REPORT
            </button>
          </div>

          {/* Print-only header */}
          <div className="hidden print:block border-b border-border pb-4 mb-4">
            <h1 className="text-2xl font-bold">IMPACTGRID Operations Report</h1>
            <p className="text-sm text-muted-foreground">Generated {generatedAt}</p>
          </div>

          {loadingDash ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-44 w-full" />
              ))}
            </div>
          ) : (
            <>
              {/* Top stats grid */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryTile
                  label="TOTAL_MISSIONS"
                  value={typedMissions.length}
                  icon={FileText}
                  accent
                />
                <SummaryTile
                  label="VOLUNTEER_ROSTER"
                  value={typedVolunteers.length}
                  icon={Users}
                />
                <SummaryTile
                  label="LOGISTICS_TASKS"
                  value={typedTasks.length}
                  icon={Truck}
                />
                <SummaryTile
                  label="ACTIVE_ALERTS"
                  value={activeAlerts}
                  icon={AlertTriangle}
                  warn={activeAlerts > 0}
                />
              </section>

              {/* Detailed sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReportSection
                  title="MISSION_BREAKDOWN"
                  icon={FileText}
                  rows={[
                    ["Active", activeMissions],
                    ["Pending", pendingMissions],
                    ["Completed", completedMissions],
                    ["Total reports YTD", typedReports.length],
                  ]}
                />

                <ReportSection
                  title="PERSONNEL_SUMMARY"
                  icon={Users}
                  rows={[
                    ["Available", availableVolunteers],
                    ["On mission", busyVolunteers],
                    ["Total roster", typedVolunteers.length],
                    [
                      "Avg. missions completed",
                      typedVolunteers.length
                        ? Math.round(
                            typedVolunteers.reduce(
                              (sum, v) => sum + (v.missions_completed || 0),
                              0,
                            ) / typedVolunteers.length,
                          )
                        : 0,
                    ],
                  ]}
                />

                <ReportSection
                  title="LOGISTICS_SUMMARY"
                  icon={Truck}
                  rows={[
                    ["En route", enRouteTasks],
                    ["Pending dispatch", pendingTasks],
                    ["Delivered", deliveredTasks],
                    ["Total dispatched", typedTasks.length],
                  ]}
                />

                <ReportSection
                  title="ALERTS_SUMMARY"
                  icon={AlertTriangle}
                  warn={criticalAlerts > 0}
                  rows={[
                    ["Critical", criticalAlerts],
                    ["Total active", activeAlerts],
                    [
                      "Total recorded",
                      typedAlerts.length,
                    ],
                  ]}
                />
              </div>

              {/* Deployment Logs */}
              <section className="border border-border rounded-sm bg-card">
                <header className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[var(--tactical-orange)]" />
                    <p className="font-mono text-xs font-semibold">
                      DEPLOYMENT_LOGS
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    LATEST_INTEL_STREAM
                  </span>
                </header>
                <div className="p-3 font-mono text-xs space-y-1 max-h-72 overflow-y-auto">
                  {data?.intel_stream && data.intel_stream.length > 0 ? (
                    data.intel_stream.slice(0, 20).map((entry: { id: string; timestamp: string; payload_type: string; source: string; message: string }) => (
                      <p key={entry.id} className="leading-relaxed">
                        <span className="text-muted-foreground">
                          {entry.timestamp}
                        </span>{" "}
                        <span
                          className={cn(
                            entry.payload_type === "ALERT"
                              ? "text-[var(--tactical-red)]"
                              : entry.payload_type === "WARN"
                                ? "text-[var(--tactical-yellow)]"
                                : "text-[var(--tactical-green)]",
                          )}
                        >
                          [{entry.payload_type}]
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {entry.source}:
                        </span>{" "}
                        <span className="text-foreground">{entry.message}</span>
                      </p>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">
                      No deployment activity recorded yet.
                    </p>
                  )}
                </div>
              </section>

              {/* Active Alerts list */}
              {typedAlerts.length > 0 && (
                <section className="border border-border rounded-sm bg-card">
                  <header className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[var(--tactical-orange)]" />
                      <p className="font-mono text-xs font-semibold">
                        ACTIVE_ALERTS
                      </p>
                    </div>
                  </header>
                  <ul className="divide-y divide-border">
                    {typedAlerts.slice(0, 10).map((alert) => (
                      <li
                        key={alert.id}
                        className="p-3 flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-semibold">
                            {alert.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {alert.description}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-0.5 font-mono text-[9px] tracking-wider rounded-sm uppercase shrink-0",
                            alert.severity === "critical"
                              ? "bg-[var(--tactical-red)]/15 text-[var(--tactical-red)] border border-[var(--tactical-red)]/40"
                              : alert.severity === "high"
                                ? "bg-[var(--tactical-orange)]/15 text-[var(--tactical-orange)] border border-[var(--tactical-orange)]/40"
                                : "bg-muted text-muted-foreground border border-border",
                          )}
                        >
                          {alert.severity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <DeployResponseBar variant="floating" />

      {/* Print stylesheet */}
      <style jsx global>{`
        @media print {
          aside,
          header,
          .print\\:hidden {
            display: none !important;
          }
          main {
            margin-left: 0 !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  )
}

function SummaryTile({
  label,
  value,
  icon: Icon,
  accent,
  warn,
}: {
  label: string
  value: number
  icon: React.ElementType
  accent?: boolean
  warn?: boolean
}) {
  return (
    <div
      className={cn(
        "p-4 border rounded-sm bg-card",
        accent && "border-[var(--tactical-orange)]/30 bg-[var(--tactical-orange)]/5",
        warn && "border-[var(--tactical-red)]/30 bg-[var(--tactical-red)]/5",
        !accent && !warn && "border-border",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon
          className={cn(
            "w-5 h-5",
            accent
              ? "text-[var(--tactical-orange)]"
              : warn
                ? "text-[var(--tactical-red)]"
                : "text-muted-foreground",
          )}
        />
        <span
          className={cn(
            "font-mono text-[10px] tracking-wider",
            accent
              ? "text-[var(--tactical-orange)]"
              : warn
                ? "text-[var(--tactical-red)]"
                : "text-muted-foreground",
          )}
        >
          {label}
        </span>
      </div>
      <p
        className={cn(
          "text-3xl font-mono font-bold",
          accent && "text-[var(--tactical-orange)]",
          warn && "text-[var(--tactical-red)]",
        )}
      >
        {value}
      </p>
    </div>
  )
}

function ReportSection({
  title,
  icon: Icon,
  rows,
  warn,
}: {
  title: string
  icon: React.ElementType
  rows: Array<[string, number | string]>
  warn?: boolean
}) {
  return (
    <section className="border border-border rounded-sm bg-card">
      <header className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
        <Icon
          className={cn(
            "w-4 h-4",
            warn ? "text-[var(--tactical-red)]" : "text-[var(--tactical-orange)]",
          )}
        />
        <p className="font-mono text-xs font-semibold">{title}</p>
      </header>
      <dl className="p-3 font-mono text-xs">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-bold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
