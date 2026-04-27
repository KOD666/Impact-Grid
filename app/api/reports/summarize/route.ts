// To use the Gemini API, set GEMINI_API_KEY in your environment variables.
// Get your API key from: https://aistudio.google.com/app/apikey

import { NextResponse } from "next/server"

interface GeminiSummary {
  executive_summary: string
  key_findings: string[]
  affected_population: string
  immediate_actions_required: string[]
  risk_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  recommended_resources: string[]
  estimated_resolution_time: string
}

// Mock summary for development when GEMINI_API_KEY is not set
function getMockSummary(category: string, urgency: number): GeminiSummary {
  const riskLevel = urgency >= 80 ? "CRITICAL" : urgency >= 60 ? "HIGH" : urgency >= 40 ? "MEDIUM" : "LOW"
  
  return {
    executive_summary: `Field report received regarding ${category} concerns. Situation requires ${riskLevel.toLowerCase()} priority response. Initial assessment indicates need for immediate resource allocation and field team deployment.`,
    key_findings: [
      `${category.charAt(0).toUpperCase() + category.slice(1)} infrastructure compromised`,
      "Local resources insufficient for current demand",
      "Community assistance required within 48 hours"
    ],
    affected_population: urgency >= 60 ? "500-1000 individuals" : "100-250 individuals",
    immediate_actions_required: [
      `Deploy ${category} response team`,
      "Establish temporary distribution point",
      "Coordinate with local authorities"
    ],
    risk_level: riskLevel,
    recommended_resources: [
      `${category} supplies`,
      "Medical personnel",
      "Transport vehicles"
    ],
    estimated_resolution_time: urgency >= 80 ? "24-48 hours" : urgency >= 60 ? "48-72 hours" : "3-5 days"
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { reportText, category, urgency, location } = body

    if (!reportText) {
      return NextResponse.json(
        { error: "Missing reportText" },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY

    // If no API key, return mock data for development
    if (!apiKey) {
      console.log("[v0] GEMINI_API_KEY not set, returning mock summary")
      return NextResponse.json({
        summary: getMockSummary(category || "general", urgency || 50)
      })
    }

    const prompt = `You are a crisis analyst for an NGO coordination platform.
Analyze this field report and return a structured JSON summary.
Return ONLY valid JSON, no markdown, no backticks.

Report: "${reportText}"
Category: ${category || "general"}
Urgency Score: ${urgency || 50}/100
Location: ${location || "Unknown"}

Return this exact schema:
{
  "executive_summary": "2-3 sentence plain English overview of what occurred",
  "key_findings": ["finding 1", "finding 2", "finding 3"],
  "affected_population": "estimated number or description",
  "immediate_actions_required": ["action 1", "action 2"],
  "risk_level": "CRITICAL | HIGH | MEDIUM | LOW",
  "recommended_resources": ["resource 1", "resource 2"],
  "estimated_resolution_time": "e.g. 48-72 hours"
}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    )

    if (!response.ok) {
      console.error("[v0] Gemini API error:", response.status, response.statusText)
      // Return mock data on API error
      return NextResponse.json({
        summary: getMockSummary(category || "general", urgency || 50),
        warning: "AI analysis unavailable, showing estimated summary"
      })
    }

    const data = await response.json()
    
    // Extract the text from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!text) {
      return NextResponse.json({
        summary: getMockSummary(category || "general", urgency || 50),
        warning: "AI analysis unavailable, showing estimated summary"
      })
    }

    // Try to parse as JSON
    try {
      // Remove any markdown code block markers if present
      const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      const summary = JSON.parse(cleanText) as GeminiSummary
      return NextResponse.json({ summary })
    } catch (parseError) {
      console.error("[v0] Failed to parse Gemini response:", parseError)
      return NextResponse.json({
        summary: getMockSummary(category || "general", urgency || 50),
        warning: "AI analysis format error, showing estimated summary"
      })
    }

  } catch (error) {
    console.error("[v0] Reports summarize error:", error)
    return NextResponse.json(
      { error: "Analysis unavailable", summary: null },
      { status: 500 }
    )
  }
}
