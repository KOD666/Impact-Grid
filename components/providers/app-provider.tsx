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
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
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
  isSupabaseConnected: boolean
}

export const AppContext = createContext<AppContextValue | null>(null)

// Type guard for volunteer data from Supabase
function isValidVolunteer(v: unknown): v is Volunteer {
  if (!v || typeof v !== 'object') return false
  const obj = v as Record<string, unknown>
  return typeof obj.id === 'string' && typeof obj.name === 'string'
}

// Type guard for mission data from Supabase
function isValidMission(m: unknown): m is Mission {
  if (!m || typeof m !== 'object') return false
  const obj = m as Record<string, unknown>
  return typeof obj.id === 'string' && typeof obj.name === 'string'
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>(
    emptyChanges(),
  )
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployStep, setDeployStep] = useState(0)
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([])
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false)

  // Load initial data from Supabase with realtime subscriptions
  useEffect(() => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let volunteersSubscription: any = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let missionsSubscription: any = null

    const loadData = async () => {
      // If Supabase is not configured, skip to API fallback
      if (!isSupabaseConfigured() || !supabase) {
        console.log('[v0] Supabase not configured, falling back to API endpoints')
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
          console.error('[v0] Failed to load initial data from API:', error)
        }
        return
      }

      try {
        // Try Supabase first
        const [volResult, msnResult] = await Promise.all([
          supabase.from('volunteers').select('*'),
          supabase.from('missions').select('*'),
        ])

        if (!volResult.error && !msnResult.error) {
          setIsSupabaseConnected(true)
          
          // Transform Supabase data to match app types
          const volData = (volResult.data || []).filter(isValidVolunteer).map((v) => ({
            ...v,
            skills: v.skills || [],
            mission_history: [],
          }))
          
          const msnData = (msnResult.data || []).filter(isValidMission).map((m) => ({
            ...m,
            assigned_volunteers: m.assigned_volunteers || [],
            source_reports: m.source_reports || [],
            objectives: m.objectives || [],
            resources_needed: m.resources_needed || [],
          }))

          setVolunteers(volData)
          setMissions(msnData)

          // Set up realtime subscriptions
          volunteersSubscription = supabase
            .channel('volunteers-changes')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'volunteers' },
              (payload) => {
                console.log('[v0] Volunteers realtime update:', payload.eventType)
                if (payload.eventType === 'INSERT' && isValidVolunteer(payload.new)) {
                  setVolunteers((prev) => [...prev, { ...payload.new, skills: payload.new.skills || [], mission_history: [] }])
                } else if (payload.eventType === 'UPDATE' && isValidVolunteer(payload.new)) {
                  setVolunteers((prev) =>
                    prev.map((v) => (v.id === payload.new.id ? { ...v, ...payload.new } : v))
                  )
                } else if (payload.eventType === 'DELETE') {
                  const oldRecord = payload.old as { id?: string }
                  if (oldRecord?.id) {
                    setVolunteers((prev) => prev.filter((v) => v.id !== oldRecord.id))
                  }
                }
              }
            )
            .subscribe()

          missionsSubscription = supabase
            .channel('missions-changes')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'missions' },
              (payload) => {
                console.log('[v0] Missions realtime update:', payload.eventType)
                if (payload.eventType === 'INSERT' && isValidMission(payload.new)) {
                  setMissions((prev) => [...prev, { 
                    ...payload.new, 
                    assigned_volunteers: payload.new.assigned_volunteers || [],
                    source_reports: payload.new.source_reports || [],
                    objectives: payload.new.objectives || [],
                    resources_needed: payload.new.resources_needed || [],
                  }])
                } else if (payload.eventType === 'UPDATE' && isValidMission(payload.new)) {
                  setMissions((prev) =>
                    prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m))
                  )
                } else if (payload.eventType === 'DELETE') {
                  const oldRecord = payload.old as { id?: string }
                  if (oldRecord?.id) {
                    setMissions((prev) => prev.filter((m) => m.id !== oldRecord.id))
                  }
                }
              }
            )
            .subscribe()

          return // Success with Supabase
        }
      } catch (error) {
        console.error('[v0] Supabase connection error:', error)
      }

      // Fallback to API if Supabase fails
      console.log('[v0] Falling back to API endpoints')
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

    return () => {
      if (volunteersSubscription && supabase) {
        supabase.removeChannel(volunteersSubscription)
      }
      if (missionsSubscription && supabase) {
        supabase.removeChannel(missionsSubscription)
      }
    }
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
      const supabase = createClient()

      // Step 1: Updating missions
      setDeployStep(1)
      
      // Apply mission assignments to Supabase
      for (const [missionId, volunteerIds] of Object.entries(pendingChanges.missionAssignments)) {
        if (isSupabaseConnected && supabase) {
          await supabase
            .from('missions')
            .update({ assigned_volunteers: volunteerIds, updated_at: new Date().toISOString() })
            .eq('id', missionId)
          
          // Update volunteers' current_mission
          for (const volId of volunteerIds) {
            await supabase
              .from('volunteers')
              .update({ current_mission: missionId, availability: 'busy', updated_at: new Date().toISOString() })
              .eq('id', volId)
          }
        }
      }
      await new Promise((r) => setTimeout(r, 250))

      // Step 2: Apply mission status updates
      setDeployStep(2)
      for (const [missionId, status] of Object.entries(pendingChanges.missionStatusUpdates)) {
        if (isSupabaseConnected && supabase) {
          await supabase
            .from('missions')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', missionId)
        }
      }
      await new Promise((r) => setTimeout(r, 250))

      // Step 3: Apply volunteer updates
      setDeployStep(3)
      for (const [volunteerId, updates] of Object.entries(pendingChanges.volunteerUpdates)) {
        if (isSupabaseConnected && supabase) {
          await supabase
            .from('volunteers')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', volunteerId)
        }
      }
      await new Promise((r) => setTimeout(r, 250))

      // Also send to API for backward compatibility
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
  }, [pendingChanges, resetChanges, isSupabaseConnected])

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
    isSupabaseConnected,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider")
  return ctx
}
