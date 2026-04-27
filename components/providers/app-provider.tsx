"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { mutate } from "swr"
import type { Volunteer, Mission } from "@/lib/types"

export interface PendingChanges {
  missionAssignments: Record<string, string[]>
  missionStatusUpdates: Record<
    string,
    "active" | "completed" | "pending" | "cancelled"
  >
  volunteerUpdates: Record<
    string,
    Partial<{
      availability: "available" | "busy" | "offline"
      location: string
      coordinates: { lat: number; lng: number }
      current_mission: string | undefined
    }>
  >
  logisticsUpdates: Record<
    string,
    Partial<{
      status: "pending" | "en_route" | "delivered"
      team: string
      eta: string
    }>
  >
}

const emptyChanges = (): PendingChanges => ({
  missionAssignments: {},
  missionStatusUpdates: {},
  volunteerUpdates: {},
  logisticsUpdates: {},
})

export interface DismissedAlert {
  id: string
  dismissedAt: number
}

interface AppContextValue {
  volunteers: Volunteer[]
  missions: Mission[]
  pendingChanges: PendingChanges
  pendingCount: number
  queueMissionAssignment: (missionId: string, volunteerIds: string[]) => void
  queueMissionStatus: (
    missionId: string,
    status: "active" | "completed" | "pending" | "cancelled",
  ) => void
  queueVolunteerUpdate: (
    volunteerId: string,
    updates: PendingChanges["volunteerUpdates"][string],
  ) => void
  queueLogisticsUpdate: (
    taskId: string,
    updates: PendingChanges["logisticsUpdates"][string],
  ) => void
  resetChanges: () => void
  deploy: () => Promise<{
    success: boolean
    error?: string
    data?: unknown
  }>
  isDeploying: boolean
  deployStep: number
  dismissedAlertIds: string[]
  dismissAlert: (id: string) => void
}

export const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>(
    emptyChanges(),
  )
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployStep, setDeployStep] = useState(0)
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([])

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [volRes, msnRes] = await Promise.all([
          fetch('/api/volunteers'),
          fetch('/api/missions'),
        ])
        if (volRes.ok) {
          const volData = await volRes.json()
          setVolunteers(volData.data || [])
        }
        if (msnRes.ok) {
          const msnData = await msnRes.json()
          setMissions(msnData.data || [])
        }
      } catch (error) {
        console.error('[v0] Failed to load initial data:', error)
      }
    }
    loadData()
  }, [])

  const pendingCount = useMemo(() => {
    return (
      Object.keys(pendingChanges.missionAssignments).length +
      Object.keys(pendingChanges.missionStatusUpdates).length +
      Object.keys(pendingChanges.volunteerUpdates).length +
      Object.keys(pendingChanges.logisticsUpdates).length
    )
  }, [pendingChanges])

  const queueMissionAssignment = useCallback(
    (missionId: string, volunteerIds: string[]) => {
      setPendingChanges((prev) => ({
        ...prev,
        missionAssignments: {
          ...prev.missionAssignments,
          [missionId]: volunteerIds,
        },
      }))
    },
    [],
  )

  const queueMissionStatus = useCallback(
    (
      missionId: string,
      status: "active" | "completed" | "pending" | "cancelled",
    ) => {
      setPendingChanges((prev) => ({
        ...prev,
        missionStatusUpdates: {
          ...prev.missionStatusUpdates,
          [missionId]: status,
        },
      }))
    },
    [],
  )

  const queueVolunteerUpdate = useCallback<
    AppContextValue["queueVolunteerUpdate"]
  >((volunteerId, updates) => {
    setPendingChanges((prev) => ({
      ...prev,
      volunteerUpdates: {
        ...prev.volunteerUpdates,
        [volunteerId]: { ...prev.volunteerUpdates[volunteerId], ...updates },
      },
    }))
  }, [])

  const queueLogisticsUpdate = useCallback<
    AppContextValue["queueLogisticsUpdate"]
  >((taskId, updates) => {
    setPendingChanges((prev) => ({
      ...prev,
      logisticsUpdates: {
        ...prev.logisticsUpdates,
        [taskId]: { ...prev.logisticsUpdates[taskId], ...updates },
      },
    }))
  }, [])

  const resetChanges = useCallback(() => {
    setPendingChanges(emptyChanges())
  }, [])

  const deploy = useCallback(async () => {
    setIsDeploying(true)
    setDeployStep(0)
    try {
      // Step 1: Updating missions
      setDeployStep(1)
      await new Promise((r) => setTimeout(r, 350))

      // Step 2: Notifying volunteers
      setDeployStep(2)
      await new Promise((r) => setTimeout(r, 350))

      // Step 3: Recalculating routes
      setDeployStep(3)
      await new Promise((r) => setTimeout(r, 350))

      // Send batch
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes: pendingChanges }),
      })
      const json = await res.json()

      // Step 4: Done
      setDeployStep(4)
      await new Promise((r) => setTimeout(r, 250))

      // Refresh all SWR caches
      await Promise.all([
        mutate("/api/dashboard"),
        mutate("/api/missions"),
        mutate("/api/volunteers"),
        mutate("/api/reports"),
        mutate("/api/predictions"),
        mutate("/api/logistics"),
      ])

      if (json.success) resetChanges()
      return json
    } finally {
      setIsDeploying(false)
      setTimeout(() => setDeployStep(0), 600)
    }
  }, [pendingChanges, resetChanges])

  const dismissAlert = useCallback((id: string) => {
    setDismissedAlertIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const value: AppContextValue = {
    volunteers,
    missions,
    pendingChanges,
    pendingCount,
    queueMissionAssignment,
    queueMissionStatus,
    queueVolunteerUpdate,
    queueLogisticsUpdate,
    resetChanges,
    deploy,
    isDeploying,
    deployStep,
    dismissedAlertIds,
    dismissAlert,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider")
  return ctx
}
