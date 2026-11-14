import {
  AnalysisResponse,
  AnalogResult,
  ApiAnalogGroup,
  ApiEvidenceResponse,
  ApiHealthResponse,
  ApiMatchDetailResponse,
  ApiMatchRow,
  ApiMatchesResponse,
  ApiMetaResponse,
  ApiSite,
  ApiThermalDetail,
  ApiThermalListResponse,
  BoundingBox,
  ConfidenceLevel,
  ExcludedCandidate,
  Factor,
  MissionProfile,
  Region,
  Warning,
} from '../lib/types';

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'https://tiraapifinal-production.up.railway.app'
).replace(/\/+$/, '');

export function isPlaceholderApiUrl(): boolean {
  return API_BASE_URL.includes('your-backend-url.onrender.com');
}

export class ApiError extends Error {
  status: number;
  endpoint: string;

  constructor(message: string, status: number, endpoint: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = 15000, signal, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(fetchOptions.headers || {}),
      },
    });

    if (!response.ok) {
      let detail = response.statusText || `HTTP ${response.status}`;
      try {
        const errBody = await response.json();
        if (errBody && typeof errBody.detail === 'string') {
          detail = errBody.detail;
        }
      } catch {
        // Ignore JSON parse error on error response
      }
      throw new ApiError(detail, response.status, path);
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out or aborted', 408, path);
    }
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error reaching Tira Nova API',
      0,
      path
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}

// ============================================================================
// Endpoint Functions
// ============================================================================

export async function fetchHealth(signal?: AbortSignal): Promise<ApiHealthResponse> {
  return apiFetch<ApiHealthResponse>('/api/health', { signal, timeoutMs: 8000 });
}

export async function reloadBackendData(signal?: AbortSignal): Promise<ApiHealthResponse> {
  return apiFetch<ApiHealthResponse>('/api/reload', {
    method: 'POST',
    signal,
    timeoutMs: 20000,
  });
}

export async function fetchMeta(signal?: AbortSignal): Promise<ApiMetaResponse> {
  return apiFetch<ApiMetaResponse>('/api/meta', { signal });
}

export async function fetchSites(signal?: AbortSignal): Promise<ApiSite[]> {
  return apiFetch<ApiSite[]>('/api/sites', { signal });
}

export interface FetchMatchesParams {
  mars: string;
  mission?: string;
  only_ranked?: boolean;
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}

export async function fetchMatches(params: FetchMatchesParams): Promise<ApiMatchesResponse> {
  const query = new URLSearchParams();
  query.set('mars', params.mars);
  if (params.mission) query.set('mission', params.mission);
  if (params.only_ranked !== undefined) query.set('only_ranked', String(params.only_ranked));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.offset !== undefined) query.set('offset', String(params.offset));

  return apiFetch<ApiMatchesResponse>(`/api/matches?${query.toString()}`, {
    signal: params.signal,
  });
}

export async function fetchMatchDetail(
  earthRegionId: string,
  mars: string,
  mission?: string,
  signal?: AbortSignal
): Promise<ApiMatchDetailResponse> {
  const query = new URLSearchParams();
  query.set('mars', mars);
  if (mission) query.set('mission', mission);

  return apiFetch<ApiMatchDetailResponse>(
    `/api/matches/${encodeURIComponent(earthRegionId)}?${query.toString()}`,
    { signal }
  );
}

export async function fetchEvidence(
  marsRegionId: string,
  signal?: AbortSignal
): Promise<ApiEvidenceResponse> {
  return apiFetch<ApiEvidenceResponse>(
    `/api/evidence/${encodeURIComponent(marsRegionId)}`,
    { signal }
  );
}

export async function fetchThermalList(
  planet?: 'mars' | 'earth',
  signal?: AbortSignal
): Promise<ApiThermalListResponse> {
  const query = planet ? `?planet=${encodeURIComponent(planet)}` : '';
  return apiFetch<ApiThermalListResponse>(`/api/thermal${query}`, { signal });
}

export async function fetchThermalDetail(
  regionId: string,
  signal?: AbortSignal
): Promise<ApiThermalDetail> {
  return apiFetch<ApiThermalDetail>(`/api/thermal/${encodeURIComponent(regionId)}`, {
    signal,
  });
}

