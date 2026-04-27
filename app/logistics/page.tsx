import { Sidebar } from "@/components/impact-grid/sidebar"
import { TopNav } from "@/components/impact-grid/top-nav"
import { StatsCard } from "@/components/impact-grid/stats-card"
import { MissionCard } from "@/components/impact-grid/mission-card"
import { FieldGearPanel } from "@/components/impact-grid/field-gear-panel"
import { ImpactLog } from "@/components/impact-grid/impact-log"
import { Clock, CheckCircle2, Target, Shield, Plus } from "lucide-react"

export default function LogisticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-56">
        <TopNav activeTab="reports" />
        
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <StatsCard
              label="ACTIVE_DUTY_HOURS"
              value="1,248.5"
              unit="HRS"
              trend={12.4}
              progress={75}
              icon={Clock}
            />
            <StatsCard
              label="MISSIONS_COMPLETED"
              value="42"
              subLabel="TIER 1 RESPONDER"
              icon={CheckCircle2}
            />
            <StatsCard
              label="FIELD_RELIEF_SCORE"
              value="98.2"
              unit="% EFFICIENCY"
              icon={Target}
            />
            <StatsCard
              label="AGENT_CLEARANCE"
              value="LEVEL IV"
              variant="accent"
              subLabel="SECURE_ACCESS: GRANTED"
              icon={Shield}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Mission Dossier */}
            <div className="col-span-8">
              <MissionCard
                id="SEA-WALL-II"
                title="Operation Sea-Wall II"
                location="COASTAL_SECTOR_07"
                code="FLOOD_RELIEF"
                description="Deployment of essential supplies and medical support to rural coastal communities affected by secondary storm surges. High coordination with local logistics required."
                slotsRemaining={34}
                tags={["LOGISTICS SPECIALIST", "BOAT LICENSE REQ"]}
                urgent={true}
              />
            </div>
            
            {/* Right Column - Gear & Logs */}
            <div className="col-span-4 space-y-6">
              <FieldGearPanel />
              <ImpactLog />
            </div>
          </div>

          {/* Field Operations Map */}
          <div className="border border-border rounded-sm bg-card overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <p className="font-mono text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[var(--tactical-orange)]" />
                FIELD_OPERATIONS_CONTOUR
              </p>
              <div className="flex items-center gap-4 font-mono text-[10px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[var(--tactical-orange)]" />
                  HIGH_RISK
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[var(--tactical-green)]" />
                  ACTIVE_DEPLOYMENT
                </span>
              </div>
            </div>
            
            <div className="relative h-64 bg-gradient-to-br from-[#0d1117] to-[#161b22]">
              {/* Topographic overlay */}
              <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
                <defs>
                  <pattern id="contour" width="200" height="200" patternUnits="userSpaceOnUse">
                    <ellipse cx="100" cy="100" rx="80" ry="40" fill="none" stroke="#4a5568" strokeWidth="0.5" />
                    <ellipse cx="100" cy="100" rx="60" ry="30" fill="none" stroke="#4a5568" strokeWidth="0.5" />
                    <ellipse cx="100" cy="100" rx="40" ry="20" fill="none" stroke="#4a5568" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#contour)" />
              </svg>
              
              {/* Coordinates overlay */}
              <div className="absolute top-4 left-4 p-3 bg-background/80 border border-border rounded-sm">
                <p className="font-mono text-[10px] text-[var(--tactical-orange)]">TARGET_COORD_B09</p>
                <div className="mt-2 space-y-1 font-mono text-[10px]">
                  <p>LAT: <span className="text-foreground">34.0522° N</span></p>
                  <p>LNG: <span className="text-foreground">118.2437° N</span></p>
                  <p>ELEV: <span className="text-foreground">248m</span> <span className="text-muted-foreground">+/- 1.2m</span></p>
                </div>
              </div>

              {/* Map marker */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-[var(--tactical-orange)]" />
              </div>

              {/* Active Comms */}
              <div className="absolute bottom-4 right-4 px-4 py-2 border border-[var(--tactical-orange)] rounded-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--tactical-orange)] animate-pulse" />
                  <span className="font-mono text-xs text-[var(--tactical-orange)]">ACTIVE_COMMS: ONLINE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Action Button */}
          <div className="fixed bottom-6 right-6">
            <button className="w-14 h-14 rounded-full bg-[var(--tactical-orange)] text-primary-foreground flex items-center justify-center shadow-lg hover:brightness-110 transition-all">
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
