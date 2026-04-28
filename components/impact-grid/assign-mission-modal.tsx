'use client'

import { useState, useMemo, useCallback } from 'react'
import { X, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { useAppContext } from '@/components/providers/app-provider'
import type { Volunteer } from '@/lib/types'

interface GDACSEvent {
  title: string
  link: string
  pubDate: string
  alertlevel: string
  severity: string
  country: string
  coordinates?: { lat: number; lng: number }
}

interface AssignMissionModalProps {
  event: GDACSEvent
  open: boolean
  onOpenChange: (open: boolean) => void
  volunteers: Volunteer[]
}

// Haversine formula to calculate distance between two coordinates
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Smart allocation logic
interface AllocationResult {
  volunteer: Volunteer
  distance?: number
  hasSkill: boolean
  reasoning: string
}

function allocateVolunteers(
  event: GDACSEvent,
  volunteers: Volunteer[],
): AllocationResult[] {
  // 1. Filter available volunteers
  let available = volunteers.filter(v => v.availability === 'available')

  if (available.length === 0) {
    return []
  }

  // 2. Determine priority skills based on event type
  const skillPriorities = ['Search & Rescue', 'Medical', 'Emergency Response']
  const eventTypeLower = event.title.toLowerCase()

  // 3. Sort by proximity (if coordinates available) and skill match
  let ranked = available.map(vol => {
    let distance: number | undefined
    if (event.coordinates && vol.coordinates) {
      distance = haversineDistance(
        event.coordinates.lat,
        event.coordinates.lng,
        vol.coordinates.lat,
        vol.coordinates.lng,
      )
    }

    const hasSkill = vol.skills.some(skill =>
      skillPriorities.some(priority =>
        skill.toLowerCase().includes(priority.toLowerCase()),
      ),
    )

    let reasoning = ''
    if (distance !== undefined) {
      if (hasSkill) {
        reasoning = `Closest available · has ${vol.skills.find(s => skillPriorities.some(p => s.toLowerCase().includes(p.toLowerCase())))} skill`
      } else {
        reasoning = `Closest available (${Math.round(distance)}km away)`
      }
    } else {
      if (hasSkill) {
        reasoning = `Has ${vol.skills.find(s => skillPriorities.some(p => s.toLowerCase().includes(p.toLowerCase())))} skill`
      } else {
        reasoning = 'Available'
      }
    }

    return {
      volunteer: vol,
      distance,
      hasSkill,
      reasoning,
    }
  })

  // Sort: by skill match first, then by distance
  ranked.sort((a, b) => {
    // Skill match priority
    if (a.hasSkill && !b.hasSkill) return -1
    if (!a.hasSkill && b.hasSkill) return 1

    // Distance priority (if both have/don't have skill)
    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance
    }
    if (a.distance !== undefined) return -1
    if (b.distance !== undefined) return 1

    return 0
  })

  // Return top 1-3 suggestions
  return ranked.slice(0, 3)
}

function getPriorityFromAlertLevel(alertLevel: string): 'critical' | 'high' | 'medium' | 'low' {
  const level = alertLevel.toLowerCase()
  if (level === 'red') return 'critical'
  if (level === 'orange') return 'high'
  if (level === 'green') return 'low'
  return 'medium'
}

