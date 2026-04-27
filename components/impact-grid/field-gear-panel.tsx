import { cn } from "@/lib/utils"
import { Briefcase, Radio, MapPin, Search } from "lucide-react"

interface GearItem {
  id: string
  label: string
  icon: "medkit" | "satcom" | "search"
  active?: boolean
}

const defaultGear: GearItem[] = [
  { id: "1", label: "FIELD MEDKIT", icon: "medkit", active: true },
  { id: "2", label: "SAT-COM-9", icon: "satcom", active: true },
  { id: "3", label: "", icon: "medkit" },
  { id: "4", label: "SEARCH UNIT", icon: "search", active: true },
]

interface FieldGearPanelProps {
  className?: string
}

export function FieldGearPanel({ className }: FieldGearPanelProps) {
  const icons = {
    medkit: Briefcase,
    satcom: Radio,
    search: Search,
  }

  return (
    <div className={cn("border border-border rounded-sm bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <p className="font-mono text-xs text-muted-foreground">FIELD_GEAR_&_CERTS</p>
      </div>

      {/* Certifications */}
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-muted-foreground">ADVANCED_TRAUMA_CARE</span>
          <span className="font-mono text-xs text-[var(--tactical-green)]">85% STATUS</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-muted-foreground">RADIO_COMM_PROTOCOL</span>
          <span className="font-mono text-xs text-[var(--tactical-green)]">OPERATIONAL</span>
        </div>
      </div>

      {/* Gear Grid */}
      <div className="p-3 pt-0">
        <div className="grid grid-cols-2 gap-2">
          {defaultGear.map((item) => {
            const Icon = icons[item.icon]
            return (
              <div
                key={item.id}
                className={cn(
                  "p-3 border border-border rounded-sm relative",
                  item.active ? "bg-muted/30" : "bg-transparent opacity-50"
                )}
              >
                <Icon className="w-5 h-5 text-muted-foreground mb-2" />
                {item.label && (
                  <p className="font-mono text-[10px]">{item.label}</p>
                )}
                {item.active && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--tactical-orange)]" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
