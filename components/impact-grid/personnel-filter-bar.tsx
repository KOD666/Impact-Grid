"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ChevronDown } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Volunteer } from "@/lib/types"

export type AvailabilityFilter = "all" | "available" | "busy" | "offline"
export type SortOption = "name-asc" | "joined-newest" | "missions-most"

interface PersonnelFilterBarProps {
  volunteers: Volunteer[]
  onFiltered: (filtered: Volunteer[]) => void
}

export function PersonnelFilterBar({ volunteers, onFiltered }: PersonnelFilterBarProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [availability, setAvailability] = useState<AvailabilityFilter>("all")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [sort, setSort] = useState<SortOption>("name-asc")
  const [skillsOpen, setSkillsOpen] = useState(false)

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Extract unique skills from all volunteers
  const allSkills = useMemo(() => {
    const skillSet = new Set<string>()
    volunteers.forEach((v) => {
      v.skills?.forEach((skill) => skillSet.add(skill))
    })
    return Array.from(skillSet).sort()
  }, [volunteers])

  // Filter and sort volunteers
  const filtered = useMemo(() => {
    let result = [...volunteers]

    // Search filter (name/location)
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase()
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(searchLower) ||
          v.location.toLowerCase().includes(searchLower)
      )
    }

    // Availability filter
    if (availability !== "all") {
      result = result.filter((v) => v.availability === availability)
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      result = result.filter((v) =>
        selectedSkills.some((skill) => v.skills?.includes(skill))
      )
    }

    // Sort
    switch (sort) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "joined-newest":
        result.sort((a, b) => {
          const dateA = a.joined_at ? new Date(a.joined_at).getTime() : 0
          const dateB = b.joined_at ? new Date(b.joined_at).getTime() : 0
          return dateB - dateA
        })
        break
      case "missions-most":
        result.sort((a, b) => b.missions_completed - a.missions_completed)
        break
    }

    return result
  }, [volunteers, debouncedSearch, availability, selectedSkills, sort])

  // Notify parent of filtered results
  useEffect(() => {
    onFiltered(filtered)
  }, [filtered, onFiltered])

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    )
  }

  const availabilityOptions: { value: AvailabilityFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "available", label: "Available" },
    { value: "busy", label: "Busy" },
    { value: "offline", label: "Offline" },
  ]

  return (
    <div className="border-b border-border px-4 py-3 md:px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-sm text-sm font-mono focus:outline-none focus:border-[var(--tactical-orange)]"
            />
          </div>

          {/* Sort */}
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-48 bg-card border-border font-mono text-xs">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="joined-newest">Joined: Newest</SelectItem>
              <SelectItem value="missions-most">Missions: Most</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Availability Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">Status:</span>
          {availabilityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAvailability(opt.value)}
              className={cn(
                "px-3 py-1 font-mono text-xs rounded-sm transition-colors",
                availability === opt.value
                  ? "bg-[var(--tactical-orange)] text-black"
                  : "bg-card border border-border hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Skills Multi-Select Dropdown */}
        {allSkills.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setSkillsOpen(!skillsOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-sm font-mono text-xs hover:bg-muted transition-colors"
            >
              <span className="text-muted-foreground">Skills:</span>
              <span>
                {selectedSkills.length === 0
                  ? "All Skills"
                  : `${selectedSkills.length} selected`}
              </span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", skillsOpen && "rotate-180")} />
            </button>

            {skillsOpen && (
              <div className="absolute z-20 mt-1 w-64 max-h-48 overflow-y-auto bg-card border border-border rounded-sm shadow-lg">
                {allSkills.map((skill) => (
                  <label
                    key={skill}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                      className="w-3 h-3"
                    />
                    <span className="font-mono text-xs">{skill}</span>
                  </label>
                ))}
                {selectedSkills.length > 0 && (
                  <button
                    onClick={() => setSelectedSkills([])}
                    className="w-full px-3 py-2 text-left font-mono text-xs text-[var(--tactical-orange)] hover:bg-muted border-t border-border"
                  >
                    Clear selection
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Result Count */}
        <p className="font-mono text-xs text-muted-foreground">
          Showing {filtered.length} of {volunteers.length} volunteer{volunteers.length === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  )
}
