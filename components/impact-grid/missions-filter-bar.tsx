"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ChevronDown, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Mission, ReportCategory } from "@/lib/types"

export type StatusFilter = "all" | "active" | "pending" | "completed" | "cancelled"
export type UrgencyFilter = "all" | "critical" | "high" | "medium" | "low"

interface MissionsFilterBarProps {
  missions: Mission[]
  onFiltered: (filtered: Mission[]) => void
}

export function MissionsFilterBar({ missions, onFiltered }: MissionsFilterBarProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [urgency, setUrgency] = useState<UrgencyFilter>("all")
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | "all">("all")
  const [categoryOpen, setCategoryOpen] = useState(false)

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Extract unique categories from all missions
  const allCategories = useMemo(() => {
    const categorySet = new Set<ReportCategory>()
    missions.forEach((m) => {
      if (m.category) categorySet.add(m.category)
    })
    return Array.from(categorySet).sort()
  }, [missions])

  // Filter missions
  const filtered = useMemo(() => {
    let result = [...missions]

    // Search filter (title)
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase()
      result = result.filter((m) =>
        m.title.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (status !== "all") {
      result = result.filter((m) => m.status === status)
    }

    // Urgency filter
    if (urgency !== "all") {
      result = result.filter((m) => m.urgency === urgency)
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((m) => m.category === selectedCategory)
    }

    return result
  }, [missions, debouncedSearch, status, urgency, selectedCategory])

  // Notify parent of filtered results
  useEffect(() => {
    onFiltered(filtered)
  }, [filtered, onFiltered])

  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    urgency !== "all" ||
    selectedCategory !== "all"

  const resetFilters = () => {
    setSearch("")
    setStatus("all")
    setUrgency("all")
    setSelectedCategory("all")
  }

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Resolved" },
  ]

  const urgencyOptions: { value: UrgencyFilter; label: string; color: string }[] = [
    { value: "all", label: "All", color: "" },
    { value: "critical", label: "Critical", color: "bg-[var(--tactical-red)]" },
    { value: "high", label: "High", color: "bg-orange-500" },
    { value: "medium", label: "Medium", color: "bg-yellow-500" },
    { value: "low", label: "Low", color: "bg-[var(--tactical-green)]" },
  ]

  const formatCategory = (cat: ReportCategory): string => {
    return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return (
    <div className="border border-border rounded-sm bg-card mb-6">
      <div className="px-4 py-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search missions by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-border rounded-sm text-sm font-mono focus:outline-none focus:border-[var(--tactical-orange)]"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">Status:</span>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={cn(
                "px-3 py-1 font-mono text-xs rounded-sm transition-colors",
                status === opt.value
                  ? "bg-[var(--tactical-orange)] text-black"
                  : "bg-muted/50 border border-border hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Urgency Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">Urgency:</span>
          {urgencyOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setUrgency(opt.value)}
              className={cn(
                "px-3 py-1 font-mono text-xs rounded-sm transition-colors flex items-center gap-1.5",
                urgency === opt.value
                  ? "bg-[var(--tactical-orange)] text-black"
                  : "bg-muted/50 border border-border hover:bg-muted"
              )}
            >
              {opt.color && (
                <span className={cn("w-2 h-2 rounded-full", opt.color)} />
              )}
              {opt.label}
            </button>
          ))}
        </div>

        {/* Category Dropdown and Reset */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          {allCategories.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-sm font-mono text-xs hover:bg-muted transition-colors"
              >
                <span className="text-muted-foreground">Category:</span>
                <span>
                  {selectedCategory === "all"
                    ? "All Categories"
                    : formatCategory(selectedCategory)}
                </span>
                <ChevronDown className={cn("w-3 h-3 transition-transform", categoryOpen && "rotate-180")} />
              </button>

              {categoryOpen && (
                <div className="absolute z-20 mt-1 w-48 max-h-48 overflow-y-auto bg-card border border-border rounded-sm shadow-lg">
                  <button
                    onClick={() => {
                      setSelectedCategory("all")
                      setCategoryOpen(false)
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left font-mono text-xs hover:bg-muted",
                      selectedCategory === "all" && "bg-muted"
                    )}
                  >
                    All Categories
                  </button>
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat)
                        setCategoryOpen(false)
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left font-mono text-xs hover:bg-muted",
                        selectedCategory === cat && "bg-muted"
                      )}
                    >
                      {formatCategory(cat)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-[var(--tactical-orange)] font-mono text-xs hover:bg-muted/50 rounded-sm transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset filters
            </button>
          )}
        </div>

        {/* Result Count */}
        <p className="font-mono text-xs text-muted-foreground pt-1 border-t border-border">
          Showing {filtered.length} of {missions.length} mission{missions.length === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  )
}

// Empty state component for no results
export function MissionsEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-border rounded-sm bg-card">
      <p className="font-mono text-sm text-muted-foreground mb-4">
        No missions match your filters
      </p>
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--tactical-orange)] text-black font-mono text-xs tracking-wider rounded-sm hover:brightness-110 transition-all"
      >
        <RotateCcw className="w-3 h-3" />
        RESET_FILTERS
      </button>
    </div>
  )
}
