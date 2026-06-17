"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

// ---------------------------------------------------------------------------
// External feeds: USGS earthquakes (direct) + GDACS disasters (proxy)
// ---------------------------------------------------------------------------

const USGS_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson"

export type ExternalUrgency = "critical" | "high" | "medium"

export interface ExternalMarker {
  id: string
  source: "usgs" | "gdacs"
  title: string
  lat: number
  lng: number
  urgency: ExternalUrgency
  markerColor: string
  category?: string
  detail?: string
  url?: string
  timestamp?: string
  magnitude?: number
}

interface USGSFeature {
  id: string
  properties: {
    title?: string
    place?: string
    mag?: number | null
    time?: number
    url?: string
  }
  geometry: {
    type: string
    coordinates: [number, number, number?]
  }
}

interface USGSResponse {
  features?: USGSFeature[]
}

function magToUrgency(mag: number | null | undefined): ExternalUrgency {
  if (typeof mag !== "number") return "medium"
  if (mag >= 6) return "critical"
  if (mag >= 5) return "high"
  return "medium"
}

export function urgencyToColor(u: ExternalUrgency): string {
  if (u === "critical") return "#ef4444"
  if (u === "high") return "#f97316"
  return "#eab308"
}

export function magToColor(mag: number | null | undefined): string {
  if (typeof mag !== "number") return "#eab308"
  if (mag >= 6) return "#ef4444"
  if (mag >= 5) return "#f97316"
  return "#eab308"
}

export function magToRadius(mag: number | null | undefined): number {
  if (typeof mag !== "number") return 6
  return mag * 3
}

export interface UsgsEarthquake {
  id: string
  lat: number
  lon: number
  mag: number
  place: string
  time: number
}

export function useUsgsEarthquakes(): UsgsEarthquake[] {
  const { data } = useSWR<USGSResponse>(
    "usgs-earthquakes",
    async () => {
      try {
        const res = await fetch(USGS_URL, {
          headers: { "User-Agent": "ImpactGrid/1.0" }
        })
        if (!res.ok) {
          console.error(`[useUsgsEarthquakes] HTTP ${res.status}`)
          return { features: [] }
        }
        return await res.json()
      } catch (err) {
        console.error("[useUsgsEarthquakes] Fetch failed:", err)
        return { features: [] }
      }
    },
    { refreshInterval: 300000, revalidateOnFocus: false },
  )

  const earthquakes: UsgsEarthquake[] = (data?.features ?? [])
    .map((f) => ({
      id: f.id,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      mag: f.properties.mag ?? 0,
      place: f.properties.place ?? "Unknown",
      time: f.properties.time ?? 0,
    }))

  return earthquakes
}

interface GdacsEvent {
  eventid?: number | string
  eventtype?: string
  alertlevel?: string
  alertscore?: number
  name?: string
  htmldescription?: string
  description?: string
  fromdate?: string
  todate?: string
  bbox?: string
  geometry?: { type?: string; coordinates?: number[] | number[][] }
  properties?: Record<string, unknown>
}

interface GdacsResponse {
  data?: { features?: Array<{ properties: GdacsEvent; geometry?: GdacsEvent["geometry"] }> } | GdacsEvent[]
  features?: Array<{ properties: GdacsEvent; geometry?: GdacsEvent["geometry"] }>
  events?: GdacsEvent[]
  success?: boolean
}

const GDACS_TYPE_NAMES: Record<string, string> = {
  EQ: "Earthquake",
  TC: "Cyclone",
  FL: "Flood",
  VO: "Volcano",
  DR: "Drought",
  WF: "Wildfire",
}

function gdacsAlertToUrgency(level?: string): ExternalUrgency {
  const v = (level ?? "").toLowerCase()
  if (v === "red") return "critical"
  if (v === "orange") return "high"
  return "medium"
}

export interface GdacsDisaster {
  id: string
  lat: number
  lon: number
  title: string
  alertLevel: string
  eventType: string
}

export function useGdacsDisasters(): GdacsDisaster[] {
  const { data } = useSWR<GdacsResponse>(
    "gdacs-events",
    async () => {
      try {
        const res = await fetch("/api/gdacs")
        if (!res.ok) {
          console.error(`[useGdacsDisasters] HTTP ${res.status}`)
          return { events: [] }
        }
        return await res.json()
      } catch (err) {
        console.error("[useGdacsDisasters] Fetch failed:", err)
        return { events: [] }
      }
    },
    { refreshInterval: 600000, revalidateOnFocus: false },
  )

  const disasters: GdacsDisaster[] = (data?.events ?? [])
    .map((e: any) => ({
      id: e.id ?? e.title,
      lat: parseFloat(e.lat),
      lon: parseFloat(e.lon),
      title: e.title,
      alertLevel: e.alertLevel ?? e.alert_level ?? 'green',
      eventType: e.eventType ?? e.event_type ?? '',
    }))
    .filter((e: any) => !isNaN(e.lat) && !isNaN(e.lon))

  return disasters
}

