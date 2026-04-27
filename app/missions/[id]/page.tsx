"use client"

import { use } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/impact-grid/sidebar"
import { TopNav } from "@/components/impact-grid/top-nav"
import { CrisisMap } from "@/components/impact-grid/crisis-map"
import { DeployResponseBar } from "@/components/impact-grid/deploy-response-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { useMission } from "@/hooks/use-dashboard"
import { ArrowLeft, ArrowUpRight, Clock, MapPin, Users } from "lucide-react"
import type { Volunteer, Report } from "@/lib/types"

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

export default function MissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { mission, assignedVolunteers, sourceReports, isLoading } = useMission(id)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="lg:ml-56">
        <TopNav activeTab="reports" />

        <div className="p-4 md:p-6 space-y-6 pb-24">
          <Link
            href="/missions"
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            BACK TO MISSIONS
          </Link>

          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          )}

          {!isLoading && !mission && (
            <div className="p-6 border border-border rounded-sm bg-card">
              <p className="font-mono text-sm text-muted-foreground">
                Mission {id} not found.
              </p>
            </div>
          )}

          {mission && (
            <>
              <header className="space-y-3">
                <h1 className="font-mono text-2xl font-bold tracking-wide">
                  {mission.title}
                </h1>
                <p className="font-mono text-xs text-muted-foreground">
                  {mission.id} // {mission.location}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 py-1 border rounded-sm font-mono text-[10px] ${urgencyTone[mission.urgency] ?? "border-border"}`}
                  >
                    URGENCY: {mission.urgency.toUpperCase()}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-sm font-mono text-[10px] ${statusTone[mission.status] ?? "bg-muted"}`}
                  >
                    STATUS: {mission.status.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-muted rounded-sm font-mono text-[10px]">
                    {mission.category.toUpperCase()}
                  </span>
                </div>
              </header>

              <p className="text-sm leading-relaxed text-muted-foreground max-w-3xl">
                {mission.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
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
                  height="320px"
                  showLegend={false}
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
                <h2 className="font-mono text-sm font-bold mb-3">
                  ASSIGNED VOLUNTEERS ({assignedVolunteers.length})
                </h2>
                {assignedVolunteers.length === 0 ? (
                  <p className="font-mono text-xs text-muted-foreground">
                    No volunteers assigned yet.
                  </p>
                ) : (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(assignedVolunteers as Volunteer[]).map((v) => (
                      <li
                        key={v.id}
                        className="flex items-center justify-between p-3 border border-border rounded-sm bg-card"
                      >
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-semibold truncate">
                            {v.name}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground truncate">
                            {v.skills.slice(0, 4).join(" / ") || "No skills listed"}
                          </p>
                        </div>
                        <Link
                          href={`/personnel/${v.id}`}
                          className="font-mono text-[10px] text-[var(--tactical-orange)] hover:underline flex items-center gap-1 shrink-0"
                        >
                          PROFILE <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h2 className="font-mono text-sm font-bold mb-3">TIMELINE</h2>
                <ol className="space-y-2 text-xs font-mono">
                  <li className="flex gap-3 p-2 border border-border rounded-sm bg-card">
                    <span className="text-muted-foreground w-40 shrink-0">
                      {new Date(mission.created_at).toLocaleString()}
                    </span>
                    <span>Mission generated from intel sweep.</span>
                  </li>
                  {(sourceReports as Report[]).map((r) => (
                    <li
                      key={r.id}
                      className="flex gap-3 p-2 border border-border rounded-sm bg-card"
                    >
                      <span className="text-muted-foreground w-40 shrink-0">
                        {new Date(r.timestamp).toLocaleString()}
                      </span>
                      <span>
                        Report {r.id} :: {r.text}
                      </span>
                    </li>
                  ))}
                  {mission.status === "active" && (
                    <li className="flex gap-3 p-2 border border-[var(--tactical-green)]/40 rounded-sm bg-[var(--tactical-green)]/5">
                      <span className="text-muted-foreground w-40 shrink-0">Now</span>
                      <span className="text-[var(--tactical-green)]">
                        Active deployment in progress.
                      </span>
                    </li>
                  )}
                </ol>
              </section>
            </>
          )}
        </div>
      </main>

      <DeployResponseBar variant="floating" />
    </div>
  )
}
