import { Sidebar } from "@/components/impact-grid/sidebar"
import { TopNav } from "@/components/impact-grid/top-nav"
import { SatelliteStatus } from "@/components/impact-grid/satellite-status"
import { LiveDataPanel } from "@/components/impact-grid/live-data-panel"
import { NeuralDataEngine } from "@/components/impact-grid/neural-data-engine"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-56">
        <TopNav activeTab="analytics" />
        
        <div className="p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Map and Neural Engine */}
            <div className="col-span-8 space-y-6">
              {/* Satellite Status */}
              <SatelliteStatus />
              
              {/* Terrain Map */}
              <div className="relative border border-border rounded-sm bg-card overflow-hidden h-96">
                {/* Topographic Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1410] via-[#2a1f18] to-[#1a1410]">
                  {/* Terrain texture */}
                  <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
                    <defs>
                      <pattern id="terrain" width="150" height="150" patternUnits="userSpaceOnUse">
                        <path
                          d="M0,75 Q40,45 80,75 T150,75"
                          fill="none"
                          stroke="#8b7355"
                          strokeWidth="0.5"
                        />
                        <path
                          d="M0,50 Q50,30 100,50 T150,50"
                          fill="none"
                          stroke="#8b7355"
                          strokeWidth="0.3"
                        />
                        <path
                          d="M0,100 Q30,80 70,100 T150,100"
                          fill="none"
                          stroke="#8b7355"
                          strokeWidth="0.4"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#terrain)" />
                  </svg>
                  
                  {/* Grid overlay */}
                  <div className="absolute inset-0 grid-pattern opacity-20" />
                </div>

                {/* Map Markers */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--tactical-orange)] flex items-center justify-center">
                      <div className="w-3 h-3 bg-[var(--tactical-orange)] rotate-45" />
                    </div>
                    <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-[var(--tactical-orange)] animate-ping opacity-30" />
                  </div>
                </div>

                <div className="absolute bottom-24 right-1/4">
                  <div className="w-4 h-4 bg-[var(--tactical-yellow)] rotate-45" />
                </div>
              </div>

              {/* Neural Data Engine */}
              <NeuralDataEngine />
            </div>
            
            {/* Right Column - Live Data */}
            <div className="col-span-4">
              <LiveDataPanel />
            </div>
          </div>
        </div>

        {/* Active Comms Status */}
        <div className="fixed bottom-6 right-6">
          <div className="px-4 py-2 border-2 border-[var(--tactical-orange)] rounded-sm bg-background">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--tactical-orange)] animate-pulse" />
              <span className="font-mono text-xs text-[var(--tactical-orange)]">ACTIVE_COMMS: ONLINE</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
