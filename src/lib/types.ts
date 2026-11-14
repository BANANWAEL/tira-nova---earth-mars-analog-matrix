export type Planet = 'Earth' | 'Mars' | 'Moon';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type Verdict = 'similar' | 'different' | 'unknown';

export type WarningSeverity = 'info' | 'warn' | 'error';

export type EvidenceSupport = 'similarity' | 'difference' | 'limitation';

export interface GeoCenter {
  lat: number;
  lon: number;
}

// [west, south, east, north], lon -180..180
export type BoundingBox = [number, number, number, number];

export interface Region {
  region_id: string;
  name: string;
  planet: Planet;
  country?: string;
  center: GeoCenter;
  bbox: BoundingBox;
  window_km?: number;
  thumbnail_url: string | null;
  datasets: string[];
  description?: string;
  category?: string;
  primary_analogs?: string[];
  topography?: {
    elevation_m: number;
    slope_p90_deg: number;
    tri_mean_m: number;
    roughness_cm: number;
  };
  live?: LiveRegionExtras;
}

export interface Factor {
  feature: string;
  label: string;
  unit: string;
  group?: 'terrain' | 'minerals' | 'surface';
  mars_value: number | null;
  earth_value: number | null;
  weight: number;
  contribution: number; // share of distance
  verdict: Verdict;
  coverage_pct: number;
}

export interface Warning {
  code: string;
  severity: WarningSeverity;
  text: string;
}

export interface EvidenceDocument {
  doc_id: string;
  title: string;
  year: number;
  page?: number;
  snippet: string;
  supports: EvidenceSupport;
  url: string;
  authors?: string;
  journal?: string;
}

export interface ConfidenceMetric {
  level: ConfidenceLevel;
  coverage_pct: number;
  distance_vs_good: number;
  features_used: string[];
  features_missing: string[];
  rank_stability_pct: number;
}

export interface AnalogResult {
  rank: number;
  region_id: string;
  name: string;
  country?: string;
  center: GeoCenter;
  bbox: BoundingBox;
  thumbnail_url: string | null;
  distance: number; // lower = closer
  confidence: ConfidenceMetric;
  factors: Factor[];
  warnings: Warning[];
  evidence: EvidenceDocument[];
  explanation: string;
  live?: LiveMatchMetadata;
}

export interface MissionFilter {
  feature: string;
  min: number;
  max: number;
}

export interface MissionProfile {
  id: string;
  label: string;
  description: string;
  weights: Record<string, number>;
  filters: MissionFilter[];
  features: string[];
  available: boolean;
  missing_inputs?: string[];
}

export interface ExcludedCandidate {
  region_id: string;
  reason: string;
  emit_status?: string;
  flags?: string[];
  slope_p90_deg?: number | null;
  slope_limit_deg?: number | null;
  terrain_rank?: number | null;
  distance?: number | null;
}

export interface AnalysisResponse {
  request_id: string;
  status: 'ok' | 'partial_data' | 'no_good_analog';
  mars_region: Region;
  mission: MissionProfile;
  results: AnalogResult[];
  candidates_within_good: number;
  matches_by_area: Record<string, number>;
  excluded: ExcludedCandidate[];
  global_warnings: Warning[];
  limits?: string[];
  total_available?: number;
  is_live_data?: boolean;
  method: {
    version: string;
    good_distance: number;
    grid_m: number;
    normalization: string;
    datasets: string[];
  };
}

// Hyperspectral Twin Types
export interface SpectralBandData {
  wavelength_nm: number;
  mars_reflectance: number;
  earth_reflectance: number;
  absorption_flag?: boolean;
  mineral_match?: string;
}

export interface SpectralTwinSet {
  id: string;
  pair_label: string;
  mineral_class: string;
  crism_dataset: string;
  emit_dataset: string;
  correlation: number;
  bands: SpectralBandData[];
  key_minerals: {
    name: string;
    formula: string;
    absorption_peak_nm: number;
    similarity_score: number;
  }[];
}

// Regolith Geotechnical Sensor Data
export interface RegolithSensorProfile {
  site_id: string;
  site_name: string;
  planet: Planet;
  bearing_capacity_kpa: number;
  friction_angle_deg: number;
  cohesion_kpa: number;
  bulk_density_g_cm3: number;
  perchlorate_pct: number;
  dielectric_constant: number;
  grain_distribution: {
    fraction: string;
    size_microns: string;
    percentage: number;
  }[];
  wheel_sinkage_cm: number;
  trafficability_index: 'optimal' | 'moderate' | 'hazard';
}

export interface LunarSimulantEntry {
  simulant: string;
  origin: string;
  mineralogy: string;
  density: number;
  friction: number;
  matchPct: number;
}

export interface LunarOutpostTelemetry {
  region_id: string;
  composite_score: number;
  peak_illumination: string;
  thermal_regime_label: string;
  thermal_regime_value: string;
  water_ice_wt: string;
  water_ice_source: string;
  electrostatic_field: string;
  electrostatic_note: string;
  earth_comm_uptime: string;
  earth_comm_note: string;
  radar_metrics: {
    subject: string;
    A: number;
    fullMark: number;
  }[];
  safety_metrics: {
    overall_rating: 'NOMINAL' | 'CAUTION' | 'ELEVATED';
    landing_slope_hazard: string;
    bearing_capacity_kpa: number;
    wheel_sinkage_cm: number;
    boulder_density_note: string;
    radiation_shielding: string;
    dust_abrasion_risk: 'Low' | 'Moderate' | 'High';
    landing_ellipse_km: string;
    comms_latency_s: number;
    mitigation_protocol: string;
  };
  simulants: LunarSimulantEntry[];
}

