"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { ExternalMarker } from "@/hooks/use-dashboard"
import { magToRadius } from "@/hooks/use-dashboard"

export interface CrisisMarker {
  id: string
  label: string
  lat: number
  lng: number
  urgency: number
  category?: string
  people_affected?: number
  missionId?: string
}

export interface TeamMarker {
  id: string
  name: string
  lat: number
  lng: number
  currentMission?: string
  destinationLat?: number
  destinationLng?: number
  destinationUrgency?: number
}

interface CrisisMapInnerProps {
  markers: CrisisMarker[]
  teams?: TeamMarker[]
  externalMarkers?: ExternalMarker[]
  showRoutes?: boolean
  center?: [number, number]
  zoom?: number
  height?: string
  focusId?: string | null
  onMarkerClick?: (marker: CrisisMarker) => void
  onViewMission?: (missionId: string) => void
  usgsError?: boolean
  gdacsError?: boolean
}

function urgencyColor(urgency: number): string {
  if (urgency > 70) return "#ef4444" // red
  if (urgency >= 40) return "#eab308" // yellow
  return "#22c55e" // green
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `${diffMins} minutes ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
}

const personIcon = L.divIcon({
  className: "team-marker",
  html: `<div style="
    width: 22px;
    height: 22px;
    background: #3b82f6;
    border: 2px solid #fff;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  "><div style="
    transform: rotate(45deg);
    color: #fff;
    font-size: 11px;
    font-weight: bold;
    font-family: monospace;
  ">T</div></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
})

function FocusController({
  markers,
  focusId,
}: {
  markers: CrisisMarker[]
  focusId: string | null | undefined
}) {
  const map = useMap()
  useEffect(() => {
    if (!focusId) return
    const m = markers.find((x) => x.id === focusId || x.missionId === focusId)
    if (m) {
      map.flyTo([m.lat, m.lng], 14, { duration: 0.8 })
    }
  }, [focusId, markers, map])
  return null
}

// Layer toggle button component
function LayerLegend({
  layers,
  onToggle,
}: {
  layers: { id: string; label: string; color: string; enabled: boolean; count: number; error?: boolean }[]
  onToggle: (id: string) => void
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1000,
        background: "rgba(13, 17, 23, 0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 4,
        padding: "8px 10px",
        fontFamily: "monospace",
        fontSize: 11,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, opacity: 0.8, fontSize: 10 }}>
        DATA LAYERS
      </div>
      {layers.map((layer) => (
        <label
          key={layer.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            marginBottom: 4,
            opacity: layer.enabled ? 1 : 0.5,
          }}
        >
          <input
            type="checkbox"
            checked={layer.enabled}
            onChange={() => onToggle(layer.id)}
            style={{ accentColor: layer.color }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: layer.color,
              display: "inline-block",
            }}
          />
          <span>
            {layer.label} ({layer.error ? "!" : layer.count})
          </span>
        </label>
      ))}
    </div>
  )
}

