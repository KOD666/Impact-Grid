"use client"

import { useMemo, useState } from "react"
import { Sidebar } from "@/components/impact-grid/sidebar"
import { TopNav } from "@/components/impact-grid/top-nav"
import { CrisisMap } from "@/components/impact-grid/crisis-map"
import { DeployResponseBar } from "@/components/impact-grid/deploy-response-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { useLogistics, updateLogisticsTask } from "@/hooks/use-dashboard"
import { useAppContext } from "@/components/providers/app-provider"
import { Search, CheckCircle2, Truck, Package, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LogisticsTask } from "@/lib/types"

const categoryLabels: Record<LogisticsTask["category"], string> = {
  supply_delivery: "SUPPLY DELIVERY",
  medical_kit_transport: "MEDICAL KIT TRANSPORT",
  shelter_setup: "SHELTER SETUP",
  food_distribution: "FOOD DISTRIBUTION",
  water_purification_drop: "WATER PURIFICATION DROP",
  communication_relay: "COMMUNICATION RELAY",
}

const statusBadge: Record<
  LogisticsTask["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "PENDING",
    className: "bg-muted text-muted-foreground border-border",
  },
  en_route: {
    label: "EN ROUTE",
    className:
      "bg-[var(--tactical-orange)]/15 text-[var(--tactical-orange)] border-[var(--tactical-orange)]/40",
  },
  delivered: {
    label: "DELIVERED",
    className:
      "bg-[var(--tactical-green)]/15 text-[var(--tactical-green)] border-[var(--tactical-green)]/40",
  },
}

const priorityBadge: Record<LogisticsTask["priority"], string> = {
  critical: "bg-[var(--tactical-red)] text-white",
  high: "bg-[var(--tactical-orange)] text-primary-foreground",
  medium: "bg-[var(--tactical-yellow)]/80 text-black",
  low: "bg-muted text-muted-foreground",
}

