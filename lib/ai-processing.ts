// ImpactGrid AI Processing - Rule-based NLP and Pattern Detection

import type { ProcessedReport, ReportCategory, Report, PredictiveAlert, Mission, Volunteer } from "./types"

// Category keywords for classification
const CATEGORY_KEYWORDS: Record<ReportCategory, string[]> = {
  water: ["water", "drinking", "well", "pump", "drought", "flood", "contaminated", "purification", "thirst", "dehydration"],
  medical: ["medical", "health", "hospital", "doctor", "medicine", "injury", "disease", "sick", "ambulance", "trauma", "clinic", "vaccine"],
  food: ["food", "hunger", "starving", "supplies", "nutrition", "rations", "meals", "feeding"],
  shelter: ["shelter", "housing", "tent", "displaced", "homeless", "camp", "refugee", "accommodation"],
  infrastructure: ["road", "bridge", "power", "electricity", "building", "collapsed", "damaged", "infrastructure", "communications"],
  security: ["security", "violence", "threat", "danger", "attack", "conflict", "armed", "looting"],
  evacuation: ["evacuation", "evacuate", "escape", "rescue", "trapped", "stranded", "flee"],
  communication: ["communication", "radio", "signal", "network", "phone", "internet", "contact"],
  other: []
}

// Urgency keywords with weights
const URGENCY_KEYWORDS: Record<string, number> = {
  "urgent": 20,
  "critical": 25,
  "emergency": 25,
  "immediate": 20,
  "dying": 30,
  "death": 25,
  "life-threatening": 30,
  "severe": 15,
  "desperate": 20,
  "help": 10,
  "please": 5,
  "quickly": 10,
  "asap": 15,
  "now": 10,
  "children": 15,
  "elderly": 15,
  "pregnant": 15,
  "disabled": 15,
  "babies": 20,
  "infants": 20
}

// Vulnerable group keywords
const VULNERABLE_GROUPS: Record<string, string> = {
  "children": "children",
  "kids": "children",
  "child": "children",
  "elderly": "elderly",
  "old": "elderly",
  "senior": "elderly",
  "pregnant": "pregnant_women",
  "women": "women",
  "disabled": "disabled",
  "handicapped": "disabled",
  "babies": "infants",
  "infants": "infants",
  "newborn": "infants"
}

/**
 * Process raw report text and extract structured data
 */
export function processReportText(text: string, location: string): ProcessedReport {
  const lowerText = text.toLowerCase()
  
  // Extract category
  const category = classifyCategory(lowerText)
  
  // Extract urgency signals
  const urgencySignals = extractUrgencySignals(lowerText)
  
  // Extract people affected (look for numbers)
  const peopleAffected = extractPeopleAffected(text)
  
  // Extract vulnerable groups
  const vulnerableGroups = extractVulnerableGroups(lowerText)
  
  // Extract keywords
  const extractedKeywords = extractKeywords(lowerText, category)
  
  return {
    original_text: text,
    location,
    category,
    urgency_signals: urgencySignals,
    people_affected: peopleAffected,
    vulnerable_groups: vulnerableGroups,
    extracted_keywords: extractedKeywords
  }
}

/**
 * Classify report into a category based on keyword matching
 */
function classifyCategory(text: string): ReportCategory {
  let bestCategory: ReportCategory = "other"
  let bestScore = 0
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "other") continue
    
    let score = 0
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += 1
      }
    }
    
    if (score > bestScore) {
      bestScore = score
      bestCategory = category as ReportCategory
    }
  }
  
  return bestCategory
}

/**
 * Extract urgency signals from text
 */
function extractUrgencySignals(text: string): string[] {
  const signals: string[] = []
  
  for (const keyword of Object.keys(URGENCY_KEYWORDS)) {
    if (text.includes(keyword)) {
      signals.push(keyword)
    }
  }
  
  return signals
}

/**
 * Extract number of people affected from text
 */
function extractPeopleAffected(text: string): number {
  // Look for patterns like "20 families", "100 people", "50 affected"
  const patterns = [
    /(\d+)\s*(?:families|family)/i,
    /(\d+)\s*(?:people|persons|individuals)/i,
    /(\d+)\s*(?:affected|impacted)/i,
    /(\d+)\s*(?:residents|villagers|citizens)/i
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const num = parseInt(match[1])
      // If families, multiply by average family size
      if (text.toLowerCase().includes("famil")) {
        return num * 5
      }
      return num
    }
  }
  
  // Default estimate if no number found
  return 10
}

/**
 * Extract vulnerable groups mentioned in text
 */
function extractVulnerableGroups(text: string): string[] {
  const groups = new Set<string>()
  
  for (const [keyword, group] of Object.entries(VULNERABLE_GROUPS)) {
    if (text.includes(keyword)) {
      groups.add(group)
    }
  }
  
  return Array.from(groups)
}

/**
 * Extract relevant keywords for the category
 */
