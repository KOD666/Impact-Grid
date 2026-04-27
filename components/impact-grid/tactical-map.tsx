"use client"

import { cn } from "@/lib/utils"

interface MapMarker {
  id: string
  label?: string
  location?: string
  type?: "active_mission" | "in_transit" | "logistics_hub" | "critical"
  category?: string
  urgency_score?: number
  lat?: number
  lng?: number
  coordinates?: { lat: number; lng: number }
  info?: string
}

interface TacticalMapProps {
  title?: string
  markers?: MapMarker[]
  className?: string
  showLegend?: boolean
  showCoords?: boolean
}

const defaultMarkers: MapMarker[] = [
  { id: "1", label: "REFUGEE_CAMP_A", type: "active_mission", lat: 35, lng: 45, info: "POP: 12,450 // STABLE" },
  { id: "2", label: "WATER_POINT_Z3", type: "logistics_hub", lat: 55, lng: 65, info: "OUTPUT: 88% // ACTIVE" },
  { id: "3", label: "CONVOY_09", type: "in_transit", lat: 45, lng: 30 },
]

export function TacticalMap({
  title = "GEOSPATIAL_INTEL // SYNC: ACTIVE",
  markers = defaultMarkers,
  className,
  showLegend = true,
  showCoords = true,
}: TacticalMapProps) {
  const markerColors = {
    active_mission: "bg-[var(--tactical-orange)]",
    in_transit: "bg-[var(--tactical-yellow)]",
    logistics_hub: "bg-[var(--tactical-blue)]",
    critical: "bg-[var(--tactical-red)]",
  }

  return (
    <div className={cn("relative border border-border rounded-sm bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <p className="font-mono text-xs text-[var(--tactical-orange)] flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[var(--tactical-orange)]" />
          {title}
        </p>
        {showCoords && (
          <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
            <span>LAT: 34.0522° N</span>
            <span>LNG: 118.2437° N</span>
          </div>
        )}
      </div>

      {/* Map Area */}
      <div className="relative h-80 bg-gradient-to-br from-[#0d1117] to-[#161b22] overflow-hidden">
        {/* Topographic lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          <defs>
            <pattern id="topo" width="100" height="100" patternUnits="userSpaceOnUse">
              <path
                d="M0,50 Q25,30 50,50 T100,50"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-muted-foreground"
              />
              <path
                d="M0,70 Q30,50 60,70 T100,70"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-muted-foreground"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo)" />
        </svg>

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-pattern opacity-30" />

        {/* Map markers */}
        {markers.map((marker) => {
          // Get coordinates from either direct lat/lng or nested coordinates
          const lat = marker.lat ?? marker.coordinates?.lat ?? 50
          const lng = marker.lng ?? marker.coordinates?.lng ?? 50
          // Normalize coordinates to percentage (simple linear mapping)
          const normalizedLat = ((lat + 90) / 180) * 100
          const normalizedLng = ((lng + 180) / 360) * 100
          // Determine marker type based on urgency score or explicit type
          const markerType = marker.type || 
            (marker.urgency_score && marker.urgency_score >= 75 ? "critical" : 
             marker.urgency_score && marker.urgency_score >= 50 ? "active_mission" : "logistics_hub")
          const markerLabel = marker.label || marker.location || "UNKNOWN"
          
          return (
            <div
              key={marker.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${Math.min(90, Math.max(10, normalizedLng))}%`, top: `${Math.min(85, Math.max(15, normalizedLat))}%` }}
            >
              {/* Marker */}
              <div
                className={cn(
                  "w-4 h-4 rotate-45 border-2 border-background cursor-pointer transition-transform hover:scale-125",
                  markerColors[markerType]
                )}
              />
              {/* Pulse animation */}
              <div
                className={cn(
                  "absolute inset-0 w-4 h-4 rotate-45 animate-ping opacity-30",
                  markerColors[markerType]
                )}
              />
              {/* Tooltip */}
              <div className="absolute left-6 top-0 hidden group-hover:block z-10">
                <div className="px-2 py-1 bg-popover border border-border rounded-sm whitespace-nowrap">
                  <p className="font-mono text-[10px] font-semibold">{markerLabel}</p>
                  {marker.info && (
                    <p className="font-mono text-[8px] text-muted-foreground">{marker.info}</p>
                  )}
                  {marker.urgency_score !== undefined && (
                    <p className="font-mono text-[8px] text-muted-foreground">URGENCY: {marker.urgency_score}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Static markers with labels */}
        <div className="absolute bottom-24 left-8">
          <div className="flex items-center gap-2 px-2 py-1 bg-background/80 rounded-sm">
            <span className="w-3 h-3 bg-[var(--tactical-orange)]" />
            <div>
              <p className="font-mono text-[10px] font-semibold">REFUGEE_CAMP_A</p>
              <p className="font-mono text-[8px] text-muted-foreground">POP: 12,450 // STABLE</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-12 left-8">
          <div className="flex items-center gap-2 px-2 py-1 bg-background/80 rounded-sm">
            <span className="w-3 h-3 bg-[var(--tactical-blue)]" />
            <div>
              <p className="font-mono text-[10px] font-semibold">WATER_POINT_Z3</p>
              <p className="font-mono text-[8px] text-muted-foreground">OUTPUT: 88% // ACTIVE</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="absolute top-16 right-4 p-3 bg-background/90 border border-border rounded-sm">
          <p className="font-mono text-[10px] text-muted-foreground mb-2">MAP_LEGEND</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[var(--tactical-orange)]" />
              <span className="font-mono text-[10px]">ACTIVE_MISSION</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[var(--tactical-yellow)]" />
              <span className="font-mono text-[10px]">IN_TRANSIT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[var(--tactical-blue)]" />
              <span className="font-mono text-[10px]">LOGISTICS_HUB</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
