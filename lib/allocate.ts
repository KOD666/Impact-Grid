// Pure TypeScript — no React or Next.js imports

export interface Volunteer {
  id: string
  name: string
  location: string
  skills: string[]
  availability?: "available" | "busy" | "offline"
  available?: boolean
  coordinates?: { lat: number; lng: number } | null
  current_mission?: string
  missions_completed?: number
}

export interface AllocationOptions {
  coordinates?: { lat: number; lng: number } | null
  requiredSkills?: string[]
  urgency?: "low" | "medium" | "high" | "critical"
  volunteersNeeded?: number
}

export interface SuggestedVolunteer {
  volunteerId: string
  volunteerName: string
  score: number
  reasons: string[]
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

function isAvailable(vol: Volunteer): boolean {
  // Handle both "availability" and "available" field names
  if (vol.availability !== undefined) {
    return vol.availability === "available"
  }
  if (vol.available !== undefined) {
    return vol.available === true
  }
  return true // Default to available if field not present
}

function skillMatch(skills: string[], required: string[]): number {
  if (required.length === 0) return 0
  const normalizedVol = skills.map((s) => s.toLowerCase())
  const normalizedReq = required.map((s) => s.toLowerCase())
  const matches = normalizedReq.filter((r) =>
    normalizedVol.some((v) => v.includes(r) || r.includes(v)),
  ).length
  return matches / normalizedReq.length
}

/**
 * Suggests volunteers for a mission using Haversine distance + skill scoring
 * Returns sorted array with reasons
 */
export function suggestVolunteers(
  volunteers: Volunteer[],
  options: AllocationOptions,
): SuggestedVolunteer[] {
  const {
    coordinates,
    requiredSkills = [],
    urgency = "medium",
    volunteersNeeded = 3,
  } = options

  // 1. Filter to available volunteers
  let pool = volunteers.filter(isAvailable)

  if (pool.length === 0) {
    console.log("[v0] No available volunteers in pool")
    return []
  }

  console.log(
    "[v0] Available volunteers pool:",
    pool.map((v) => ({ id: v.id, name: v.name, availability: v.availability })),
  )

  // 2. Calculate scores
  const scored = pool.map((vol) => {
    let score = 50 // Base score

    // Distance scoring (0-25 points)
    let distanceScore = 0
    if (
      coordinates &&
      coordinates.lat != null &&
      coordinates.lng != null &&
      vol.coordinates?.lat != null &&
      vol.coordinates?.lng != null
    ) {
      const dist = haversine(
        vol.coordinates.lat,
        vol.coordinates.lng,
        coordinates.lat,
        coordinates.lng,
      )
      distanceScore = Math.max(0, 25 - dist / 10) // Closer = higher score
    }
    score += distanceScore

    // Skill matching (0-25 points)
    let skillScore = 0
    if (requiredSkills.length > 0) {
      skillScore = skillMatch(vol.skills, requiredSkills) * 25
    }
    score += skillScore

    // Urgency bonus for high/critical (0-10 points)
    let urgencyBonus = 0
    if ((urgency === "high" || urgency === "critical") && vol.missions_completed) {
      urgencyBonus = Math.min(10, vol.missions_completed)
    }
    score += urgencyBonus

    // Build reasons
    const reasons: string[] = []
    if (distanceScore > 0) reasons.push(`Proximity: ${distanceScore.toFixed(0)}pts`)
    if (skillScore > 0) reasons.push(`Skills: ${skillScore.toFixed(0)}pts`)
    if (urgencyBonus > 0) reasons.push(`Experience: ${urgencyBonus.toFixed(0)}pts`)
    if (reasons.length === 0) reasons.push("Available team member")

    return {
      volunteerId: vol.id,
      volunteerName: vol.name,
      score,
      reasons,
    }
  })

  // 3. Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  console.log(
    "[v0] Scored suggestions:",
    scored.slice(0, volunteersNeeded),
  )

  // 4. Return top N
  return scored.slice(0, Math.max(1, volunteersNeeded))
}