function extractKeywords(text: string, category: ReportCategory): string[] {
  const keywords: string[] = []
  const categoryKeywords = CATEGORY_KEYWORDS[category]
  
  for (const keyword of categoryKeywords) {
    if (text.includes(keyword)) {
      keywords.push(keyword)
    }
  }
  
  return keywords
}

/**
 * Calculate urgency score (0-100) based on multiple factors
 */
export function calculateUrgencyScore(processed: ProcessedReport): number {
  let score = 0
  
  // Base score from urgency keywords
  for (const signal of processed.urgency_signals) {
    score += URGENCY_KEYWORDS[signal] || 0
  }
  
  // People affected factor (log scale)
  if (processed.people_affected > 0) {
    score += Math.min(Math.log10(processed.people_affected) * 10, 25)
  }
  
  // Vulnerable groups factor
  score += processed.vulnerable_groups.length * 10
  
  // Category severity multiplier
  const categorySeverity: Record<ReportCategory, number> = {
    medical: 1.3,
    water: 1.2,
    security: 1.3,
    evacuation: 1.4,
    food: 1.1,
    shelter: 1.0,
    infrastructure: 0.9,
    communication: 0.8,
    other: 0.7
  }
  
  score *= categorySeverity[processed.category] || 1.0
  
  // Clamp to 0-100
  return Math.min(Math.max(Math.round(score), 0), 100)
}

/**
 * Detect patterns across multiple reports for predictive alerts
 */
export function detectPatterns(reports: Report[], timeWindowHours: number = 48): PredictiveAlert[] {
  const alerts: PredictiveAlert[] = []
  const now = new Date()
  const windowStart = new Date(now.getTime() - timeWindowHours * 60 * 60 * 1000)
  
  // Filter reports within time window
  const recentReports = reports.filter(r => new Date(r.timestamp) >= windowStart)
  
  // Group by location and category
  const locationCategoryGroups: Record<string, Report[]> = {}
  
  for (const report of recentReports) {
    const key = `${report.location.toLowerCase()}_${report.category}`
    if (!locationCategoryGroups[key]) {
      locationCategoryGroups[key] = []
    }
    locationCategoryGroups[key].push(report)
  }
  
  // Check for patterns (3+ reports in same location/category)
  for (const [key, groupReports] of Object.entries(locationCategoryGroups)) {
    if (groupReports.length >= 3) {
      const [location, category] = key.split("_")
      const avgUrgency = groupReports.reduce((sum, r) => sum + r.urgency_score, 0) / groupReports.length
      
      const alertType = avgUrgency >= 70 ? "critical_event" : avgUrgency >= 40 ? "logistics_alert" : "advisory"
      
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: alertType,
        title: generateAlertTitle(category as ReportCategory, location),
        description: `Multiple reports (${groupReports.length}) detected in ${location} related to ${category}. Pattern indicates potential escalation.`,
        location: location.toUpperCase(),
        confidence: Math.min(60 + groupReports.length * 10, 95),
        time_to_event: estimateTimeToEvent(avgUrgency),
        recommended_action: generateRecommendedAction(category as ReportCategory),
        triggered_at: new Date().toISOString(),
        source_pattern: {
          report_count: groupReports.length,
          time_window: `${timeWindowHours}h`,
          category: category as ReportCategory
        }
      })
    }
  }
  
  return alerts
}

function generateAlertTitle(category: ReportCategory, location: string): string {
  const titles: Record<ReportCategory, string> = {
    water: `WATER SHORTAGE RISK - ${location.toUpperCase()}`,
    medical: `MEDICAL CRISIS EMERGING - ${location.toUpperCase()}`,
    food: `FOOD SECURITY ALERT - ${location.toUpperCase()}`,
    shelter: `SHELTER CAPACITY CRITICAL - ${location.toUpperCase()}`,
    infrastructure: `INFRASTRUCTURE FAILURE - ${location.toUpperCase()}`,
    security: `SECURITY THREAT DETECTED - ${location.toUpperCase()}`,
    evacuation: `EVACUATION REQUIRED - ${location.toUpperCase()}`,
    communication: `COMM BLACKOUT RISK - ${location.toUpperCase()}`,
    other: `SITUATION DEVELOPING - ${location.toUpperCase()}`
  }
  return titles[category]
}

function estimateTimeToEvent(avgUrgency: number): string {
  if (avgUrgency >= 80) return "T-MINUS: 2H"
  if (avgUrgency >= 60) return "T-MINUS: 6H"
  if (avgUrgency >= 40) return "T-MINUS: 12H"
  return "T-MINUS: 24H"
}

function generateRecommendedAction(category: ReportCategory): string {
  const actions: Record<ReportCategory, string> = {
    water: "Deploy water purification units and coordinate with local authorities",
    medical: "Prepare medical response team and secure supply routes",
    food: "Initiate emergency food distribution protocol",
    shelter: "Activate overflow shelter capacity and assess relocation options",
    infrastructure: "Dispatch engineering assessment team",
    security: "Coordinate with security forces and establish safe zones",
    evacuation: "Begin evacuation protocols and prepare transport",
    communication: "Deploy mobile communication units",
    other: "Monitor situation and prepare general response"
  }
  return actions[category]
}

