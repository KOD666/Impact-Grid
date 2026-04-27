# ImpactGrid - Implementation Documentation

## Overview

ImpactGrid is a crisis coordination platform designed for NGO operations. It provides real-time mission tracking, volunteer management, logistics coordination, and AI-powered report analysis.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS 4 with custom tactical design tokens
- **Components**: shadcn/ui component library
- **State Management**: React Context + SWR for data fetching
- **Database**: Supabase (with fallback to in-memory data store)
- **AI Integration**: Google Gemini API for report analysis
- **PDF Export**: jsPDF + html2canvas

## Project Structure

```
app/
├── page.tsx                    # Main dashboard
├── missions/
│   ├── page.tsx               # Missions list with filtering
│   └── [id]/page.tsx          # Mission detail view
├── personnel/
│   ├── page.tsx               # Personnel roster with filtering
│   └── [id]/page.tsx          # Volunteer profile view
├── logistics/
│   └── page.tsx               # Logistics task tracking
├── analytics/
│   └── page.tsx               # Analytics dashboard
├── reports/
│   └── page.tsx               # AI-powered report analysis
└── api/
    ├── missions/route.ts      # Missions CRUD API
    ├── volunteers/route.ts    # Volunteers CRUD API
    ├── dashboard/route.ts     # Dashboard metrics API
    └── reports/
        └── summarize/route.ts # Gemini AI summarization

components/
├── impact-grid/               # Core application components
│   ├── sidebar.tsx            # Navigation sidebar
│   ├── top-nav.tsx            # Top navigation with search/settings
│   ├── crisis-map.tsx         # Geospatial visualization
│   ├── live-intel-stream.tsx  # Real-time intel feed
│   ├── predictive-alerts.tsx  # ML-powered alerts
│   ├── resource-matrix.tsx    # Resource allocation display
│   ├── volunteer-card.tsx     # Personnel card component
│   ├── mission-card.tsx       # Mission card component
│   └── ...                    # Additional UI components
├── providers/
│   └── app-provider.tsx       # Global state management
└── ui/                        # shadcn/ui components

lib/
├── types.ts                   # TypeScript interfaces
├── data-store.ts              # In-memory fallback data
├── ai-processing.ts           # AI matching algorithms
└── supabase/
    ├── client.ts              # Client-side Supabase
    └── server.ts              # Server-side Supabase
```

## Key Features

### 1. Dashboard (/)
- Real-time metrics display (missions, volunteers, alerts)
- Interactive crisis map with mission markers
- Live intel stream with search filtering
- Predictive alerts panel
- Resource allocation matrix

### 2. Missions (/missions)
- Mission list with status/urgency/category filtering
- Mission detail view with volunteer assignments
- Deploy volunteers functionality
- Mission completion tracking

### 3. Personnel (/personnel)
- Volunteer roster with filtering by availability/skills
- Volunteer profile management
- Mission assignment workflow
- Availability toggling

### 4. Logistics (/logistics)
- Task tracking with status updates
- Team location visualization
- Delivery status management
- Route planning support

### 5. Reports (/reports)
- AI-powered field report analysis (Gemini API)
- Structured summary generation
- PDF export functionality
- Report history (localStorage)

### 6. Analytics (/analytics)
- Satellite status monitoring
- Neural data engine visualization
- Live data panels

## Dashboard Top-Bar Features

### Search Bar
- Real-time filtering of LIVE_INTEL_STREAM
- 300ms debounce on input
- Shows result count badge
- Escape key or X button to reset

### Notifications Bell
- Slide-in drawer from right (300ms animation)
- Shows predictive alerts as notification items
- Each item displays: icon, title, timestamp, confidence %
- "Clear all" button
- Closes on outside click or Escape

### Settings Gear
- Dropdown menu with toggles:
  - Map Layer Density: All / Critical only
  - Intel Stream: Live / Paused
  - Marker Labels: On / Off
- Settings persisted in localStorage (`impactgrid_settings`)
- Export Data option links to Reports page

## Environment Variables

```env
# Supabase (optional - falls back to in-memory data)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini AI (optional - returns mock data without key)
GEMINI_API_KEY=your_gemini_api_key
```

## Database Schema (Supabase)

### volunteers
- id (uuid, primary key)
- name (text)
- location (text)
- skills (text[])
- availability (text: available/busy/offline)
- clearance_level (integer)
- missions_completed (integer)
- current_mission (uuid, nullable)
- joined_at (date)
- contact_email (text)
- contact_phone (text)
- created_at, updated_at (timestamp)

### missions
- id (uuid, primary key)
- title (text)
- location (text)
- category (text)
- volunteers_required (integer)
- time_estimate (text)
- urgency (text: critical/high/medium/low)
- status (text: pending/active/completed/cancelled)
- description (text)
- assigned_volunteers (uuid[])
- source_reports (uuid[])
- coordinates (jsonb)
- created_at, updated_at (timestamp)

### logistics_tasks
- id (uuid, primary key)
- title (text)
- team (text)
- category (text)
- status (text: pending/en_route/delivered)
- load_details (text)
- eta (text)
- priority (text)
- destination (text)
- destination_coordinates (jsonb)
- team_coordinates (jsonb)
- destination_urgency (integer)
- created_at, delivered_at (timestamp)

## Graceful Degradation

The application is designed to work without Supabase:
- `isSupabaseConfigured()` checks for env vars before attempting connection
- All API routes fall back to `dataStore` (in-memory data)
- App provider detects missing Supabase and uses API endpoints instead

## Styling

Custom CSS variables for tactical theme:
```css
--tactical-orange: #FF6B00
--tactical-green: #22C55E
--tactical-red: #EF4444
--tactical-yellow: #F59E0B
--tactical-blue: #3B82F6
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```
