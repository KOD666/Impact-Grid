'use client'

import { useState, useMemo } from 'react'
import { Sidebar } from '@/components/impact-grid/sidebar'
import { TopNav } from '@/components/impact-grid/top-nav'
import { MapPin, AlertTriangle, Loader2, Plus } from 'lucide-react'
import useSWR from 'swr'
import { useRole } from '@/lib/useRole'
import { useVolunteers } from '@/hooks/use-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { AssignMissionModal } from '@/components/impact-grid/assign-mission-modal'
import type { Volunteer } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface GDACSEvent {
  title: string
  link: string
  pubDate: string
  alertlevel: string
  severity: string
  country: string
  coordinates?: { lat: number; lng: number }
}

function getSeverityBadgeColor(alertLevel: string) {
  const level = (alertLevel || '').toLowerCase()
  if (level === 'red') return 'bg-[var(--tactical-red)]/20 text-[var(--tactical-red)] border-[var(--tactical-red)]'
  if (level === 'orange') return 'bg-[var(--tactical-yellow)]/20 text-[var(--tactical-yellow)] border-[var(--tactical-yellow)]'
  if (level === 'green') return 'bg-[var(--tactical-green)]/20 text-[var(--tactical-green)] border-[var(--tactical-green)]'
  return 'bg-muted/20 text-muted-foreground border-muted'
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  } catch {
    return 'Recently'
  }
}

interface EventCardProps {
  event: GDACSEvent
  onAssignClick: (event: GDACSEvent) => void
  isCommander: boolean
}

function EventCard({ event, onAssignClick, isCommander }: EventCardProps) {
  const alertLevel = event.alertlevel.toLowerCase()
  const isRed = alertLevel === 'red'
  const isOrange = alertLevel === 'orange'
  const isGreen = alertLevel === 'green'
  
  const priorityLabel = isRed ? 'Critical' : isOrange ? 'High' : isGreen ? 'Low' : 'Medium'
  const priorityValue = isRed ? 'critical' : isOrange ? 'high' : isGreen ? 'low' : 'medium'

  return (
    <div className="border border-border bg-card rounded-sm p-4 hover:bg-card/80 transition-colors">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-sm font-semibold tracking-wide truncate">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {event.country}
            </div>
          </div>
          <span className={`px-2 py-1 font-mono text-[10px] font-semibold rounded-sm border ${getSeverityBadgeColor(event.alertlevel)}`}>
            {event.alertlevel.toUpperCase()}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span>Severity: {event.severity}</span>
          <span>{formatRelativeTime(event.pubDate)}</span>
        </div>

        {/* Assign Button */}
        <div className="pt-2 border-t border-border">
          <button
            onClick={() => onAssignClick(event)}
            disabled={!isCommander}
            title={isCommander ? 'Create mission from this event' : 'Commander access required'}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-muted border border-border rounded-sm font-mono text-xs font-semibold text-[var(--tactical-orange)] hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-3 h-3" />
            ASSIGN MISSION
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GDACSPage() {
  const { isCommander, isCoordinator, isLoading: roleLoading } = useRole()
  const { volunteers: volsData } = useVolunteers()
  const [selectedEvent, setSelectedEvent] = useState<GDACSEvent | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)

  const { data, isLoading, error } = useSWR('/api/gdacs', fetcher, {
    refreshInterval: 300000, // 5 minutes
    revalidateOnFocus: false,
  })

  const events: GDACSEvent[] = data?.data || []
  const typedVolunteers = (volsData as Volunteer[]) || []

  // If not commander or coordinator, don't render
  if (!roleLoading && !isCommander && !isCoordinator) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:ml-56">
          <TopNav activeTab="reports" />
          <div className="p-6">
            <div className="border border-border bg-card rounded-sm p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-[var(--tactical-orange)] mx-auto mb-3" />
              <p className="font-mono text-sm text-muted-foreground">
                GDACS feed access is restricted to Commanders and Coordinators
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="lg:ml-56">
        <TopNav activeTab="reports" />

        <div className="p-4 md:p-6 space-y-6 pb-24">
          {/* Header */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-mono text-xl font-bold tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 bg-[var(--tactical-red)]" />
                  GDACS FEED
                </h1>
                <p className="font-mono text-xs text-muted-foreground mt-1">
                  Global Disaster Awareness and Coordination System — Active disasters
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="border border-[var(--tactical-red)]/20 bg-[var(--tactical-red)]/10 rounded-sm p-4">
              <p className="font-mono text-xs text-[var(--tactical-red)]">
                Failed to fetch GDACS feed. Please try again later.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && events.length === 0 && (
            <div className="border border-border bg-card rounded-sm p-12 text-center">
              <p className="font-mono text-sm text-muted-foreground">
                No active disasters recorded at this time
              </p>
            </div>
          )}

          {/* Events Grid */}
          {!isLoading && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event, idx) => (
                <EventCard
                  key={`${event.title}_${idx}`}
                  event={event}
                  onAssignClick={(evt) => {
                    setSelectedEvent(evt)
                    setAssignModalOpen(true)
                  }}
                  isCommander={isCommander}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Assign Mission Modal */}
      {selectedEvent && (
        <AssignMissionModal
          event={selectedEvent}
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          volunteers={typedVolunteers}
        />
      )}
    </div>
  )
}
