"use client"

import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import type { CrisisMarker, TeamMarker } from "./crisis-map-inner"

const CrisisMapInner = dynamic(() => import("./crisis-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0d1117]">
      <div className="font-mono text-xs text-muted-foreground animate-pulse">
        LOADING_GEOSPATIAL_GRID...
      </div>
    </div>
  ),
})

interface CrisisMapProps {
  title?: string
  subtitle?: string
  markers: CrisisMarker[]
  teams?: TeamMarker[]
  showRoutes?: boolean
  center?: [number, number]
  zoom?: number
  height?: string
  focusId?: string | null
  className?: string
  onMarkerClick?: (marker: CrisisMarker) => void
  onViewMission?: (missionId: string) => void
  showLegend?: boolean
}

export type { CrisisMarker, TeamMarker }

export function CrisisMap({
  title = "GEOSPATIAL_INTEL // SYNC: ACTIVE",
  subtitle,
  markers,
  teams,
  showRoutes,
  center,
  zoom,
  height = "400px",
  focusId,
  className,
  onMarkerClick,
  onViewMission,
  showLegend = true,
}: CrisisMapProps) {
  return (
    <div
      className={cn(
        "border border-border rounded-sm bg-card overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center justify-between p-3 border-b border-border">
        <p className="font-mono text-xs text-[var(--tactical-orange)] flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[var(--tactical-orange)]" />
          {title}
        </p>
        {subtitle && (
          <span className="font-mono text-[10px] text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>

      <div className="relative" style={{ height }}>
        <CrisisMapInner
          markers={markers}
          teams={teams}
          showRoutes={showRoutes}
          center={center}
          zoom={zoom}
          height={height}
          focusId={focusId}
          onMarkerClick={onMarkerClick}
          onViewMission={onViewMission}
        />

        {showLegend && (
          <div className="absolute top-3 right-3 z-[400] p-2.5 bg-background/90 border border-border rounded-sm pointer-events-none">
            <p className="font-mono text-[10px] text-muted-foreground mb-1.5">
              MAP_LEGEND
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <span className="font-mono text-[10px]">URGENCY &gt; 70</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#eab308]" />
                <span className="font-mono text-[10px]">URGENCY 40-70</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
                <span className="font-mono text-[10px]">URGENCY &lt; 40</span>
              </div>
              {teams && teams.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#3b82f6]" />
                  <span className="font-mono text-[10px]">TEAM_UNIT</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