export async function fetchAnalogs(signal?: AbortSignal): Promise<ApiAnalogGroup[]> {
  return apiFetch<ApiAnalogGroup[]>('/api/analogs', { signal });
}

// ============================================================================
// Parsing & Adapter Helpers
// ============================================================================

export function parseLatLonFromId(regionId: string): { lat: number; lon: number } {
  const match = regionId.match(/_lat(-?[\d.]+)_lon(-?[\d.]+)$/);
  if (match) {
    return {
      lat: Number.parseFloat(match[1]),
      lon: Number.parseFloat(match[2]),
    };
  }
  return { lat: 0, lon: 0 };
}

export function prettifySiteName(rawName: string): string {
  const base = rawName.split('_lat')[0] || rawName;
  return base.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}

export function extractCountryHint(row: ApiMatchRow): string | undefined {
  if (typeof row.country === 'string' && row.country.trim()) {
    return row.country.trim();
  }
  if (typeof row.known_analog === 'string' && row.known_analog.trim()) {
    return row.known_analog.trim();
  }
  return undefined;
}

export function buildMissionProfilesFromSites(
  sites: ApiSite[],
  fallbackMissions: MissionProfile[]
): MissionProfile[] {
  const discovered = new Set<string>();
  sites.forEach((s) => s.missions.forEach((m) => discovered.add(m)));
  if (discovered.size === 0) return fallbackMissions;

  const knownMap = new Map(fallbackMissions.map((m) => [m.id, m]));
  const ordered: MissionProfile[] = [];

  discovered.forEach((missionId) => {
    const existing = knownMap.get(missionId);
    if (existing) {
      ordered.push({ ...existing, available: true });
    } else {
      ordered.push({
        id: missionId,
        label: prettifySiteName(missionId),
        description: `Live mission profile "${missionId}" served from Tira Nova backend.`,
        weights: { slope_p90_deg: 0.35, tri_mean_m: 0.25, roughness_cm: 0.2, mineral_match: 0.2 },
        filters: [{ feature: 'slope_p90_deg', min: 0, max: 22 }],
        features: ['slope_p90_deg', 'tri_mean_m', 'roughness_cm', 'mineral_match'],
        available: true,
      });
    }
  });

  return ordered;
}

export function mapApiSiteToRegion(site: ApiSite, localTemplate?: Region): Region {
  const parsed = parseLatLonFromId(site.mars_region_id);
  const lat = site.lat ?? localTemplate?.center.lat ?? parsed.lat;
  const lon = site.lon ?? localTemplate?.center.lon ?? parsed.lon;
  const datasets = ['MOLA', 'CRISM'];
  if (site.thermal_available) datasets.push('THEMIS');

  return {
    region_id: site.mars_region_id,
    name: prettifySiteName(site.name || site.mars_region_id),
    planet: 'Mars',
    center: { lat, lon },
    bbox: localTemplate?.bbox ?? [lon - 0.25, lat - 0.25, lon + 0.25, lat + 0.25],
    window_km: localTemplate?.window_km ?? 50.9,
    thumbnail_url: null,
    datasets: localTemplate?.datasets?.length ? localTemplate.datasets : datasets,
    category:
      site.crism_target_minerals.length > 0
        ? site.crism_target_minerals.slice(0, 2).join(' · ')
        : localTemplate?.category || 'Orbital Target Window',
    description:
      localTemplate?.description ||
      (site.crism_target_minerals.length > 0
        ? `CRISM mineral target classes detected: ${site.crism_target_minerals.join(', ')}. (${site.ranked_matches} EMIT-ranked Earth analog windows)`
        : `Mars target region (${site.mars_region_id}) harmonized at ~450 m grid resolution.`),
    topography: localTemplate?.topography,
    primary_analogs: localTemplate?.primary_analogs,
    live: {
      missions: site.missions,
      terrain_only: site.terrain_only,
      ranked_matches: site.ranked_matches,
      crism_target_minerals: site.crism_target_minerals,
      thermal_available: site.thermal_available,
    },
  };
}

