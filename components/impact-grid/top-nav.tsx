"use client"

import Link from "next/link"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
import { Bell, Settings, Search, X, Check, Layers, Pause, Play, Tag, Download, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReportSubmissionDialog } from "./report-submission-dialog"
import { usePredictions } from "@/hooks/use-dashboard"
import { useAppContext, type AppRole } from "@/components/providers/app-provider"
import type { PredictiveAlert } from "@/lib/types"

interface TopNavProps {
  activeTab?: "reports" | "analytics" | "field_logs"
  onReportSubmitted?: () => void
  intelStream?: Array<{
    id: string
    timestamp: string
    source: string
    payload_type: string
    message: string
    payload?: string
  }>
  onIntelFilter?: (filtered: Array<{
    id: string
    timestamp: string
    source: string
    payload_type: string
    message: string
    payload?: string
  }> | null, query: string) => void
}

// Settings stored in localStorage
interface DashboardSettings {
  mapLayerDensity: "all" | "critical"
  intelStreamLive: boolean
  markerLabels: boolean
}

const DEFAULT_SETTINGS: DashboardSettings = {
  mapLayerDensity: "all",
  intelStreamLive: true,
  markerLabels: true,
}

const ROLE_STYLES: Record<AppRole, { label: string; badge: string }> = {
  commander: {
    label: "Commander",
    badge: "bg-blue-600/20 text-blue-400 border border-blue-500/30",
  },
  coordinator: {
    label: "Coordinator",
    badge: "bg-amber-600/20 text-amber-400 border border-amber-500/30",
  },
  volunteer: {
    label: "Volunteer",
    badge: "bg-gray-600/20 text-gray-400 border border-gray-500/30",
  },
}

