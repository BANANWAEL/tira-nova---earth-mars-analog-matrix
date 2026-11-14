import React, { useEffect, useState } from 'react';
import {
  ApiEvidenceResponse,
  ApiThermalDetail,
  Region,
} from '../../lib/types';
import { useLanguage } from '../../lib/LanguageContext';
import { GlobeHUD } from '../GlobeHUD';
import { fetchEvidence, fetchThermalDetail, prettifySiteName } from '../../services/api';
import {
  Thermometer,
  Wind,
  Gauge,
  Sun,
  Crosshair,
  AlertTriangle,
  Loader2,
  Flame,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

interface MarsTelemetryViewProps {
  marsRegions: Region[];
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
  onRunAnalogSearch: (region: Region) => void;
}

export const MarsTelemetryView: React.FC<MarsTelemetryViewProps> = ({
  marsRegions,
  selectedRegion,
  onSelectRegion,
  onRunAnalogSearch,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'topography' | 'environmental' | 'geology'>('topography');

  const [evidence, setEvidence] = useState<ApiEvidenceResponse | null>(null);
  const [loadingEvidence, setLoadingEvidence] = useState<boolean>(false);
  const [thermal, setThermal] = useState<ApiThermalDetail | null>(null);
  const [loadingThermal, setLoadingThermal] = useState<boolean>(false);

  // Fetch live CRISM evidence & Phase 2 thermal features whenever selectedRegion changes
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoadingEvidence(true);
    fetchEvidence(selectedRegion.region_id, controller.signal)
      .then((res) => {
        if (active) setEvidence(res);
      })
      .catch(() => {
        if (active) setEvidence(null);
      })
      .finally(() => {
        if (active) setLoadingEvidence(false);
      });

    setLoadingThermal(true);
    fetchThermalDetail(selectedRegion.region_id, controller.signal)
      .then((res) => {
        if (active) setThermal(res);
      })
      .catch(() => {
        if (active) setThermal(null);
      })
      .finally(() => {
        if (active) setLoadingThermal(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedRegion.region_id]);

  const formatLat = (lat: number) => `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`;
  const formatLon = (lon: number) => `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;

  // Simulated MOLA Topographic Transect anchored to region elevation if known
  const baseElevation = selectedRegion.topography?.elevation_m ?? -2500;
  const topographyProfile = [
    { km: 0, elevation: baseElevation, slope: 4.2 },
    { km: 5, elevation: baseElevation + 140, slope: 6.8 },
    { km: 10, elevation: baseElevation + 260, slope: 9.1 },
    { km: 15, elevation: baseElevation + 310, slope: 11.4 },
    { km: 20, elevation: baseElevation + 190, slope: 8.5 },
    { km: 25, elevation: baseElevation + 70, slope: 5.2 },
    { km: 30, elevation: baseElevation - 80, slope: 7.9 },
    { km: 35, elevation: baseElevation - 150, slope: 10.3 },
    { km: 40, elevation: baseElevation - 40, slope: 8.1 },
    { km: 45, elevation: baseElevation + 80, slope: 6.4 },
    { km: 51, elevation: baseElevation + 20, slope: 4.9 },
  ];

  const slopeDistribution = [
    { bin: '0-2°', frequency: 18 },
    { bin: '2-5°', frequency: 34 },
    { bin: '5-8°', frequency: 26 },
    { bin: '8-12°', frequency: 14 },
    { bin: '12-16°', frequency: 6 },
    { bin: '>16°', frequency: 2 },
  ];

  const dayTempK = thermal?.features?.mean_day_temp_K?.value ?? null;
  const nightTempK = thermal?.features?.mean_night_temp_K?.value ?? null;
  const diurnalRangeK = thermal?.features?.diurnal_range_K?.value ?? null;

  const dayTempC = dayTempK !== null ? Math.round(dayTempK - 273.15) : 12;
  const nightTempC = nightTempK !== null ? Math.round(nightTempK - 273.15) : -108;
  const meanTempC =
    dayTempK !== null && nightTempK !== null
      ? `${Math.round((dayTempK + nightTempK) / 2 - 273.15)} °C`
      : '-42 °C';

  const temperatureDiurnal = [
    { hour: '00:00', temp: nightTempC + 10 },
    { hour: '04:00', temp: nightTempC },
    { hour: '08:00', temp: Math.round((nightTempC + dayTempC) / 2 - 15) },
    { hour: '12:00', temp: dayTempC - 8 },
    { hour: '14:00', temp: dayTempC },
    { hour: '18:00', temp: Math.round((nightTempC + dayTempC) / 2) },
    { hour: '22:00', temp: nightTempC + 16 },
  ];

  const crismDetectBars =
    evidence?.top_detect_features?.map((f) => ({
      name: f.feature_name.replace(/_detect_pct$/i, '').replace(/_/g, ' '),
      pct: Number((f.value ?? 0).toFixed(2)),
    })) || [];

  return (
    <div className="space-y-6">
      {/* Top Telemetry Header */}
      <div className="p-4 rounded-md border border-white/10 bg-[#0e131f]/85 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
        <div className="flex items-center gap-4">
          {/* Orbital Reconnaissance Beacon */}
          <div className="relative w-12 h-12 shrink-0 hidden sm:flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-amber-400/45 animate-[spin_24s_linear_infinite]">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            </div>
            <div className="absolute inset-2 rounded-full border border-cyan-400/35 animate-[spin_36s_linear_infinite_reverse]">
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
            </div>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
              {t.marsTelemetry.headerEyebrow}
            </div>
            <h1 className="font-heading font-bold text-2xl text-white mt-0.5">
              {selectedRegion.name}
            </h1>
            <div className="text-xs font-mono text-slate-400 mt-1 flex flex-wrap items-center gap-3">
              <span>
                {t.common.lat}: <span className="ltr-num text-slate-200">{formatLat(selectedRegion.center.lat)}</span>
              </span>
              <span>·</span>
              <span>
                {t.common.lon}: <span className="ltr-num text-slate-200">{formatLon(selectedRegion.center.lon)}</span>
              </span>
              <span>·</span>
              <span>
                {t.marsTelemetry.categoryLabel} <span className="text-slate-200">{selectedRegion.category}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Site Quick Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {marsRegions.map((r) => (
            <button
              key={r.region_id}
              type="button"
              onClick={() => onSelectRegion(r)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer border ${
                selectedRegion.region_id === r.region_id
                  ? 'border-amber-400 bg-amber-950/60 text-white font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: 3D Mars Reconnaissance View + Real-time Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Mars 3D HUD Probe */}
        <div className="lg:col-span-5 space-y-4">
          <GlobeHUD
            planet="Mars"
            selectedRegion={selectedRegion}
            allRegions={marsRegions}
            onSelectRegion={onSelectRegion}
          />

          {/* Regional Geomorphology & Live CRISM Target Minerals */}
          <div className="p-4 rounded-md border border-white/10 bg-[#0e131f]/85 backdrop-blur-md text-xs space-y-2.5 transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                {t.marsTelemetry.stratigraphyTitle}
              </span>
              {(loadingEvidence || loadingThermal) && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              )}
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">
              {selectedRegion.description}
            </p>
            {selectedRegion.live?.crism_target_minerals &&
              selectedRegion.live.crism_target_minerals.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedRegion.live.crism_target_minerals.map((m) => (
                    <span
                      key={m}
                      className="px-2 py-0.5 rounded bg-amber-950/50 border border-amber-500/30 text-amber-300 text-[10px] font-mono ltr-num"
                    >
                      {prettifySiteName(m)}
                    </span>
                  ))}
                </div>
              )}
            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
              <span className="text-slate-400">{t.marsTelemetry.knownAnalogs}</span>
              <span className="text-cyan-400 ltr-num">
                {selectedRegion.primary_analogs?.join(', ') ||
                  (selectedRegion.live?.ranked_matches
                    ? `${selectedRegion.live.ranked_matches} EMIT-ranked matches`
                    : 'Atacama, Salda')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Instruments & Transects */}
        <div className="lg:col-span-7 space-y-4">
          {/* Telemetry Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded bg-[#080e1a] border border-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.marsTelemetry.atmPressure}</span>
              </div>
              <div className="mt-1 text-xl font-bold font-mono text-white tabular-nums ltr-num">
                612 Pa
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                {t.marsTelemetry.atmPressureSub}
              </div>
            </div>

            <div className="p-3 rounded bg-[#080e1a] border border-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>{thermal ? t.api.thermalDiurnalRange : t.marsTelemetry.surfaceTemp}</span>
              </div>
              <div className="mt-1 text-xl font-bold font-mono text-white tabular-nums ltr-num">
                {diurnalRangeK !== null ? `${diurnalRangeK.toFixed(1)} K` : meanTempC}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1 ltr-num">
                {dayTempK !== null && nightTempK !== null
                  ? `Day ${dayTempK.toFixed(0)}K / Night ${nightTempK.toFixed(0)}K`
                  : t.marsTelemetry.surfaceTempSub}
              </div>
            </div>

            <div className="p-3 rounded bg-[#080e1a] border border-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                <Sun className="w-3.5 h-3.5 text-yellow-400" />
                <span>{evidence?.crism_coverage_pct != null ? t.api.crismCoverageLabel : t.marsTelemetry.solarFlux}</span>
              </div>
              <div className="mt-1 text-xl font-bold font-mono text-white tabular-nums ltr-num">
                {evidence?.crism_coverage_pct != null
                  ? `${evidence.crism_coverage_pct.toFixed(1)}%`
                  : '590 W/m²'}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1 ltr-num">
                {evidence?.crism_dates || t.marsTelemetry.solarFluxSub}
              </div>
            </div>

            <div className="p-3 rounded bg-[#080e1a] border border-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                <span>{thermal?.range_rank_in_planet ? t.api.thermalPlanetRank : t.marsTelemetry.windVelocity}</span>
              </div>
              <div className="mt-1 text-xl font-bold font-mono text-white tabular-nums ltr-num">
                {thermal?.range_rank_in_planet
                  ? `#${thermal.range_rank_in_planet}/${thermal.n_ranked_in_planet}`
                  : '6.4 m/s'}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                {thermal?.dataset || t.marsTelemetry.windVelocitySub}
              </div>
            </div>
          </div>

          {/* Interactive Telemetry Tabs */}
          <div className="p-4 rounded-md border border-white/10 bg-[#0e131f]/85 backdrop-blur-md space-y-4 transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                {(['topography', 'environmental', 'geology'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                      activeTab === tab
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                        : 'text-slate-400 hover:text-white bg-white/5'
                    }`}
                  >
                    {t.marsTelemetry.tabs[tab]}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onRunAnalogSearch(selectedRegion)}
                className="px-3 py-1.5 rounded text-xs font-heading font-bold bg-cyan-500 hover:bg-cyan-400 text-[#030712] transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
              >
                <span>{t.marsTelemetry.findEarthAnalogs}</span>
                <Crosshair className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tab 1: MOLA Topography & Slope Profile */}
            {activeTab === 'topography' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-300 font-semibold">
                      {t.marsTelemetry.molaTransectTitle}
                    </span>
                    <span className="text-slate-500">{t.common.grid450m}</span>
                  </div>
                  <div className="h-48 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={topographyProfile}>
                        <defs>
                          <linearGradient id="molaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="km" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" km" />
                        <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" m" domain={['dataMin - 100', 'dataMax + 100']} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#080e1a', borderColor: '#334155', borderRadius: 4, fontSize: 11 }}
                          itemStyle={{ color: '#fbbf24' }}
                        />
                        <Area type="monotone" dataKey="elevation" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#molaGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono mb-2">
                    <span className="text-slate-300 font-semibold">
                      {t.marsTelemetry.slopeDistTitle}{' '}
                      {selectedRegion.topography?.slope_p90_deg != null && (
                        <span className="ltr-num">(P90 = {selectedRegion.topography.slope_p90_deg}°)</span>
                      )}
                    </span>
                    <span className="text-amber-400">{t.marsTelemetry.roverMaxSlope}</span>
                  </div>
                  <div className="h-36 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={slopeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="bin" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#080e1a', borderColor: '#334155', borderRadius: 4, fontSize: 11 }}
                        />
                        <Bar dataKey="frequency" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Environmental & Live Phase 2 THEMIS Thermal Telemetry */}
            {activeTab === 'environmental' && (
              <div className="space-y-4">
                {thermal && (
                  <div className="p-3 rounded border border-amber-500/30 bg-amber-950/20 text-xs font-mono space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-amber-300 font-bold uppercase text-[11px]">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{t.api.thermalSectionTitle}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/30 text-amber-200 text-[10px]">
                        {t.api.thermalExploratoryBadge}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div className="p-2 rounded bg-black/40">
                        <span className="text-slate-500 block text-[10px]">{t.api.thermalDayTemp}</span>
                        <strong className="text-white ltr-num">{dayTempK !== null ? `${dayTempK.toFixed(1)} K` : '—'}</strong>
                      </div>
                      <div className="p-2 rounded bg-black/40">
                        <span className="text-slate-500 block text-[10px]">{t.api.thermalNightTemp}</span>
                        <strong className="text-white ltr-num">{nightTempK !== null ? `${nightTempK.toFixed(1)} K` : '—'}</strong>
                      </div>
                      <div className="p-2 rounded bg-black/40">
                        <span className="text-slate-500 block text-[10px]">{t.api.thermalDiurnalRange}</span>
                        <strong className="text-amber-300 ltr-num">{diurnalRangeK !== null ? `${diurnalRangeK.toFixed(1)} K` : '—'}</strong>
                      </div>
                      <div className="p-2 rounded bg-black/40">
                        <span className="text-slate-500 block text-[10px]">Ls Day / Gap</span>
                        <strong className="text-cyan-300 ltr-num">
                          {thermal.features.ls_day_deg?.value ?? '—'}° / Δ{thermal.features.ls_gap_deg?.value ?? '—'}°
                        </strong>
                      </div>
                    </div>
                    {thermal.limits?.[0] && (
                      <div className="text-[10px] text-amber-200/80 flex items-start gap-1.5 pt-1">
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" />
                        <span className="ltr-num">{thermal.limits[0]}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300 font-semibold">
                    {t.marsTelemetry.diurnalTempTitle}
                  </span>
                  <span className="text-slate-500 ltr-num">
                    {thermal?.source_date || t.marsTelemetry.solSimulation}
                  </span>
                </div>
                <div className="h-52 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={temperatureDiurnal}>
                      <defs>
                        <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit="°C" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#080e1a', borderColor: '#334155', borderRadius: 4, fontSize: 11 }}
                      />
                      <Area type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#tempGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-3 rounded bg-black/40 border border-white/5 text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-slate-500 block text-[10px]">{t.marsTelemetry.gases.co2}</span>
                    <strong className="text-white text-sm ltr-num">95.32%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">{t.marsTelemetry.gases.n2}</span>
                    <strong className="text-white text-sm ltr-num">2.60%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">{t.marsTelemetry.gases.ar}</span>
                    <strong className="text-white text-sm ltr-num">1.90%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">{t.marsTelemetry.gases.trace}</span>
                    <strong className="text-white text-sm ltr-num">0.18%</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Live CRISM Geological & Mineral Indices */}
            {activeTab === 'geology' && (
              <div className="space-y-4 text-xs font-mono">
                {evidence && (evidence.crism_targets.length > 0 || crismDetectBars.length > 0) ? (
                  <div className="space-y-4">
                    <div className="p-3 rounded bg-cyan-950/25 border border-cyan-500/25 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-cyan-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{t.api.crismEvidenceTitle}</span>
                        </span>
                        <span className="text-[11px] text-slate-300 ltr-num">
                          {t.api.crismCoverageLabel}{' '}
                          <strong className="text-amber-300">
                            {evidence.crism_coverage_pct != null ? `${evidence.crism_coverage_pct.toFixed(1)}%` : 'N/A'}
                          </strong>
                          {evidence.crism_dates ? ` · ${evidence.crism_dates}` : ''}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">{evidence.note}</div>
                    </div>

                    {crismDetectBars.length > 0 && (
                      <div>
                        <div className="text-slate-300 font-semibold mb-2">
                          {t.api.crismTopDetectsLabel}
                        </div>
                        <div className="h-48 w-full" dir="ltr">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={crismDetectBars} layout="vertical" margin={{ left: 30, right: 16 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" />
                              <YAxis type="category" dataKey="name" stroke="#64748b" width={110} tick={{ fontSize: 10, fill: '#cbd5e1' }} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#080e1a', borderColor: '#334155', borderRadius: 4, fontSize: 11 }}
                              />
                              <Bar dataKey="pct" fill="#f59e0b" radius={[0, 2, 2, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {evidence.crism_targets.length > 0 && (
                      <div className="p-3 rounded bg-black/40 border border-white/5 space-y-2">
                        <div className="text-amber-400 font-bold uppercase text-[11px]">
                          {t.api.crismTargetsLabel} ({evidence.crism_targets.length})
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {evidence.crism_targets.map((tg, idx) => (
                            <div key={idx} className="p-2 rounded bg-white/5 flex items-center justify-between gap-2">
                              <div>
                                <div className="text-white font-semibold ltr-num">{tg.emit_mineral || 'Target Mineral'}</div>
                                {tg.crism_param && (
                                  <div className="text-slate-400 text-[10px] ltr-num">CRISM: {tg.crism_param}</div>
                                )}
                              </div>
                              {tg.detect_pct != null && (
                                <span className="text-cyan-300 font-bold ltr-num">{Number(tg.detect_pct).toFixed(1)}%</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded bg-black/40 border border-white/5 space-y-2">
                    <div className="text-cyan-400 font-bold uppercase text-[11px]">
                      {t.marsTelemetry.crismTitle}
                    </div>
                    <div className="text-[11px] text-slate-400 pb-1">
                      {t.api.noCrismEvidence}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                      <div className="p-2 rounded bg-white/5">
                        <div className="text-white font-semibold">{t.marsTelemetry.minerals.phylloTitle}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{t.marsTelemetry.minerals.phylloDesc}</div>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <div className="text-white font-semibold">{t.marsTelemetry.minerals.carbTitle}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{t.marsTelemetry.minerals.carbDesc}</div>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <div className="text-white font-semibold">{t.marsTelemetry.minerals.olivineTitle}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{t.marsTelemetry.minerals.olivineDesc}</div>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <div className="text-white font-semibold">{t.marsTelemetry.minerals.sulfateTitle}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{t.marsTelemetry.minerals.sulfateDesc}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