function buildWarningsFromApiRow(row: ApiMatchRow): Warning[] {
  const warnings: Warning[] = [];

  if (row.flags.includes('non_discriminating_terrain') || row.discrimination === 'non_discriminating') {
    warnings.push({
      code: 'NON_DISCRIMINATING_TERRAIN',
      severity: 'warn',
      text: 'A large share of Earth windows falls inside the good distance threshold; terrain rank separates candidates weakly.',
    });
  }
  if (row.emit_status !== 'ok') {
    warnings.push({
      code: `EMIT_${String(row.emit_status || 'UNAVAILABLE').toUpperCase()}`,
      severity: row.emit_status === 'no_emit_data' || row.emit_status === 'terrain_only' ? 'info' : 'warn',
      text: `Mineral status is "${row.emit_status}". Only rows with status "ok" receive an EMIT-combined final_rank.`,
    });
  }
  if (row.flags.includes('single_mineral_signal')) {
    warnings.push({
      code: 'SINGLE_MINERAL_SIGNAL',
      severity: 'info',
      text: 'Combined score relies on a single CRISM target mineral signal; treat mineral weighting cautiously.',
    });
  }
  if (row.flags.includes('provisional_targets')) {
    warnings.push({
      code: 'PROVISIONAL_TARGETS',
      severity: 'warn',
      text: 'CRISM mineral targets for this region use provisional heuristic thresholds.',
    });
  }
  if (row.flags.includes('unverified_source_pixels')) {
    warnings.push({
      code: 'UNVERIFIED_SOURCE_PIXELS',
      severity: 'warn',
      text: `Window contains ${row.pct_unverified_source ?? ''}% unverified source pixels.`,
    });
  }

  return warnings;
}

