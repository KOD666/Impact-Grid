import { NextResponse } from "next/server"

// GDACS GeoRSS proxy - fetches current disasters from GDACS
const GDACS_URL = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH"

export async function GET() {
  try {
    const response = await fetch(GDACS_URL, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 600 }, // Cache for 10 minutes
    })

    if (!response.ok) {
      // Return empty array if GDACS is unavailable
      return NextResponse.json({ features: [], success: true })
    }

    const data = await response.json()
    return NextResponse.json({ ...data, success: true })
  } catch (error) {
    console.error("[v0] GDACS fetch error:", error)
    // Return empty array on error to prevent UI crashes
    return NextResponse.json({ features: [], success: true })
  }
}
