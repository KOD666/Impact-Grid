"use client"

import { useState } from "react"
import { Zap, CheckCircle2, Loader2 } from "lucide-react"
import { useAppContext } from "@/components/providers/app-provider"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const STEPS = [
  "Updating mission assignments",
  "Notifying field volunteers",
  "Recalculating logistics routes",
  "Deployment complete",
]

interface DeployResponseBarProps {
  variant?: "floating" | "inline"
}

export function DeployResponseBar({ variant = "floating" }: DeployResponseBarProps) {
  const { pendingCount, deploy, isDeploying, deployStep } = useAppContext()
  const [open, setOpen] = useState(false)

  const disabled = pendingCount === 0 || isDeploying

  const handleDeploy = async () => {
    setOpen(true)
    await deploy()
    // auto-close shortly after success
    setTimeout(() => setOpen(false), 1200)
  }

  const button = (
    <button
      onClick={handleDeploy}
      disabled={disabled}
      title={pendingCount === 0 ? "No changes to deploy" : `${pendingCount} pending change${pendingCount === 1 ? "" : "s"}`}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 font-mono text-xs font-semibold tracking-wider rounded-sm transition-all border",
        disabled
          ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
          : "bg-[var(--tactical-orange)] text-primary-foreground border-[var(--tactical-orange)] hover:brightness-110",
      )}
    >
      {isDeploying ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Zap className="w-4 h-4" />
      )}
      DEPLOY RESPONSE
      {pendingCount > 0 && (
        <span
          className={cn(
            "px-1.5 py-0.5 rounded-sm text-[10px] font-bold",
            disabled
              ? "bg-muted-foreground/20"
              : "bg-primary-foreground/20",
          )}
        >
          {pendingCount}
        </span>
      )}
    </button>
  )

  return (
    <>
      {variant === "floating" ? (
        <div className="fixed bottom-6 right-6 z-40">{button}</div>
      ) : (
        button
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">FIELD DEPLOYMENT</DialogTitle>
            <DialogDescription className="font-mono text-xs">
              Pushing pending changes to the field. Hold position.
            </DialogDescription>
          </DialogHeader>

          <ol className="space-y-3 mt-2">
            {STEPS.map((label, idx) => {
              const i = idx + 1
              const isDone = deployStep > i || deployStep === STEPS.length
              const isActive = deployStep === i
              return (
                <li key={label} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center border",
                      isDone
                        ? "bg-[var(--tactical-green)]/20 border-[var(--tactical-green)] text-[var(--tactical-green)]"
                        : isActive
                          ? "bg-[var(--tactical-orange)]/20 border-[var(--tactical-orange)] text-[var(--tactical-orange)]"
                          : "bg-muted border-border text-muted-foreground",
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="font-mono text-[10px]">{i}</span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-sm",
                      isDone || isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                </li>
              )
            })}
          </ol>
        </DialogContent>
      </Dialog>
    </>
  )
}
