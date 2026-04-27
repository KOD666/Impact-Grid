'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useVolunteer } from '@/hooks/use-dashboard'
import { Skeleton } from '@/components/ui/skeleton'

export default function PersonnelDetailPage() {
  const params = useParams()
  const volunteerId = params.id as string
  const { volunteer, currentMission, missionHistory, isLoading, isError } = useVolunteer(volunteerId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border px-4 py-6 md:px-6">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="px-4 py-6 md:px-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !volunteer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Volunteer not found</h1>
          <p className="text-muted-foreground mb-4">The volunteer record could not be loaded.</p>
          <Link href="/personnel" className="text-[var(--tactical-orange)] hover:underline">
            ← Back to Personnel Roster
          </Link>
        </div>
      </div>
    )
  }

  const initials = volunteer.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const statusColor = {
    available: 'bg-[var(--tactical-green)]',
    busy: 'bg-[var(--tactical-orange)]',
    offline: 'bg-gray-500'
  }[volunteer.availability]

  const formattedJoinedDate = volunteer.joined_at
    ? new Date(volunteer.joined_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Date unknown'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 py-6 md:px-6">
        <div className="max-w-2xl mx-auto flex items-start gap-4">
          <div className={`w-16 h-16 rounded-lg ${statusColor} flex items-center justify-center font-mono font-bold text-xl text-black flex-shrink-0`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{volunteer.name}</h1>
              <div className={`w-4 h-4 rounded-full ${statusColor}`} />
            </div>
            <p className="text-muted-foreground mb-3">{volunteer.location}</p>
            <p className="text-sm text-muted-foreground">Joined {formattedJoinedDate}</p>
          </div>
          <Link
            href="/personnel"
            className="px-4 py-2 border border-border font-mono text-xs tracking-wider rounded-sm hover:bg-muted transition-all"
          >
            BACK
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 md:px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Contact Information */}
          <div className="border border-border rounded-sm bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h2 className="font-mono text-sm font-semibold">CONTACT_INFORMATION</h2>
            </div>
            <div className="px-4 py-4 space-y-3">
              {volunteer.contact_email && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="font-mono text-sm">{volunteer.contact_email}</p>
                </div>
              )}
              {volunteer.contact_phone && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="font-mono text-sm">{volunteer.contact_phone}</p>
                </div>
              )}
              {!volunteer.contact_email && !volunteer.contact_phone && (
                <p className="text-xs text-muted-foreground italic">No contact information provided</p>
              )}
            </div>
          </div>

          {/* Skills & Qualifications */}
          <div className="border border-border rounded-sm bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h2 className="font-mono text-sm font-semibold">SKILLS_QUALIFICATIONS</h2>
            </div>
            <div className="px-4 py-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Skills ({volunteer.skills?.length || 0})</p>
                {volunteer.skills && volunteer.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {volunteer.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-muted border border-border rounded-sm text-xs font-mono">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No skills listed</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Clearance Level</p>
                <p className="font-mono text-sm">Level {volunteer.clearance_level}</p>
              </div>
            </div>
          </div>

          {/* Mission History */}
          <div className="border border-border rounded-sm bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h2 className="font-mono text-sm font-semibold">MISSION_HISTORY</h2>
            </div>
            <div className="px-4 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Missions Completed</p>
                  <p className="text-2xl font-mono font-bold">{volunteer.missions_completed}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current Assignment</p>
                  {volunteer.current_mission ? (
                    <p className="font-mono text-sm bg-[var(--tactical-orange)]/10 border border-[var(--tactical-orange)]/30 rounded-sm px-2 py-1 inline-block">
                      {volunteer.current_mission}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Unassigned</p>
                  )}
                </div>
              </div>
              {missionHistory && missionHistory.length > 0 ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Recent Missions</p>
                  <ul className="space-y-2">
                    {missionHistory.slice(0, 5).map((mission) => (
                      <li key={mission} className="font-mono text-sm text-[var(--tactical-orange)]/80">
                        {mission}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No mission history yet</p>
              )}
            </div>
          </div>

          {/* Availability Status */}
          <div className="border border-border rounded-sm bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h2 className="font-mono text-sm font-semibold">STATUS</h2>
            </div>
            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${statusColor}`} />
                <span className="font-mono text-sm capitalize">
                  {volunteer.availability === 'available' ? 'Available for deployment' : volunteer.availability === 'busy' ? 'On mission' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
