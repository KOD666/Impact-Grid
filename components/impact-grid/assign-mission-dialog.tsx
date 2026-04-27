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
import { Sparkles, User, MapPin, Star, CheckCircle } from "lucide-react"
import type { Mission, Volunteer } from "@/lib/types"

interface AssignMissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  volunteer?: Volunteer | null
  mission?: Mission | null
  mode?: "volunteer-to-mission" | "mission-to-volunteers"
  onAssigned?: () => void
}

interface AISuggestion {
  id: string
  name: string
  location: string
  skills: string[]
  score: number
  reasons: string[]
  missions_completed: number
  clearance_level: number
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
  mission,
  mode = "volunteer-to-mission",
  onAssigned,
}: AssignMissionDialogProps) {
  const { missions, refresh } = useMissions()
  const { queueMissionAssignment, volunteers } = useAppContext()
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const open_missions = (missions as Mission[]).filter(
    (m) => m.status === "pending" || m.status === "active",
  )

  // Fetch AI suggestions for a mission
  const fetchAiSuggestions = async (missionId: string) => {
    setAiLoading(true)
    setAiError(null)
    try {
      const res = await fetch("/api/ai-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, limit: 8 }),
      })
      const data = await res.json()
      if (data.success) {
        setAiSuggestions(data.data.matches)
      } else {
        setAiError(data.error || "Failed to get suggestions")
      }
    } catch (err) {
      setAiError("Network error")
    } finally {
      setAiLoading(false)
    }
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      if (mode === "volunteer-to-mission" && volunteer && selected) {
        queueMissionAssignment(selected, [volunteer.id])
        await assignVolunteer(selected, volunteer.id)
      } else if (mode === "mission-to-volunteers" && mission && selectedVolunteers.length > 0) {
        for (const volId of selectedVolunteers) {
          queueMissionAssignment(mission.id, [volId])
          await assignVolunteer(mission.id, volId)
        }
      }
      refresh()
      onAssigned?.()
      onOpenChange(false)
      setSelected(null)
      setSelectedVolunteers([])
      setAiSuggestions([])
    } finally {
      setSubmitting(false)
    }
  }

  const toggleVolunteerSelection = (volId: string) => {
    setSelectedVolunteers((prev) =>
      prev.includes(volId) ? prev.filter((id) => id !== volId) : [...prev, volId],
    )
  }

  // Mode: Assign a volunteer to a mission
  if (mode === "volunteer-to-mission") {
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
                          {m.title || m.name}
                        </p>
                        <span
                          className={`font-mono text-[10px] uppercase ${urgencyColors[m.urgency || m.priority || "medium"]}`}
                        >
                          {m.urgency || m.priority}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground mt-1">
                        {m.location} // {m.volunteers_required || 0} volunteers required //{" "}
                        {m.assigned_volunteers?.length || 0} assigned
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

  // Mode: Assign volunteers to a mission (with AI suggestions)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--tactical-orange)]" />
            AI Volunteer Matching
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {mission
              ? `Find the best volunteers for ${mission.title || mission.name}`
              : "Select a mission first."}
          </DialogDescription>
        </DialogHeader>

        {mission && (
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* AI Suggest Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchAiSuggestions(mission.id)}
                disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono text-xs font-semibold rounded-sm hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiLoading ? "ANALYZING..." : "AI SUGGEST"}
              </button>
              {aiSuggestions.length > 0 && (
                <span className="font-mono text-[10px] text-muted-foreground">
                  {aiSuggestions.length} matches found
                </span>
              )}
              {selectedVolunteers.length > 0 && (
                <span className="font-mono text-[10px] text-[var(--tactical-orange)]">
                  {selectedVolunteers.length} selected
                </span>
              )}
            </div>

            {aiError && (
              <p className="font-mono text-xs text-red-500 py-2">{aiError}</p>
            )}

            {/* Suggestions or All Volunteers */}
            <div className="flex-1 overflow-y-auto border border-border rounded-sm">
              {aiSuggestions.length > 0 ? (
                <div className="divide-y divide-border">
                  {aiSuggestions.map((suggestion, idx) => {
                    const isSelected = selectedVolunteers.includes(suggestion.id)
                    return (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => toggleVolunteerSelection(suggestion.id)}
                        className={`w-full text-left p-3 transition-colors ${
                          isSelected
                            ? "bg-[var(--tactical-orange)]/10"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                                idx < 3
                                  ? "bg-[var(--tactical-orange)] text-black"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-mono text-sm font-semibold flex items-center gap-2">
                                {suggestion.name}
                                {isSelected && (
                                  <CheckCircle className="w-3.5 h-3.5 text-[var(--tactical-green)]" />
                                )}
                              </p>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {suggestion.location}
                                </span>
                                <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  {suggestion.missions_completed} missions
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-mono text-lg font-bold ${
                                suggestion.score >= 80
                                  ? "text-[var(--tactical-green)]"
                                  : suggestion.score >= 50
                                    ? "text-[var(--tactical-yellow)]"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {suggestion.score}%
                            </div>
                            <p className="font-mono text-[10px] text-muted-foreground">
                              match
                            </p>
                          </div>
                        </div>
                        {suggestion.reasons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {suggestion.reasons.map((reason, i) => (
                              <span
                                key={i}
                                className="font-mono text-[9px] px-1.5 py-0.5 bg-muted rounded"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4">
                  <p className="font-mono text-xs text-muted-foreground mb-3">
                    {aiLoading
                      ? "Analyzing volunteer skills and availability..."
                      : "Click AI SUGGEST to find the best matches, or select manually:"}
                  </p>
                  {!aiLoading && (
                    <div className="space-y-2">
                      {(volunteers || [])
                        .filter((v) => v.availability === "available")
                        .slice(0, 10)
                        .map((vol) => {
                          const isSelected = selectedVolunteers.includes(vol.id)
                          return (
                            <button
                              key={vol.id}
                              type="button"
                              onClick={() => toggleVolunteerSelection(vol.id)}
                              className={`w-full text-left p-2 border rounded-sm transition-colors ${
                                isSelected
                                  ? "border-[var(--tactical-orange)] bg-[var(--tactical-orange)]/10"
                                  : "border-border hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="font-mono text-sm">{vol.name}</span>
                                {isSelected && (
                                  <CheckCircle className="w-3.5 h-3.5 text-[var(--tactical-green)] ml-auto" />
                                )}
                              </div>
                            </button>
                          )
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false)
              setSelectedVolunteers([])
              setAiSuggestions([])
            }}
            className="px-4 py-2 border border-border font-mono text-xs rounded-sm hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selectedVolunteers.length === 0 || submitting}
            onClick={handleConfirm}
            className="px-4 py-2 bg-[var(--tactical-orange)] text-primary-foreground font-mono text-xs font-semibold rounded-sm disabled:opacity-50"
          >
            {submitting
              ? "Assigning..."
              : `Assign ${selectedVolunteers.length} volunteer${selectedVolunteers.length !== 1 ? "s" : ""}`}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
