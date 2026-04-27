"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useMissions, assignVolunteer } from "@/hooks/use-dashboard"
import { useAppContext } from "@/components/providers/app-provider"
import type { Mission, Volunteer } from "@/lib/types"

interface AssignMissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  volunteer: Volunteer | null
  onAssigned?: () => void
}

const urgencyColors: Record<string, string> = {
  critical: "text-[var(--tactical-red)]",
  high: "text-[var(--tactical-orange)]",
  medium: "text-[var(--tactical-yellow)]",
  low: "text-[var(--tactical-green)]",
}

export function AssignMissionDialog({
  open,
  onOpenChange,
  volunteer,
  onAssigned,
}: AssignMissionDialogProps) {
  const { missions, refresh } = useMissions()
  const { queueMissionAssignment } = useAppContext()
  const [selected, setSelected] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const open_missions = (missions as Mission[]).filter(
    (m) => m.status === "pending" || m.status === "active",
  )

  const handleConfirm = async () => {
    if (!volunteer || !selected) return
    setSubmitting(true)
    try {
      queueMissionAssignment(selected, [volunteer.id])
      await assignVolunteer(selected, volunteer.id)
      refresh()
      onAssigned?.()
      onOpenChange(false)
      setSelected(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono">Assign Mission</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {volunteer
              ? `Pick an open mission to assign to ${volunteer.name}.`
              : "Select a volunteer first."}
          </DialogDescription>
        </DialogHeader>

        {open_missions.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground py-4">
            No open missions available right now.
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto space-y-2">
            {open_missions.map((m) => {
              const isSel = selected === m.id
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(m.id)}
                    className={`w-full text-left p-3 border rounded-sm transition-colors ${
                      isSel
                        ? "border-[var(--tactical-orange)] bg-[var(--tactical-orange)]/10"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-sm font-semibold truncate">
                        {m.title}
                      </p>
                      <span
                        className={`font-mono text-[10px] uppercase ${urgencyColors[m.urgency]}`}
                      >
                        {m.urgency}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground mt-1">
                      {m.location} // {m.volunteers_required} volunteers required //{" "}
                      {m.assigned_volunteers.length} assigned
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-border font-mono text-xs rounded-sm hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected || submitting}
            onClick={handleConfirm}
            className="px-4 py-2 bg-[var(--tactical-orange)] text-primary-foreground font-mono text-xs font-semibold rounded-sm disabled:opacity-50"
          >
            {submitting ? "Assigning..." : "Confirm assignment"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
