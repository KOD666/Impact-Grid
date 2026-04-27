"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

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
