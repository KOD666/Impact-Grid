import { cn } from "@/lib/utils"
import { Fuel, Cross, Users, Lock } from "lucide-react"

interface ResourceItem {
  id: string
  label?: string
  name?: string
  value?: number
  current?: number
  capacity?: number
  icon?: "fuel" | "medical" | "personnel"
  status?: "nominal" | "low" | "critical"
}

const defaultResources: ResourceItem[] = [
  { id: "1", label: "FUEL_RESERVES_ALPHA", value: 72.4, icon: "fuel" },
  { id: "2", label: "MEDICAL_SUPPLY_BASE", value: 58, icon: "medical" },
  { id: "3", label: "PERSONNEL_DEPLOYMENT", value: 91.8, icon: "personnel" },
]

interface ResourceMatrixProps {
  resources?: ResourceItem[]
  className?: string
}

export function ResourceMatrix({ resources = defaultResources, className }: ResourceMatrixProps) {
  const icons = {
    fuel: Fuel,
    medical: Cross,
    personnel: Users,
  }

  return (
    <div className={cn("border border-border rounded-sm bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <p className="font-mono text-xs text-muted-foreground">RESOURCE_ALLOCATION_MATRIX</p>
      </div>

      {/* Resources */}
      <div className="p-3 space-y-4">
        {resources.map((resource) => {
          const label = resource.label || resource.name || "RESOURCE"
          const value = resource.value ?? resource.current ?? 50
          const iconType = resource.icon || (label.toLowerCase().includes("fuel") ? "fuel" : label.toLowerCase().includes("medical") ? "medical" : "personnel")
          const Icon = icons[iconType]
          const isLow = resource.status === "low" || value < 60
          const isCritical = resource.status === "critical" || value < 40

          return (
            <div key={resource.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className={cn(
                    "w-3.5 h-3.5",
                    isCritical ? "text-[var(--tactical-red)]" : 
                    isLow ? "text-[var(--tactical-yellow)]" : 
                    "text-[var(--tactical-orange)]"
                  )} />
                  <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
                    {label}
                  </span>
                </div>
                <span className={cn(
                  "font-mono text-xs font-semibold",
                  isCritical ? "text-[var(--tactical-red)]" : 
                  isLow ? "text-[var(--tactical-yellow)]" : 
                  "text-[var(--tactical-green)]"
                )}>
                  {value}%
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    isCritical ? "bg-[var(--tactical-red)]" : 
                    isLow ? "bg-[var(--tactical-yellow)]" : 
                    "bg-[var(--tactical-orange)]"
                  )}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Encryption Status */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-xs font-semibold">ENCRYPTION_STATUS</span>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">
          RSA-4096 // AES-GCM // <span className="text-[var(--tactical-green)]">ACTIVE</span>
        </p>
        <div className="flex justify-between mt-2 font-mono text-[10px] text-muted-foreground">
          <span>UPLINK_BANDWIDTH:</span>
          <span className="text-foreground">9.4 GB/S</span>
        </div>
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>SESSION_KEY:</span>
          <span className="text-foreground">B4_A9_C2_7F...</span>
        </div>
      </div>
    </div>
  )
}