export function TopNav({ activeTab = "reports", onReportSubmitted, intelStream, onIntelFilter }: TopNavProps) {
  const { role, setRole } = useAppContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<number | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS)
  const [mounted, setMounted] = useState(false)

  // Separate refs for buttons and portal content
  const notifBtnRef = useRef<HTMLButtonElement>(null)
  const notifDrawerRef = useRef<HTMLDivElement>(null)
  const settingsBtnRef = useRef<HTMLButtonElement>(null)
  const settingsDropRef = useRef<HTMLDivElement>(null)
  const roleBtnRef = useRef<HTMLButtonElement>(null)
  const roleDropRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Dropdown positions (for portal-fixed positioning)
  const [settingsPos, setSettingsPos] = useState<{ top: number; right: number } | null>(null)
  const [rolePos, setRolePos] = useState<{ top: number; left: number } | null>(null)

  const { alerts } = usePredictions()
  const typedAlerts = alerts as PredictiveAlert[]

  // Mount guard for portals (SSR safety)
  useEffect(() => { setMounted(true) }, [])

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("impactgrid_settings")
    if (stored) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) })
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, [])

  // Save settings to localStorage
  const updateSetting = useCallback(<K extends keyof DashboardSettings>(key: K, value: DashboardSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      localStorage.setItem("impactgrid_settings", JSON.stringify(next))
      return next
    })
  }, [])

  // Debounced search for intel stream
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!intelStream || !onIntelFilter) return
      if (!searchQuery.trim()) {
        onIntelFilter(null, "")
        setSearchResults(null)
        return
      }
      const q = searchQuery.toLowerCase()
      const filtered = intelStream.filter(entry => {
        const payload = entry.payload || entry.message || ""
        return (
          payload.toLowerCase().includes(q) ||
          entry.source.toLowerCase().includes(q)
        )
      })
      onIntelFilter(filtered, searchQuery)
      setSearchResults(filtered.length)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, intelStream, onIntelFilter])

  // Handle Escape key for search
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchQuery("")
      setSearchResults(null)
      onIntelFilter?.(null, "")
      searchInputRef.current?.blur()
    }
  }, [onIntelFilter])

  // Close dropdowns on outside click or Escape — portal-aware
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        notifBtnRef.current && !notifBtnRef.current.contains(target) &&
        notifDrawerRef.current && !notifDrawerRef.current.contains(target)
      ) {
        setNotificationsOpen(false)
      }
      if (
        settingsBtnRef.current && !settingsBtnRef.current.contains(target) &&
        settingsDropRef.current && !settingsDropRef.current.contains(target)
      ) {
        setSettingsOpen(false)
      }
      if (
        roleBtnRef.current && !roleBtnRef.current.contains(target) &&
        roleDropRef.current && !roleDropRef.current.contains(target)
      ) {
        setRoleSwitcherOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSettingsOpen(false)
        setNotificationsOpen(false)
        setRoleSwitcherOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  // Mark as read when notifications open
  useEffect(() => {
    if (notificationsOpen) setHasUnread(false)
  }, [notificationsOpen])

  const handleExport = useCallback(() => {
    window.location.href = "/reports"
  }, [])

  const openSettings = useCallback(() => {
    const rect = settingsBtnRef.current?.getBoundingClientRect()
    if (rect) {
      setSettingsPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    setSettingsOpen(v => !v)
  }, [])

  const openRoleSwitcher = useCallback(() => {
    const rect = roleBtnRef.current?.getBoundingClientRect()
    if (rect) {
      setRolePos({ top: rect.bottom + 4, left: rect.left })
    }
    setRoleSwitcherOpen(v => !v)
  }, [])

  const tabs = [
    { id: "reports", label: "REPORTS", href: "/reports" },
    { id: "analytics", label: "ANALYTICS", href: "/analytics" },
  ] as const

  const currentRoleStyle = ROLE_STYLES[role]

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
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "px-4 py-1.5 font-mono text-xs tracking-wider rounded-sm transition-all",
                activeTab === tab.id
                  ? "bg-[var(--tactical-orange)] text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right: Search & Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="SEARCH_INTEL_INDEX..."
            className="w-56 h-9 pl-9 pr-20 bg-muted border border-border rounded-sm font-mono text-xs placeholder:text-muted-foreground focus:outline-none focus:border-[var(--tactical-orange)] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setSearchResults(null)
                onIntelFilter?.(null, "")
              }}
              className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          {searchResults !== null && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-[var(--tactical-orange)]/20 text-[var(--tactical-orange)] font-mono text-[9px] rounded">
              {searchResults}
            </span>
          )}
        </div>

        {/* Role Switcher */}
        <button
          ref={roleBtnRef}
          type="button"
          onClick={openRoleSwitcher}
          aria-haspopup="listbox"
          aria-expanded={roleSwitcherOpen}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-mono text-[10px] font-semibold tracking-wider transition-colors",
            currentRoleStyle.badge,
          )}
        >
          {currentRoleStyle.label.toUpperCase()}
          <ChevronDown className={cn("w-3 h-3 transition-transform", roleSwitcherOpen && "rotate-180")} />
        </button>

        {/* Notifications */}
        <button
          ref={notifBtnRef}
          type="button"
          onClick={() => setNotificationsOpen(v => !v)}
          className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {hasUnread && typedAlerts.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--tactical-red)]" />
          )}
        </button>

        {/* Settings */}
        <button
          ref={settingsBtnRef}
          type="button"
          onClick={openSettings}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* New Report */}
        <ReportSubmissionDialog onReportSubmitted={onReportSubmitted} />
      </div>

      {/* ── Portals ── rendered at document.body to escape backdrop-filter stacking context */}

      {/* Role Switcher Dropdown Portal */}
      {mounted && roleSwitcherOpen && rolePos && createPortal(
        <div
          ref={roleDropRef}
          style={{ position: "fixed", top: rolePos.top, left: rolePos.left, zIndex: 9999 }}
          className="w-44 bg-[#1a1a1a] border border-[#333] rounded-sm shadow-xl"
          role="listbox"
          aria-label="Select role"
        >
          {(["commander", "coordinator", "volunteer"] as AppRole[]).map((r) => {
            const s = ROLE_STYLES[r]
            return (
              <button
                key={r}
                type="button"
                role="option"
                aria-selected={role === r}
                onClick={() => {
                  setRole(r)
                  setRoleSwitcherOpen(false)
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/20 transition-colors",
                  role === r && "bg-muted/20"
                )}
              >
                <span className={cn("font-mono text-[10px] font-semibold px-2 py-0.5 rounded-sm", s.badge)}>
                  {s.label.toUpperCase()}
                </span>
                {role === r && <Check className="w-3 h-3 text-[var(--tactical-orange)]" />}
              </button>
            )
          })}
        </div>,
        document.body
      )}

      {/* Notifications Drawer Portal */}
      {mounted && createPortal(
        <div
          ref={notifDrawerRef}
          style={{ zIndex: 9999 }}
          className={cn(
            "fixed top-0 right-0 h-screen w-80 bg-[#1a1a1a] border-l border-[#333] transform transition-transform duration-300 ease-out",
            notificationsOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-[#333]">
            <h3 className="font-mono text-sm font-bold">ALERTS</h3>
            <button
              type="button"
              onClick={() => setNotificationsOpen(false)}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 border-b border-[#333]">
            <button
              type="button"
              className="w-full px-3 py-2 text-center font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-sm transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-120px)]">
            {typedAlerts.length === 0 ? (
              <p className="p-4 font-mono text-xs text-muted-foreground text-center">
                No active alerts
              </p>
            ) : (
              <div className="divide-y divide-[#333]">
                {typedAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-sm flex items-center justify-center shrink-0",
                        alert.type === "critical_event" ? "bg-[var(--tactical-red)]/20" :
                        alert.type === "logistics_alert" ? "bg-[var(--tactical-yellow)]/20" :
                        "bg-[var(--tactical-blue)]/20"
                      )}>
                        <Bell className={cn(
                          "w-4 h-4",
                          alert.type === "critical_event" ? "text-[var(--tactical-red)]" :
                          alert.type === "logistics_alert" ? "text-[var(--tactical-yellow)]" :
                          "text-[var(--tactical-blue)]"
                        )} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs font-semibold truncate">{alert.title}</p>
                        <p className="font-mono text-[10px] text-muted-foreground mt-1">
                          {alert.time_to_event || alert.triggered_at}
                        </p>
                        {alert.confidence && (
                          <p className="font-mono text-[10px] text-[var(--tactical-orange)] mt-1">
                            {alert.confidence}% confidence
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Settings Dropdown Portal */}
      {mounted && settingsOpen && settingsPos && createPortal(
        <div
          ref={settingsDropRef}
          style={{
            position: "fixed",
            top: settingsPos.top,
            right: settingsPos.right,
            zIndex: 9999,
          }}
          className="w-64 bg-[#1a1a1a] border border-[#333] rounded-sm shadow-xl"
        >
          <div className="p-2">
            {/* Map Layer Density */}
            <div className="flex items-center justify-between p-2 hover:bg-muted/20 rounded-sm">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-xs">Map Layer Density</span>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => updateSetting("mapLayerDensity", "all")}
                  className={cn(
                    "px-2 py-0.5 font-mono text-[10px] rounded-sm transition-colors",
                    settings.mapLayerDensity === "all"
                      ? "bg-[var(--tactical-orange)] text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting("mapLayerDensity", "critical")}
                  className={cn(
                    "px-2 py-0.5 font-mono text-[10px] rounded-sm transition-colors",
                    settings.mapLayerDensity === "critical"
                      ? "bg-[var(--tactical-orange)] text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  Critical
                </button>
              </div>
            </div>

            {/* Intel Stream */}
            <div className="flex items-center justify-between p-2 hover:bg-muted/20 rounded-sm">
              <div className="flex items-center gap-2">
                {settings.intelStreamLive ? (
                  <Play className="w-4 h-4 text-[var(--tactical-green)]" />
                ) : (
                  <Pause className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="font-mono text-xs">Intel Stream</span>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => updateSetting("intelStreamLive", true)}
                  className={cn(
                    "px-2 py-0.5 font-mono text-[10px] rounded-sm transition-colors",
                    settings.intelStreamLive
                      ? "bg-[var(--tactical-green)] text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  Live
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting("intelStreamLive", false)}
                  className={cn(
                    "px-2 py-0.5 font-mono text-[10px] rounded-sm transition-colors",
                    !settings.intelStreamLive
                      ? "bg-[var(--tactical-yellow)] text-black"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  Paused
                </button>
              </div>
            </div>

            {/* Marker Labels */}
            <div className="flex items-center justify-between p-2 hover:bg-muted/20 rounded-sm">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-xs">Marker Labels</span>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => updateSetting("markerLabels", true)}
                  className={cn(
                    "px-2 py-0.5 font-mono text-[10px] rounded-sm transition-colors",
                    settings.markerLabels
                      ? "bg-[var(--tactical-orange)] text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  On
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting("markerLabels", false)}
                  className={cn(
                    "px-2 py-0.5 font-mono text-[10px] rounded-sm transition-colors",
                    !settings.markerLabels
                      ? "bg-[var(--tactical-orange)] text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  Off
                </button>
              </div>
            </div>

            {/* Separator */}
            <div className="my-2 border-t border-[#333]" />

            {/* Export Data */}
            <button
              type="button"
              onClick={handleExport}
              className="w-full flex items-center gap-2 p-2 hover:bg-muted/20 rounded-sm transition-colors"
            >
              <Download className="w-4 h-4 text-[var(--tactical-orange)]" />
              <span className="font-mono text-xs text-[var(--tactical-orange)]">Export Data</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </header>
  )
}