export function mapApiMatchRowToAnalogResult(
  row: ApiMatchRow,
  index: number,
  marsRegion: Region,
  mission: MissionProfile
): AnalogResult {
  const parsed = parseLatLonFromId(row.earth_region_id);
  const bbox: BoundingBox =
    row.bbox_w != null && row.bbox_s != null && row.bbox_e != null && row.bbox_n != null
      ? [Number(row.bbox_w), Number(row.bbox_s), Number(row.bbox_e), Number(row.bbox_n)]
      : [parsed.lon - 0.25, parsed.lat - 0.25, parsed.lon + 0.25, parsed.lat + 0.25];

  const distVsGood =
    typeof row.distance_vs_good === 'number'
      ? row.distance_vs_good
      : Number(((row.distance ?? 0) / 0.35).toFixed(3));

  const mineralMatchPct =
    row.emit_n_targets && row.emit_n_targets > 0 && row.emit_hits != null
      ? Math.round((row.emit_hits / row.emit_n_targets) * 100)
      : null;

  let confidenceLevel: ConfidenceLevel = 'medium';
  if (row.emit_status === 'ok' && distVsGood <= 1.0 && (mineralMatchPct === null || mineralMatchPct >= 50)) {
    confidenceLevel = 'high';
  } else if (distVsGood > 1.3 || row.emit_status === 'no_target_mineral' || row.discrimination === 'non_discriminating') {
    confidenceLevel = 'low';
  }

  const slopeLimit =
    typeof row.slope_limit_deg === 'number'
      ? row.slope_limit_deg
      : mission.filters.find((f) => f.feature.includes('slope'))?.max ?? 22;

  const slopeVal = typeof row.slope_p90_deg === 'number' ? row.slope_p90_deg : null;
  const triVal = typeof row.tri_mean_m === 'number' ? row.tri_mean_m : null;
  const roughnessVal = typeof row.roughness_cm === 'number' ? row.roughness_cm : null;

  const factors: Factor[] = [];

  if (slopeVal !== null || marsRegion.topography?.slope_p90_deg !== undefined) {
    const mSlope = marsRegion.topography?.slope_p90_deg ?? null;
    factors.push({
      feature: 'slope_p90_deg',
      label: 'Slope (90th percentile)',
      unit: 'deg',
      group: 'terrain',
      mars_value: mSlope,
      earth_value: slopeVal,
      weight: mission.weights.slope_p90_deg ?? 0.35,
      contribution: slopeVal !== null ? Math.min(1, Math.abs(slopeVal - (mSlope ?? slopeVal)) / 10) : 0.35,
      verdict:
        slopeVal === null || mSlope === null
          ? 'unknown'
          : slopeVal > slopeLimit || Math.abs(slopeVal - mSlope) >= 3.5
          ? 'different'
          : 'similar',
      coverage_pct: typeof row.coverage_pct === 'number' ? row.coverage_pct : 95,
    });
  }

  if (triVal !== null || marsRegion.topography?.tri_mean_m !== undefined) {
    const mTri = marsRegion.topography?.tri_mean_m ?? null;
    factors.push({
      feature: 'tri_mean_m',
      label: 'Terrain Ruggedness Index (TRI)',
      unit: 'm',
      group: 'terrain',
      mars_value: mTri,
      earth_value: triVal,
      weight: mission.weights.tri_mean_m ?? 0.25,
      contribution: triVal !== null ? Math.min(1, Math.abs(triVal - (mTri ?? triVal)) / 10) : 0.25,
      verdict:
        triVal === null || mTri === null
          ? 'unknown'
          : Math.abs(triVal - mTri) < 3.0
          ? 'similar'
          : 'different',
      coverage_pct: typeof row.coverage_pct === 'number' ? row.coverage_pct : 95,
    });
  }

  if (roughnessVal !== null) {
    const mRough = marsRegion.topography?.roughness_cm ?? null;
    factors.push({
      feature: 'roughness_cm',
      label: 'Surface Roughness Scale',
      unit: 'cm',
      group: 'terrain',
      mars_value: mRough,
      earth_value: roughnessVal,
      weight: mission.weights.roughness_cm ?? 0.2,
      contribution: 0.2,
      verdict: mRough !== null && Math.abs(roughnessVal - mRough) < 6 ? 'similar' : 'different',
      coverage_pct: typeof row.coverage_pct === 'number' ? row.coverage_pct : 92,
    });
  }

  // Always show mineral matching factor directly from live API EMIT hits
  factors.push({
    feature: 'emit_mineral_match',
    label: 'EMIT Mineral Signal Match',
    unit: row.emit_n_targets ? `/${row.emit_n_targets}` : 'hits',
    group: 'minerals',
    mars_value: row.emit_n_targets ?? null,
    earth_value: row.emit_hits ?? null,
    weight: 0.5,
    contribution:
      mineralMatchPct !== null ? Number((1 - mineralMatchPct / 100).toFixed(2)) : 0.5,
    verdict:
      row.emit_status === 'ok' && (row.emit_hits ?? 0) > 0
        ? 'similar'
        : row.emit_status === 'no_emit_data' || row.emit_status === 'terrain_only'
        ? 'unknown'
        : 'different',
    coverage_pct: typeof row.coverage_pct === 'number' ? row.coverage_pct : row.emit_status === 'ok' ? 100 : 0,
  });

  const displayName = row.known_analog
    ? `${prettifySiteName(row.earth_region_id)} (${row.known_analog})`
    : prettifySiteName(row.earth_region_id);

  const combinedPct =
    typeof row.combined_score === 'number' ? Math.round(row.combined_score * 100) : null;

  const explanationParts = [
    `Terrain rank #${row.rank} (distance ${Number(row.distance).toFixed(3)}) for ${marsRegion.name} under mission "${row.mission}".`,
  ];
  if (row.final_rank != null) {
    explanationParts.push(
      `EMIT final rank #${row.final_rank}${combinedPct !== null ? ` with ${combinedPct}% combined terrain+mineral score` : ''}.`
    );
  }
  if (row.emit_n_targets != null && row.emit_hits != null) {
    explanationParts.push(
      `Matched ${row.emit_hits} of ${row.emit_n_targets} CRISM target mineral signal(s)${mineralMatchPct !== null ? ` (${mineralMatchPct}%)` : ''}.`
    );
  } else {
    explanationParts.push(`Mineral coverage status: ${row.emit_status}.`);
  }

  const featuresMissing: string[] = [];
  if (row.emit_status !== 'ok') featuresMissing.push(`emit_minerals (${row.emit_status})`);
  if (slopeVal === null) featuresMissing.push('slope_p90_deg');

  const stabilityScore =
    combinedPct !== null
      ? Math.max(20, Math.min(99, combinedPct))
      : Math.max(25, Math.min(96, Math.round((1 - Math.min(distVsGood, 1.5) * 0.45) * 100)));

  return {
    rank: row.final_rank ?? row.rank ?? index + 1,
    region_id: row.earth_region_id,
    name: displayName,
    country: extractCountryHint(row),
    center: parsed,
    bbox,
    thumbnail_url: null,
    distance: Number(row.distance ?? 0),
    confidence: {
      level: confidenceLevel,
      coverage_pct: typeof row.coverage_pct === 'number' ? row.coverage_pct : row.emit_status === 'ok' ? 96 : 62,
      distance_vs_good: Number(distVsGood.toFixed(2)),
      features_used: factors.filter((f) => f.verdict !== 'unknown').map((f) => f.feature),
      features_missing: featuresMissing,
      rank_stability_pct: stabilityScore,
    },
    factors,
    warnings: buildWarningsFromApiRow(row),
    evidence: [],
    explanation: explanationParts.join(' '),
    live: {
      final_rank: row.final_rank,
      terrain_rank: row.rank,
      distance_vs_good: distVsGood,
      discrimination: row.discrimination,
      emit_status: row.emit_status,
      emit_hits: row.emit_hits,
      emit_n_targets: row.emit_n_targets,
      emit_n_minerals: row.emit_n_minerals,
      emit_target_source: row.emit_target_source,
      combined_score: row.combined_score,
      mineral_match_pct: mineralMatchPct,
      known_analog: row.known_analog,
      slope_p90_deg: slopeVal,
      slope_limit_deg: slopeLimit,
      pct_unverified_source: row.pct_unverified_source,
      flags: row.flags || [],
      mission: row.mission,
      raw_row: row,
    },
  };
}

