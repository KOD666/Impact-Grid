import { cn } from "@/lib/utils"
import { Satellite, MapPin } from "lucide-react"

interface SatelliteStatusProps {
  className?: string
}

export function SatelliteStatus({ className }: SatelliteStatusProps) {
  return (
    <div className={cn("border border-[var(--tactical-orange)]/30 rounded-sm bg-card overflow-hidden", className)}>
      {/* Satellite Link Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--tactical-orange)]/10 border border-[var(--tactical-orange)]/30 rounded-sm w-fit">
          <Satellite className="w-4 h-4 text-[var(--tactical-orange)]" />
          <span className="font-mono text-xs text-[var(--tactical-orange)]">SATELLITE_LINK:</span>
          <span className="font-mono text-xs font-semibold text-[var(--tactical-green)]">ENCRYPTED_1.2Gbps</span>
          <span className="w-2 h-2 rounded-full bg-[var(--tactical-green)] animate-pulse" />
        </div>
      </div>

      {/* Status Grid */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted-foreground w-20">LATENCY:</span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-[var(--tactical-green)]" style={{ width: "15%" }} />
          </div>
          <span className="font-mono text-xs">42ms</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted-foreground w-20">UPTIME:</span>
          <span className="font-mono text-xs font-semibold">14:02:11:04</span>
        </div>
      </div>

      {/* Zone Info */}
      <div className="p-3 border-t border-border">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--tactical-orange)]" />
              <span className="font-mono text-xs">ZONE_ALPHA</span>
              <span className="px-1.5 py-0.5 bg-[var(--tactical-green)]/20 border border-[var(--tactical-green)]/30 rounded-sm font-mono text-[8px] text-[var(--tactical-green)]">
                ACTIVE
              </span>
            </div>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">14.223N 38.991E</p>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs">#402-A</span>
          </div>
        </div>

        {/* Casualty Estimate */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-[10px] text-muted-foreground">EST. CASUALTIES</p>
            <p className="font-mono text-lg font-bold">
              ~450 <span className="text-xs text-muted-foreground">±15%</span>
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted-foreground">ACTIVE ASSETS</p>
            <div className="space-y-1 mt-1">
              <p className="font-mono text-xs">UN_LOG_01</p>
              <p className="font-mono text-xs text-muted-foreground">NGO_MED_4</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
