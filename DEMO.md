# ImpactGrid - Demo Script for Jury Presentation

This guide walks you through demonstrating ImpactGrid to the jury. Follow this sequence to showcase the platform's key features effectively.

---

## START HERE: Dashboard Overview

**URL:** `/` (Home Page)

### What to Show:
1. **Point out the overall layout**
   - Sidebar navigation on the left with all major sections
   - Top navigation bar with search, notifications, and settings
   - Main dashboard with real-time metrics

2. **Highlight the metrics cards at the top**
   - Total missions count
   - Volunteer roster size
   - Active alerts
   - Success rate percentage

3. **Show the Crisis Map**
   - Explain: "This is a geospatial visualization of all active crisis points"
   - Markers show report locations with urgency indicators
   - Click a marker to see details

4. **Scroll to Live Intel Stream**
   - Explain: "Real-time intelligence feed from field operators"
   - Different payload types are color-coded (INFO, WARN, ALERT)

---

## DEMO 1: Search & Filter Intel Stream

### Steps:
1. **Click on the search bar** in the top navigation
2. **Type a search term** (e.g., "supply" or "alert")
3. **Show the results count badge** appearing next to the input
4. **Point out** that the intel stream table filters in real-time
5. **Press Escape or click X** to clear the filter

**Say:** "Operators can quickly filter through thousands of intel entries to find relevant information."

---

## DEMO 2: Notifications Panel

### Steps:
1. **Click the bell icon** in the top navigation
2. **Show the drawer sliding in** from the right
3. **Point out:**
   - Alert items with severity icons
   - Confidence percentage for predictions
   - Timestamps
4. **Click outside or press Escape** to close

**Say:** "The predictive alerts system uses ML models to forecast potential crisis events before they escalate."

---

## DEMO 3: Settings Panel

### Steps:
1. **Click the gear icon** in the top navigation
2. **Show the dropdown menu**
3. **Toggle "Map Layer Density"** between All and Critical
4. **Toggle "Intel Stream"** between Live and Paused
5. **Toggle "Marker Labels"** On/Off
6. **Close by clicking outside**

**Say:** "Settings are persisted locally, so operators can customize their workspace preferences."

---

## DEMO 4: Personnel Management

**URL:** `/personnel`

### Steps:
1. **Navigate to Personnel** from sidebar
2. **Show the filter bar:**
   - Search by name
   - Filter by availability (Available, Busy, Offline)
   - Filter by skills dropdown
   - Sort options
3. **Select a skill filter** to narrow results
4. **Show the volunteer cards** with status indicators
5. **Click "VIEW PROFILE"** on one volunteer
6. **Show the detailed profile page** with contact info, skills, mission history

**Say:** "Personnel management allows coordinators to quickly find volunteers with specific skills and availability."

---

## DEMO 5: Mission Operations

**URL:** `/missions`

### Steps:
1. **Navigate to Missions** from sidebar
2. **Show the filter bar:**
   - Status pills (Active, Pending, Completed)
   - Urgency pills (Critical, High, Medium, Low)
   - Category dropdown
3. **Filter to show "Critical" missions**
4. **Click on a mission card** to view details
5. **Show the "DEPLOY VOLUNTEERS" button**
6. **Explain the assignment workflow**

**Say:** "Missions are prioritized by urgency and can be filtered to help coordinators focus on critical situations first."

---

## DEMO 6: Logistics Tracking

**URL:** `/logistics`

### Steps:
1. **Navigate to Logistics** from sidebar
2. **Show the stats tiles** at the top (Active tasks, En route, Pending, Delivered)
3. **Show the map with team markers** and routes
4. **Point out a task card** with team, destination, ETA
5. **Click "MARK AS DELIVERED"** on a task

**Say:** "Logistics tracking enables real-time visibility of supply convoys and delivery teams."

---

## DEMO 7: AI-Powered Report Analysis (KEY FEATURE)

**URL:** `/reports`

### Steps:
1. **Navigate to Reports** from sidebar
2. **Point out the two-column layout**
   - Left: Submit form
   - Right: AI analysis output

3. **Enter a sample report:**
   ```
   Water supply disrupted in Sector 4-B following infrastructure damage. 
   Approximately 500 families affected. Local reserves depleted. 
   Urgent need for water purification equipment and tanker trucks.
   ```

4. **Set location:** "Sector 4-B, Northern District"
5. **Set category:** WATER
6. **Click "ANALYZE_REPORT"**
7. **Wait for the analysis** (show loading state)
8. **Walk through the AI output:**
   - Risk Level badge (color-coded)
   - Executive Summary
   - Key Findings (bulleted)
   - Immediate Actions Required (numbered)
   - Affected Population
   - Estimated Resolution Time
   - Recommended Resources (pill tags)

9. **Click "DOWNLOAD_REPORT"** to generate PDF

**Say:** "Our AI-powered analysis uses Google Gemini to extract structured intelligence from field reports, enabling faster decision-making."

---

## DEMO 8: Show Report History

### Steps:
1. **Point out the "RECENT_REPORTS" section** below the form
2. **Click on a previous report** to reload it
3. **Show that the analysis is also restored**

**Say:** "Reports are stored locally for quick reference and can be re-analyzed or exported at any time."

---

## DEMO 9: Analytics Dashboard (Optional)

**URL:** `/analytics`

### Steps:
1. **Navigate to Analytics** from sidebar
2. **Show the satellite status panel**
3. **Point out the terrain visualization**
4. **Show the Neural Data Engine metrics**
5. **Point out the Live Data Panel** on the right

**Say:** "The analytics dashboard provides system-wide visibility for high-level operations oversight."

---

## CLOSING: Deploy Response

### Steps:
1. **Point to the "DEPLOY_RESPONSE" button** in the sidebar
2. **Click it to show the deploy modal**
3. **Explain:** "This commits all pending changes to the database"
4. **Click Deploy** (or cancel)

**Say:** "The deploy system batches all coordinator actions and commits them atomically, ensuring data consistency across the platform."

---

## Key Talking Points

1. **Real-time Operations:** All data syncs in real-time between field operators and coordinators

2. **AI Integration:** Gemini-powered analysis turns unstructured field reports into actionable intelligence

3. **Graceful Degradation:** Platform works with or without database connection (falls back to in-memory store)

4. **Mobile Responsive:** Sidebar collapses on mobile, all views adapt to smaller screens

5. **Accessibility:** Full keyboard navigation, ARIA labels, screen reader support

6. **PDF Export:** Professional report generation for stakeholder communication

---

## Troubleshooting

- **If AI analysis shows "estimated summary":** The Gemini API key is not configured. This is expected in demo environments - the mock data demonstrates the feature functionality.

- **If data looks empty:** Click "DEPLOY_RESPONSE" in the sidebar to refresh, or reload the page.

- **If map doesn't load:** The map uses sample coordinates. Ensure the page has fully loaded.
