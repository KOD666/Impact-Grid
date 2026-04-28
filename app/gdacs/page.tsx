'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/impact-grid/sidebar'
import { TopNav } from '@/components/impact-grid/top-nav'
import { useAppContext } from '@/components/providers/app-provider'
import { suggestVolunteers } from '@/lib/allocate'
import { AlertTriangle, MapPin, Clock, Users, Loader2, Radio, ChevronRight, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GDACSAlert {
  id: string
  title: string
  description: string
  eventType: string
  alertLevel: string
  country: string
  pubDate: string
  link: string
  latitude?: number
  longitude?: number
}

interface VolunteerSuggestion {
  volunteerId: string
  volunteerName: string
  score: number
  reasons: string[]
}

export default function GDACSPage() {
  const { volunteers, role } = useAppContext()
  const [alerts, setAlerts] = useState<GDACSAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<GDACSAlert | null>(null)
  const [suggestions, setSuggestions] = useState<VolunteerSuggestion[]>([])
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<string[]>([])

  const canCreateMission = role === 'commander' || role === 'coordinator'

  useEffect(() => {
    fetchAlerts()
  }, [])

  async function fetchAlerts() {
    setLoading(true)
    setError(null)
    setIsCached(false)
    try {
      const res = await fetch('/api/gdacs')
      const data = await res.json()

      // Handle response with events array
      if (data.events && Array.isArray(data.events)) {
        // Transform API events to GDACSAlert format
        const transformedAlerts: GDACSAlert[] = data.events.map((event: any, idx: number) => ({
          id: `alert-${idx}`,
          title: event.title,
          description: event.title, // Use title as description fallback
          eventType: extractEventType(event.title),
          alertLevel: event.alertLevel || 'Yellow',
          country: event.country || 'Unknown',
          pubDate: event.pubDate,
          link: event.link || 'https://www.gdacs.org',
          latitude: event.lat,
          longitude: event.lon,
        }))

        setAlerts(transformedAlerts)
        if (data.cached) {
          setIsCached(true)
        }
      } else if (data.error) {
        setError('Live feed unavailable — showing cached data')
        setIsCached(true)
        setAlerts([])
      } else {
        setError('Failed to fetch alerts')
      }
    } catch (err) {
      console.error('[v0] Failed to fetch GDACS:', err)
      setError('Network error fetching GDACS feed')
    } finally {
      setLoading(false)
    }
  }

  function extractEventType(title: string): string {
    if (title.toLowerCase().includes('earthquake')) return 'EQ'
    if (title.toLowerCase().includes('cyclone') || title.toLowerCase().includes('typhoon')) return 'TC'
    if (title.toLowerCase().includes('flood')) return 'FL'
    if (title.toLowerCase().includes('volcano')) return 'VO'
    if (title.toLowerCase().includes('drought')) return 'DR'
    if (title.toLowerCase().includes('wildfire') || title.toLowerCase().includes('fire')) return 'WF'
    return 'OT'
  }

  function openAssignModal(alert: GDACSAlert) {
    setSelectedAlert(alert)
    setSelectedVolunteers([])

    // Generate suggestions using allocation algorithm
    const missionCoords = alert.latitude && alert.longitude
      ? { lat: alert.latitude, lng: alert.longitude }
      : undefined

    const requiredSkills = mapEventTypeToSkills(alert.eventType)

    const suggested = suggestVolunteers(volunteers, {
      coordinates: missionCoords,
      requiredSkills,
      urgency: mapAlertLevelToUrgency(alert.alertLevel),
      volunteersNeeded: 5,
    })

    setSuggestions(suggested)
    // Pre-select top 3 suggestions
    setSelectedVolunteers(suggested.slice(0, 3).map(s => s.volunteerId))
  }

  function mapEventTypeToSkills(eventType: string): string[] {
    const mapping: Record<string, string[]> = {
      'EQ': ['search_rescue', 'medical', 'structural_assessment'],
      'TC': ['logistics', 'shelter', 'communications'],
      'FL': ['water_rescue', 'evacuation', 'logistics'],
      'VO': ['hazmat', 'evacuation', 'medical'],
      'DR': ['water_distribution', 'logistics', 'agriculture'],
      'WF': ['firefighting', 'evacuation', 'medical'],
    }
    return mapping[eventType] || ['general', 'logistics']
  }

  function mapAlertLevelToUrgency(level: string): 'low' | 'medium' | 'high' | 'critical' {
    if (level === 'Red') return 'critical'
    if (level === 'Orange') return 'high'
    if (level === 'Green') return 'medium'
    return 'low'
  }

  function toggleVolunteer(id: string) {
    setSelectedVolunteers(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    )
  }

  async function createMission() {
    if (!selectedAlert) return
    setCreating(true)

    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          mission: {
            title: `GDACS: ${selectedAlert.title}`,
            location: selectedAlert.country,
            category: mapEventTypeToCategory(selectedAlert.eventType),
            volunteers_required: selectedVolunteers.length || 5,
            time_estimate: '72h',
            urgency: mapAlertLevelToUrgency(selectedAlert.alertLevel),
            description: selectedAlert.description,
            coordinates: selectedAlert.latitude && selectedAlert.longitude
              ? { lat: selectedAlert.latitude, lng: selectedAlert.longitude }
              : undefined,
          },
        }),
      })

      const data = await res.json()
      if (data.success) {
        setCreated(prev => [...prev, selectedAlert.id])
        setSelectedAlert(null)
      }
    } catch {
      // Handle error silently
    } finally {
      setCreating(false)
    }
  }

  function mapEventTypeToCategory(eventType: string): string {
    const mapping: Record<string, string> = {
      'EQ': 'search_rescue',
      'TC': 'logistics',
      'FL': 'evacuation',
      'VO': 'evacuation',
      'DR': 'logistics',
      'WF': 'medical',
    }
    return mapping[eventType] || 'other'
  }

  function getEventIcon(eventType: string) {
    const icons: Record<string, string> = {
      'EQ': '🌍',
      'TC': '🌀',
      'FL': '🌊',
      'VO': '🌋',
      'DR': '☀️',
      'WF': '🔥',
    }
    return icons[eventType] || '⚠️'
  }

  function getAlertColor(level: string) {
    if (level === 'Red') return 'text-red-400 bg-red-500/20 border-red-500/30'
    if (level === 'Orange') return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
    return 'text-green-400 bg-green-500/20 border-green-500/30'
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNav />
        <main className="flex-1 overflow-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-mono font-bold text-foreground tracking-tight">
                GDACS_FEED
              </h1>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                Global Disaster Alert and Coordination System
              </p>
            </div>
            <button
              onClick={fetchAlerts}
              disabled={loading}
              className="px-4 py-2 bg-muted border border-border font-mono text-xs tracking-wider rounded-sm hover:bg-muted/80 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
              REFRESH_FEED
            </button>
          </div>

      {/* Error State */}
      {isCached && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-sm">
          <p className="text-amber-400 font-mono text-sm">Live feed unavailable — showing cached data</p>
        </div>
      )}

      {error && !isCached && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-sm">
          <p className="text-red-400 font-mono text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Alerts Grid */}
      {!loading && alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "bg-card border border-border rounded-sm overflow-hidden hover:border-muted-foreground/50 transition-all",
                created.includes(alert.id) && "opacity-50"
              )}
            >
              {/* Alert Header */}
              <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getEventIcon(alert.eventType)}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {alert.eventType}
                  </span>
                </div>
                <span className={cn(
                  "font-mono text-[10px] px-2 py-0.5 rounded-sm border",
                  getAlertColor(alert.alertLevel)
                )}>
                  {alert.alertLevel?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>

              {/* Alert Body */}
              <div className="p-4 space-y-3">
                <h3 className="font-mono text-sm font-medium text-foreground line-clamp-2">
                  {alert.title}
                </h3>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span className="font-mono">{alert.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono">
                      {new Date(alert.pubDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {alert.description}
                </p>
              </div>

              {/* Alert Actions */}
              <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-2">
                <a
                  href={alert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 border border-border font-mono text-[10px] tracking-wider rounded-sm hover:bg-muted transition-all text-center"
                >
                  VIEW_SOURCE
                </a>
                {canCreateMission && !created.includes(alert.id) ? (
                  <button
                    onClick={() => openAssignModal(alert)}
                    className="flex-1 px-3 py-2 bg-[var(--tactical-orange)] text-black font-mono text-[10px] tracking-wider rounded-sm hover:bg-[var(--tactical-orange)]/90 transition-all flex items-center justify-center gap-1"
                  >
                    CREATE_MISSION
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ) : created.includes(alert.id) ? (
                  <span className="flex-1 px-3 py-2 bg-green-500/20 text-green-400 font-mono text-[10px] tracking-wider rounded-sm text-center flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" />
                    CREATED
                  </span>
                ) : (
                  <button
                    disabled
                    title="Commander or Coordinator access required"
                    className="flex-1 px-3 py-2 bg-muted text-muted-foreground font-mono text-[10px] tracking-wider rounded-sm cursor-not-allowed text-center"
                  >
                    CREATE_MISSION
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && alerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-mono text-lg text-foreground mb-2">NO_ACTIVE_ALERTS</h3>
          <p className="text-sm text-muted-foreground">
            No active disaster alerts from GDACS at this time.
          </p>
        </div>
      )}

      {/* Assign Mission Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setSelectedAlert(null)}
          />
          <div className="relative bg-card border border-border rounded-sm w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div>
                <h2 className="font-mono text-lg font-bold text-foreground">
                  CREATE_MISSION
                </h2>
                <p className="font-mono text-xs text-muted-foreground mt-1">
                  {selectedAlert.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-2 hover:bg-muted rounded-sm transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Alert Info */}
              <div className="p-4 bg-muted/30 border border-border rounded-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getEventIcon(selectedAlert.eventType)}</span>
                  <span className={cn(
                    "font-mono text-xs px-2 py-0.5 rounded-sm border",
                    getAlertColor(selectedAlert.alertLevel)
                  )}>
                    {selectedAlert.alertLevel?.toUpperCase()}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {selectedAlert.country}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedAlert.description}
                </p>
              </div>

              {/* Suggested Volunteers */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-mono text-sm font-medium text-foreground">
                    SUGGESTED_TEAM ({selectedVolunteers.length} selected)
                  </h3>
                </div>

                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.volunteerId}
                      onClick={() => toggleVolunteer(suggestion.volunteerId)}
                      className={cn(
                        "w-full p-3 border rounded-sm text-left transition-all flex items-start gap-3",
                        selectedVolunteers.includes(suggestion.volunteerId)
                          ? "border-[var(--tactical-orange)] bg-[var(--tactical-orange)]/10"
                          : "border-border hover:border-muted-foreground/50"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-sm border flex items-center justify-center flex-shrink-0 mt-0.5",
                        selectedVolunteers.includes(suggestion.volunteerId)
                          ? "bg-[var(--tactical-orange)] border-[var(--tactical-orange)]"
                          : "border-border"
                      )}>
                        {selectedVolunteers.includes(suggestion.volunteerId) && (
                          <Check className="w-3 h-3 text-black" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-medium text-foreground">
                            {suggestion.volunteerName}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            Score: {suggestion.score.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {suggestion.reasons.map((reason, i) => (
                            <span
                              key={i}
                              className="font-mono text-[10px] px-1.5 py-0.5 bg-muted rounded-sm text-muted-foreground"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}

                  {suggestions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No volunteers available for suggestion
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 border border-border font-mono text-xs tracking-wider rounded-sm hover:bg-muted transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={createMission}
                disabled={creating}
                className="px-4 py-2 bg-[var(--tactical-orange)] text-black font-mono text-xs tracking-wider rounded-sm hover:bg-[var(--tactical-orange)]/90 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                CREATE_MISSION
              </button>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  )
}
