"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppContext } from "@/components/providers/app-provider"
import {
  removeVolunteer,
  updateVolunteer as updateVolunteerApi,
} from "@/hooks/use-dashboard"
import type { Volunteer } from "@/lib/types"
import { AssignMissionDialog } from "./assign-mission-dialog"

interface VolunteerCardProps {
  volunteer: Volunteer
  onChanged?: () => void
}

function formatJoined(date?: string) {
  if (!date) return "Recently joined"
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return "Recently joined"
  return `Joined ${parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`
}

export function VolunteerCard({ volunteer, onChanged }: VolunteerCardProps) {
  const router = useRouter()
  const { queueVolunteerUpdate } = useAppContext()
  const [assignOpen, setAssignOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [localAvailable, setLocalAvailable] = useState(
    volunteer.availability === "available",
  )

  const handleAvailabilityToggle = async (next: boolean) => {
    setLocalAvailable(next)
    setBusy(true)
    const availability = next ? "available" : "offline"
    queueVolunteerUpdate(volunteer.id, { availability })
    try {
      await updateVolunteerApi(volunteer.id, { availability })
      onChanged?.()
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async () => {
    setBusy(true)
    try {
      await removeVolunteer(volunteer.id)
      onChanged?.()
    } finally {
      setBusy(false)
    }
  }

  const skillsLine =
    volunteer.skills && volunteer.skills.length > 0
      ? volunteer.skills.slice(0, 4).join(" / ")
      : "No skills listed"

  const missionsLine =
    volunteer.missions_completed > 0
      ? `${volunteer.missions_completed} mission${volunteer.missions_completed === 1 ? "" : "s"} completed`
      : "No missions yet"

  return (
    <article className="p-4 border border-border rounded-sm bg-card flex flex-col gap-3">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center relative">
          <User className="w-5 h-5 text-muted-foreground" />
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card",
              localAvailable ? "bg-[var(--tactical-green)]" : "bg-muted-foreground",
            )}
            aria-label={localAvailable ? "Available" : "Unavailable"}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-mono text-sm font-semibold truncate">
            {volunteer.name}
          </h3>
          <p className="font-mono text-[10px] text-muted-foreground">
            {formatJoined(volunteer.joined_at)}
          </p>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-2 font-mono text-[11px]">
        <div>
          <dt className="text-muted-foreground">Status</dt>
          <dd className="font-semibold">
            {localAvailable ? "Available" : "Unavailable"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Missions</dt>
          <dd>{missionsLine}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">Skills</dt>
          <dd className="line-clamp-2">{skillsLine}</dd>
        </div>
      </dl>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
        <label className="flex items-center gap-2 text-xs font-mono">
          <Switch
            checked={localAvailable}
            onCheckedChange={handleAvailabilityToggle}
            disabled={busy}
            aria-label="Update availability"
          />
          Available
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setAssignOpen(true)}
          className="flex-1 px-3 py-1.5 bg-[var(--tactical-orange)] text-primary-foreground font-mono text-[10px] tracking-wider font-semibold rounded-sm hover:brightness-110"
        >
          ASSIGN MISSION
        </button>
        <Link
          href={`/personnel/${volunteer.id}`}
          className="flex-1 text-center px-3 py-1.5 border border-border font-mono text-[10px] tracking-wider rounded-sm hover:bg-muted"
        >
          VIEW PROFILE
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="px-3 py-1.5 border border-[var(--tactical-red)]/40 text-[var(--tactical-red)] font-mono text-[10px] tracking-wider rounded-sm hover:bg-[var(--tactical-red)]/10"
            >
              REMOVE
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Remove {volunteer.name}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the volunteer&apos;s record from the
                roster. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemove}
                className="bg-[var(--tactical-red)] text-white hover:bg-[var(--tactical-red)]/90"
              >
                Remove volunteer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <AssignMissionDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        volunteer={volunteer}
        onAssigned={() => {
          onChanged?.()
          router.refresh()
        }}
      />
    </article>
  )
}
