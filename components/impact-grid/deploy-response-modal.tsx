'use client'

import { useContext, useState } from 'react'
import { AppContext } from '@/components/providers/app-provider'
import { Check, Loader } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Updating mission statuses' },
  { id: 2, label: 'Assigning volunteers' },
  { id: 3, label: 'Pushing logistics targets' },
  { id: 4, label: 'Running alert check' },
]

interface DeployResponseModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DeployResponseModal({ isOpen, onClose }: DeployResponseModalProps) {
  const { deploy, deployStep, pendingChanges } = useContext(AppContext)!
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployResult, setDeployResult] = useState<{ success: boolean; error?: string } | null>(null)

  const handleDeploy = async () => {
    setIsDeploying(true)
    try {
      const result = await deploy()
      setDeployResult(result)
    } catch (error) {
      console.error('[v0] Deploy failed:', error)
      setDeployResult({ success: false, error: 'Deployment failed. Please try again.' })
    } finally {
      setIsDeploying(false)
    }
  }

  if (!isOpen) return null

  const totalChanges = pendingChanges.missionStatusUpdates 
    ? Object.keys(pendingChanges.missionStatusUpdates).length 
    : 0
  const totalVolunteers = pendingChanges.volunteerUpdates 
    ? Object.keys(pendingChanges.volunteerUpdates).length 
    : 0

  const isComplete = deployStep === 4 && deployResult?.success

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-sm w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="font-mono font-semibold text-lg">DEPLOY_RESPONSE</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isComplete ? 'Deployment complete' : 'Processing changes...'}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {!deployResult ? (
            <div className="space-y-6">
              {/* Progress Stepper */}
              <div className="space-y-3">
                {STEPS.map((step) => {
                  const isActive = step.id === deployStep
                  const isDone = deployStep > step.id
                  const isPending = deployStep < step.id

                  return (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold ${
                        isDone
                          ? 'bg-[var(--tactical-green)] text-black'
                          : isActive
                          ? 'bg-[var(--tactical-orange)] text-black'
                          : isPending
                          ? 'bg-muted border border-border'
                          : 'bg-muted border border-border'
                      }`}>
                        {isDone ? (
                          <Check className="w-3 h-3" />
                        ) : isActive ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <span className={`font-mono text-sm ${
                        isDone || isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Summary */}
              {deployStep > 0 && (
                <div className="bg-muted/50 rounded-sm p-3 border border-border/50">
                  <p className="font-mono text-xs text-muted-foreground">Summary</p>
                  <p className="font-mono text-sm mt-2">
                    {totalChanges} {totalChanges === 1 ? 'mission' : 'missions'} · {totalVolunteers} {totalVolunteers === 1 ? 'volunteer' : 'volunteers'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-center">
              {deployResult.success ? (
                <>
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--tactical-green)] flex items-center justify-center">
                      <Check className="w-6 h-6 text-black" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-mono font-semibold mb-1">Deployment successful</h3>
                    <p className="text-xs text-muted-foreground">
                      {totalChanges} {totalChanges === 1 ? 'mission' : 'missions'} activated · {totalVolunteers} {totalVolunteers === 1 ? 'volunteer' : 'volunteers'} assigned
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center">
                      <span className="text-red-200 text-xl">✕</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-mono font-semibold text-red-200 mb-1">Deployment failed</h3>
                    {deployResult.error && (
                      <p className="text-xs text-red-200/70">{deployResult.error}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex gap-2">
          {!deployResult ? (
            <>
              <button
                onClick={onClose}
                disabled={isDeploying}
                className="flex-1 px-4 py-2 border border-border font-mono text-xs tracking-wider rounded-sm hover:bg-muted disabled:opacity-50 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="flex-1 px-4 py-2 bg-[var(--tactical-orange)] text-black font-mono text-xs tracking-wider rounded-sm hover:bg-[var(--tactical-orange)]/90 disabled:opacity-50 transition-all"
              >
                {isDeploying ? 'DEPLOYING...' : 'START_DEPLOY'}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-[var(--tactical-orange)] text-black font-mono text-xs tracking-wider rounded-sm hover:bg-[var(--tactical-orange)]/90 transition-all"
            >
              CLOSE
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
