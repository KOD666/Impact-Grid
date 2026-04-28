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

const FALLBACK_EVENTS: GdacsEvent[] = [
  {
    title: "Typhoon - Philippines",
    link: "https://www.gdacs.org",
    pubDate: new Date().toISOString(),
    alertLevel: "Red",
    country: "Philippines",
    lat: 14.5995,
    lon: 120.9842,
  },
  {
    title: "Earthquake - Turkey/Syria Border",
    link: "https://www.gdacs.org",
    pubDate: new Date().toISOString(),
    alertLevel: "Orange",
    country: "Turkey",
    lat: 37.2263,
    lon: 35.7845,
  },
  {
    title: "Drought - East Africa",
    link: "https://www.gdacs.org",
    pubDate: new Date().toISOString(),
    alertLevel: "Orange",
    country: "Kenya",
    lat: -1.2921,
    lon: 36.8219,
  },
  {
    title: "Flooding - Bangladesh",
    link: "https://www.gdacs.org",
    pubDate: new Date().toISOString(),
    alertLevel: "Yellow",
    country: "Bangladesh",
    lat: 23.6850,
    lon: 90.3563,
  },
  {
    title: "Wildfire - California",
    link: "https://www.gdacs.org",
    pubDate: new Date().toISOString(),
    alertLevel: "Red",
    country: "United States",
    lat: 37.7749,
    lon: -122.4194,
  },
]

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
    console.log("[GDACS] Fetching from:", GDACS_RSS_URL)
    const response = await fetch(GDACS_RSS_URL, {
      next: { revalidate: 300 },
      headers: { "User-Agent": "ImpactGrid/1.0" },
    })

    if (!response.ok) {
      console.warn(
        `[GDACS] HTTP error: ${response.status} ${response.statusText}, using fallback`,
      )
      return NextResponse.json({ events: FALLBACK_EVENTS, cached: true })
    }

    const xml = await response.text()
    console.log(
      `[GDACS] Raw XML length: ${xml.length}, first 300 chars: ${xml.substring(0, 300)}...`,
    )

    const events = parseRssXml(xml)
    console.log(`[GDACS] Parsed ${events.length} events`)
    
    if (events.length === 0) {
      console.warn("[GDACS] No events parsed, using fallback")
      return NextResponse.json({ events: FALLBACK_EVENTS, cached: true })
    }

    return NextResponse.json({ events, cached: false })
  } catch (error) {
    console.error(
      "[GDACS] Fetch failed:",
      error instanceof Error ? error.message : String(error),
    )
    return NextResponse.json({ events: FALLBACK_EVENTS, cached: true })
  }
}
