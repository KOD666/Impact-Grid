import { NextResponse } from "next/server"

// GDACS RSS feed - fetches current disasters
const GDACS_RSS_URL = "https://www.gdacs.org/xml/rss.xml"

interface GDACSEvent {
  title: string
  link: string
  pubDate: string
  alertlevel: string
  severity: string
  country: string
  coordinates?: { lat: number; lng: number }
}

// Simple XML parser using string matching (no external libraries)
function parseGDACSRSS(xml: string): GDACSEvent[] {
  const events: GDACSEvent[] = []
  
  // Split by <item> tags
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
  
  let count = 0
  for (const match of itemMatches) {
    if (count >= 15) break
    
    const itemXml = match[1]
    
    // Extract fields using regex
    const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
      itemXml.match(/<title>(.*?)<\/title>/)
    const linkMatch = itemXml.match(/<link>(.*?)<\/link>/)
    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)
    const alertlevelMatch = itemXml.match(/<gdacs:alertlevel>(.*?)<\/gdacs:alertlevel>/)
    const severityMatch = itemXml.match(/<gdacs:severity>(.*?)<\/gdacs:severity>/)
    const countryMatch = itemXml.match(/<gdacs:country>(.*?)<\/gdacs:country>/)
    const coordMatch = itemXml.match(/<gdacs:coordinates>([0-9.-]+),([0-9.-]+)<\/gdacs:coordinates>/)
    
    const title = titleMatch?.[1]?.trim()
    const link = linkMatch?.[1]?.trim()
    const pubDate = pubDateMatch?.[1]?.trim()
    const alertlevel = alertlevelMatch?.[1]?.trim()
    const severity = severityMatch?.[1]?.trim()
    const country = countryMatch?.[1]?.trim()
    
    if (title && link && pubDate) {
      const event: GDACSEvent = {
        title,
        link,
        pubDate,
        alertlevel: alertlevel || "Green",
        severity: severity || "N/A",
        country: country || "Global",
      }
      
      if (coordMatch) {
        event.coordinates = {
          lat: parseFloat(coordMatch[1]),
          lng: parseFloat(coordMatch[2]),
        }
      }
      
      events.push(event)
      count++
    }
  }
  
  return events
}

export async function GET() {
  try {
    const response = await fetch(GDACS_RSS_URL, {
      headers: {
        "User-Agent": "ImpactGrid/1.0",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.warn(`[v0] GDACS returned ${response.status}`)
      return NextResponse.json({ data: [], success: true })
    }

    const xml = await response.text()
    const events = parseGDACSRSS(xml)
    
    return NextResponse.json({ 
      data: events, 
      success: true,
      count: events.length,
    })
  } catch (error) {
    console.error("[v0] GDACS fetch error:", error)
    return NextResponse.json({ data: [], success: true, error: String(error) })
  }
}
