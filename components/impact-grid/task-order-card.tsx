import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

interface TaskOrderProps {
  priority: string
  title: string
  description: string
  personnel: string
  duration: string
  location: string
  equipment: string
  status: "SYS_AUTH_OK" | "LOG_PENDING" | "SCAN_ACTIVE" | "ACTIVE"
  onDeploy?: () => void
  isDeploying?: boolean
  isActive?: boolean
}

export function TaskOrderCard({
  priority,
  title,
  description,
  personnel,
  duration,
  location,
  equipment,
  status,
  onDeploy,
  isDeploying,
  isActive,
}: TaskOrderProps) {
  const statusColors = {
    SYS_AUTH_OK: "text-[var(--tactical-green)]",
    LOG_PENDING: "text-[var(--tactical-yellow)]",
    SCAN_ACTIVE: "text-[var(--tactical-orange)]",
    ACTIVE: "text-[var(--tactical-green)]",
  }

  return (
    <div className="border border-border rounded-sm bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <span className="font-mono text-xs text-[var(--tactical-orange)] flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[var(--tactical-orange)]" />
          {priority}
        </span>
        <span className={cn("font-mono text-[10px]", statusColors[status])}>
          {status}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-mono text-base font-bold tracking-wide mb-2">{title}</h3>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Details Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="font-mono text-[10px] text-muted-foreground">PERSONNEL</p>
            <p className="font-mono text-xs font-semibold mt-0.5">{personnel}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted-foreground">EST_DUR</p>
            <p className="font-mono text-xs font-semibold mt-0.5">{duration}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted-foreground">LOCATION</p>
            <p className="font-mono text-xs font-semibold mt-0.5">{location}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted-foreground">EQUIPMENT</p>
            <p className="font-mono text-xs font-semibold mt-0.5">{equipment}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-3">
          <button className="flex-1 px-3 py-2 border border-border font-mono text-[10px] tracking-wider rounded-sm hover:bg-muted transition-all">
            VIEW_DETAILS
          </button>
          {!isActive && (
            <button 
              onClick={onDeploy}
              disabled={isDeploying}
              className={cn(
                "flex-1 px-3 py-2 bg-[var(--tactical-orange)] text-primary-foreground font-mono text-[10px] tracking-wider font-semibold rounded-sm hover:brightness-110 transition-all flex items-center justify-center gap-2",
                isDeploying && "opacity-70 cursor-not-allowed"
              )}
            >
              {isDeploying ? (
                <>
                  <Spinner className="w-3 h-3" />
                  DEPLOYING...
                </>
              ) : (
                "INITIALIZE_DEPLOYMENT"
              )}
            </button>
          )}
          {isActive && (
            <span className="flex-1 px-3 py-2 bg-[var(--tactical-green)]/20 text-[var(--tactical-green)] border border-[var(--tactical-green)]/30 font-mono text-[10px] tracking-wider font-semibold rounded-sm text-center">
              IN_PROGRESS
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
