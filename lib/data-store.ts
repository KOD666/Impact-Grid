// In-memory data store for ImpactGrid demo
// In production, this would be replaced with a database

import type { Report, Mission, Volunteer, PredictiveAlert, IntelStreamEntry, ResourceAllocation, SystemMetrics, LogisticsTask, DeploymentLog } from "./types"

// Initial seed data
const initialReports: Report[] = [
  {
    id: "RPT_001",
    text: "Critical water shortage in Sector 7G. Water contamination confirmed. 50 families affected including elderly and children. Urgent response needed.",
    location: "Sector 7G",
    category: "water",
    urgency_score: 85,
    urgency_signals: ["critical", "urgent", "children", "elderly"],
    people_affected: 250,
    vulnerable_groups: ["children", "elderly"],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "processed",
    coordinates: { lat: 34.0522, lng: -118.2437 }
  },
  {
    id: "RPT_002",
    text: "Medical supplies running low at Field Hospital Delta. Need trauma kits and antibiotics. 30 patients waiting.",
    location: "Field Hospital Delta",
    category: "medical",
    urgency_score: 72,
    urgency_signals: ["urgent"],
    people_affected: 30,
    vulnerable_groups: [],
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: "mission_created",
    coordinates: { lat: 34.0612, lng: -118.2517 }
  },
  {
    id: "RPT_003",
    text: "Minor flooding detected near perimeter fence. Evacuation routes remain open but monitoring required.",
    location: "Perimeter Zone A",
    category: "infrastructure",
    urgency_score: 35,
    urgency_signals: [],
    people_affected: 0,
    vulnerable_groups: [],
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: "processed",
    coordinates: { lat: 34.0422, lng: -118.2337 }
  },
  {
    id: "RPT_004",
    text: "Multiple SOS beacons activated at coastal region. Coordinating SAR operations. Estimated 12 people stranded.",
    location: "Coastal Region B",
    category: "evacuation",
    urgency_score: 92,
    urgency_signals: ["emergency", "urgent"],
    people_affected: 12,
    vulnerable_groups: [],
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: "mission_created",
    coordinates: { lat: 34.0322, lng: -118.2637 }
  }
]

const initialMissions: Mission[] = [
  {
    id: "MSN_001",
    title: "WATER_PURIFICATION_FAILURE",
    location: "SECTOR_07.B",
    category: "water",
    volunteers_required: 4,
    time_estimate: "06:00 HRS",
    urgency: "critical",
    status: "pending",
    description: "Sector 7 filtration system compromised. Emergency backup systems offline. Immediate technical response required for water purification restoration.",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    assigned_volunteers: [],
    source_reports: ["RPT_001"],
    coordinates: { lat: 34.0522, lng: -118.2437 }
  },
  {
    id: "MSN_002",
    title: "MEDICAL_RESUPPLY_CONVOY",
    location: "CAMP_SILVER",
    category: "medical",
    volunteers_required: 3,
    time_estimate: "03:30 HRS",
    urgency: "high",
    status: "active",
    description: "Transport of critical trauma kits and antibiotics to Field Hospital Delta. Route requires heavy vehicle certification and medical handling protocols.",
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    assigned_volunteers: ["VOL_002"],
    source_reports: ["RPT_002"],
    coordinates: { lat: 34.0612, lng: -118.2517 }
  },
  {
    id: "MSN_003",
    title: "STRUCTURAL_INTEGRITY_ASSESSMENT",
    location: "BLOCK_12_URBAN",
    category: "infrastructure",
    volunteers_required: 2,
    time_estimate: "08:00 HRS",
    urgency: "medium",
    status: "pending",
    description: "Post-incident survey of residential block 12. Multiple reports of subsidence and gas leaks. Evacuation standby order pending.",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    assigned_volunteers: [],
    source_reports: [],
    coordinates: { lat: 34.0422, lng: -118.2237 }
  }
]

