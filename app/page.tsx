"use client"

import { Sidebar } from "@/components/impact-grid/sidebar"
import { TopNav } from "@/components/impact-grid/top-nav"
import { DashboardStats } from "@/components/impact-grid/stats-card"
import { TacticalMap } from "@/components/impact-grid/tactical-map"
import { LiveIntelStream } from "@/components/impact-grid/live-intel-stream"
import { PredictiveAlerts } from "@/components/impact-grid/predictive-alerts"
import { ResourceMatrix } from "@/components/impact-grid/resource-matrix"
import { useDashboard } from "@/hooks/use-dashboard"

export default function DashboardPage() {
  const { data, refresh } = useDashboard()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-56">
        <TopNav activeTab="reports" onReportSubmitted={refresh} />
        
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <DashboardStats data={data?.metrics} />
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Map & Intel */}
            <div className="col-span-8 space-y-6">
              <TacticalMap markers={data?.recent_reports} />
              <LiveIntelStream entries={data?.intel_stream} />
            </div>
            
            {/* Right Column - Alerts & Resources */}
            <div className="col-span-4 space-y-6">
              <PredictiveAlerts alerts={data?.alerts} />
              <ResourceMatrix resources={data?.resources} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
