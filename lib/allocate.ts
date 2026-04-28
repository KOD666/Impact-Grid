// Pure TypeScript — no React or Next.js imports

export interface AllocVolunteer {
  id: string
  name: string
  location: string
  skills: string[]
  availability: "available" | "busy" | "offline"
  coordinates?: { lat: number; lng: number } | null
  current_mission?: string
  missions_completed?: number
}

export interface EventCoords {
  lat: number
  lon: number
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

const PRIORITY_SKILLS = ["search & rescue", "medical", "emergency response"]

function hasPrioritySkill(skills: string[]): boolean {
  return skills.some((s) =>
    PRIORITY_SKILLS.some((ps) => s.toLowerCase().includes(ps.toLowerCase())),
  )
}

/**
 * Suggests up to 3 available volunteers for a mission.
 * 1. Filters to available volunteers.
 * 2. Sorts by Haversine distance if eventCoords is valid.
 * 3. Floats priority-skill volunteers to top for high/critical priority.
 * 4. Returns top 3.
 */
export function suggestVolunteers(
  volunteers: AllocVolunteer[],
  missionPriority: string,
  eventCoords: EventCoords | null,
): AllocVolunteer[] {
  // 1. Filter to available only
  let pool = volunteers.filter((v) => v.availability === "available")

  if (pool.length === 0) return []

  // 2. Sort by Haversine distance if coords are valid
  if (
    eventCoords &&
    eventCoords.lat != null &&
    eventCoords.lon != null &&
    !isNaN(eventCoords.lat) &&
    !isNaN(eventCoords.lon)
  ) {
    pool = [...pool].sort((a, b) => {
      if (!a.coordinates) return 1
      if (!b.coordinates) return -1
      const distA = haversine(
        a.coordinates.lat,
        a.coordinates.lng,
        eventCoords.lat,
        eventCoords.lon,
      )
      const distB = haversine(
        b.coordinates.lat,
        b.coordinates.lng,
        eventCoords.lat,
        eventCoords.lon,
      )
      return distA - distB
    })
  }

  // 3. Float priority-skill volunteers to top for high/critical
  const priority = missionPriority.toLowerCase()
  if (priority === "high" || priority === "critical") {
    const withSkill = pool.filter((v) => hasPrioritySkill(v.skills))
    const withoutSkill = pool.filter((v) => !hasPrioritySkill(v.skills))
    pool = [...withSkill, ...withoutSkill]
  }

  // 4. Return top 3
  return pool.slice(0, 3)
}

/** Returns a one-line reason string for a suggested volunteer. */
export function getSuggestReason(
  vol: AllocVolunteer,
  missionPriority: string,
  hasCoords: boolean,
): string {
  const reasons: string[] = []
  if (hasCoords && vol.coordinates) reasons.push("Closest available")
  if (hasPrioritySkill(vol.skills)) {
    const matched = vol.skills.find((s) =>
      PRIORITY_SKILLS.some((ps) => s.toLowerCase().includes(ps.toLowerCase())),
    )
    reasons.push(matched ? `${matched} skill` : "Priority skill")
  }
  if (reasons.length === 0) reasons.push("Available team member")
  return reasons.join(" · ")
}
