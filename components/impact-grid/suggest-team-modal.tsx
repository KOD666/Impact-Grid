'use client'

import { useState, useMemo } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import type { Mission, Volunteer } from '@/lib/types'

interface SuggestTeamModalProps {
  mission: Mission | null
  open: boolean
  onOpenChange: (open: boolean) => void
  volunteers: Volunteer[]
}

// Haversine formula
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
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

interface SuggestedVolunteer {
  volunteer: Volunteer
  distance?: number
  hasSkill: boolean
  reasoning: string
}

function allocateVolunteers(mission: Mission, volunteers: Volunteer[]): SuggestedVolunteer[] {
  let available = volunteers.filter(v => v.availability === 'available')

  if (available.length === 0) {
    return []
  }

  const skillPriorities = ['Search & Rescue', 'Medical', 'Emergency Response']

  let ranked = available.map(vol => {
    let distance: number | undefined
    if (mission.coordinates && vol.coordinates) {
      distance = haversineDistance(
        mission.coordinates.lat,
        mission.coordinates.lng,
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
        reasoning = `Closest available (${Math.round(distance)}km)`
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

  ranked.sort((a, b) => {
    if (a.hasSkill && !b.hasSkill) return -1
    if (!a.hasSkill && b.hasSkill) return 1

    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance
    }
    if (a.distance !== undefined) return -1
    if (b.distance !== undefined) return 1

    return 0
  })

  return ranked.slice(0, 5)
}

export function SuggestTeamModal({
  mission,
  open,
  onOpenChange,
  volunteers,
}: SuggestTeamModalProps) {
  const [isAssigning, setIsAssigning] = useState<string | null>(null)

  const suggestedVolunteers = useMemo(() => {
    if (!mission) return []
    return allocateVolunteers(mission, volunteers)
  }, [mission, volunteers])

  const availableVolunteers = useMemo(
    () => volunteers.filter(v => v.availability === 'available'),
    [volunteers],
  )

  const deployedVolunteers = useMemo(
    () => volunteers.filter(v => v.availability !== 'available'),
    [volunteers],
  )

  const handleAssignVolunteer = async (volunteerId: string) => {
    if (!mission) return

    setIsAssigning(volunteerId)
    try {
      const res = await fetch('/api/volunteers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId,
          availability: 'busy',
          current_mission: mission.id,
        }),
      })

      if (res.ok) {
        onOpenChange(false)
      }
    } catch (error) {
      console.error('[v0] Assign error:', error)
    } finally {
      setIsAssigning(null)
    }
  }

  if (!mission) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono">SUGGEST TEAM</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Mission: {mission.title}
          </DialogDescription>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-4 py-4">
          {availableVolunteers.length === 0 ? (
            <>
              <div className="flex items-start gap-2 p-3 bg-[var(--tactical-yellow)]/10 border border-[var(--tactical-yellow)]/20 rounded-sm">
                <AlertTriangle className="w-4 h-4 text-[var(--tactical-yellow)] mt-0.5 flex-shrink-0" />
                <div className="font-mono text-[10px] text-[var(--tactical-yellow)]">
                  <p className="font-semibold">All teams currently deployed</p>
                  <p className="mt-1 opacity-80">
                    You can pull volunteers from active missions:
                  </p>
                </div>
              </div>

              {deployedVolunteers.length > 0 && (
                <div className="space-y-2">
                  {deployedVolunteers.map(vol => (
                    <div key={vol.id} className="p-3 bg-muted/20 border border-border rounded-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono text-xs font-semibold">{vol.name}</p>
                          <p className="font-mono text-[9px] text-muted-foreground mt-1">
                            Current Mission: {mission.title}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-[var(--tactical-orange)]/20 text-[var(--tactical-orange)] border border-[var(--tactical-orange)]/30 font-mono text-[9px] font-semibold rounded-sm">
                          DEPLOYED
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="font-mono text-xs font-semibold mb-3">AVAILABLE VOLUNTEERS:</p>
              <div className="space-y-2">
                {suggestedVolunteers.map(suggestion => (
                  <div
                    key={suggestion.volunteer.id}
                    className="flex items-start justify-between p-3 bg-muted/20 border border-border rounded-sm hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-mono text-xs font-semibold text-foreground">
                        {suggestion.volunteer.name}
                      </p>
                      <p className="font-mono text-[9px] text-muted-foreground mt-1">
                        {suggestion.reasoning}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
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
                    <button
                      onClick={() => handleAssignVolunteer(suggestion.volunteer.id)}
                      disabled={isAssigning === suggestion.volunteer.id}
                      className="ml-3 px-3 py-2 bg-[var(--tactical-green)] text-primary-foreground border border-[var(--tactical-green)] font-mono text-[10px] font-semibold rounded-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                      {isAssigning === suggestion.volunteer.id ? 'ASSIGNING...' : 'ASSIGN'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