export function AssignMissionModal({
  event,
  open,
  onOpenChange,
  volunteers,
}: AssignMissionModalProps) {
  const { queueMissionAssignment, queueVolunteerUpdate } = useAppContext()
  const [formData, setFormData] = useState({
    title: event.title,
    location: event.country,
    priority: getPriorityFromAlertLevel(event.alertlevel),
    description: `Event: ${event.title}. Alert Level: ${event.alertlevel}. Severity: ${event.severity}`,
  })
  const [selectedVolunteerIds, setSelectedVolunteerIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableVolunteers = useMemo(
    () => volunteers.filter(v => v.availability === 'available'),
    [volunteers],
  )

  const suggestedVolunteers = useMemo(
    () => allocateVolunteers(event, volunteers),
    [event, volunteers],
  )

  const handleCreateAndAssign = useCallback(async () => {
    setIsSubmitting(true)
    try {
      // Create mission via API
      const missionRes = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          location: formData.location,
          category: 'other',
          urgency: formData.priority,
          description: formData.description,
          volunteers_required: selectedVolunteerIds.length || suggestedVolunteers.length,
        }),
      })

      if (!missionRes.ok) {
        throw new Error('Failed to create mission')
      }

      const missionData = await missionRes.json()
      const missionId = missionData.data?.id

      if (!missionId) {
        throw new Error('No mission ID returned')
      }

      // Assign selected volunteers
      const volsToAssign = selectedVolunteerIds.length > 0
        ? selectedVolunteerIds
        : suggestedVolunteers.map(s => s.volunteer.id)

      for (const volId of volsToAssign) {
        // Update volunteer availability and current mission
        await fetch('/api/volunteers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            volunteerId: volId,
            availability: 'busy',
            current_mission: missionId,
          }),
        })
      }

      // Close modal
      onOpenChange(false)
    } catch (error) {
      console.error('[v0] Assign mission error:', error)
      alert('Failed to create mission')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, selectedVolunteerIds, suggestedVolunteers, onOpenChange])

  const allDeployed = availableVolunteers.length === 0
  const assignCount = selectedVolunteerIds.length > 0
    ? selectedVolunteerIds.length
    : suggestedVolunteers.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono">ASSIGN MISSION</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Create and assign mission from GDACS event
          </DialogDescription>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Event Info */}
          <div className="border border-border bg-muted/30 rounded-sm p-3">
            <div className="font-mono text-xs">
              <p className="font-semibold text-foreground">{event.title}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  <span className="text-[9px] opacity-70">LOCATION:</span>{' '}
                  {event.country}
                </div>
                <div>
                  <span className="text-[9px] opacity-70">ALERT:</span>{' '}
                  {event.alertlevel.toUpperCase()}
                </div>
                <div>
                  <span className="text-[9px] opacity-70">SEVERITY:</span>{' '}
                  {event.severity}
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block font-mono text-xs mb-1">MISSION TITLE</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 bg-muted border border-border rounded-sm font-mono text-sm focus:outline-none focus:border-[var(--tactical-orange)]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs mb-1">LOCATION</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, location: e.target.value }))
                }
                className="w-full px-3 py-2 bg-muted border border-border rounded-sm font-mono text-sm focus:outline-none focus:border-[var(--tactical-orange)]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs mb-1">PRIORITY</label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    priority: e.target.value as 'critical' | 'high' | 'medium' | 'low',
                  }))
                }
                className="w-full px-3 py-2 bg-muted border border-border rounded-sm font-mono text-sm focus:outline-none focus:border-[var(--tactical-orange)]"
              >
                <option value="critical">CRITICAL</option>
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs mb-1">DESCRIPTION</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }
                className="w-full px-3 py-2 bg-muted border border-border rounded-sm font-mono text-sm focus:outline-none focus:border-[var(--tactical-orange)] min-h-[80px] resize-none"
              />
            </div>
          </div>

          {/* Allocation Panel */}
          {allDeployed ? (
            <div className="flex items-start gap-2 p-3 bg-[var(--tactical-yellow)]/10 border border-[var(--tactical-yellow)]/20 rounded-sm">
              <AlertTriangle className="w-4 h-4 text-[var(--tactical-yellow)] mt-0.5 flex-shrink-0" />
              <div className="font-mono text-[10px] text-[var(--tactical-yellow)]">
                <p className="font-semibold">All teams currently deployed</p>
                <p className="mt-1 opacity-80">
                  This mission will be created as unassigned. You can manually assign a team
                  when one becomes available.
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-border bg-muted/20 rounded-sm p-3">
              <p className="font-mono text-xs font-semibold mb-2">SUGGESTED TEAM:</p>
              {suggestedVolunteers.length > 0 ? (
                <div className="space-y-2">
                  {suggestedVolunteers.map(suggestion => (
                    <label
                      key={suggestion.volunteer.id}
                      className="flex items-start gap-2 p-2 hover:bg-muted/30 rounded-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVolunteerIds.includes(suggestion.volunteer.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVolunteerIds(prev => [
                              ...prev,
                              suggestion.volunteer.id,
                            ])
                          } else {
                            setSelectedVolunteerIds(prev =>
                              prev.filter(id => id !== suggestion.volunteer.id),
                            )
                          }
                        }}
                        className="mt-1 accent-[var(--tactical-orange)]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs font-semibold text-foreground">
                          {suggestion.volunteer.name}
                        </p>
                        <p className="font-mono text-[9px] text-muted-foreground mt-0.5">
                          {suggestion.reasoning}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {suggestion.volunteer.skills.slice(0, 2).map(skill => (
                            <span
                              key={skill}
                              className="px-1.5 py-0.5 bg-muted border border-border rounded-sm font-mono text-[8px] text-muted-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-[var(--tactical-green)] flex-shrink-0 mt-1" />
                    </label>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-[10px] text-muted-foreground">
                  No suitable volunteers available
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2 border border-border rounded-sm font-mono text-xs font-semibold text-foreground hover:bg-muted/30 transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleCreateAndAssign}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[var(--tactical-orange)] text-primary-foreground rounded-sm font-mono text-xs font-semibold hover:bg-[var(--tactical-orange)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'CREATING...' : 'CREATE & ASSIGN'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