export default function LogisticsPage() {
  const { tasks, isLoading, refresh } = useLogistics()
  const { queueLogisticsUpdate } = useAppContext()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | LogisticsTask["status"]>(
    "all",
  )
  const [teamFilter, setTeamFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | LogisticsTask["category"]
  >("all")

  const typedTasks = tasks as LogisticsTask[]

  const teams = useMemo(
    () => Array.from(new Set(typedTasks.map((t) => t.team))).sort(),
    [typedTasks],
  )

  const filtered = useMemo(() => {
    return typedTasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false
      if (teamFilter !== "all" && t.team !== teamFilter) return false
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const haystack =
          `${t.title} ${t.team} ${t.destination} ${categoryLabels[t.category]}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [typedTasks, statusFilter, teamFilter, categoryFilter, search])

  const active = filtered.filter((t) => t.status !== "delivered")
  const completed = filtered.filter((t) => t.status === "delivered")

  const teamMarkers = typedTasks
    .filter((t) => t.status !== "delivered" && t.team_coordinates)
    .map((t) => ({
      id: t.id,
      name: t.team,
      lat: t.team_coordinates!.lat,
      lng: t.team_coordinates!.lng,
      currentMission: t.title,
      destinationLat: t.destination_coordinates?.lat,
      destinationLng: t.destination_coordinates?.lng,
      destinationUrgency: t.destination_urgency,
    }))

  const crisisMarkers = typedTasks
    .filter((t) => t.status !== "delivered" && t.destination_coordinates)
    .map((t) => ({
      id: `dest_${t.id}`,
      label: t.destination,
      lat: t.destination_coordinates!.lat,
      lng: t.destination_coordinates!.lng,
      urgency: t.destination_urgency,
      category: categoryLabels[t.category],
    }))

  const markAsDelivered = async (task: LogisticsTask) => {
    queueLogisticsUpdate(task.id, { status: "delivered" })
    await updateLogisticsTask(task.id, { status: "delivered" })
    refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="lg:ml-56">
        <TopNav activeTab="reports" />

        <div className="p-4 md:p-6 space-y-6 pb-24">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatTile
              label="ACTIVE TASKS"
              value={typedTasks.filter((t) => t.status !== "delivered").length}
              icon={Package}
            />
            <StatTile
              label="EN ROUTE"
              value={typedTasks.filter((t) => t.status === "en_route").length}
              icon={Truck}
              accent
            />
            <StatTile
              label="PENDING DISPATCH"
              value={typedTasks.filter((t) => t.status === "pending").length}
              icon={Clock}
            />
            <StatTile
              label="DELIVERED TODAY"
              value={
                typedTasks.filter(
                  (t) =>
                    t.status === "delivered" &&
                    t.delivered_at &&
                    new Date(t.delivered_at).toDateString() ===
                      new Date().toDateString(),
                ).length
              }
              icon={CheckCircle2}
            />
          </div>

          {/* Team Location Map */}
          <CrisisMap
            title="LOGISTICS_FIELD_MAP // TEAMS & ROUTES"
            subtitle={`${teamMarkers.length} TEAMS DEPLOYED`}
            markers={crisisMarkers}
            teams={teamMarkers}
            showRoutes
            height="380px"
          />

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 p-3 border border-border rounded-sm bg-card">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks, teams, destinations..."
                className="w-full h-9 pl-9 pr-4 bg-muted border border-border rounded-sm font-mono text-xs placeholder:text-muted-foreground focus:outline-none focus:border-[var(--tactical-orange)]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="h-9 px-3 bg-muted border border-border rounded-sm font-mono text-xs"
            >
              <option value="all">ALL STATUS</option>
              <option value="pending">PENDING</option>
              <option value="en_route">EN ROUTE</option>
              <option value="delivered">DELIVERED</option>
            </select>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="h-9 px-3 bg-muted border border-border rounded-sm font-mono text-xs"
            >
              <option value="all">ALL TEAMS</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as typeof categoryFilter)
              }
              className="h-9 px-3 bg-muted border border-border rounded-sm font-mono text-xs"
            >
              <option value="all">ALL CATEGORIES</option>
              {Object.entries(categoryLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Active Tasks */}
          <section>
            <h2 className="font-mono text-sm font-bold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--tactical-orange)]" />
              ACTIVE LOGISTICS TASKS ({active.length})
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-44 w-full" />
                ))}
              </div>
            ) : active.length === 0 ? (
              <p className="font-mono text-xs text-muted-foreground p-6 border border-border rounded-sm bg-card">
                No active logistics tasks match your filters.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {active.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onMarkDelivered={() => markAsDelivered(t)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Completed */}
          {completed.length > 0 && (
            <section>
              <h2 className="font-mono text-sm font-bold mb-3 flex items-center gap-2 text-muted-foreground">
                <span className="w-2 h-2 bg-[var(--tactical-green)]" />
                COMPLETED ({completed.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
                {completed.map((t) => (
                  <TaskCard key={t.id} task={t} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <DeployResponseBar variant="floating" />
    </div>
  )
}

function StatTile({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  icon: React.ElementType
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        "p-4 border rounded-sm bg-card",
        accent
          ? "border-[var(--tactical-orange)]/30 bg-[var(--tactical-orange)]/5"
          : "border-border",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon
          className={cn(
            "w-4 h-4",
            accent ? "text-[var(--tactical-orange)]" : "text-muted-foreground",
          )}
        />
        <span
          className={cn(
            "font-mono text-[10px]",
            accent ? "text-[var(--tactical-orange)]" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
      </div>
      <p
        className={cn(
          "text-2xl font-mono font-bold",
          accent && "text-[var(--tactical-orange)]",
        )}
      >
        {value}
      </p>
    </div>
  )
}

function TaskCard({
  task,
  onMarkDelivered,
}: {
  task: LogisticsTask
  onMarkDelivered?: () => void
}) {
  const status = statusBadge[task.status]
  return (
    <article className="p-4 border border-border rounded-sm bg-card flex flex-col gap-3">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] text-muted-foreground tracking-wider">
            {categoryLabels[task.category]}
          </p>
          <h3 className="font-mono text-sm font-semibold mt-1 truncate">
            {task.title}
          </h3>
        </div>
        <span
          className={cn(
            "px-2 py-0.5 font-mono text-[9px] rounded-sm uppercase shrink-0",
            priorityBadge[task.priority],
          )}
        >
          {task.priority}
        </span>
      </header>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-[11px]">
        <div>
          <dt className="text-muted-foreground">TEAM</dt>
          <dd className="font-semibold">{task.team}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">DESTINATION</dt>
          <dd className="font-semibold truncate">{task.destination}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">LOAD</dt>
          <dd>{task.load_details}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">ETA</dt>
          <dd className="font-semibold">{task.eta} HRS</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">URGENCY</dt>
          <dd
            className={cn(
              "font-semibold",
              task.destination_urgency > 70
                ? "text-[var(--tactical-red)]"
                : task.destination_urgency >= 40
                  ? "text-[var(--tactical-yellow)]"
                  : "text-[var(--tactical-green)]",
            )}
          >
            {task.destination_urgency}
          </dd>
        </div>
      </dl>

      <footer className="flex items-center justify-between gap-2 pt-2 border-t border-border">
        <span
          className={cn(
            "px-2 py-1 border rounded-sm font-mono text-[10px]",
            status.className,
          )}
        >
          {status.label}
        </span>
        {task.status !== "delivered" && onMarkDelivered ? (
          <button
            type="button"
            onClick={onMarkDelivered}
            className="px-3 py-1.5 bg-[var(--tactical-green)]/15 text-[var(--tactical-green)] border border-[var(--tactical-green)]/40 font-mono text-[10px] tracking-wider rounded-sm hover:bg-[var(--tactical-green)]/25 transition-all"
          >
            MARK AS DELIVERED
          </button>
        ) : task.delivered_at ? (
          <span className="font-mono text-[10px] text-muted-foreground">
            {new Date(task.delivered_at).toLocaleString()}
          </span>
        ) : null}
      </footer>
    </article>
  )
}
