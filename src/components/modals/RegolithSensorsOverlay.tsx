import React, { useEffect, useState } from 'react';
import { REGOLITH_PROFILES } from '../../lib/data';
import { ApiThermalDetail, ApiThermalSummary } from '../../lib/types';
import { useLanguage } from '../../lib/LanguageContext';
import { fetchThermalDetail, fetchThermalList, prettifySiteName } from '../../services/api';
import {
  X,
  Layers,
  ShieldCheck,
  Flame,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface RegolithSensorsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialSiteId?: string;
  marsRegionId?: string;
}

export const RegolithSensorsOverlay: React.FC<RegolithSensorsOverlayProps> = ({
  isOpen,
  onClose,
  initialSiteId,
  marsRegionId,
}) => {
  const { t } = useLanguage();
  const [sensorMode, setSensorMode] = useState<'thermal' | 'terramechanics'>('thermal');

  // Phase 2 Thermal Live API State
  const [thermalList, setThermalList] = useState<ApiThermalSummary[]>([]);
  const [thermalLimits, setThermalLimits] = useState<string[]>([]);
  const [loadingThermal, setLoadingThermal] = useState<boolean>(false);
  const [primaryThermalId, setPrimaryThermalId] = useState<string>('');
  const [compareThermalId, setCompareThermalId] = useState<string>('');
  const [primaryDetail, setPrimaryDetail] = useState<ApiThermalDetail | null>(null);
  const [compareDetail, setCompareDetail] = useState<ApiThermalDetail | null>(null);

  // Terramechanics Fallback / Soil Mechanics State
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    initialSiteId || REGOLITH_PROFILES[0].site_id
  );
  const [compareSiteId, setCompareSiteId] = useState<string>(REGOLITH_PROFILES[1].site_id);

  // Fetch /api/thermal summary list when overlay opens
  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    let active = true;
    setLoadingThermal(true);

    fetchThermalList(undefined, controller.signal)
      .then((res) => {
        if (!active) return;
        setThermalList(res.results || []);
        setThermalLimits(res.limits || []);

        const results = res.results || [];
        if (results.length > 0) {
          const marsMatch =
            results.find((r) => r.region_id === marsRegionId) ||
            results.find((r) => r.planet === 'mars') ||
            results[0];
          const earthMatch =
            results.find((r) => r.planet === 'earth') ||
            results[1] ||
            results[0];
          setPrimaryThermalId(marsMatch.region_id);
          setCompareThermalId(earthMatch.region_id);
        }
      })
      .catch(() => {
        if (!active) return;
        setThermalList([]);
      })
      .finally(() => {
        if (active) setLoadingThermal(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [isOpen, marsRegionId]);

  // Fetch /api/thermal/{region_id} details for selected primary & compare regions
  useEffect(() => {
    if (!isOpen || !primaryThermalId) return;
    const controller = new AbortController();
    let active = true;

    fetchThermalDetail(primaryThermalId, controller.signal)
      .then((d) => {
        if (active) setPrimaryDetail(d);
      })
      .catch(() => {
        if (active) setPrimaryDetail(null);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [isOpen, primaryThermalId]);

  useEffect(() => {
    if (!isOpen || !compareThermalId) return;
    const controller = new AbortController();
    let active = true;

    fetchThermalDetail(compareThermalId, controller.signal)
      .then((d) => {
        if (active) setCompareDetail(d);
      })
      .catch(() => {
        if (active) setCompareDetail(null);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [isOpen, compareThermalId]);

  if (!isOpen) return null;

  const primarySummary = thermalList.find((r) => r.region_id === primaryThermalId);
  const compareSummary = thermalList.find((r) => r.region_id === compareThermalId);

  const primaryTempChart = [
    {
      metric: t.api.thermalDayTemp,
      primary: primarySummary?.mean_day_temp_K ?? 0,
      comparison: compareSummary?.mean_day_temp_K ?? 0,
    },
    {
      metric: t.api.thermalNightTemp,
      primary: primarySummary?.mean_night_temp_K ?? 0,
      comparison: compareSummary?.mean_night_temp_K ?? 0,
    },
    {
      metric: t.api.thermalDiurnalRange,
      primary: primarySummary?.diurnal_range_K ?? 0,
      comparison: compareSummary?.diurnal_range_K ?? 0,
    },
  ];

  // Collect union of all feature keys from primaryDetail / compareDetail
  const detailFeatureKeys = Array.from(
    new Set([
      ...Object.keys(primaryDetail?.features || {}),
      ...Object.keys(compareDetail?.features || {}),
    ])
  );

  // Terramechanics fallback references
  const currentSite =
    REGOLITH_PROFILES.find((s) => s.site_id === selectedSiteId) || REGOLITH_PROFILES[0];
  const compareSite =
    REGOLITH_PROFILES.find((s) => s.site_id === compareSiteId) || REGOLITH_PROFILES[1];

  const geotechnicalMetrics = [
    {
      metric: t.regolithSensors.params.bearing,
      mars: currentSite.bearing_capacity_kpa,
      analog: compareSite.bearing_capacity_kpa,
      unit: 'kPa',
    },
    {
      metric: t.regolithSensors.params.friction,
      mars: currentSite.friction_angle_deg,
      analog: compareSite.friction_angle_deg,
      unit: '°',
    },
    {
      metric: t.regolithSensors.params.cohesion,
      mars: currentSite.cohesion_kpa,
      analog: compareSite.cohesion_kpa,
      unit: 'kPa',
    },
    {
      metric: t.regolithSensors.params.density,
      mars: currentSite.bulk_density_g_cm3,
      analog: compareSite.bulk_density_g_cm3,
      unit: 'g/cm³',
    },
    {
      metric: t.regolithSensors.params.sinkage,
      mars: currentSite.wheel_sinkage_cm,
      analog: compareSite.wheel_sinkage_cm,
      unit: t.common.cm,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl hud-fade-in">
      <div className="hud-modal-in relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-lg border border-amber-500/30 bg-[#0e131f]/95 shadow-[0_0_40px_rgba(245,158,11,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-white/10 bg-[#080e1a]/95">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-400">
              {sensorMode === 'thermal' ? <Flame className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-white tracking-wide">
                {sensorMode === 'thermal' ? t.api.thermalSectionTitle : t.regolithSensors.title}
              </h2>
              <div className="text-[11px] font-mono text-slate-400">
                {sensorMode === 'thermal' ? t.api.thermalExploratoryBadge : t.regolithSensors.subtitle}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded border border-white/10 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setSensorMode('thermal')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  sensorMode === 'thermal'
                    ? 'bg-amber-500 text-[#030712] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.api.thermalModeTab}
              </button>
              <button
                type="button"
                onClick={() => setSensorMode('terramechanics')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  sensorMode === 'terramechanics'
                    ? 'bg-cyan-500 text-[#030712] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.api.terramechanicsModeTab}
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label={t.common.close}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {sensorMode === 'thermal' ? (
            <>
              {loadingThermal ? (
                <div className="p-8 flex items-center justify-center gap-3 text-xs font-mono text-amber-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading /api/thermal telemetry...</span>
                </div>
              ) : thermalList.length === 0 ? (
                <div className="p-6 rounded-md border border-dashed border-amber-500/35 bg-amber-950/15 text-center space-y-3 text-xs font-mono">
                  <AlertTriangle className="w-7 h-7 text-amber-400 mx-auto" />
                  <p className="text-amber-200 max-w-lg mx-auto">{t.api.thermalNoData}</p>
                  <button
                    type="button"
                    onClick={() => setSensorMode('terramechanics')}
                    className="px-3.5 py-1.5 rounded bg-cyan-500 text-[#030712] font-bold cursor-pointer"
                  >
                    {t.api.terramechanicsModeTab}
                  </button>
                </div>
              ) : (
                <>
                  {/* Thermal Limits Caution Notice */}
                  {thermalLimits.length > 0 && (
                    <div className="p-3 rounded border border-amber-500/30 bg-amber-950/20 text-[11px] font-mono text-amber-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase text-[10px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{t.api.thermalLimitsTitle}</span>
                      </div>
                      <ul className="list-disc ps-5 space-y-0.5 text-amber-100/85 ltr-num">
                        {thermalLimits.slice(0, 3).map((lim, i) => (
                          <li key={i}>{lim}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Dual Region Selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 rounded bg-black/40 border border-white/10">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-amber-400 mb-1">
                        {t.regolithSensors.primarySiteLabel}
                      </label>
                      <select
                        value={primaryThermalId}
                        onChange={(e) => setPrimaryThermalId(e.target.value)}
                        className="w-full bg-[#080e1a] border border-white/15 focus:border-amber-400 text-white rounded px-3 py-1.5 text-xs font-mono outline-none"
                      >
                        {thermalList.map((r) => (
                          <option key={r.region_id} value={r.region_id}>
                            [{r.planet.toUpperCase()}] {prettifySiteName(r.known_analog || r.name)} ({r.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-cyan-400 mb-1">
                        {t.regolithSensors.compareSiteLabel}
                      </label>
                      <select
                        value={compareThermalId}
                        onChange={(e) => setCompareThermalId(e.target.value)}
                        className="w-full bg-[#080e1a] border border-white/15 focus:border-cyan-400 text-white rounded px-3 py-1.5 text-xs font-mono outline-none"
                      >
                        {thermalList.map((r) => (
                          <option key={r.region_id} value={r.region_id}>
                            [{r.planet.toUpperCase()}] {prettifySiteName(r.known_analog || r.name)} ({r.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Thermal KPI Strip */}
                  {primarySummary && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded bg-[#080e1a] border border-white/10 text-xs font-mono transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <span className="text-slate-400 block text-[10px] uppercase">{t.api.thermalDayTemp}</span>
                        <div className="text-xl font-bold text-white mt-1 tabular-nums ltr-num">
                          {primarySummary.mean_day_temp_K != null ? `${primarySummary.mean_day_temp_K.toFixed(1)} K` : 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 ltr-num">
                          {t.regolithSensors.analogPrefix}{' '}
                          {compareSummary?.mean_day_temp_K != null ? `${compareSummary.mean_day_temp_K.toFixed(1)} K` : 'N/A'}
                        </div>
                      </div>

                      <div className="p-3 rounded bg-[#080e1a] border border-white/10 text-xs font-mono transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <span className="text-slate-400 block text-[10px] uppercase">{t.api.thermalNightTemp}</span>
                        <div className="text-xl font-bold text-white mt-1 tabular-nums ltr-num">
                          {primarySummary.mean_night_temp_K != null ? `${primarySummary.mean_night_temp_K.toFixed(1)} K` : 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 ltr-num">
                          {t.regolithSensors.analogPrefix}{' '}
                          {compareSummary?.mean_night_temp_K != null ? `${compareSummary.mean_night_temp_K.toFixed(1)} K` : 'N/A'}
                        </div>
                      </div>

                      <div className="p-3 rounded bg-[#080e1a] border border-white/10 text-xs font-mono transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <span className="text-slate-400 block text-[10px] uppercase">{t.api.thermalDiurnalRange}</span>
                        <div className="text-xl font-bold text-amber-400 mt-1 tabular-nums ltr-num">
                          {primarySummary.diurnal_range_K != null ? `${primarySummary.diurnal_range_K.toFixed(1)} K` : 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 ltr-num">
                          {t.regolithSensors.analogPrefix}{' '}
                          {compareSummary?.diurnal_range_K != null ? `${compareSummary.diurnal_range_K.toFixed(1)} K` : 'N/A'}
                        </div>
                      </div>

                      <div className="p-3 rounded bg-[#080e1a] border border-white/10 text-xs font-mono transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <span className="text-slate-400 block text-[10px] uppercase">{t.api.thermalPlanetRank}</span>
                        <div className="text-xl font-bold text-cyan-300 mt-1 tabular-nums ltr-num">
                          {primarySummary.range_rank_in_planet != null
                            ? `#${primarySummary.range_rank_in_planet}/${primarySummary.n_ranked_in_planet}`
                            : primarySummary.status}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 ltr-num">
                          {t.api.thermalCoverage}: {primarySummary.min_coverage_pct != null ? `${primarySummary.min_coverage_pct.toFixed(0)}%` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Temperature Bar Comparison */}
                  <div className="p-4 rounded-md border border-white/10 bg-[#080e1a]/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-white font-semibold">
                        {t.api.thermalDayTemp} / {t.api.thermalNightTemp} / {t.api.thermalDiurnalRange} (K)
                      </span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-amber-400 font-bold">{prettifySiteName(primarySummary?.name || '')}</span>
                        <span className="text-slate-500">{t.common.vs}</span>
                        <span className="text-cyan-400 font-bold">{prettifySiteName(compareSummary?.name || '')}</span>
                      </div>
                    </div>

                    <div className="h-52 w-full" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={primaryTempChart}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="metric" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" K" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#080e1a', borderColor: '#334155', borderRadius: 4, fontSize: 11 }}
                          />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="primary" name={prettifySiteName(primarySummary?.name || 'Primary')} fill="#f59e0b" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="comparison" name={prettifySiteName(compareSummary?.name || 'Comparison')} fill="#06b6d4" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Full Feature Breakdown Table */}
                  {detailFeatureKeys.length > 0 && (
                    <div className="p-4 rounded-md border border-white/10 bg-[#080e1a]/80 space-y-2">
                      <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                        THEMIS / MODIS Feature Table (/api/thermal/{'{region_id}'})
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs font-mono">
                          <thead>
                            <tr className="border-b border-white/10 text-start text-slate-400 text-[10px] uppercase">
                              <th className="pb-2 text-start">Feature</th>
                              <th className="pb-2 text-amber-400 text-start">{prettifySiteName(primarySummary?.name || '')}</th>
                              <th className="pb-2 text-cyan-400 text-start">{prettifySiteName(compareSummary?.name || '')}</th>
                              <th className="pb-2 text-end">Coverage %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {detailFeatureKeys.map((key) => {
                              const f1 = primaryDetail?.features?.[key];
                              const f2 = compareDetail?.features?.[key];
                              return (
                                <tr key={key} className="hover:bg-white/5 transition-colors">
                                  <td className="py-2 text-slate-300 ltr-num text-start">{key}</td>
                                  <td className="py-2 font-bold text-white tabular-nums ltr-num text-start">
                                    {f1?.value != null ? Number(f1.value).toFixed(2) : '—'}
                                  </td>
                                  <td className="py-2 font-bold text-cyan-300 tabular-nums ltr-num text-start">
                                    {f2?.value != null ? Number(f2.value).toFixed(2) : '—'}
                                  </td>
                                  <td className="py-2 text-end text-slate-400 tabular-nums ltr-num">
                                    {f1?.coverage_pct != null ? `${f1.coverage_pct.toFixed(1)}%` : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {/* Dual Site Comparison Selector (Terramechanics) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 rounded bg-black/40 border border-white/10">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-amber-400 mb-1">
                    {t.regolithSensors.primarySiteLabel}
                  </label>
                  <select
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    className="w-full bg-[#080e1a] border border-white/15 focus:border-amber-400 text-white rounded px-3 py-1.5 text-xs font-mono outline-none"
                  >
                    {REGOLITH_PROFILES.map((p) => (
                      <option key={p.site_id} value={p.site_id}>
                        [{p.planet}] {p.site_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-cyan-400 mb-1">
                    {t.regolithSensors.compareSiteLabel}
                  </label>
                  <select
                    value={compareSiteId}
                    onChange={(e) => setCompareSiteId(e.target.value)}
                    className="w-full bg-[#080e1a] border border-white/15 focus:border-cyan-400 text-white rounded px-3 py-1.5 text-xs font-mono outline-none"
                  >
                    {REGOLITH_PROFILES.map((p) => (
                      <option key={p.site_id} value={p.site_id}>
                        [{p.planet}] {p.site_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Metrics KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded bg-[#080e1a] border border-white/10 text-xs font-mono transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <span className="text-slate-400 block text-[10px] uppercase">{t.regolithSensors.wheelSinkage}</span>
                  <div className="text-xl font-bold text-white mt-1 tabular-nums ltr-num">
                    {currentSite.wheel_sinkage_cm} {t.common.cm}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {t.regolithSensors.analogPrefix}{' '}
                    <span className="ltr-num">{compareSite.wheel_sinkage_cm} {t.common.cm}</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-[#080e1a] border border-white/10 text-xs font-mono transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <span className="text-slate-400 block text-[10px] uppercase">{t.regolithSensors.bearingCapacity}</span>
                  <div className="text-xl font-bold text-white mt-1 tabular-nums ltr-num">
                    {currentSite.bearing_capacity_kpa} kPa
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {t.regolithSensors.analogPrefix}{' '}
                    <span className="ltr-num">{compareSite.bearing_capacity_kpa} kPa</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-[#080e1a] border border-white/10 text-xs font-mono transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <span className="text-slate-400 block text-[10px] uppercase">{t.regolithSensors.perchlorateLevel}</span>
                  <div className="text-xl font-bold text-amber-400 mt-1 tabular-nums ltr-num">
                    {currentSite.perchlorate_pct} wt%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {t.regolithSensors.analogPrefix}{' '}
                    <span className="ltr-num">{compareSite.perchlorate_pct} wt%</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-[#080e1a] border border-white/10 text-xs font-mono transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <span className="text-slate-400 block text-[10px] uppercase">{t.regolithSensors.trafficabilityIndex}</span>
                  <div className="text-sm font-bold uppercase mt-1 text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.regolithSensors.trafficabilityValues[currentSite.trafficability_index]}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{t.regolithSensors.safeForRover}</div>
                </div>
              </div>

              {/* Grain Size Distribution Bar Chart */}
              <div className="p-4 rounded-md border border-white/10 bg-[#080e1a]/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-white font-semibold">
                    {t.regolithSensors.grainChartTitle}
                  </span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-amber-400 font-bold">{currentSite.site_name}</span>
                    <span className="text-slate-500">{t.common.vs}</span>
                    <span className="text-cyan-400 font-bold">{compareSite.site_name}</span>
                  </div>
                </div>

                <div className="h-56 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={currentSite.grain_distribution.map((item, idx) => ({
                        fraction: item.fraction,
                        primary: item.percentage,
                        comparison: compareSite.grain_distribution[idx]?.percentage ?? 0,
                      }))}
                      margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="fraction" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#080e1a',
                          borderColor: '#334155',
                          borderRadius: 4,
                          fontSize: 11,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                      <Bar dataKey="primary" name={currentSite.site_name} fill="#f59e0b" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="comparison" name={compareSite.site_name} fill="#06b6d4" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Terramechanics Parameter Table */}
              <div className="p-4 rounded-md border border-white/10 bg-[#080e1a]/80 space-y-2">
                <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                  {t.regolithSensors.terramechanicsTitle}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-start text-slate-400 text-[10px] uppercase">
                        <th className="pb-2 text-start">{t.regolithSensors.physicalParam}</th>
                        <th className="pb-2 text-amber-400 text-start">{currentSite.site_name}</th>
                        <th className="pb-2 text-cyan-400 text-start">{compareSite.site_name}</th>
                        <th className="pb-2 text-end">{t.regolithSensors.divergence}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {geotechnicalMetrics.map((row) => {
                        const diff = (row.analog - row.mars).toFixed(2);
                        return (
                          <tr key={row.metric} className="hover:bg-white/5 transition-colors">
                            <td className="py-2.5 text-slate-300 font-medium text-start">{row.metric}</td>
                            <td className="py-2.5 font-bold text-white tabular-nums ltr-num text-start">
                              {row.mars} {row.unit}
                            </td>
                            <td className="py-2.5 font-bold text-cyan-300 tabular-nums ltr-num text-start">
                              {row.analog} {row.unit}
                            </td>
                            <td className="py-2.5 text-end font-mono text-slate-400 tabular-nums ltr-num">
                              {Number(diff) > 0 ? `+${diff}` : diff} {row.unit}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#080e1a]/90 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <span>{t.regolithSensors.footerNote}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded font-heading font-bold text-xs bg-amber-500 hover:bg-amber-400 text-[#030712] transition-colors cursor-pointer"
          >
            {t.regolithSensors.closeOverlay}
          </button>
        </div>
      </div>
    </div>
  );
};
