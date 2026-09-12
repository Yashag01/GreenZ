export interface ConditionLikelihood {
  condition_name: string;
  // Evidence strength label: "High" | "Moderate" | "Low" | null
  // NOT a calibrated failure probability
  confidence: string | null;
  evidence: string[];
}

export interface AssetSummary {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'Monitor' | 'Watch' | 'Schedule Inspection' | 'Inspect Now' | string;
  decision_status: 'Monitor' | 'Watch' | 'Schedule Inspection' | 'Inspect Now' | string;
  failure_risk: number;  // Heuristic score 0-100, not a calibrated probability
  fault_type: string;
  ranked_conditions: ConditionLikelihood[];
  recommended_action: string;
  energy_at_risk: number;    // kWh (daylight-aware for solar)
  revenue_at_risk: number;   // Illustrative ₹ at assumed tariff
  priority_score: number;
  priority_rank: number;
  expected_power?: number;
  deviation_pct?: number;
  actual_power?: number;
}

export interface AssetDetail extends AssetSummary {
  model_status: string;
  capacity_kw: number;
  reasons: string[];
  action_immediate: string[];
  action_inspect: string[];
  action_long_term: string[];
  fault_confidence: string | null;  // Evidence strength label
}

export interface Alert {
  id: number;
  asset_id: string;
  severity: string;
  message: string;
  recommended_action: string;
  created_at: string;
}

export interface HistoryPoint {
  timestamp: string;
  actual_power: number;
  expected_power: number;
  deviation_pct: number;
  module_temp_c?: number;
  ambient_temp_c?: number;
  vibration_mm_s?: number;
  irradiance_wm2?: number;
  wind_speed_ms?: number;
}

export interface PlaybackState {
  is_playing: boolean;
  speed: number;
  cursor: number;
  timestamp: string | null;
}
