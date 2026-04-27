import { cn } from "@/lib/utils"

interface LiveReport {
  id: string
  code: string
  timestamp: string
  message: string
  tags: Array<{ label: string; type: "urgent" | "warning" | "info" }>
}

const defaultReports: LiveReport[] = [
  {
    id: "1",
    code: "REPT_4029",
    timestamp: "14:02:11Z",
    message: "CRITICAL SHORTAGE OF MEDICAL SUPPLIES REPORTED AT SECTOR 7G. WATER CONTAMINATION CONFIRMED.",
    tags: [
      { label: "URGENT", type: "urgent" },
      { label: "HEALTH", type: "info" },
    ],
  },
  {
    id: "2",
    code: "REPT_4030",
    timestamp: "14:03:45Z",
    message: "MINOR FLOODING DETECTED NEAR PERIMETER FENCE. EVACUATION ROUTES REMAIN OPEN.",
    tags: [
      { label: "WARNING", type: "warning" },
      { label: "INFRA", type: "info" },
    ],
  },
  {
    id: "3",
    code: "REPT_4031",
    timestamp: "14:04:12Z",
    message: "MULTIPLE SOS BEACONS ACTIVATED AT COASTAL REGION. COORDINATING SAR_OPS.",
    tags: [
      { label: "URGENT", type: "urgent" },
      { label: "SAR_UNIT", type: "info" },
    ],
  },
]

interface LiveDataPanelProps {
  reports?: LiveReport[]
  className?: string
}

export function LiveDataPanel({ reports = defaultReports, className }: LiveDataPanelProps) {
  const tagStyles = {
    urgent: "bg-[var(--tactical-red)]/20 text-[var(--tactical-red)] border-[var(--tactical-red)]/30",
    warning: "bg-[var(--tactical-yellow)]/20 text-[var(--tactical-yellow)] border-[var(--tactical-yellow)]/30",
    info: "bg-muted text-muted-foreground border-border",
  }

  return (
    <div className={cn("border border-border rounded-sm bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div>
          <p className="font-mono text-[10px] text-[var(--tactical-orange)] tracking-wider">
            SOURCE: FEED_OMEGA
          </p>
          <p className="font-mono text-sm font-semibold mt-0.5">LIVE DATA INGESTION</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-[var(--tactical-red)] animate-pulse" />
          <span className="w-2 h-2 bg-[var(--tactical-red)] animate-pulse" />
        </div>
      </div>

      {/* Reports */}
      <div className="p-3 space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="p-3 border border-border rounded-sm bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-[var(--tactical-orange)] font-semibold">
                {report.code}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {report.timestamp}
              </span>
            </div>
            <p className="font-mono text-xs leading-relaxed">{report.message}</p>
            <div className="flex items-center gap-2 mt-2">
              {report.tags.map((tag) => (
                <span
                  key={tag.label}
                  className={cn(
                    "px-2 py-0.5 border rounded-sm font-mono text-[10px]",
                    tagStyles[tag.type]
                  )}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
          <span>BUFFER_CAPACITY_LOAD</span>
          <span className="text-foreground">42.08%</span>
        </div>
        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-[var(--tactical-orange)]" style={{ width: "42%" }} />
        </div>
      </div>
    </div>
  )
}
