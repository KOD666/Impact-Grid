"use client"

import { Bell, Settings, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReportSubmissionDialog } from "./report-submission-dialog"

interface TopNavProps {
  activeTab?: "reports" | "analytics" | "field_logs"
  onReportSubmitted?: () => void
}

export function TopNav({ activeTab = "reports", onReportSubmitted }: TopNavProps) {
  const tabs = [
    { id: "reports", label: "REPORTS" },
    { id: "analytics", label: "ANALYTICS" },
    { id: "field_logs", label: "FIELD_LOGS" },
  ] as const

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-6">
      {/* Left: Terminal ID & Tabs */}
      <div className="flex items-center gap-6">
        <div className="font-mono text-xs">
          <p className="text-muted-foreground">
            STATUS: <span className="text-[var(--tactical-green)]">NOMINAL</span>
          </p>
          <p className="text-foreground font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[var(--tactical-orange)]" />
            CRISIS_CONTROL_v1.0
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 ml-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "px-4 py-1.5 font-mono text-xs tracking-wider rounded-sm transition-all",
                activeTab === tab.id
                  ? "bg-[var(--tactical-orange)] text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Search & Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="SEARCH_INTEL_INDEX..."
            className="w-64 h-9 pl-9 pr-4 bg-muted border border-border rounded-sm font-mono text-xs placeholder:text-muted-foreground focus:outline-none focus:border-[var(--tactical-orange)] transition-colors"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--tactical-red)]" />
        </button>

        {/* Settings */}
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        {/* New Report */}
        <ReportSubmissionDialog onReportSubmitted={onReportSubmitted} />
      </div>
    </header>
  )
}