export function mapApiMatchesToAnalysisResponse(
  apiResp: ApiMatchesResponse,
  marsRegion: Region,
  mission: MissionProfile,
  options: { topK: number; earthScope: string; onlyRanked?: boolean }
): AnalysisResponse {
  let rows = apiResp.results || [];

  // Optional Earth region/country/analog scope filter
  if (options.earthScope && options.earthScope !== 'all') {
    const scopeLower = options.earthScope.toLowerCase();
    rows = rows.filter((r) => {
      const hay = `${r.earth_region_id} ${r.country ?? ''} ${r.known_analog ?? ''}`.toLowerCase();
      return hay.includes(scopeLower);
    });
  }

  // Partition explicit exclusions / unranked rows for the Exclusion Log drawer
  const excluded: ExcludedCandidate[] = [];
  rows.forEach((r) => {
    const slopeLimit =
      typeof r.slope_limit_deg === 'number'
        ? r.slope_limit_deg
        : mission.filters.find((f) => f.feature.includes('slope'))?.max ?? null;
    const slopeBreach =
      typeof r.slope_p90_deg === 'number' && slopeLimit !== null && r.slope_p90_deg > slopeLimit;
    const isUnrankedEmit = r.emit_status !== 'ok' || r.final_rank === null;
    const isNonDiscriminating = r.discrimination === 'non_discriminating';

    if (r.excluded_reason || slopeBreach || isUnrankedEmit || isNonDiscriminating) {
      let reason = r.excluded_reason || '';
      if (!reason) {
        if (slopeBreach && r.slope_p90_deg != null && slopeLimit != null) {
          reason = `filter:slope_p90_deg exceeds limit (${r.slope_p90_deg.toFixed(1)}° > ${slopeLimit}°)`;
        } else if (isUnrankedEmit) {
          reason = `emit_status:${r.emit_status} (terrain rank #${r.rank}; excluded from EMIT final_rank)`;
        } else if (isNonDiscriminating) {
          reason = `discrimination:${r.discrimination} (rank separates candidates weakly)`;
        }
      }
      excluded.push({
        region_id: r.earth_region_id,
        reason,
        emit_status: r.emit_status,
        flags: r.flags,
        slope_p90_deg: r.slope_p90_deg ?? null,
        slope_limit_deg: slopeLimit,
        terrain_rank: r.rank,
        distance: r.distance,
      });
    }
  });

  // Primary displayed rows: prioritize EMIT-ranked rows first when available, or show top-K from backend order
  const displayRows = options.onlyRanked
    ? rows.filter((r) => r.final_rank != null)
    : rows;

  const sliced = displayRows.slice(0, options.topK);
  const results = sliced.map((row, idx) =>
    mapApiMatchRowToAnalogResult(row, idx, marsRegion, mission)
  );

  // Geographic / known_analog distribution
  const matchesByArea: Record<string, number> = {};
  rows.forEach((r) => {
    const areaKey =
      (typeof r.known_analog === 'string' && r.known_analog.trim()) ||
      (typeof r.country === 'string' && r.country.trim()) ||
      prettifySiteName(r.earth_region_id).split(' ')[0] ||
      'Global Window';
    matchesByArea[areaKey] = (matchesByArea[areaKey] || 0) + 1;
  });

  // Limit to top 6 groups for tidy grid
  const topAreaEntries = Object.entries(matchesByArea)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const candidatesWithinGood = rows.filter(
    (r) => (typeof r.distance_vs_good === 'number' ? r.distance_vs_good <= 1.0 : r.distance <= 0.35)
  ).length;

  return {
    request_id: `live_${Date.now().toString(36)}`,
    status: results.length === 0 ? 'no_good_analog' : 'ok',
    mars_region: marsRegion,
    mission,
    results,
    candidates_within_good: candidatesWithinGood,
    matches_by_area: Object.fromEntries(topAreaEntries),
    excluded: excluded.slice(0, 25),
    global_warnings: (apiResp.limits || []).map((text, idx) => ({
      code: `METHOD_LIMIT_${idx + 1}`,
      severity: 'info',
      text,
    })),
    limits: apiResp.limits,
    total_available: apiResp.total,
    is_live_data: true,
    method: {
      version: '0.3-api',
      good_distance: 0.35,
      grid_m: 450,
      normalization: 'z-score',
      datasets: ['SRTMGL1', 'MOLA', 'EMIT', 'CRISM'],
    },
  };
}

