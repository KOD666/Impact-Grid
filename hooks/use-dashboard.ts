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

// Helper to deploy a mission
export async function deployMission(missionId: string) {
  const response = await fetch("/api/missions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "deploy", missionId })
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