// ReliefWeb (dashboard list only - no map markers)
interface ReliefWebItem {
  id: string
  fields?: {
    name?: string
    title?: string
    body?: string
    description?: string
    date?: { created?: string }
    country?: Array<{ name?: string }>
    type?: Array<{ name?: string }>
    primary_country?: { name?: string }
    url_alias?: string
  }
}

interface ReliefWebResponse {
  data?: ReliefWebItem[]
}

export interface ReliefWebIncident {
  id: string
  title: string
  country: string
  type: string
  summary: string
  url?: string
  date?: string
}

export function useReliefWebIncidents() {
  const url =
    "https://api.reliefweb.int/v1/disasters?appname=impactgrid&profile=list&limit=12&sort[]=date.created:desc"
  const { data, error, isLoading } = useSWR<ReliefWebResponse>(
    "reliefweb-incidents",
    () => fetch(url).then((r) => r.json()),
    { refreshInterval: 600000, revalidateOnFocus: false },
  )

  const incidents: ReliefWebIncident[] = (data?.data ?? []).map((i) => {
    const f = i.fields ?? {}
    const country =
      f.primary_country?.name ?? f.country?.[0]?.name ?? "Global"
    const type = f.type?.[0]?.name ?? "Incident"
    const summary = (f.body ?? f.description ?? "").slice(0, 220)
    return {
      id: i.id,
      title: f.name ?? f.title ?? "Incident",
      country,
      type,
      summary,
      url: f.url_alias,
      date: f.date?.created,
    }
  })

  return { incidents, isLoading, isError: Boolean(error) }
}

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR("/api/dashboard", fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds for real-time feel
    revalidateOnFocus: true,
  })

  return {
    data: data?.data,
    isLoading,
    isError: error || !data?.success,
    refresh: mutate
  }
}

export function useReports() {
  const { data, error, isLoading, mutate } = useSWR("/api/reports", fetcher, {
    refreshInterval: 5000,
  })

  return {
    reports: data?.data || [],
    isLoading,
    isError: error || !data?.success,
    refresh: mutate
  }
}

export function useMissions() {
  const { data, error, isLoading, mutate } = useSWR("/api/missions", fetcher, {
    refreshInterval: 5000,
  })

  return {
    missions: data?.data || [],
    isLoading,
    isError: error || !data?.success,
    refresh: mutate
  }
}

export function useVolunteers() {
  const { data, error, isLoading, mutate } = useSWR("/api/volunteers", fetcher, {
    refreshInterval: 5000,
  })

  return {
    volunteers: data?.data || [],
    isLoading,
    isError: error || !data?.success,
    refresh: mutate
  }
}

export function usePredictions() {
  const { data, error, isLoading, mutate } = useSWR("/api/predictions", fetcher, {
    refreshInterval: 10000,
  })

  return {
    alerts: data?.data || [],
    isLoading,
    isError: error || !data?.success,
    refresh: mutate
  }
}

export function useLogistics() {
  const { data, error, isLoading, mutate } = useSWR("/api/logistics", fetcher, {
    refreshInterval: 5000,
  })

  return {
    tasks: data?.data || [],
    isLoading,
    isError: error || !data?.success,
    refresh: mutate
  }
}

export function useMission(id: string | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/missions/${id}` : null,
    fetcher,
  )
  return {
    mission: data?.data?.mission,
    assignedVolunteers: data?.data?.assigned_volunteers ?? [],
    sourceReports: data?.data?.source_reports ?? [],
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  }
}

export function useVolunteer(id: string | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/volunteers/${id}` : null,
    fetcher,
  )
  return {
    volunteer: data?.data?.volunteer,
    currentMission: data?.data?.current_mission,
    missionHistory: data?.data?.mission_history ?? [],
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  }
}

// Helper to deploy a mission
export async function deployMission(missionId: string) {
  const response = await fetch("/api/missions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "deploy", missionId })
  })
  return response.json()
}

// Helper to assign a specific volunteer
export async function assignVolunteer(missionId: string, volunteerId: string) {
  const response = await fetch("/api/missions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "assign", missionId, volunteerId })
  })
  return response.json()
}

// Helper to update volunteer
export async function updateVolunteer(volunteerId: string, updates: Record<string, unknown>) {
  const response = await fetch("/api/volunteers", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ volunteerId, ...updates })
  })
  return response.json()
}

// Helper to remove volunteer
export async function removeVolunteer(volunteerId: string) {
  const response = await fetch(`/api/volunteers/${volunteerId}`, { method: "DELETE" })
  return response.json()
}

// Helper to update logistics task
export async function updateLogisticsTask(id: string, updates: Record<string, unknown>) {
  const response = await fetch("/api/logistics", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...updates })
  })
  return response.json()
}

// Helper to complete a mission
export async function completeMission(missionId: string) {
  const response = await fetch("/api/missions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "complete", missionId })
  })
  return response.json()
}