// ============================================================================
// Live FastAPI Backend Contracts
// ============================================================================

export type ApiConnectionStatus = 'connecting' | 'connected' | 'offline';

export interface ApiHealthResponse {
  status: string;
  rows: number;
}

export interface ApiMetaResponse {
  limits: string[];
  missing_optional_files: string[];
  rows: number;
  emit_status_counts: Record<string, number>;
  target_source_counts: Record<string, number>;
  engine_responses: number;
  field_notes: Record<string, string>;
  thermal: {
    available: boolean;
    regions: number;
    by_planet: Record<string, number>;
    limits: string[];
    field_notes: Record<string, string>;
  };
}

export interface ApiSite {
  mars_region_id: string;
  name: string;
  lat: number | null;
  lon: number | null;
  missions: string[];
  terrain_only: boolean;
  ranked_matches: number;
  crism_target_minerals: string[];
  thermal_available: boolean;
}

export interface ApiMatchRow {
  mars_region_id: string;
  mission: string;
  earth_region_id: string;
  rank: number;
  distance: number;
  distance_vs_good?: number | null;
  discrimination: string;
  emit_status: string;
  final_rank: number | null;
  emit_hits: number | null;
  emit_n_targets: number | null;
  emit_n_minerals?: number | null;
  emit_target_source?: string | null;
  pct_unverified_source?: number | null;
  combined_score: number | null;
  known_analog?: string | null;
  country?: string | null;
  bbox_w?: number | null;
  bbox_s?: number | null;
  bbox_e?: number | null;
  bbox_n?: number | null;
  slope_p90_deg?: number | null;
  slope_limit_deg?: number | null;
  tri_mean_m?: number | null;
  roughness_cm?: number | null;
  elevation_m?: number | null;
  coverage_pct?: number | null;
  excluded_reason?: string | null;
  flags: string[];
  [key: string]: unknown;
}

export interface ApiMatchesResponse {
  mars_region_id: string;
  mission: string | null;
  total: number;
  limit: number;
  offset: number;
  limits: string[];
  results: ApiMatchRow[];
}

export interface ApiMatchDetailResponse {
  match: ApiMatchRow;
  all_missions: ApiMatchRow[];
  engine_detail: AnalogResult | null;
  engine_warnings: Warning[];
  limits: string[];
}

export interface ApiCrismTargetRow {
  mars_region_id?: string;
  emit_mineral?: string;
  crism_param?: string;
  detect_pct?: number | null;
  source?: string | null;
  [key: string]: unknown;
}

export interface ApiEvidenceResponse {
  mars_region_id: string;
  crism_targets: ApiCrismTargetRow[];
  top_detect_features: Array<{
    feature_name: string;
    value: number | null;
  }>;
  crism_coverage_pct: number | null;
  crism_dates: string | null;
  note: string;
}

export interface ApiThermalSummary {
  region_id: string;
  planet: string;
  name: string;
  known_analog: string | null;
  dataset: string;
  status: string;
  mean_day_temp_K: number | null;
  mean_night_temp_K: number | null;
  diurnal_range_K: number | null;
  min_coverage_pct: number | null;
  range_rank_in_planet: number | null;
  n_ranked_in_planet: number | null;
  flags: string[];
}

export interface ApiThermalListResponse {
  available: boolean;
  count: number;
  limits: string[];
  results: ApiThermalSummary[];
}

export interface ApiThermalFeatureValue {
  value: number | null;
  coverage_pct: number | null;
}

export interface ApiThermalDetail {
  region_id: string;
  planet: string;
  name: string;
  lat: number | null;
  lon: number | null;
  known_analog: string | null;
  dataset: string;
  resolution_m: number | null;
  source_date: string | null;
  status: string;
  features: Record<string, ApiThermalFeatureValue>;
  range_rank_in_planet: number | null;
  n_ranked_in_planet: number | null;
  flags: string[];
  limits: string[];
}

export interface ApiAnalogGroup {
  known_analog: string;
  windows?: number;
  mars_sites?: string[];
  earth_region_ids?: string[];
  [key: string]: unknown;
}

// Live metadata extensions on core UI models
export interface LiveRegionExtras {
  missions?: string[];
  terrain_only?: boolean;
  ranked_matches?: number;
  crism_target_minerals?: string[];
  thermal_available?: boolean;
}

export interface LiveMatchMetadata {
  final_rank?: number | null;
  terrain_rank?: number;
  distance_vs_good?: number | null;
  discrimination?: string;
  emit_status?: string;
  emit_hits?: number | null;
  emit_n_targets?: number | null;
  emit_n_minerals?: number | null;
  emit_target_source?: string | null;
  combined_score?: number | null;
  mineral_match_pct?: number | null;
  known_analog?: string | null;
  slope_p90_deg?: number | null;
  slope_limit_deg?: number | null;
  pct_unverified_source?: number | null;
  flags?: string[];
  mission?: string;
  raw_row?: ApiMatchRow;
}


