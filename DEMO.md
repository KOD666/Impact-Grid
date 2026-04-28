# ImpactGrid — Screen Recording Demo Script

Follow this sequence exactly. Each section is one continuous recording segment. Keep cursor movements deliberate and pause 1–2 seconds on anything you want the viewer to read.

---

## SEGMENT 1: Dashboard Overview (30 sec)

**URL:** `/`

1. Open the app. Let the dashboard fully load.
2. Pan across the top metrics row — point out Total Missions, Volunteers, Active Alerts.
3. Hover over the crisis map markers briefly.
4. Scroll down to the Live Intel Stream — let it sit for 2 seconds so the viewer sees the feed.
5. Point out the Deploy Response bar at the bottom (grayed out, no pending changes).

---

## SEGMENT 2: Role Switcher (20 sec)

**URL:** any page (TopNav is always visible)

1. Click the role indicator in the top-right navigation bar (shows current role: COMMANDER).
2. Show the dropdown: Commander / Coordinator / Volunteer.
3. Select **Volunteer** — watch the Deploy Response bar disappear from the bottom.
4. Observe the GDACS link disappear from the sidebar.
5. Switch back to **Commander**.

**Say:** "Three roles — Commander, Coordinator, Volunteer — each with different access to create, deploy, and manage resources."

---

## SEGMENT 3: Notification Bell Fix (15 sec)

**URL:** any page

1. Click the bell icon in the top navigation.
2. Show the notification panel dropping down — it should render on top of all content, not clipped by the sidebar.
3. Click outside to dismiss.
4. Click the gear icon — show the settings panel opening on top of content.
5. Toggle a setting (e.g., Map Layer Density).
6. Click outside to dismiss.

**Say:** "Both panels are now fixed-position at z-index 9999, no more clipping behind the sidebar."

---

## SEGMENT 4: Personnel Management (45 sec)

**URL:** `/personnel`

1. Show the volunteer card grid.
2. Use the filter bar to narrow by "Available" and then by a skill.
3. Click **SET_OFFLINE** on a volunteer — show the availability dot change.
4. Click **VIEW_PROFILE** on any volunteer — show the full profile page.
5. Navigate back.
6. Click **ASSIGN_MISSION** — show the mission selection dialog, select a mission, confirm.
7. Show the volunteer card update with the mission badge.
8. Switch role to **Volunteer**, show the ADD_VOLUNTEER button is now disabled.
9. Switch back to **Commander**.
10. Click **ADD_VOLUNTEER**, fill in Name + a skill, submit — show new card appear.

---

## SEGMENT 5: Missions Page — Unassigned Badge + Suggest Team (45 sec)

**URL:** `/missions`

1. Show the missions grid. Point out an **UNASSIGNED** amber badge on a pending mission card.
2. Point out the **SUGGEST_TEAM** amber button below it.
3. Click **SUGGEST_TEAM** — the mission detail modal opens.
4. Scroll to the **SUGGESTED_ALLOCATION** section at the bottom of the modal.
5. Show the volunteer rows: name, reason pills (Skill Match, Proximity, etc.), ASSIGN button.
6. Click **ASSIGN** on one volunteer — show the spinner, then the checkmark.
7. Close the modal.
8. Point out the **NEW_MISSION** button in the top right.
9. Click it — show the create mission modal (Title, Location, Priority, Description).
10. Fill in a title and location, click **CREATE** — show the new card appear in the grid.

---

## SEGMENT 6: GDACS Live Feed (40 sec)

**URL:** `/gdacs`

> Note: If the live feed is unavailable, the page shows mock events with an amber "Live feed unavailable" banner — that is expected behavior.

1. Navigate to GDACS from the sidebar.
2. If the amber cached-data banner appears, point it out and explain the graceful fallback.
3. Show the alert cards: each card has title, country, alert level badge (Red/Orange/Yellow), and coordinates.
4. Click **CREATE_MISSION** on a Red alert card.
5. The modal opens — show the pre-filled event title and the allocation preview.
6. Show the volunteer suggestions with scores.
7. Fill in a mission title if needed and click **CREATE_MISSION**.
8. Navigate to `/missions` — show the new mission card has appeared.

**Say:** "GDACS alerts are parsed directly from the UN feed. When the feed is unreachable, the app falls back to cached events and flags it clearly."

---

## SEGMENT 7: Deploy Response (30 sec)

**URL:** `/missions` or `/personnel` (make a change first to enable the bar)

1. Make a change — toggle a volunteer availability or assign a mission.
2. Point out the Deploy Response bar at the bottom now shows a count badge.
3. Click **DEPLOY_RESPONSE**.
4. Watch the 4-step stepper: Mission statuses → Volunteers assigned → Logistics → Alert check.
5. Each step shows a spinner then a checkmark.
6. Show the success summary: "X missions activated · Y volunteers assigned".
7. Click CLOSE — bar resets to zero.

**Say:** "Deploy commits all staged changes in a single atomic batch, writes an audit log entry, and revalidates all SWR caches."

---

## SEGMENT 8: Logistics (20 sec)

**URL:** `/logistics`

1. Show the stat tiles at the top.
2. Show the map with team markers and polyline routes.
3. Point out a task card: team, destination, ETA.
4. Click **MARK AS DELIVERED** on a task — show it move to Delivered status.

---

## Optional: AI Report Analysis

**URL:** `/reports`

1. Paste a sample field report.
2. Click **ANALYZE_REPORT** — show loading state.
3. Walk through: Risk Level, Executive Summary, Key Findings, Immediate Actions, Resources.
4. Click **DOWNLOAD_REPORT** for PDF export.

---

## Key Talking Points (say at any point)

- **Role-Based Access:** Three roles with gates on every destructive or privileged action — no hard-coded user, switchable at runtime.
- **Smart Allocation:** Haversine distance + skill match + urgency multiplier produces a ranked volunteer shortlist in milliseconds, client-side, no API call needed.
- **GDACS Integration:** Live UN disaster feed parsed from RSS XML. Graceful fallback to mock data with a clear UI signal — no silent failures.
- **Atomic Deploy:** All staged changes (mission statuses, volunteer assignments, logistics) committed in a single POST with audit trail.
- **Overlay Fix:** Notification bell and settings panel use `position: fixed` at z-index 9999, confirmed to render above sidebar and map layers on all pages.

---

## Troubleshooting

- **GDACS page shows amber banner:** Expected. Live feed may be blocked in sandbox — mock events show full flow.
- **Suggest Team shows no volunteers:** Data store may be empty. Add a volunteer on `/personnel` first, or reload.
- **Deploy bar stays grayed out:** Make at least one change (toggle availability, assign a mission) to queue a pending change.
- **Map does not load:** Hard refresh the page. Leaflet requires client-side only — the dynamic import handles SSR but the first paint can lag.
