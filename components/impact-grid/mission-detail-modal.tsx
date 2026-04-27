"use client"

import Link from "next/link"
import { CrisisMap } from "./crisis-map"
import { useMission } from "@/hooks/use-dashboard"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, MapPin, Users, ArrowUpRight } from "lucide-react"
import type { Volunteer, Report } from "@/lib/types"

interface MissionDetailModalProps {
  missionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const urgencyTone: Record<string, string> = {
  critical: "text-[var(--tactical-red)] border-[var(--tactical-red)]/40 bg-[var(--tactical-red)]/10",
  high: "text-[var(--tactical-orange)] border-[var(--tactical-orange)]/40 bg-[var(--tactical-orange)]/10",
  medium: "text-[var(--tactical-yellow)] border-[var(--tactical-yellow)]/40 bg-[var(--tactical-yellow)]/10",
  low: "text-[var(--tactical-green)] border-[var(--tactical-green)]/40 bg-[var(--tactical-green)]/10",
}

const statusTone: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  active: "bg-[var(--tactical-green)]/15 text-[var(--tactical-green)]",
  completed: "bg-[var(--tactical-blue)]/15 text-[var(--tactical-blue)]",
  cancelled: "bg-[var(--tactical-red)]/15 text-[var(--tactical-red)]",
}

export function MissionDetailModal({
  missionId,
  open,
  onOpenChange,
}: MissionDetailModalProps) {
  const { mission, assignedVolunteers, sourceReports, isLoading } =
    useMission(open ? missionId : null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono">
            {isLoading ? "Loading mission..." : mission?.title ?? "Mission not found"}
          </DialogTitle>
          {mission && (
            <DialogDescription className="font-mono text-xs">
              {mission.id} // {mission.location}
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {!isLoading && !mission && (
          <p className="font-mono text-sm text-muted-foreground">
            This mission could not be loaded. It may have been removed.
          </p>
        )}

        {mission && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2 py-0.5 border rounded-sm font-mono text-[10px] ${urgencyTone[mission.urgency] ?? "border-border"}`}
              >
                URGENCY: {mission.urgency.toUpperCase()}
              </span>
              <span
                className={`px-2 py-0.5 rounded-sm font-mono text-[10px] ${statusTone[mission.status] ?? "bg-muted"}`}
              >
                {mission.status.toUpperCase()}
              </span>
              <span className="px-2 py-0.5 bg-muted rounded-sm font-mono text-[10px]">
                {mission.category.toUpperCase()}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {mission.description}
            </p>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 border border-border rounded-sm bg-card">
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> EST. DURATION
                </p>
                <p className="mt-1 font-semibold">{mission.time_estimate}</p>
              </div>
              <div className="p-3 border border-border rounded-sm bg-card">
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> VOLUNTEERS REQUIRED
                </p>
                <p className="mt-1 font-semibold">{mission.volunteers_required}</p>
              </div>
              <div className="p-3 border border-border rounded-sm bg-card">
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> LOCATION
                </p>
                <p className="mt-1 font-semibold truncate">{mission.location}</p>
              </div>
            </div>

            {mission.coordinates && (
              <CrisisMap
                title="MISSION_LOCATION"
                showLegend={false}
                height="220px"
                center={[mission.coordinates.lat, mission.coordinates.lng]}
                zoom={13}
                markers={[
                  {
                    id: mission.id,
                    label: mission.title,
                    lat: mission.coordinates.lat,
                    lng: mission.coordinates.lng,
                    urgency:
                      mission.urgency === "critical"
                        ? 90
                        : mission.urgency === "high"
                          ? 65
                          : mission.urgency === "medium"
                            ? 45
                            : 25,
                    category: mission.category,
                  },
                ]}
              />
            )}

            <section>
              <h3 className="font-mono text-xs font-semibold mb-2">
                ASSIGNED_VOLUNTEERS ({assignedVolunteers.length})
              </h3>
              {assignedVolunteers.length === 0 ? (
                <p className="font-mono text-xs text-muted-foreground">
                  No volunteers assigned yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {(assignedVolunteers as Volunteer[]).map((v) => (
                    <li
                      key={v.id}
                      className="flex items-center justify-between p-2.5 border border-border rounded-sm bg-card"
                    >
                      <div>
                        <p className="font-mono text-xs font-semibold">{v.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {v.skills.slice(0, 3).join(" / ") || "No skills listed"}
                        </p>
                      </div>
                      <Link
                        href={`/personnel/${v.id}`}
                        className="font-mono text-[10px] text-[var(--tactical-orange)] hover:underline flex items-center gap-1"
                      >
                        VIEW PROFILE <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="font-mono text-xs font-semibold mb-2">
                TIMELINE & SOURCE REPORTS
              </h3>
              <ol className="space-y-2 text-xs font-mono">
                <li className="flex gap-3">
                  <span className="text-muted-foreground w-32 shrink-0">
                    {new Date(mission.created_at).toLocaleString()}
                  </span>
                  <span>Mission generated from intel sweep.</span>
                </li>
                {(sourceReports as Report[]).map((r) => (
                  <li key={r.id} className="flex gap-3">
                    <span className="text-muted-foreground w-32 shrink-0">
                      {new Date(r.timestamp).toLocaleString()}
                    </span>
                    <span>
                      Report {r.id} :: {r.text.slice(0, 90)}
                      {r.text.length > 90 ? "..." : ""}
                    </span>
                  </li>
                ))}
                {mission.status === "active" && (
                  <li className="flex gap-3">
                    <span className="text-muted-foreground w-32 shrink-0">Now</span>
                    <span className="text-[var(--tactical-green)]">
                      Active deployment in progress.
                    </span>
                  </li>
                )}
              </ol>
            </section>

            <div className="flex justify-end pt-2">
              <Link
                href={`/missions/${mission.id}`}
                className="px-4 py-2 border border-[var(--tactical-orange)] text-[var(--tactical-orange)] font-mono text-xs tracking-wider rounded-sm hover:bg-[var(--tactical-orange)] hover:text-primary-foreground transition-all"
              >
                OPEN_FULL_PAGE
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