/**
 * Generate a mission from processed report data
 */
export function generateMission(report: Report): Mission {
  const urgencyLevel = getUrgencyLevel(report.urgency_score)
  const volunteersRequired = calculateVolunteersRequired(report.urgency_score, report.people_affected)
  
  return {
    id: `MSN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: generateMissionTitle(report.category, report.location),
    location: report.location,
    category: report.category,
    volunteers_required: volunteersRequired,
    time_estimate: estimateMissionTime(report.category, report.urgency_score),
    urgency: urgencyLevel,
    status: "pending",
    description: generateMissionDescription(report),
    created_at: new Date().toISOString(),
    assigned_volunteers: [],
    source_reports: [report.id],
    coordinates: report.coordinates
  }
}

function getUrgencyLevel(score: number): "critical" | "high" | "medium" | "low" {
  if (score >= 75) return "critical"
  if (score >= 50) return "high"
  if (score >= 25) return "medium"
  return "low"
}

function calculateVolunteersRequired(urgencyScore: number, peopleAffected: number): number {
  const base = Math.ceil(peopleAffected / 20) // 1 volunteer per 20 people
  const urgencyMultiplier = 1 + (urgencyScore / 100)
  return Math.max(2, Math.min(Math.ceil(base * urgencyMultiplier), 50))
}

function generateMissionTitle(category: ReportCategory, location: string): string {
  const titles: Record<ReportCategory, string> = {
    water: "WATER_PURIFICATION_DEPLOYMENT",
    medical: "MEDICAL_RESPONSE_CONVOY",
    food: "FOOD_DISTRIBUTION_OP",
    shelter: "SHELTER_SETUP_MISSION",
    infrastructure: "INFRASTRUCTURE_REPAIR",
    security: "SECURITY_ASSESSMENT",
    evacuation: "EVACUATION_OPERATION",
    communication: "COMM_RESTORATION",
    other: "GENERAL_RESPONSE"
  }
  return `${titles[category]}_${location.toUpperCase().replace(/\s+/g, "_")}`
}

function estimateMissionTime(category: ReportCategory, urgencyScore: number): string {
  const baseTimes: Record<ReportCategory, number> = {
    water: 8,
    medical: 6,
    food: 4,
    shelter: 12,
    infrastructure: 24,
    security: 8,
    evacuation: 4,
    communication: 6,
    other: 8
  }
  
  const hours = Math.max(2, Math.round(baseTimes[category] * (1 - urgencyScore / 200)))
  return `${hours.toString().padStart(2, "0")}:00 HRS`
}

function generateMissionDescription(report: Report): string {
  return `Response to ${report.category} situation in ${report.location}. ` +
    `Approximately ${report.people_affected} individuals affected. ` +
    `${report.vulnerable_groups.length > 0 ? `Vulnerable groups include: ${report.vulnerable_groups.join(", ")}. ` : ""}` +
    `Urgency signals: ${report.urgency_signals.join(", ") || "standard priority"}.`
}

/**
 * Match volunteers to a mission based on proximity, availability, and skills
 */
export function matchVolunteers(mission: Mission, volunteers: Volunteer[]): Volunteer[] {
  const availableVolunteers = volunteers.filter(v => v.availability === "available")
  
  // Score each volunteer
  const scored = availableVolunteers.map(volunteer => {
    let score = 0
    
    // Proximity score (simplified - in real app would use actual distance)
    if (volunteer.location.toLowerCase().includes(mission.location.toLowerCase()) ||
        mission.location.toLowerCase().includes(volunteer.location.toLowerCase())) {
      score += 50
    }
    
    // Skills matching
    const relevantSkills = getRelevantSkills(mission.category)
    for (const skill of volunteer.skills) {
      if (relevantSkills.includes(skill.toLowerCase())) {
        score += 20
      }
    }
    
    // Experience score
    score += Math.min(volunteer.missions_completed * 2, 20)
    
    // Clearance level
    if (mission.urgency === "critical" && volunteer.clearance_level >= 3) {
      score += 15
    }
    
    return { volunteer, score }
  })
  
  // Sort by score and return top matches
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, mission.volunteers_required)
    .map(s => s.volunteer)
}

function getRelevantSkills(category: ReportCategory): string[] {
  const skills: Record<ReportCategory, string[]> = {
    water: ["plumbing", "engineering", "water purification", "logistics"],
    medical: ["medical", "first aid", "nursing", "paramedic", "doctor"],
    food: ["logistics", "cooking", "distribution", "nutrition"],
    shelter: ["construction", "carpentry", "logistics", "social work"],
    infrastructure: ["engineering", "electrical", "construction", "heavy machinery"],
    security: ["security", "law enforcement", "communication"],
    evacuation: ["driving", "logistics", "first aid", "communication"],
    communication: ["technical", "radio", "electrical", "it"],
    other: ["general", "logistics"]
  }
  return skills[category]
}
