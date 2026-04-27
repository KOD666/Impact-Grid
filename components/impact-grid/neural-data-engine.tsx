import { cn } from "@/lib/utils"
import { Brain, TrendingUp, TrendingDown } from "lucide-react"

interface NeuralDataEngineProps {
  className?: string
}

export function NeuralDataEngine({ className }: NeuralDataEngineProps) {
  return (
    <div className={cn("border border-border rounded-sm bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-[var(--tactical-orange)]/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-[var(--tactical-orange)]" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold">NEURAL DATA ENGINE</h3>
            <p className="font-mono text-[10px] text-muted-foreground">
              LOGIC_MODE: HEURISTIC_CLUSTER_V4
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] text-muted-foreground">SYSTEM_LATENCY</p>
          <p className="font-mono text-sm text-[var(--tactical-green)]">0.024ms</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="p-4 space-y-4">
        {/* Pop Density */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-xs text-muted-foreground">POP_DENSITY</span>
            <div className="flex items-center gap-1 text-[var(--tactical-green)]">
              <TrendingUp className="w-3 h-3" />
              <span className="font-mono text-xs font-semibold">8.2</span>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden flex gap-0.5">
            <div className="h-full bg-[var(--tactical-orange)] flex-[82]" />
            <div className="h-full bg-[var(--tactical-green)] flex-[18]" />
          </div>
        </div>

        {/* Infra Fragility */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-xs text-muted-foreground">INFRA_FRAGILITY</span>
            <div className="flex items-center gap-1 text-[var(--tactical-blue)]">
              <TrendingDown className="w-3 h-3" />
              <span className="font-mono text-xs font-semibold">4.7</span>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-[var(--tactical-blue)]" style={{ width: "47%" }} />
          </div>
        </div>

        {/* Urgency Index */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="font-mono text-[10px] text-muted-foreground mb-2">AGGREGATE_URGENCY_INDEX</p>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-mono font-bold">9.2</span>
            <span className="px-2 py-0.5 bg-[var(--tactical-red)] text-white font-mono text-[10px] font-semibold rounded-sm">
              CRITICAL
            </span>
          </div>
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">SIG_LEVEL_09</p>
          <div className="mt-2 font-mono text-[10px] text-muted-foreground space-y-0.5">
            <p>WEIGHT: SENTIMENT(0.4) +</p>
            <p className="ml-12">GEO_SPATIAL(0.4) +</p>
            <p className="ml-12">REPT_DENSITY(0.2)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