const initialVolunteers: Volunteer[] = [
  {
    id: "VOL_001",
    name: "SGT. ELIAS VANCE",
    location: "Base Camp Alpha",
    skills: ["medical", "first aid", "logistics", "hazmat"],
    availability: "available",
    clearance_level: 4,
    missions_completed: 42,
    coordinates: { lat: 34.0500, lng: -118.2400 },
    joined_at: "2024-01-03",
    contact_email: "e.vance@impactgrid.ops",
    contact_phone: "+1-555-0142",
    mission_history: ["MSN_002"],
  },
  {
    id: "VOL_002",
    name: "TECH. MIA CHEN",
    location: "Field Station 3",
    skills: ["engineering", "water purification", "electrical", "technical"],
    availability: "busy",
    clearance_level: 3,
    missions_completed: 28,
    current_mission: "MSN_002",
    coordinates: { lat: 34.0550, lng: -118.2450 },
    joined_at: "2024-03-12",
    contact_email: "m.chen@impactgrid.ops",
    contact_phone: "+1-555-0188",
    mission_history: ["MSN_002"],
  },
  {
    id: "VOL_003",
    name: "OP. MARCUS THORNE",
    location: "Mobile Unit 7",
    skills: ["driving", "heavy machinery", "logistics", "security"],
    availability: "available",
    clearance_level: 4,
    missions_completed: 35,
    coordinates: { lat: 34.0480, lng: -118.2380 },
    joined_at: "2023-11-20",
    contact_email: "m.thorne@impactgrid.ops",
    contact_phone: "+1-555-0210",
    mission_history: [],
  },
  {
    id: "VOL_004",
    name: "DR. SARAH REYES",
    location: "Field Hospital Delta",
    skills: ["medical", "doctor", "trauma", "surgery"],
    availability: "busy",
    clearance_level: 5,
    missions_completed: 67,
    coordinates: { lat: 34.0612, lng: -118.2517 },
    joined_at: "2022-08-05",
    contact_email: "s.reyes@impactgrid.ops",
    contact_phone: "+1-555-0319",
    mission_history: [],
  },
  {
    id: "VOL_005",
    name: "CPL. JAMES OKORO",
    location: "Sector 4 Outpost",
    skills: ["security", "communication", "first aid"],
    availability: "available",
    clearance_level: 3,
    missions_completed: 19,
    coordinates: { lat: 34.0600, lng: -118.2300 },
    joined_at: "2024-06-18",
    contact_email: "j.okoro@impactgrid.ops",
    contact_phone: "+1-555-0427",
    mission_history: [],
  }
]

const initialAlerts: PredictiveAlert[] = [
  {
    id: "ALERT_001",
    type: "critical_event",
    title: "WATER SHORTAGE RISK - SECTOR 4",
    description: "Pattern analysis indicates potential water crisis. 3 related reports in past 48 hours.",
    location: "SECTOR 4",
    confidence: 88,
    time_to_event: "T-MINUS: 14H 22M",
    recommended_action: "Deploy water purification units and coordinate with local authorities",
    triggered_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    source_pattern: {
      report_count: 3,
      time_window: "48h",
      category: "water"
    }
  },
  {
    id: "ALERT_002",
    type: "logistics_alert",
    title: "CONVOY_09 BLOCKED - ROUTE_DELTA",
    description: "Supply convoy unable to proceed. Alternative routing required.",
    location: "ROUTE DELTA",
    confidence: 100,
    recommended_action: "Re-route via Highway 7 or await clearance",
    triggered_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    source_pattern: {
      report_count: 1,
      time_window: "1h",
      category: "infrastructure"
    }
  },
  {
    id: "ALERT_003",
    type: "advisory",
    title: "WEATHER_SYSTEM_INCOMING",
    description: "Meteorological data indicates incoming precipitation system.",
    location: "ALL SECTORS",
    confidence: 75,
    time_to_event: "PRECIPITATION EXPECTED: 06H02",
    recommended_action: "Secure outdoor equipment and prepare drainage systems",
    triggered_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    source_pattern: {
      report_count: 0,
      time_window: "N/A",
      category: "other"
    }
  }
]

const initialIntelStream: IntelStreamEntry[] = [
  {
    id: "INTEL_001",
    timestamp: "12:44:01",
    source: "FIELD_U_04",
    payload_type: "INFO",
    message: "Supplies reaching distribution point B. Local team ready for offload.",
    status: "received"
  },
  {
    id: "INTEL_002",
    timestamp: "12:42:58",
    source: "NODE_HQ",
    payload_type: "SYS",
    message: "SYSTEM_UPDATE: Delta protocols engaged for evening shift.",
    status: "logged"
  },
  {
    id: "INTEL_003",
    timestamp: "12:41:15",
    source: "SAT_RELAY",
    payload_type: "WARN",
    message: "ANOMALY_DETECTED: Unexpected heat signature Sector 04-B.",
    status: "action_req"
  }
]

