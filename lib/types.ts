// ImpactGrid Data Types

export interface Report {
  id: string
  text: string
  location: string
  category: ReportCategory
  urgency_score: number
  urgency_signals: string[]
  people_affected: number
  vulnerable_groups: string[]
  timestamp: string
  status: "pending" | "processed" | "mission_created"
  coordinates?: {
    lat: number
    lng: number
  }
}

export type ReportCategory =
  | "water"
  | "medical"
  | "food"
  | "shelter"
  | "infrastructure"
  | "security"
  | "evacuation"
  | "communication"
  | "other"

export interface Mission {
  id: string
  title: string
  location: string
  category: ReportCategory
  volunteers_required: number
  time_estimate: string
  urgency: "critical" | "high" | "medium" | "low"
  status: "pending" | "active" | "completed" | "cancelled"
  description: string
  created_at: string
  assigned_volunteers: string[]
  source_reports: string[]
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface Volunteer {
  id: string
  name: string
  location: string
  skills: string[]
  availability: "available" | "busy" | "offline"
  clearance_level: number
  missions_completed: number
  current_mission?: string
  coordinates?: {
    lat: number
    lng: number
  }
  joined_at?: string
  contact_email?: string
  contact_phone?: string
  mission_history?: string[]
}

export interface PredictiveAlert {
  id: string
  type: "critical_event" | "logistics_alert" | "advisory"
  title: string
  description: string
  location: string
  confidence: number
  time_to_event?: string
  recommended_action?: string
  triggered_at: string
  source_pattern: {
    report_count: number
    time_window: string
    category: ReportCategory
  }
}

export interface ProcessedReport {
  original_text: string
  location: string
  category: ReportCategory
  urgency_signals: string[]
  people_affected: number
  vulnerable_groups: string[]
  extracted_keywords: string[]
}

export interface IntelStreamEntry {
  id: string
  timestamp: string
  source: string
  payload_type: "INFO" | "SYS" | "WARN" | "ALERT"
  message: string
  status: "received" | "logged" | "action_req" | "resolved"
}

export interface ResourceAllocation {
  id: string
  name: string
  current: number
  capacity: number
  status: "nominal" | "low" | "critical"
}

export interface SystemMetrics {
  total_reports_ytd: number
  active_missions: number
  success_rate: number
  threat_level: 1 | 2 | 3 | 4 | 5
  uplink_bandwidth: string
  buffer_capacity: number
  encryption_status: "active" | "inactive"
}

export type LogisticsCategory =
  | "supply_delivery"
  | "medical_kit_transport"
  | "shelter_setup"
  | "food_distribution"
  | "water_purification_drop"
  | "communication_relay"

export type LogisticsStatus = "pending" | "en_route" | "delivered"
export type LogisticsPriority = "low" | "medium" | "high" | "critical"

export interface LogisticsTask {
  id: string
  title: string
  team: string
  category: LogisticsCategory
  status: LogisticsStatus
  load_details: string
  eta: string
  priority: LogisticsPriority
  destination: string
  destination_coordinates?: { lat: number; lng: number }
  team_coordinates?: { lat: number; lng: number }
  destination_urgency: number
  created_at: string
  delivered_at?: string
}

export interface DeploymentLog {
  id: string
  timestamp: string
  summary: string
  changes: {
    missions_updated: number
    volunteers_updated: number
    logistics_updated: number
    alerts_generated: number
  }
}
