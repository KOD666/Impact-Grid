"use client"

import { cn } from "@/lib/utils"
import { Settings2, AlertCircle } from "lucide-react"

interface IntelEntry {
  id: string
  timestamp: string
  source: string
  payload?: string
  message?: string
  payloadType?: "INFO" | "SYS" | "WARN"
  payload_type?: "INFO" | "SYS" | "WARN" | "ALERT"
  status: "RECEIVED" | "LOGGED" | "ACTION_REQ" | "received" | "logged" | "action_req" | "resolved"
}

const defaultEntries: IntelEntry[] = [
  {
    id: "1",
    timestamp: "12:44:01",
    source: "FIELD_U_04",
    payload: "Supplies reaching distribution point B. Local team ready for offload.",
    payloadType: "INFO",
    status: "RECEIVED",
  },
  {
    id: "2",
    timestamp: "12:42:58",
    source: "NODE_HQ",
    payload: "SYSTEM_UPDATE: Delta protocols engaged for evening shift.",
    payloadType: "SYS",
    status: "LOGGED",
  },
  {
    id: "3",
    timestamp: "12:41:15",
    source: "SAT_RELAY",
    payload: "ANOMALY_DETECTED: Unexpected heat signature Sector 04-B.",
    payloadType: "WARN",
    status: "ACTION_REQ",
  },
]

interface LiveIntelStreamProps {
  entries?: IntelEntry[]
  className?: string
  searchQuery?: string
  emptyMessage?: string
}

export function LiveIntelStream({ 
  entries = defaultEntries, 
  className,
  searchQuery,
  emptyMessage 
}: LiveIntelStreamProps) {
  const statusColors: Record<string, string> = {
    RECEIVED: "bg-[var(--tactical-green)]/20 text-[var(--tactical-green)] border-[var(--tactical-green)]/30",
    received: "bg-[var(--tactical-green)]/20 text-[var(--tactical-green)] border-[var(--tactical-green)]/30",
    LOGGED: "bg-muted text-muted-foreground border-border",
    logged: "bg-muted text-muted-foreground border-border",
    ACTION_REQ: "bg-[var(--tactical-orange)]/20 text-[var(--tactical-orange)] border-[var(--tactical-orange)]/30",
    action_req: "bg-[var(--tactical-orange)]/20 text-[var(--tactical-orange)] border-[var(--tactical-orange)]/30",
    resolved: "bg-[var(--tactical-green)]/20 text-[var(--tactical-green)] border-[var(--tactical-green)]/30",
  }

  const payloadTypeColors: Record<string, string> = {
    INFO: "text-[var(--tactical-blue)]",
    SYS: "text-muted-foreground",
    WARN: "text-[var(--tactical-yellow)]",
    ALERT: "text-[var(--tactical-red)]",
  }

  const isEmpty = !entries || entries.length === 0

  return (
    <div className={cn("border border-border rounded-sm bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <p className="font-mono text-xs flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--tactical-green)] animate-pulse" />
          LIVE_INTEL_STREAM
          {searchQuery && (
            <span className="ml-2 px-2 py-0.5 bg-[var(--tactical-orange)]/20 text-[var(--tactical-orange)] text-[10px] rounded">
              Filtered: {entries?.length || 0} results
            </span>
          )}
        </p>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-[var(--tactical-green)]/20 border border-[var(--tactical-green)]/30 rounded-sm font-mono text-[10px] text-[var(--tactical-green)]">
            CH_ID: SECURE_D_01
          </span>
          <button className="p-1 text-muted-foreground hover:text-foreground">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table or Empty State */}
      {isEmpty ? (
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="font-mono text-sm text-muted-foreground">
            {emptyMessage || "No intel entries"}
          </p>
          {searchQuery && (
            <p className="font-mono text-xs text-muted-foreground mt-2">
              Try adjusting your search query
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left font-mono text-[10px] text-muted-foreground font-normal tracking-wider">
                  TIME_STAMP
                </th>
                <th className="px-4 py-2 text-left font-mono text-[10px] text-muted-foreground font-normal tracking-wider">
                  SOURCE
                </th>
                <th className="px-4 py-2 text-left font-mono text-[10px] text-muted-foreground font-normal tracking-wider">
                  PAYLOAD
                </th>
                <th className="px-4 py-2 text-left font-mono text-[10px] text-muted-foreground font-normal tracking-wider">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {entry.timestamp}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-[var(--tactical-orange)]">
                      + {entry.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs max-w-md">
                    <span className={cn("mr-2", payloadTypeColors[entry.payloadType || entry.payload_type || "INFO"])}>
                      [{entry.payloadType || entry.payload_type || "INFO"}]
                    </span>
                    <span className="text-foreground">{entry.payload || entry.message}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 border rounded-sm font-mono text-[10px]",
                        statusColors[entry.status] || statusColors["logged"]
                      )}
                    >
                      {entry.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
