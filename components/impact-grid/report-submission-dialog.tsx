"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Plus, AlertTriangle, CheckCircle2 } from "lucide-react"
import type { Report, Mission, ReportCategory } from "@/lib/types"

interface ProcessedResult {
  report: Report
  processed: {
    category: ReportCategory
    urgency_score: number
    urgency_signals: string[]
    people_affected: number
    vulnerable_groups: string[]
    keywords: string[]
  }
  mission: Mission | null
  alerts_triggered: number
}

export function ReportSubmissionDialog({ onReportSubmitted }: { onReportSubmitted?: () => void }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ProcessedResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!text.trim() || !location.trim()) {
      setError("Please provide both report text and location")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, location })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        onReportSubmitted?.()
      } else {
        setError(data.error || "Failed to submit report")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    // Reset state after animation
    setTimeout(() => {
      setText("")
      setLocation("")
      setResult(null)
      setError(null)
    }, 200)
  }

  const getUrgencyColor = (score: number) => {
    if (score >= 75) return "text-red-500"
    if (score >= 50) return "text-orange-500"
    if (score >= 25) return "text-yellow-500"
    return "text-green-500"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs uppercase tracking-wider">
          <Plus className="w-4 h-4 mr-2" />
          NEW_REPORT
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-primary text-lg tracking-wider">
            SUBMIT_FIELD_REPORT
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4 mt-4">
            <FieldGroup>
              <Field>
                <FieldLabel className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  REPORT_TEXT
                </FieldLabel>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe the situation... (e.g., 'Critical water shortage in Sector 7. 50 families affected including children and elderly. Urgent assistance needed.')"
                  className="min-h-[120px] bg-background border-border font-mono text-sm"
                  disabled={isSubmitting}
                />
              </Field>
              <Field>
                <FieldLabel className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  LOCATION
                </FieldLabel>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Sector 7G, Camp Alpha, Field Hospital Delta"
                  className="bg-background border-border font-mono text-sm"
                  disabled={isSubmitting}
                />
              </Field>
            </FieldGroup>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm font-mono">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="font-mono text-xs uppercase tracking-wider"
                disabled={isSubmitting}
              >
                CANCEL
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs uppercase tracking-wider min-w-[140px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    PROCESSING...
                  </>
                ) : (
                  "SUBMIT_REPORT"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Success Header */}
            <div className="flex items-center gap-2 text-green-500 font-mono">
              <CheckCircle2 className="w-5 h-5" />
              <span className="uppercase tracking-wider text-sm">REPORT_PROCESSED</span>
            </div>

            {/* AI Analysis Results */}
            <div className="bg-background border border-border p-4 space-y-3">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">
                AI_ANALYSIS_RESULTS
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-mono text-xs text-muted-foreground">CATEGORY</div>
                  <div className="font-mono text-sm text-primary uppercase">
                    {result.processed.category}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs text-muted-foreground">URGENCY_SCORE</div>
                  <div className={`font-mono text-2xl font-bold ${getUrgencyColor(result.processed.urgency_score)}`}>
                    {result.processed.urgency_score}
                    <span className="text-xs text-muted-foreground ml-1">/ 100</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-mono text-xs text-muted-foreground">PEOPLE_AFFECTED</div>
                  <div className="font-mono text-sm text-foreground">
                    ~{result.processed.people_affected}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs text-muted-foreground">VULNERABLE_GROUPS</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.processed.vulnerable_groups.length > 0 ? (
                      result.processed.vulnerable_groups.map((group) => (
                        <span
                          key={group}
                          className="px-2 py-0.5 bg-destructive/20 text-destructive text-xs font-mono rounded"
                        >
                          {group}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs">None detected</span>
                    )}
                  </div>
                </div>
              </div>

              {result.processed.urgency_signals.length > 0 && (
                <div>
                  <div className="font-mono text-xs text-muted-foreground">URGENCY_SIGNALS</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.processed.urgency_signals.map((signal) => (
                      <span
                        key={signal}
                        className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-mono rounded"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mission Generated */}
            {result.mission && (
              <div className="bg-primary/10 border border-primary/30 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="font-mono text-xs text-primary uppercase tracking-wider">
                    MISSION_AUTO_GENERATED
                  </span>
                </div>
                <div className="font-mono text-sm text-foreground">
                  {result.mission.title}
                </div>
                <div className="flex gap-4 text-xs font-mono text-muted-foreground">
                  <span>VOLUNTEERS: {result.mission.volunteers_required}</span>
                  <span>EST: {result.mission.time_estimate}</span>
                  <span className={
                    result.mission.urgency === "critical" ? "text-red-500" :
                    result.mission.urgency === "high" ? "text-orange-500" :
                    "text-yellow-500"
                  }>
                    {result.mission.urgency.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Alerts */}
            {result.alerts_triggered > 0 && (
              <div className="flex items-center gap-2 text-yellow-500 font-mono text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{result.alerts_triggered} predictive alert(s) triggered</span>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleClose}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs uppercase tracking-wider"
              >
                CLOSE
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
