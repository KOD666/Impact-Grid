import { Sidebar } from "@/components/impact-grid/sidebar"
import { TopNav } from "@/components/impact-grid/top-nav"
import { PersonnelPanel } from "@/components/impact-grid/personnel-panel"
import { User, Shield, Award, Activity } from "lucide-react"

const allPersonnel = [
  {
    id: "1",
    name: "SGT. ELIAS VANCE",
    callsign: "ID: 992-KILO-001",
    status: "READY" as const,
    certifications: ["MED_L3", "HAZMAT_CERT"],
  },
  {
    id: "2",
    name: "TECH. MIA CHEN",
    callsign: "ID: 401-DELTA-012",
    status: "ACTIVE_MSN" as const,
  },
  {
    id: "3",
    name: "OP. MARCUS THORNE",
    callsign: "ID: 112-SIERRA-099",
    status: "READY" as const,
  },
  {
    id: "4",
    name: "CPL. SARAH REYES",
    callsign: "ID: 203-ECHO-045",
    status: "STANDBY" as const,
    certifications: ["COMMS_CERT"],
  },
  {
    id: "5",
    name: "LT. JAMES WALKER",
    callsign: "ID: 556-ALPHA-002",
    status: "READY" as const,
    certifications: ["COMMAND", "TACTICAL"],
  },
  {
    id: "6",
    name: "SPC. NINA PATEL",
    callsign: "ID: 789-BRAVO-018",
    status: "ACTIVE_MSN" as const,
    certifications: ["MED_L2"],
  },
]

export default function PersonnelPage() {
  const readyCount = allPersonnel.filter((p) => p.status === "READY").length
  const activeCount = allPersonnel.filter((p) => p.status === "ACTIVE_MSN").length
  const standbyCount = allPersonnel.filter((p) => p.status === "STANDBY").length

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-56">
        <TopNav activeTab="reports" />
        
        <div className="p-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 border border-border rounded-sm bg-card">
              <div className="flex items-center justify-between mb-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-mono text-[10px] text-muted-foreground">TOTAL</span>
              </div>
              <p className="text-3xl font-mono font-bold">{allPersonnel.length}</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">ACTIVE_ROSTER</p>
            </div>

            <div className="p-4 border border-[var(--tactical-green)]/30 rounded-sm bg-[var(--tactical-green)]/5">
              <div className="flex items-center justify-between mb-3">
                <Shield className="w-5 h-5 text-[var(--tactical-green)]" />
                <span className="font-mono text-[10px] text-[var(--tactical-green)]">READY</span>
              </div>
              <p className="text-3xl font-mono font-bold text-[var(--tactical-green)]">{readyCount}</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">DEPLOYMENT_READY</p>
            </div>

            <div className="p-4 border border-[var(--tactical-orange)]/30 rounded-sm bg-[var(--tactical-orange)]/5">
              <div className="flex items-center justify-between mb-3">
                <Activity className="w-5 h-5 text-[var(--tactical-orange)]" />
                <span className="font-mono text-[10px] text-[var(--tactical-orange)]">ACTIVE</span>
              </div>
              <p className="text-3xl font-mono font-bold text-[var(--tactical-orange)]">{activeCount}</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">ON_MISSION</p>
            </div>

            <div className="p-4 border border-border rounded-sm bg-card">
              <div className="flex items-center justify-between mb-3">
                <Award className="w-5 h-5 text-muted-foreground" />
                <span className="font-mono text-[10px] text-muted-foreground">STANDBY</span>
              </div>
              <p className="text-3xl font-mono font-bold">{standbyCount}</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">RESERVE_STATUS</p>
            </div>
          </div>

          {/* Personnel Grid */}
          <div className="grid grid-cols-2 gap-6">
            <PersonnelPanel personnel={allPersonnel.slice(0, 3)} />
            <PersonnelPanel personnel={allPersonnel.slice(3, 6)} />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-[var(--tactical-orange)] text-primary-foreground font-mono text-xs font-semibold tracking-wider rounded-sm hover:brightness-110 transition-all">
              ADD_PERSONNEL
            </button>
            <button className="px-6 py-3 border border-border font-mono text-xs tracking-wider rounded-sm hover:bg-muted transition-all">
              EXPORT_ROSTER
            </button>
            <button className="px-6 py-3 border border-border font-mono text-xs tracking-wider rounded-sm hover:bg-muted transition-all">
              SCHEDULE_ROTATION
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