export function mergeMatchDetailIntoResult(
  baseResult: AnalogResult,
  detailResp: ApiMatchDetailResponse
): AnalogResult {
  const ed = detailResp.engine_detail;
  const matchRow = detailResp.match;

  const mineralMatchPct =
    matchRow.emit_n_targets && matchRow.emit_n_targets > 0 && matchRow.emit_hits != null
      ? Math.round((matchRow.emit_hits / matchRow.emit_n_targets) * 100)
      : baseResult.live?.mineral_match_pct ?? null;

  return {
    ...baseResult,
    name: ed?.name || baseResult.name,
    country: ed?.country || baseResult.country || extractCountryHint(matchRow),
    center: ed?.center || baseResult.center,
    bbox: ed?.bbox || baseResult.bbox,
    distance: ed?.distance ?? matchRow.distance ?? baseResult.distance,
    confidence: ed?.confidence || baseResult.confidence,
    factors: ed?.factors?.length ? ed.factors : baseResult.factors,
    warnings: [
      ...(ed?.warnings || baseResult.warnings),
      ...(detailResp.engine_warnings || []).filter(
        (ew) => !(ed?.warnings || baseResult.warnings).some((bw) => bw.code === ew.code)
      ),
    ],
    evidence: ed?.evidence?.length ? ed.evidence : baseResult.evidence,
    explanation: ed?.explanation || baseResult.explanation,
    live: {
      ...baseResult.live,
      final_rank: matchRow.final_rank,
      terrain_rank: matchRow.rank,
      distance_vs_good: matchRow.distance_vs_good ?? baseResult.live?.distance_vs_good,
      discrimination: matchRow.discrimination,
      emit_status: matchRow.emit_status,
      emit_hits: matchRow.emit_hits,
      emit_n_targets: matchRow.emit_n_targets,
      emit_n_minerals: matchRow.emit_n_minerals,
      emit_target_source: matchRow.emit_target_source,
      combined_score: matchRow.combined_score,
      mineral_match_pct: mineralMatchPct,
      known_analog: matchRow.known_analog,
      slope_p90_deg: matchRow.slope_p90_deg ?? baseResult.live?.slope_p90_deg,
      slope_limit_deg: matchRow.slope_limit_deg ?? baseResult.live?.slope_limit_deg,
      pct_unverified_source: matchRow.pct_unverified_source,
      flags: matchRow.flags,
      mission: matchRow.mission,
      raw_row: matchRow,
    },
  };
}
