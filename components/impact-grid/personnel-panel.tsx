import { cn } from "@/lib/utils"
import { User } from "lucide-react"

interface PersonnelMember {
  id: string
  name: string
  callsign?: string
  status?: "READY" | "ACTIVE_MSN" | "STANDBY"
  availability?: "available" | "busy" | "offline"
  certifications?: string[]
  skills?: string[]
  clearance_level?: number
}

const defaultPersonnel: PersonnelMember[] = [
  {
    id: "1",
    name: "SGT. ELIAS VANCE",
    callsign: "ID: 992-KILO-001",
    status: "READY",
    certifications: ["MED_L3", "HAZMAT_CERT"],
  },
  {
    id: "2",
    name: "TECH. MIA CHEN",
    callsign: "ID: 401-DELTA-012",
    status: "ACTIVE_MSN",
  },
  {
    id: "3",
    name: "OP. MARCUS THORNE",
    callsign: "ID: 112-SIERRA-099",
    status: "READY",
  },
]

interface PersonnelPanelProps {
  personnel?: PersonnelMember[]
  volunteers?: PersonnelMember[]
  className?: string
}

export function PersonnelPanel({ personnel = defaultPersonnel, volunteers, className }: PersonnelPanelProps) {
  // Use volunteers from API if provided, otherwise fall back to personnel prop or defaults
  const displayPersonnel = volunteers?.length ? volunteers.map(v => ({
    ...v,
    callsign: v.callsign || `ID: ${v.id}`,
    status: v.status || (v.availability === "available" ? "READY" : v.availability === "busy" ? "ACTIVE_MSN" : "STANDBY") as "READY" | "ACTIVE_MSN" | "STANDBY",
    certifications: v.certifications || v.skills?.slice(0, 2).map(s => s.toUpperCase().replace(/\s+/g, "_"))
  })) : personnel
  const statusStyles = {
    READY: "bg-[var(--tactical-green)]/20 text-[var(--tactical-green)] border-[var(--tactical-green)]/30",
    ACTIVE_MSN: "bg-[var(--tactical-orange)]/20 text-[var(--tactical-orange)] border-[var(--tactical-orange)]/30",
    STANDBY: "bg-muted text-muted-foreground border-border",
  }

  return (
    <div className={cn("border border-border rounded-sm bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <p className="font-mono text-xs text-muted-foreground">PERSONNEL_READINESS</p>
        <span className="font-mono text-[10px] text-[var(--tactical-orange)]">REFR_SEC: 3.2s</span>
      </div>

      {/* Personnel List */}
      <div className="p-3 space-y-3">
        {displayPersonnel.map((person) => (
          <div
            key={person.id}
            className="flex items-center gap-3 p-2 border border-border rounded-sm bg-muted/30"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-xs font-semibold truncate">{person.name}</h4>
                <span
                  className={cn(
                    "px-2 py-0.5 border rounded-sm font-mono text-[10px] flex-shrink-0 ml-2",
                    statusStyles[person.status]
                  )}
                >
                  {person.status}
                </span>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">{person.callsign}</p>
              {person.certifications && (
                <div className="flex items-center gap-1 mt-1">
                  {person.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="px-1.5 py-0.5 bg-muted border border-border rounded-sm font-mono text-[8px]"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
