import { cn } from "@/lib/utils"

interface MissionCardProps {
  id: string
  title: string
  location: string
  code: string
  description: string
  slotsRemaining: number
  tags: string[]
  imageUrl?: string
  urgent?: boolean
}

export function MissionCard({
  id,
  title,
  location,
  code,
  description,
  slotsRemaining,
  tags,
  imageUrl,
  urgent = false,
}: MissionCardProps) {
  return (
    <div className="relative border border-border rounded-sm bg-card overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-[10px] text-muted-foreground tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[var(--tactical-orange)]" />
            AVAILABLE_MISSION_DOSSIERS
          </p>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="text-muted-foreground">SYNC_STATUS: 100%</span>
            <span className="text-[var(--tactical-orange)]">LIVE_FEED_RECV...</span>
          </div>
        </div>

        <div className="flex gap-6 mt-4">
          {/* Satellite Image */}
          <div className="relative w-40 h-28 bg-muted rounded-sm overflow-hidden flex-shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10" />
            )}
            {urgent && (
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-[var(--tactical-red)] text-[10px] font-mono font-semibold text-white rounded-sm">
                URGENT
              </span>
            )}
            <span className="absolute bottom-2 right-2 text-[8px] font-mono text-muted-foreground">
              SAT_VIEW_07
            </span>
          </div>

          {/* Mission Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-mono font-semibold tracking-wide">{title}</h3>
                <div className="flex items-center gap-6 mt-1 text-[10px] font-mono text-muted-foreground">
                  <span>LOC: {location}</span>
                  <span>CODE: {code}</span>
                  <span>TTL: 04:32:48</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[var(--tactical-orange)] font-mono text-sm font-semibold">
                  {slotsRemaining} SLOTS
                </p>
                <p className="text-[var(--tactical-orange)] font-mono text-[10px]">REMAINING</p>
              </div>
            </div>

            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>

            {/* Tags */}
            <div className="flex items-center gap-2 mt-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-muted border border-border font-mono text-[10px] tracking-wider rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Accept Button */}
        <div className="mt-6 flex justify-center">
          <button className="px-8 py-2.5 border-2 border-[var(--tactical-orange)] text-[var(--tactical-orange)] font-mono text-xs font-semibold tracking-wider rounded-sm hover:bg-[var(--tactical-orange)] hover:text-primary-foreground transition-all">
            ACCEPT_MISSION
          </button>
        </div>
      </div>
    </div>
  )
}
