import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, CheckCircle2, Target, Shield } from "lucide-react"

interface StatsCardProps {
  label: string
  value: string | number
  unit?: string
  subLabel?: string
  trend?: number
  icon?: LucideIcon
  variant?: "default" | "accent" | "success"
  progress?: number
}

export function StatsCard({
  label,
  value,
  unit,
  subLabel,
  trend,
  icon: Icon,
  variant = "default",
  progress,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "relative p-4 border border-border rounded-sm bg-card overflow-hidden",
        variant === "accent" && "border-[var(--tactical-orange)]/30 bg-[var(--tactical-orange)]/5"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
          {label}
        </p>
        {Icon && (
          <Icon
            className={cn(
              "w-4 h-4",
              variant === "accent" ? "text-[var(--tactical-orange)]" : "text-muted-foreground"
            )}
          />
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-3xl font-mono font-bold tracking-tight",
            variant === "accent" && "text-[var(--tactical-orange)]"
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm font-mono text-muted-foreground">{unit}</span>
        )}
      </div>

      {/* Progress bar or sublabel */}
      {progress !== undefined && (
        <div className="mt-3">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--tactical-orange)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {subLabel && (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--tactical-green)]" />
          {subLabel}
        </p>
      )}

      {trend !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-[var(--tactical-green)]" />
          <span className="font-mono text-[10px] text-[var(--tactical-green)]">
            +{trend}%
          </span>
        </div>
      )}

      {/* Corner accent */}
      {variant === "accent" && (
        <div className="absolute top-0 right-0 w-6 h-6">
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--tactical-orange)]" />
        </div>
      )}
    </div>
  )
}

// Preset stats cards matching the design
interface DashboardStatsProps {
  data?: {
    total_reports_ytd?: number
    active_missions?: number
    success_rate?: number
    threat_level?: number
  }
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const threatLabel = data?.threat_level 
    ? `ELEVATED_LV${data.threat_level}` 
    : "ELEVATED_LV3"

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatsCard
        label="TOTAL_REPORTS_YTD"
        value={data?.total_reports_ytd?.toLocaleString() ?? "4,821"}
        trend={12.4}
        progress={65}
        icon={Target}
      />
      <StatsCard
        label="ACTIVE_MISSIONS"
        value={data?.active_missions ?? 32}
        subLabel="NOMINAL"
        icon={CheckCircle2}
      />
      <StatsCard
        label="SUCCESS_RATE_AVG"
        value={data?.success_rate ?? 98.2}
        unit="%"
        icon={TrendingUp}
      />
      <StatsCard
        label="THREAT_ENVIRONMENT"
        value={threatLabel}
        variant="accent"
        subLabel="SECTOR 04 NORTH ACTIVE"
        icon={Shield}
      />
    </div>
  )
}
