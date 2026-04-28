"use client"

import { AlertTriangle, X } from "lucide-react"
import { useState, useEffect } from "react"
import useSWR from "swr"
import { useAppContext } from "@/components/providers/app-provider"
import type { Report } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function GlobalAlertBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const { data } = useSWR<{ success: boolean; data: Report[] }>(
    "/api/reports",
    fetcher,
    { refreshInterval: 8000 },
  )
  const { dismissedAlertIds, dismissAlert } = useAppContext()

  const reports = data?.data ?? []
  const highUrgency = reports
    .filter((r) => r.urgency_score > 80)
    .filter((r) => !dismissedAlertIds.includes(r.id))

  // Show alert with delay
  useEffect(() => {
    if (highUrgency.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000) // 2 second delay
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [highUrgency.length])

  if (highUrgency.length === 0 || !isVisible) return null
  const top = highUrgency[0]

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 border-b border-[var(--tactical-red)]/40 bg-[var(--tactical-red)]/15 backdrop-blur-sm animate-in fade-in slide-in-from-top duration-500"
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        <AlertTriangle className="w-4 h-4 text-[var(--tactical-red)] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs">
            <span className="text-[var(--tactical-red)] font-bold">
              HIGH-URGENCY EVENT //
            </span>{" "}
            <span className="text-foreground">
              {top.category.toUpperCase()} crisis at {top.location}
            </span>{" "}
            <span className="text-muted-foreground">
              — urgency {top.urgency_score}, {top.people_affected} people affected
            </span>
            {highUrgency.length > 1 && (
              <span className="ml-2 text-muted-foreground">
                (+{highUrgency.length - 1} more)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => dismissAlert(top.id)}
          aria-label="Dismiss alert"
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