const initialResources: ResourceAllocation[] = [
  { id: "RES_001", name: "FUEL_RESERVES_ALPHA", current: 72.4, capacity: 100, status: "nominal" },
  { id: "RES_002", name: "MEDICAL_SUPPLY_BASE", current: 45, capacity: 100, status: "low" },
  { id: "RES_003", name: "PERSONNEL_DEPLOYMENT", current: 91.8, capacity: 100, status: "nominal" },
  { id: "RES_004", name: "WATER_RESERVES", current: 28, capacity: 100, status: "critical" },
  { id: "RES_005", name: "FOOD_SUPPLIES", current: 65, capacity: 100, status: "nominal" }
]

const initialLogistics: LogisticsTask[] = [
  {
    id: "LOG_001",
    title: "Water Purification Drop - Sector 7G",
    team: "BRAVO_TEAM",
    category: "water_purification_drop",
    status: "en_route",
    load_details: "12 units / 4,800 L capacity",
    eta: "01:45",
    priority: "critical",
    destination: "Sector 7G",
    destination_coordinates: { lat: 34.0522, lng: -118.2437 },
    team_coordinates: { lat: 34.0480, lng: -118.2520 },
    destination_urgency: 85,
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: "LOG_002",
    title: "Medical Kit Transport - Field Hospital Delta",
    team: "ECHO_TEAM",
    category: "medical_kit_transport",
    status: "pending",
    load_details: "30 trauma kits, antibiotics, IV fluids",
    eta: "03:30",
    priority: "high",
    destination: "Field Hospital Delta",
    destination_coordinates: { lat: 34.0612, lng: -118.2517 },
    team_coordinates: { lat: 34.0700, lng: -118.2400 },
    destination_urgency: 72,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "LOG_003",
    title: "Shelter Setup - Block 12 Urban",
    team: "ALPHA_TEAM",
    category: "shelter_setup",
    status: "en_route",
    load_details: "20 family tents, 80 cots, blankets",
    eta: "02:15",
    priority: "medium",
    destination: "Block 12 Urban",
    destination_coordinates: { lat: 34.0422, lng: -118.2237 },
    team_coordinates: { lat: 34.0350, lng: -118.2150 },
    destination_urgency: 35,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "LOG_004",
    title: "Food Distribution - Refugee Camp A",
    team: "DELTA_TEAM",
    category: "food_distribution",
    status: "pending",
    load_details: "1,200 ration packs, 800 L water",
    eta: "04:00",
    priority: "high",
    destination: "Refugee Camp A",
    destination_coordinates: { lat: 34.0322, lng: -118.2637 },
    team_coordinates: { lat: 34.0250, lng: -118.2700 },
    destination_urgency: 60,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "LOG_005",
    title: "Communication Relay Setup - Coastal Region B",
    team: "FOXTROT_TEAM",
    category: "communication_relay",
    status: "en_route",
    load_details: "2 mobile relay units, satellite uplink",
    eta: "01:10",
    priority: "critical",
    destination: "Coastal Region B",
    destination_coordinates: { lat: 34.0322, lng: -118.2637 },
    team_coordinates: { lat: 34.0400, lng: -118.2580 },
    destination_urgency: 92,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "LOG_006",
    title: "Supply Delivery - Camp Silver",
    team: "GAMMA_TEAM",
    category: "supply_delivery",
    status: "delivered",
    load_details: "Generators, fuel reserves",
    eta: "00:00",
    priority: "medium",
    destination: "Camp Silver",
    destination_coordinates: { lat: 34.0612, lng: -118.2517 },
    team_coordinates: { lat: 34.0612, lng: -118.2517 },
    destination_urgency: 40,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
]

const initialMetrics: SystemMetrics = {
  total_reports_ytd: 4821,
  active_missions: 32,
  success_rate: 98.2,
  threat_level: 3,
  uplink_bandwidth: "9.4 GB/S",
  buffer_capacity: 42.08,
  encryption_status: "active"
}

// Mutable store
class DataStore {
  private reports: Report[] = [...initialReports]
  private missions: Mission[] = [...initialMissions]
  private volunteers: Volunteer[] = [...initialVolunteers]
  private alerts: PredictiveAlert[] = [...initialAlerts]
  private intelStream: IntelStreamEntry[] = [...initialIntelStream]
  private resources: ResourceAllocation[] = [...initialResources]
  private metrics: SystemMetrics = { ...initialMetrics }
  private logistics: LogisticsTask[] = [...initialLogistics]
  private deployments: DeploymentLog[] = []

  // Reports
  getReports(): Report[] {
    return [...this.reports]
  }

  getReportById(id: string): Report | undefined {
    return this.reports.find(r => r.id === id)
  }

  addReport(report: Report): Report {
    this.reports.unshift(report)
    this.metrics.total_reports_ytd++
    return report
  }

  updateReport(id: string, updates: Partial<Report>): Report | undefined {
    const index = this.reports.findIndex(r => r.id === id)
    if (index !== -1) {
      this.reports[index] = { ...this.reports[index], ...updates }
      return this.reports[index]
    }
    return undefined
  }

  // Missions
  getMissions(): Mission[] {
    return [...this.missions]
  }

  getMissionById(id: string): Mission | undefined {
    return this.missions.find(m => m.id === id)
  }

  addMission(mission: Mission): Mission {
    this.missions.unshift(mission)
    this.metrics.active_missions++
    return mission
  }

  updateMission(id: string, updates: Partial<Mission>): Mission | undefined {
    const index = this.missions.findIndex(m => m.id === id)
    if (index !== -1) {
      this.missions[index] = { ...this.missions[index], ...updates }
      return this.missions[index]
    }
    return undefined
  }

  // Volunteers
  getVolunteers(): Volunteer[] {
    return [...this.volunteers]
  }

  getVolunteerById(id: string): Volunteer | undefined {
    return this.volunteers.find(v => v.id === id)
  }

  updateVolunteer(id: string, updates: Partial<Volunteer>): Volunteer | undefined {
    const index = this.volunteers.findIndex(v => v.id === id)
    if (index !== -1) {
      this.volunteers[index] = { ...this.volunteers[index], ...updates }
      return this.volunteers[index]
    }
    return undefined
  }

  // Alerts
  getAlerts(): PredictiveAlert[] {
    return [...this.alerts]
  }

  addAlert(alert: PredictiveAlert): PredictiveAlert {
    this.alerts.unshift(alert)
    return alert
  }

  // Intel Stream
  getIntelStream(): IntelStreamEntry[] {
    return [...this.intelStream]
  }

  addIntelEntry(entry: IntelStreamEntry): IntelStreamEntry {
    this.intelStream.unshift(entry)
    if (this.intelStream.length > 50) {
      this.intelStream.pop()
    }
    return entry
  }

  // Resources
  getResources(): ResourceAllocation[] {
    return [...this.resources]
  }

  updateResource(id: string, updates: Partial<ResourceAllocation>): ResourceAllocation | undefined {
    const index = this.resources.findIndex(r => r.id === id)
    if (index !== -1) {
      this.resources[index] = { ...this.resources[index], ...updates }
      return this.resources[index]
    }
    return undefined
  }

  // Metrics
  getMetrics(): SystemMetrics {
    return { ...this.metrics }
  }

  updateMetrics(updates: Partial<SystemMetrics>): SystemMetrics {
    this.metrics = { ...this.metrics, ...updates }
    return this.metrics
  }

  // Logistics
  getLogistics(): LogisticsTask[] {
    return [...this.logistics]
  }

  getLogisticsById(id: string): LogisticsTask | undefined {
    return this.logistics.find(l => l.id === id)
  }

  addLogistics(task: LogisticsTask): LogisticsTask {
    this.logistics.unshift(task)
    return task
  }

  updateLogistics(id: string, updates: Partial<LogisticsTask>): LogisticsTask | undefined {
    const index = this.logistics.findIndex(l => l.id === id)
    if (index !== -1) {
      this.logistics[index] = { ...this.logistics[index], ...updates }
      return this.logistics[index]
    }
    return undefined
  }

  // Volunteer mgmt
  addVolunteer(volunteer: Volunteer): Volunteer {
    this.volunteers.push(volunteer)
    return volunteer
  }

  removeVolunteer(id: string): boolean {
    const index = this.volunteers.findIndex(v => v.id === id)
    if (index !== -1) {
      this.volunteers.splice(index, 1)
      return true
    }
    return false
  }

  // Deployments
  getDeployments(): DeploymentLog[] {
    return [...this.deployments]
  }

  addDeployment(log: DeploymentLog): DeploymentLog {
    this.deployments.unshift(log)
    if (this.deployments.length > 100) this.deployments.pop()
    return log
  }
}

// Export singleton instance
export const dataStore = new DataStore()
