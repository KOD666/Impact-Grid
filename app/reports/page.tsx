"use client"

import { useState, useEffect, useRef } from "react"
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
import { Download, FileText, Users, Truck, AlertTriangle, Activity, Send, Loader2, MapPin, Tag, Clock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Mission, Volunteer, Report, LogisticsTask, PredictiveAlert } from "@/lib/types"

interface GeminiSummary {
  executive_summary: string
  key_findings: string[]
  affected_population: string
  immediate_actions_required: string[]
  risk_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  recommended_resources: string[]
  estimated_resolution_time: string
}

interface StoredReport {
  id: string
  text: string
  location: string
  category: string
  urgency: number
  timestamp: string
  summary?: GeminiSummary
}

const categories = [
  "water",
  "medical",
  "food",
  "shelter",
  "infrastructure",
  "security",
  "evacuation",
  "communication",
  "other",
]

export default function ReportsPage() {
  const { data, isLoading: loadingDash } = useDashboard()
  const { missions } = useMissions()
  const { volunteers } = useVolunteers()
  const { reports } = useReports()
  const { tasks } = useLogistics()
  const { alerts } = usePredictions()

  // Form state
  const [reportText, setReportText] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("other")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentSummary, setCurrentSummary] = useState<GeminiSummary | null>(null)
  const [reportHistory, setReportHistory] = useState<StoredReport[]>([])
  
  const analysisRef = useRef<HTMLDivElement>(null)

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

  const activeAlerts = typedAlerts.filter((a) => a.type !== "advisory").length
  const criticalAlerts = typedAlerts.filter((a) => a.type === "critical_event").length

  // Load report history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("impactgrid_reports")
    if (stored) {
      try {
        setReportHistory(JSON.parse(stored))
      } catch {
        // Invalid JSON
      }
    }
  }, [])

  // Save report to history
  const saveReport = (report: StoredReport) => {
    const updated = [report, ...reportHistory].slice(0, 10)
    setReportHistory(updated)
    localStorage.setItem("impactgrid_reports", JSON.stringify(updated))
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!reportText.trim()) return

    setIsAnalyzing(true)
    setCurrentSummary(null)

    try {
      const response = await fetch("/api/reports/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportText,
          category,
          urgency: 50, // Default urgency
          location,
        }),
      })

      const data = await response.json()
      
      if (data.summary) {
        setCurrentSummary(data.summary)
        
        // Save to history
        saveReport({
          id: `report_${Date.now()}`,
          text: reportText,
          location,
          category,
          urgency: data.summary.risk_level === "CRITICAL" ? 90 : 
                   data.summary.risk_level === "HIGH" ? 70 :
                   data.summary.risk_level === "MEDIUM" ? 50 : 30,
          timestamp: new Date().toISOString(),
          summary: data.summary,
        })
      }
    } catch (error) {
      console.error("[v0] Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Load a past report
  const loadReport = (report: StoredReport) => {
    setReportText(report.text)
    setLocation(report.location)
    setCategory(report.category)
    setCurrentSummary(report.summary || null)
  }

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!analysisRef.current || !currentSummary) return

    const html2canvas = (await import("html2canvas")).default
    const { jsPDF } = await import("jspdf")

    try {
      const canvas = await html2canvas(analysisRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      
      // Add header
      pdf.setFontSize(16)
      pdf.setTextColor(255, 107, 0)
      pdf.text("IMPACTGRID — FIELD REPORT ANALYSIS", 20, 20)
      
      pdf.setFontSize(10)
      pdf.setTextColor(150, 150, 150)
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 28)
      
      // Add the captured image
      const imgWidth = 170
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 20, 35, imgWidth, Math.min(imgHeight, 220))
      
      // Add footer
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      pdf.text("Generated by ImpactGrid Crisis Coordination Platform", 20, 285)
      
      // Download
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      pdf.save(`impactgrid-report-${timestamp}.pdf`)
    } catch (error) {
      console.error("[v0] PDF generation error:", error)
    }
  }

  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "medium",
  })

  const riskColors = {
    CRITICAL: "bg-[var(--tactical-red)] text-white",
    HIGH: "bg-[var(--tactical-orange)] text-white",
    MEDIUM: "bg-[var(--tactical-yellow)] text-black",
    LOW: "bg-[var(--tactical-green)] text-white",
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="lg:ml-56">
        <TopNav activeTab="reports" />

        <div className="p-4 md:p-6 space-y-6 pb-24">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="font-mono text-xl font-bold tracking-tight">
                FIELD_REPORT_ANALYSIS
              </h1>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                AI-powered crisis report analysis and summary generation
              </p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT PANEL - Submit Form */}
            <div className="space-y-4">
              <div className="border border-border rounded-sm bg-card">
                <div className="p-3 border-b border-border bg-muted/30">
                  <p className="font-mono text-xs font-semibold flex items-center gap-2">
                    <Send className="w-4 h-4 text-[var(--tactical-orange)]" />
                    SUBMIT_FIELD_REPORT
                  </p>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Report Text */}
                  <div>
                    <label className="block font-mono text-[10px] text-muted-foreground mb-2">
                      REPORT_TEXT
                    </label>
                    <textarea
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="Enter field report details..."
                      rows={6}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-sm font-mono text-xs placeholder:text-muted-foreground focus:outline-none focus:border-[var(--tactical-orange)] resize-none"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block font-mono text-[10px] text-muted-foreground mb-2">
                      LOCATION
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Sector 4-B, Northern District"
                        className="w-full h-9 pl-9 pr-4 bg-muted border border-border rounded-sm font-mono text-xs placeholder:text-muted-foreground focus:outline-none focus:border-[var(--tactical-orange)]"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block font-mono text-[10px] text-muted-foreground mb-2">
                      CATEGORY
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 bg-muted border border-border rounded-sm font-mono text-xs focus:outline-none focus:border-[var(--tactical-orange)] appearance-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isAnalyzing || !reportText.trim()}
                    className="w-full h-10 bg-[var(--tactical-orange)] text-primary-foreground font-mono text-xs font-semibold tracking-wider rounded-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="animate-pulse">ANALYZING_INTEL...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        ANALYZE_REPORT
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Report History */}
              {reportHistory.length > 0 && (
                <div className="border border-border rounded-sm bg-card">
                  <div className="p-3 border-b border-border bg-muted/30">
                    <p className="font-mono text-xs font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[var(--tactical-orange)]" />
                      RECENT_REPORTS ({reportHistory.length})
                    </p>
                  </div>
                  <div className="divide-y divide-border max-h-64 overflow-y-auto">
                    {reportHistory.slice(0, 5).map((report) => (
                      <button
                        key={report.id}
                        type="button"
                        onClick={() => loadReport(report)}
                        className="w-full p-3 text-left hover:bg-muted/30 transition-colors"
                      >
                        <p className="font-mono text-xs font-semibold truncate">
                          {report.text.slice(0, 50)}...
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {new Date(report.timestamp).toLocaleDateString()}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--tactical-orange)]">
                            {report.category.toUpperCase()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PANEL - Analysis Output */}
            <div>
              {currentSummary ? (
                <div ref={analysisRef} className="border border-border rounded-sm bg-card">
                  <div className="p-3 border-b border-border bg-muted/30">
                    <p className="font-mono text-xs font-semibold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[var(--tactical-orange)]" />
                      INTEL_ANALYSIS
                    </p>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {/* Risk Level Badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "px-3 py-1.5 font-mono text-xs font-bold tracking-wider rounded-sm",
                          riskColors[currentSummary.risk_level]
                        )}
                      >
                        RISK_LEVEL: {currentSummary.risk_level}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Executive Summary */}
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2">
                        EXECUTIVE_SUMMARY
                      </p>
                      <p className="font-mono text-xs leading-relaxed">
                        {currentSummary.executive_summary}
                      </p>
                    </div>

                    {/* Key Findings */}
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2">
                        KEY_FINDINGS
                      </p>
                      <ul className="space-y-1.5">
                        {currentSummary.key_findings.map((finding, i) => (
                          <li key={i} className="flex items-start gap-2 font-mono text-xs">
                            <span className="text-[var(--tactical-orange)]">•</span>
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Immediate Actions */}
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2">
                        IMMEDIATE_ACTIONS_REQUIRED
                      </p>
                      <ol className="space-y-1.5">
                        {currentSummary.immediate_actions_required.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 font-mono text-xs">
                            <span className="text-[var(--tactical-orange)] font-bold">{i + 1}.</span>
                            {action}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Two Column Stats */}
                    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-border">
                      <div>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          AFFECTED_POPULATION
                        </p>
                        <p className="font-mono text-sm font-semibold mt-1">
                          {currentSummary.affected_population}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          EST. RESOLUTION TIME
                        </p>
                        <p className="font-mono text-sm font-semibold mt-1">
                          {currentSummary.estimated_resolution_time}
                        </p>
                      </div>
                    </div>

                    {/* Recommended Resources */}
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2">
                        RECOMMENDED_RESOURCES
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {currentSummary.recommended_resources.map((resource, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-[var(--tactical-orange)]/15 text-[var(--tactical-orange)] border border-[var(--tactical-orange)]/30 font-mono text-[10px] rounded-sm"
                          >
                            {resource}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      className="w-full h-10 bg-[var(--tactical-orange)] text-primary-foreground font-mono text-xs font-semibold tracking-wider rounded-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      DOWNLOAD_REPORT
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-border rounded-sm bg-card">
                  <div className="p-3 border-b border-border bg-muted/30">
                    <p className="font-mono text-xs font-semibold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      INTEL_ANALYSIS
                    </p>
                  </div>
                  <div className="p-8 flex flex-col items-center justify-center text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="font-mono text-sm text-muted-foreground">
                      {isAnalyzing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing field report...
                        </span>
                      ) : (
                        "Submit a field report to generate AI analysis"
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Summary (Print Ready) */}
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
            </>
          )}
        </div>
      </main>

      <DeployResponseBar variant="floating" />
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
