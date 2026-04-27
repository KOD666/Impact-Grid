"use client"

import { useEffect, useMemo, useRef } from "react"
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
  showRoutes?: boolean
  center?: [number, number]
  zoom?: number
  height?: string
  focusId?: string | null
  onMarkerClick?: (marker: CrisisMarker) => void
  onViewMission?: (missionId: string) => void
}

function urgencyColor(urgency: number): string {
  if (urgency > 70) return "#ef4444" // red
  if (urgency >= 40) return "#eab308" // yellow
  return "#22c55e" // green
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

export default function CrisisMapInner({
  markers,
  teams = [],
  showRoutes = false,
  center,
  zoom = 12,
  height = "400px",
  focusId,
  onMarkerClick,
  onViewMission,
}: CrisisMapInnerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const computedCenter = useMemo<[number, number]>(() => {
    if (center) return center
    if (markers.length > 0) return [markers[0].lat, markers[0].lng]
    if (teams.length > 0) return [teams[0].lat, teams[0].lng]
    return [34.0522, -118.2437]
  }, [center, markers, teams])

  return (
    <div ref={containerRef} style={{ height, width: "100%" }}>
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

        {markers.map((m) => {
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
    </div>
  )
}
