import { Sidebar } from "@/components/impact-grid/sidebar"
import { TopNav } from "@/components/impact-grid/top-nav"
import { Server, Wifi, Database, Shield, Clock, Activity } from "lucide-react"

const systemMetrics = [
  { label: "CPU_UTILIZATION", value: 34.2, unit: "%" },
  { label: "MEMORY_ALLOCATION", value: 67.8, unit: "%" },
  { label: "NETWORK_THROUGHPUT", value: 9.4, unit: "GB/S" },
  { label: "STORAGE_CAPACITY", value: 42.1, unit: "%" },
]

const connectionStatus = [
  { name: "SAT_LINK_PRIMARY", status: "ACTIVE", latency: "42ms" },
  { name: "SAT_LINK_BACKUP", status: "STANDBY", latency: "--" },
  { name: "GROUND_RELAY_01", status: "ACTIVE", latency: "12ms" },
  { name: "GROUND_RELAY_02", status: "ACTIVE", latency: "18ms" },
  { name: "NODE_HQ_DIRECT", status: "ACTIVE", latency: "8ms" },
]

export default function SystemPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-56">
        <TopNav activeTab="reports" />
        
        <div className="p-6 space-y-6">
          {/* System Status Header */}
          <div className="p-4 border border-[var(--tactical-green)]/30 rounded-sm bg-[var(--tactical-green)]/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm bg-[var(--tactical-green)]/20 flex items-center justify-center">
                  <Server className="w-6 h-6 text-[var(--tactical-green)]" />
                </div>
                <div>
                  <h2 className="font-mono text-lg font-bold">SYSTEM_STATUS: OPERATIONAL</h2>
                  <p className="font-mono text-xs text-muted-foreground">
                    UPTIME: 14:02:11:04 // LAST_SYNC: 0.024s AGO
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--tactical-green)] animate-pulse" />
                <span className="font-mono text-sm text-[var(--tactical-green)]">ALL_SYSTEMS_NOMINAL</span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-4">
            {systemMetrics.map((metric) => (
              <div key={metric.label} className="p-4 border border-border rounded-sm bg-card">
                <p className="font-mono text-[10px] text-muted-foreground tracking-wider mb-3">
                  {metric.label}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-mono font-bold">{metric.value}</span>
                  <span className="text-sm font-mono text-muted-foreground">{metric.unit}</span>
                </div>
                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--tactical-orange)] transition-all"
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Connection Status */}
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-border rounded-sm bg-card">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-[var(--tactical-orange)]" />
                  <p className="font-mono text-xs">CONNECTION_MATRIX</p>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {connectionStatus.map((conn) => (
                  <div key={conn.name} className="flex items-center justify-between p-2 bg-muted/30 rounded-sm">
                    <span className="font-mono text-xs">{conn.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] text-muted-foreground">{conn.latency}</span>
                      <span className={`px-2 py-0.5 rounded-sm font-mono text-[10px] ${
                        conn.status === "ACTIVE" 
                          ? "bg-[var(--tactical-green)]/20 text-[var(--tactical-green)]" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {conn.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border rounded-sm bg-card">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--tactical-orange)]" />
                  <p className="font-mono text-xs">SECURITY_PROTOCOLS</p>
                </div>
              </div>
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">ENCRYPTION</span>
                  <span className="font-mono text-xs text-[var(--tactical-green)]">AES-256-GCM // ACTIVE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">KEY_EXCHANGE</span>
                  <span className="font-mono text-xs text-[var(--tactical-green)]">RSA-4096 // VERIFIED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">AUTH_TOKEN</span>
                  <span className="font-mono text-xs">B4_A9_C2_7F_E1...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">SESSION_EXPIRY</span>
                  <span className="font-mono text-xs">23:59:42</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">THREAT_LEVEL</span>
                  <span className="font-mono text-xs text-[var(--tactical-yellow)]">ELEVATED_LV2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="border border-border rounded-sm bg-card">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--tactical-orange)]" />
                <p className="font-mono text-xs">SYSTEM_ACTIVITY_LOG</p>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">LAST_24H</span>
            </div>
            <div className="p-3 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
              <p><span className="text-muted-foreground">14:02:11</span> <span className="text-[var(--tactical-green)]">[OK]</span> Satellite sync completed</p>
              <p><span className="text-muted-foreground">14:01:45</span> <span className="text-[var(--tactical-green)]">[OK]</span> Data packet received from FIELD_U_04</p>
              <p><span className="text-muted-foreground">13:58:22</span> <span className="text-[var(--tactical-yellow)]">[WARN]</span> Elevated latency detected on RELAY_02</p>
              <p><span className="text-muted-foreground">13:55:10</span> <span className="text-[var(--tactical-green)]">[OK]</span> Backup link verified</p>
              <p><span className="text-muted-foreground">13:52:33</span> <span className="text-[var(--tactical-green)]">[OK]</span> Security token refreshed</p>
              <p><span className="text-muted-foreground">13:45:00</span> <span className="text-[var(--tactical-green)]">[OK]</span> Scheduled maintenance completed</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
