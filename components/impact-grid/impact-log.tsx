import { cn } from "@/lib/utils"

interface LogEntry {
  id: string
  timestamp: string
  action: string
  points: number
}

const defaultLogs: LogEntry[] = [
  { id: "1", timestamp: "2023.10.24", action: "Water Purification Setup", points: 450 },
  { id: "2", timestamp: "2023.10.12", action: "Medical Escort Delta", points: 200 },
  { id: "3", timestamp: "2023.09.30", action: "Supplies Airdrop Coord.", points: 850 },
]

interface ImpactLogProps {
  logs?: LogEntry[]
  className?: string
}

export function ImpactLog({ logs = defaultLogs, className }: ImpactLogProps) {
  return (
    <div className={cn("border border-border rounded-sm bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <p className="font-mono text-xs text-muted-foreground">IMPACT_LOG_HISTORY</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-left font-mono text-[10px] text-muted-foreground font-normal tracking-wider">
                TIMESTAMP
              </th>
              <th className="px-4 py-2 text-left font-mono text-[10px] text-muted-foreground font-normal tracking-wider">
                ACTION_LOG
              </th>
              <th className="px-4 py-2 text-right font-mono text-[10px] text-muted-foreground font-normal tracking-wider">
                PTS
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-border/50">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {log.timestamp}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {log.action}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-[var(--tactical-green)]">
                  +{log.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <button className="w-full text-center font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          VIEW FULL ARCHIVE
        </button>
      </div>
    </div>
  )
}
