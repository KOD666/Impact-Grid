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
  onViewDetails?: () => void
  onSelect?: () => void
  isSelected?: boolean
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
  onViewDetails,
  onSelect,
  isSelected,
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
    <div
      onClick={onSelect}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect()
              }
            }
          : undefined
      }
      className={cn(
        "border rounded-sm bg-card overflow-hidden transition-all",
        isSelected
          ? "border-[var(--tactical-orange)] shadow-[0_0_0_1px_var(--tactical-orange)]"
          : "border-border",
        onSelect && "cursor-pointer hover:border-[var(--tactical-orange)]/60",
      )}
    >
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
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails?.()
            }}
            className="flex-1 px-3 py-2 border border-border font-mono text-[10px] tracking-wider rounded-sm hover:bg-muted transition-all"
          >
            VIEW_DETAILS
          </button>
          {!isActive && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeploy?.()
              }}
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
