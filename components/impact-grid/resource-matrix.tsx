"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Fuel, Cross, Users, Clock } from "lucide-react"

interface ResourceItem {
  id: string
  label?: string
  name?: string
  value?: number
  current?: number
  capacity?: number
  icon?: "fuel" | "medical" | "personnel"
  status?: "nominal" | "low" | "critical"
}

const defaultResources: ResourceItem[] = [
  { id: "1", label: "FUEL_RESERVES_ALPHA", value: 72.4, icon: "fuel" },
  { id: "2", label: "MEDICAL_SUPPLY_BASE", value: 58, icon: "medical" },
  { id: "3", label: "PERSONNEL_DEPLOYMENT", value: 91.8, icon: "personnel" },
]

interface DeploymentInfo {
  timestamp: string
  summary: string
}

interface ResourceMatrixProps {
  resources?: ResourceItem[]
  className?: string
}

export function ResourceMatrix({ resources = defaultResources, className }: ResourceMatrixProps) {
  const [lastDeploy, setLastDeploy] = useState<DeploymentInfo | null>(null)

  // Load last deployment from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("impactgrid_last_deploy")
    if (stored) {
      try {
        setLastDeploy(JSON.parse(stored))
      } catch {
        // Invalid JSON
      }
    } else {
      // Set a default last deploy for demo
      setLastDeploy({
        timestamp: new Date().toISOString(),
        summary: "Initial system deployment"
      })
    }
  }, [])

  const icons = {
    fuel: Fuel,
    medical: Cross,
    personnel: Users,
  }

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts)
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return "Recently"
    }
  }

  return (
    <div className={cn("border border-border rounded-sm bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <p className="font-mono text-xs text-muted-foreground">RESOURCE_ALLOCATION_MATRIX</p>
      </div>

      {/* Resources */}
      <div className="p-3 space-y-4">
        {resources.map((resource) => {
          const label = resource.label || resource.name || "RESOURCE"
          const value = resource.value ?? resource.current ?? 50
          const iconType = resource.icon || (label.toLowerCase().includes("fuel") ? "fuel" : label.toLowerCase().includes("medical") ? "medical" : "personnel")
          const Icon = icons[iconType]
          const isLow = resource.status === "low" || value < 60
          const isCritical = resource.status === "critical" || value < 40

          return (
            <div key={resource.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className={cn(
                    "w-3.5 h-3.5",
                    isCritical ? "text-[var(--tactical-red)]" : 
                    isLow ? "text-[var(--tactical-yellow)]" : 
                    "text-[var(--tactical-orange)]"
                  )} />
                  <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
                    {label}
                  </span>
                </div>
                <span className={cn(
                  "font-mono text-xs font-semibold",
                  isCritical ? "text-[var(--tactical-red)]" : 
                  isLow ? "text-[var(--tactical-yellow)]" : 
                  "text-[var(--tactical-green)]"
                )}>
                  {value}%
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    isCritical ? "bg-[var(--tactical-red)]" : 
                    isLow ? "bg-[var(--tactical-yellow)]" : 
                    "bg-[var(--tactical-orange)]"
                  )}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Last Deploy Card */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-[var(--tactical-orange)]" />
          <span className="font-mono text-xs font-semibold">LAST_DEPLOY</span>
        </div>
        {lastDeploy ? (
          <>
            <p className="font-mono text-[10px] text-muted-foreground">
              {formatTimestamp(lastDeploy.timestamp)}
            </p>
            <p className="font-mono text-[10px] text-foreground mt-1 line-clamp-2">
              {lastDeploy.summary}
            </p>
          </>
        ) : (
          <p className="font-mono text-[10px] text-muted-foreground">
            No deployments recorded
          </p>
        )}
      </div>
    </div>
  )
}
