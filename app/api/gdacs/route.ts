import { NextResponse } from "next/server"

const GDACS_RSS_URL = "https://www.gdacs.org/xml/rss.xml"

const MOCK_EVENTS: GdacsEvent[] = [
  {
    title: "Flood - India",
    link: "https://www.gdacs.org",
    pubDate: new Date().toISOString(),
    alertLevel: "Red",
    country: "India",
    lat: 23.1815,
    lon: 79.9864,
  },
  {
    title: "Earthquake - Turkey",
    link: "https://www.gdacs.org",
    pubDate: new Date().toISOString(),
    alertLevel: "Orange",
    country: "Turkey",
    lat: 39.9208,
    lon: 32.8541,
  },
  {
    title: "Cyclone - Bangladesh",
    link: "https://www.gdacs.org",
    pubDate: new Date().toISOString(),
    alertLevel: "Yellow",
    country: "Bangladesh",
    lat: 24.3745,
    lon: 90.3789,
  },
]

function extractCdata(text: string): string {
  const m = text.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/)
  return m ? m[1].trim() : text.trim()
}

interface GdacsEvent {
  title: string
  link: string
  pubDate: string
  alertLevel: string
  country: string
  lat: number | null
  lon: number | null
}

function parseRssXml(xml: string): GdacsEvent[] {
  const events: GdacsEvent[] = []
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []

  for (const block of itemBlocks.slice(0, 15)) {
    const getTag = (tag: string): string => {
      const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
      return m ? extractCdata(m[1].trim()) : ""
    }

    const title = getTag("title")
    const link = getTag("link")
    const pubDate = getTag("pubDate")
    const alertLevel = getTag("gdacs:alertlevel")
    const country = getTag("gdacs:country")
    const coordsRaw = getTag("gdacs:coordinates")

    let lat: number | null = null
    let lon: number | null = null
    if (coordsRaw) {
      const parts = coordsRaw.trim().split(/\s+/)
      if (parts.length >= 2) {
        const a = parseFloat(parts[0])
        const b = parseFloat(parts[1])
        if (!isNaN(a) && !isNaN(b)) {
          lat = a
          lon = b
        }
      }
    }

    events.push({ title, link, pubDate, alertLevel, country, lat, lon })
  }

  return events
}

export async function GET() {
  try {
    const response = await fetch(GDACS_RSS_URL, {
      next: { revalidate: 300 },
      headers: { "User-Agent": "ImpactGrid/1.0" },
    })

    if (!response.ok) {
      console.error(
        `[GDACS] HTTP error: ${response.status} ${response.statusText}`,
      )
      return NextResponse.json({ events: MOCK_EVENTS, cached: true })
    }

    const xml = await response.text()
    console.log(
      `[GDACS] Raw XML (first 500 chars): ${xml.substring(0, 500)}...`,
    )

    const events = parseRssXml(xml)
    if (events.length === 0) {
      console.warn("[GDACS] No events parsed, returning mock data")
      return NextResponse.json({ events: MOCK_EVENTS, cached: true })
    }

    return NextResponse.json({ events })
  } catch (error) {
    console.error(
      "[GDACS] Fetch failed:",
      error instanceof Error ? error.message : String(error),
    )
    return NextResponse.json({ events: MOCK_EVENTS, cached: true })
  }
}