export default function CrisisMapInner({
  markers,
  teams = [],
  externalMarkers = [],
  showRoutes = false,
  center,
  zoom = 12,
  height = "400px",
  focusId,
  onMarkerClick,
  onViewMission,
  usgsError = false,
  gdacsError = false,
}: CrisisMapInnerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState({
    internal: true,
    usgs: true,
    gdacs: true,
  })

  const usgsMarkers = externalMarkers.filter((m) => m.source === "usgs")
  const gdacsMarkers = externalMarkers.filter((m) => m.source === "gdacs")

  const layers = [
    {
      id: "internal",
      label: "INCIDENTS",
      color: "#22c55e",
      enabled: layerVisibility.internal,
      count: markers.length,
      error: false,
    },
    {
      id: "usgs",
      label: "USGS",
      color: "#f97316",
      enabled: layerVisibility.usgs,
      count: usgsMarkers.length,
      error: usgsError,
    },
    {
      id: "gdacs",
      label: "GDACS",
      color: "#ef4444",
      enabled: layerVisibility.gdacs,
      count: gdacsMarkers.length,
      error: gdacsError,
    },
  ]

  const handleToggle = (id: string) => {
    setLayerVisibility((prev) => ({ ...prev, [id]: !prev[id as keyof typeof prev] }))
  }

  const computedCenter = useMemo<[number, number]>(() => {
    if (center) return center
    if (markers.length > 0) return [markers[0].lat, markers[0].lng]
    if (externalMarkers.length > 0) return [externalMarkers[0].lat, externalMarkers[0].lng]
    if (teams.length > 0) return [teams[0].lat, teams[0].lng]
    return [34.0522, -118.2437]
  }, [center, markers, externalMarkers, teams])

  return (
    <div ref={containerRef} style={{ height, width: "100%", position: "relative" }}>
      <MapContainer
        center={computedCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%", background: "#0d1117" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <FocusController markers={markers} focusId={focusId} />

        {/* Internal incident markers */}
        {layerVisibility.internal &&
          markers.map((m) => {
            const color = urgencyColor(m.urgency)
            return (
              <CircleMarker
                key={m.id}
                center={[m.lat, m.lng]}
                radius={10}
                pathOptions={{
                  color,
                  weight: 2,
                  fillColor: color,
                  fillOpacity: 0.55,
                }}
                eventHandlers={{
                  click: () => onMarkerClick?.(m),
                }}
              >
                <Popup>
                  <div style={{ fontFamily: "monospace", fontSize: 12, minWidth: 180 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{m.label}</div>
                    {m.category && (
                      <div>
                        <span style={{ opacity: 0.7 }}>Category:</span>{" "}
                        {m.category.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span style={{ opacity: 0.7 }}>Urgency:</span>{" "}
                      <span style={{ color, fontWeight: 700 }}>{m.urgency}</span>
                    </div>
                    {typeof m.people_affected === "number" && (
                      <div>
                        <span style={{ opacity: 0.7 }}>People affected:</span>{" "}
                        {m.people_affected}
                      </div>
                    )}
                    {m.missionId && onViewMission && (
                      <button
                        onClick={() => onViewMission(m.missionId!)}
                        style={{
                          marginTop: 8,
                          padding: "4px 10px",
                          background: "#ea580c",
                          color: "#fff",
                          border: "none",
                          borderRadius: 3,
                          cursor: "pointer",
                          fontFamily: "monospace",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        VIEW MISSION
                      </button>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}

        {/* USGS earthquake markers */}
        {layerVisibility.usgs &&
          usgsMarkers.map((m) => {
            const radius = magToRadius(m.magnitude)
            const timeAgo = m.timestamp ? formatTimeAgo(new Date(m.timestamp)) : undefined
            return (
              <CircleMarker
                key={m.id}
                center={[m.lat, m.lng]}
                radius={radius}
                pathOptions={{
                  fillColor: m.markerColor,
                  fillOpacity: 0.6,
                  stroke: false,
                }}
              >
                <Popup>
                  <div style={{ fontFamily: "monospace", fontSize: 12, minWidth: 180 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: m.markerColor,
                        }}
                      />
                      USGS
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      {m.detail} — {m.title?.replace(/^M \d+\.\d+ - /, "")}
                    </div>
                    {timeAgo && (
                      <div style={{ opacity: 0.7, fontSize: 10, marginBottom: 4 }}>
                        {timeAgo}
                      </div>
                    )}
                    {m.url && (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: 6,
                          color: "#3b82f6",
                          fontSize: 11,
                        }}
                      >
                        View on USGS
                      </a>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}

        {/* GDACS disaster markers */}
        {layerVisibility.gdacs &&
          gdacsMarkers.map((m) => (
            <CircleMarker
              key={m.id}
              center={[m.lat, m.lng]}
              radius={9}
              pathOptions={{
                color: m.markerColor,
                weight: 2,
                fillColor: m.markerColor,
                fillOpacity: 0.55,
              }}
            >
              <Popup>
                <div style={{ fontFamily: "monospace", fontSize: 12, minWidth: 180 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: m.markerColor,
                      }}
                    />
                    GDACS
                  </div>
                  <div style={{ marginBottom: 4 }}>{m.title}</div>
                  {m.detail && (
                    <div style={{ fontWeight: 700, color: m.markerColor }}>{m.detail}</div>
                  )}
                  {m.timestamp && (
                    <div style={{ opacity: 0.7, fontSize: 10, marginTop: 4 }}>
                      {new Date(m.timestamp).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {/* Team markers */}
        {teams.map((t) => (
          <Marker key={t.id} position={[t.lat, t.lng]} icon={personIcon}>
            <Popup>
              <div style={{ fontFamily: "monospace", fontSize: 12 }}>
                <div style={{ fontWeight: 700 }}>{t.name}</div>
                {t.currentMission ? (
                  <div>Mission: {t.currentMission}</div>
                ) : (
                  <div style={{ opacity: 0.7 }}>Standing by</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route lines */}
        {showRoutes &&
          teams.map((t) =>
            t.destinationLat !== undefined && t.destinationLng !== undefined ? (
              <Polyline
                key={`route_${t.id}`}
                positions={[
                  [t.lat, t.lng],
                  [t.destinationLat, t.destinationLng],
                ]}
                pathOptions={{
                  color: urgencyColor(t.destinationUrgency ?? 0),
                  weight: 3,
                  dashArray: "6 6",
                  opacity: 0.8,
                }}
              />
            ) : null,
          )}
      </MapContainer>

      {/* Layer legend overlay */}
      <LayerLegend layers={layers} onToggle={handleToggle} />

      {/* Earthquake magnitude legend (bottom-left) */}
      {layerVisibility.usgs && usgsMarkers.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            zIndex: 1000,
            background: "rgba(13, 17, 23, 0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 4,
            padding: "8px 10px",
            fontFamily: "monospace",
            fontSize: 10,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6, opacity: 0.8 }}>
            USGS_MAG
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#ef4444",
                  display: "inline-block",
                }}
              />
              <span>M6+</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#f97316",
                  display: "inline-block",
                }}
              />
              <span>M5–6</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#eab308",
                  display: "inline-block",
                }}
              />
              <span>{"M<5"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
