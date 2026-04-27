import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dataStore } from "@/lib/data-store"
import type { Volunteer, Mission } from "@/lib/types"

// ---------------------------------------------------------------------------
// AI Volunteer Matching Endpoint
// Uses a scoring algorithm to match volunteers to missions based on:
// - Skill overlap with mission requirements
// - Availability status
// - Location proximity (if coordinates available)
// - Past mission experience
// - Clearance level requirements
// ---------------------------------------------------------------------------

interface MatchRequest {
  missionId: string
  limit?: number
}

interface VolunteerMatch {
  volunteer: Volunteer
  score: number
  reasons: string[]
}

// Calculate skill match score (0-100)
function calculateSkillScore(
  volunteerSkills: string[],
  missionNeeds: string[],
): { score: number; matchedSkills: string[] } {
  if (!missionNeeds.length) return { score: 100, matchedSkills: [] }
  if (!volunteerSkills.length) return { score: 0, matchedSkills: [] }

  const volSkillsLower = volunteerSkills.map((s) => s.toLowerCase().trim())
  const missionNeedsLower = missionNeeds.map((s) => s.toLowerCase().trim())

  const matchedSkills: string[] = []
  for (const need of missionNeedsLower) {
    for (const skill of volSkillsLower) {
      // Fuzzy match: check if skill contains need or vice versa
      if (skill.includes(need) || need.includes(skill)) {
        matchedSkills.push(skill)
        break
      }
    }
  }

  const score = Math.round((matchedSkills.length / missionNeedsLower.length) * 100)
  return { score, matchedSkills }
}

// Calculate location proximity score (0-100)
function calculateProximityScore(
  volunteerCoords: { lat: number; lng: number } | null | undefined,
  missionCoords: { lat: number; lng: number } | null | undefined,
): { score: number; distance?: number } {
  if (!volunteerCoords || !missionCoords) {
    return { score: 50 } // Neutral score if no coords
  }

  // Haversine formula for distance
  const R = 6371 // Earth radius in km
  const dLat = ((missionCoords.lat - volunteerCoords.lat) * Math.PI) / 180
  const dLon = ((missionCoords.lng - volunteerCoords.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((volunteerCoords.lat * Math.PI) / 180) *
      Math.cos((missionCoords.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  // Score based on distance (closer = higher score)
  // Within 10km = 100, 50km = 80, 100km = 60, 500km = 20, >500km = 0
  let score = 0
  if (distance <= 10) score = 100
  else if (distance <= 50) score = 80
  else if (distance <= 100) score = 60
  else if (distance <= 200) score = 40
  else if (distance <= 500) score = 20
  else score = 5

  return { score, distance: Math.round(distance) }
}

// Calculate experience score (0-100)
function calculateExperienceScore(
  missionsCompleted: number,
  missionPriority: string,
): number {
  // High priority missions prefer experienced volunteers
  const priorityMultiplier =
    missionPriority === "critical"
      ? 1.5
      : missionPriority === "high"
        ? 1.2
        : 1.0

  // Base score on missions completed
  const baseScore = Math.min(missionsCompleted * 10, 100)
  return Math.min(Math.round(baseScore * priorityMultiplier), 100)
}

// Main matching function
function matchVolunteersToMission(
  mission: Mission,
  volunteers: Volunteer[],
  limit = 10,
): VolunteerMatch[] {
  const availableVolunteers = volunteers.filter(
    (v) => v.availability === "available",
  )

  const missionNeeds = mission.resources_needed || []
  const missionCoords = mission.coordinates as { lat: number; lng: number } | undefined

  const matches: VolunteerMatch[] = availableVolunteers.map((volunteer) => {
    const reasons: string[] = []

    // Skill matching
    const { score: skillScore, matchedSkills } = calculateSkillScore(
      volunteer.skills || [],
      missionNeeds,
    )
    if (matchedSkills.length > 0) {
      reasons.push(`Skills: ${matchedSkills.join(", ")}`)
    }

    // Proximity
    const volCoords = volunteer.coordinates as { lat: number; lng: number } | undefined
    const { score: proximityScore, distance } = calculateProximityScore(
      volCoords,
      missionCoords,
    )
    if (distance !== undefined && distance <= 100) {
      reasons.push(`${distance}km away`)
    }

    // Experience
    const experienceScore = calculateExperienceScore(
      volunteer.missions_completed || 0,
      mission.priority || "medium",
    )
    if ((volunteer.missions_completed || 0) >= 5) {
      reasons.push(`${volunteer.missions_completed} missions completed`)
    }

    // Clearance check
    const clearanceScore =
      (volunteer.clearance_level || 1) >= (mission.clearance_required || 1)
        ? 100
        : 0
    if ((volunteer.clearance_level || 1) >= 3) {
      reasons.push(`Level ${volunteer.clearance_level} clearance`)
    }

    // Weighted total score
    const totalScore = Math.round(
      skillScore * 0.4 +
        proximityScore * 0.25 +
        experienceScore * 0.2 +
        clearanceScore * 0.15,
    )

    if (reasons.length === 0) {
      reasons.push("Available for deployment")
    }

    return {
      volunteer,
      score: totalScore,
      reasons,
    }
  })

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score)

  return matches.slice(0, limit)
}

export async function POST(request: Request) {
  try {
    const body: MatchRequest = await request.json()
    const { missionId, limit = 10 } = body

    if (!missionId) {
      return NextResponse.json(
        { success: false, error: "Missing missionId" },
        { status: 400 },
      )
    }

    // Try Supabase first
    const supabase = await createClient()
    const { data: mission } = await supabase
      .from("missions")
      .select("*")
      .eq("id", missionId)
      .single()

    const { data: volunteers } = await supabase.from("volunteers").select("*")

    if (mission && volunteers) {
      const matches = matchVolunteersToMission(mission, volunteers, limit)
      return NextResponse.json({
        success: true,
        data: {
          mission_id: missionId,
          mission_name: mission.name || mission.title,
          matches: matches.map((m) => ({
            id: m.volunteer.id,
            name: m.volunteer.name,
            location: m.volunteer.location,
            skills: m.volunteer.skills,
            availability: m.volunteer.availability,
            score: m.score,
            reasons: m.reasons,
            missions_completed: m.volunteer.missions_completed,
            clearance_level: m.volunteer.clearance_level,
          })),
          total_available: volunteers.filter((v) => v.availability === "available")
            .length,
        },
      })
    }

    // Fallback to data store
    const fallbackMission = dataStore.getMissionById(missionId)
    if (!fallbackMission) {
      return NextResponse.json(
        { success: false, error: "Mission not found" },
        { status: 404 },
      )
    }

    const fallbackVolunteers = dataStore.getVolunteers()
    const matches = matchVolunteersToMission(
      fallbackMission,
      fallbackVolunteers,
      limit,
    )

    return NextResponse.json({
      success: true,
      data: {
        mission_id: missionId,
        mission_name: fallbackMission.name || fallbackMission.title,
        matches: matches.map((m) => ({
          id: m.volunteer.id,
          name: m.volunteer.name,
          location: m.volunteer.location,
          skills: m.volunteer.skills,
          availability: m.volunteer.availability,
          score: m.score,
          reasons: m.reasons,
          missions_completed: m.volunteer.missions_completed,
          clearance_level: m.volunteer.clearance_level,
        })),
        total_available: fallbackVolunteers.filter(
          (v) => v.availability === "available",
        ).length,
      },
    })
  } catch (error) {
    console.error("[v0] AI Match error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to match volunteers" },
      { status: 500 },
    )
  }
}
