import { cn } from "@/lib/utils"
import { AlertTriangle, Truck, Cloud } from "lucide-react"

interface PredictiveAlert {
  id: string
  type: "critical" | "logistics" | "advisory" | "critical_event" | "logistics_alert"
  title: string
  subtitle?: string
  description?: string
  action?: string
  recommended_action?: string
  timeRemaining?: string
  time_to_event?: string
  confidence?: number
}

const defaultAlerts: PredictiveAlert[] = [
  {
    id: "1",
    type: "critical",
    title: "WATER SHORTAGE RISK - SECTOR 4",
    timeRemaining: "T-MINUS: 14H 22M",
    action: "VIEW PROTOCOL",
    confidence: 88,
  },
  {
    id: "2",
    type: "logistics",
    title: "CONVOY_09 BLOCKED - ROUTE_DELTA",
    action: "RE-ROUTE REQ",
  },
  {
    id: "3",
    type: "advisory",
    title: "WEATHER_SYSTEM_INCOMING",
    subtitle: "PRECIPITATION EXPECTED: 84002",
  },
]

interface PredictiveAlertsProps {
  alerts?: PredictiveAlert[]
  className?: string
}

export function PredictiveAlerts({ alerts = defaultAlerts, className }: PredictiveAlertsProps) {
  const alertStyles: Record<string, { border: string; bg: string; icon: typeof AlertTriangle; iconColor: string; label: string; labelColor: string }> = {
    critical: {
      border: "border-[var(--tactical-red)]/50",
      bg: "bg-[var(--tactical-red)]/10",
      icon: AlertTriangle,
      iconColor: "text-[var(--tactical-red)]",
      label: "CRITICAL_EVENT",
      labelColor: "text-[var(--tactical-red)]",
    },
    critical_event: {
      border: "border-[var(--tactical-red)]/50",
      bg: "bg-[var(--tactical-red)]/10",
      icon: AlertTriangle,
      iconColor: "text-[var(--tactical-red)]",
      label: "CRITICAL_EVENT",
      labelColor: "text-[var(--tactical-red)]",
    },
    logistics: {
      border: "border-[var(--tactical-yellow)]/50",
      bg: "bg-[var(--tactical-yellow)]/10",
      icon: Truck,
      iconColor: "text-[var(--tactical-yellow)]",
      label: "LOGISTICS_REQ",
      labelColor: "text-[var(--tactical-yellow)]",
    },
    logistics_alert: {
      border: "border-[var(--tactical-yellow)]/50",
      bg: "bg-[var(--tactical-yellow)]/10",
      icon: Truck,
      iconColor: "text-[var(--tactical-yellow)]",
      label: "LOGISTICS_ALERT",
      labelColor: "text-[var(--tactical-yellow)]",
    },
    advisory: {
      border: "border-[var(--tactical-blue)]/50",
      bg: "bg-[var(--tactical-blue)]/10",
      icon: Cloud,
      iconColor: "text-[var(--tactical-blue)]",
      label: "ADVISORY",
      labelColor: "text-[var(--tactical-blue)]",
    },
  }

  return (
    <div className={cn("border border-border rounded-sm bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <p className="font-mono text-xs text-muted-foreground">PREDICTIVE_MODELS</p>
        <span className="px-2 py-0.5 bg-muted border border-border rounded-sm font-mono text-[10px]">
          ML_CORE_v2.8
        </span>
      </div>

      {/* Alerts */}
      <div className="p-3 space-y-3">
        {alerts.map((alert) => {
          const style = alertStyles[alert.type] || alertStyles.advisory
          const Icon = style.icon

          return (
            <div
              key={alert.id}
              className={cn(
                "p-3 border rounded-sm transition-all hover:brightness-110",
                style.border,
                style.bg
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("w-4 h-4 mt-0.5", style.iconColor)} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={cn("font-mono text-[10px] tracking-wider", style.labelColor)}>
                      {style.label}
                    </span>
                    {alert.confidence && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {alert.confidence}% CONF
                      </span>
                    )}
                  </div>
                  <h4 className="mt-1 font-mono text-sm font-semibold">{alert.title}</h4>
                  {(alert.subtitle || alert.description) && (
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground line-clamp-2">
                      {alert.subtitle || alert.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    {(alert.timeRemaining || alert.time_to_event) && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {alert.timeRemaining || alert.time_to_event}
                      </span>
                    )}
                    {(alert.action || alert.recommended_action) && (
                      <button className={cn("font-mono text-[10px] tracking-wider", style.labelColor)}>
                        {alert.action || "VIEW PROTOCOL"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
