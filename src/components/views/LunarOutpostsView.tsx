import React, { useEffect, useState } from 'react';
import { ApiAnalogGroup, ApiThermalSummary, Region } from '../../lib/types';
import { LUNAR_OUTPOSTS, LUNAR_OUTPOST_PROFILES } from '../../lib/data';
import { useLanguage } from '../../lib/LanguageContext';
import { GlobeHUD } from '../GlobeHUD';
import { LunarDossierModal } from '../modals/LunarDossierModal';
import { fetchAnalogs, fetchThermalList } from '../../services/api';
import {
  Moon,
  Shield,
  Radio,
  Zap,
  Snowflake,
  Target,
  AlertTriangle,
  Database,
  Flame,
  Loader2,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface LunarOutpostsViewProps {
  onSelectDetail?: (analogSite: unknown) => void;
  initialAnalogs?: ApiAnalogGroup[];
}

export const LunarOutpostsView: React.FC<LunarOutpostsViewProps> = ({
  initialAnalogs = [],
}) => {
  const { lang, t } = useLanguage();
  const [selectedOutpost, setSelectedOutpost] = useState<Region>(LUNAR_OUTPOSTS[0]);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);

  const [liveAnalogs, setLiveAnalogs] = useState<ApiAnalogGroup[]>(initialAnalogs);
  const [earthThermals, setEarthThermals] = useState<ApiThermalSummary[]>([]);
  const [loadingLive, setLoadingLive] = useState<boolean>(false);

  useEffect(() => {
    if (initialAnalogs.length > 0) {
      setLiveAnalogs(initialAnalogs);
    }
  }, [initialAnalogs]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoadingLive(true);

    Promise.allSettled([
      fetchAnalogs(controller.signal),
      fetchThermalList('earth', controller.signal),
    ])
      .then(([analogsRes, thermalRes]) => {
        if (!active) return;
        if (analogsRes.status === 'fulfilled' && Array.isArray(analogsRes.value)) {
          setLiveAnalogs(analogsRes.value);
        }
        if (thermalRes.status === 'fulfilled' && thermalRes.value?.results) {
          setEarthThermals(thermalRes.value.results);
        }
      })
      .finally(() => {
        if (active) setLoadingLive(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const telemetry =
    LUNAR_OUTPOST_PROFILES[selectedOutpost.region_id] ||
    LUNAR_OUTPOST_PROFILES[LUNAR_OUTPOSTS[0].region_id];

  const localizedSite = lang === 'ar' ? t.lunarOutposts.siteTelemetry[selectedOutpost.region_id] : undefined;

  const formatLat = (lat: number) => `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`;
  const formatLon = (lon: number) => `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;

  const getShortLabel = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('shackleton')) return t.lunarOutposts.shortLabels.shackleton;
    if (lower.includes('malapert')) return t.lunarOutposts.shortLabels.malapert;
    if (lower.includes('marius')) return t.lunarOutposts.shortLabels.marius;
    return name.split(' ')[0];
  };

  const localizedRadarMetrics = telemetry.radar_metrics.map((m) => ({
    ...m,
    subject: t.lunarOutposts.radarSubjects[m.subject] || m.subject,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-md border border-white/10 bg-[#0e131f]/85 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.lunarOutposts.headerEyebrow}</span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-white mt-0.5">
            {selectedOutpost.name}
          </h1>
          <div className="text-xs font-mono text-slate-400 mt-1 flex flex-wrap items-center gap-3">
            <span>
              {t.common.lat}: <strong className="text-slate-200 tabular-nums ltr-num">{formatLat(selectedOutpost.center.lat)}</strong>
            </span>
            <span>·</span>
            <span>
              {t.common.lon}: <strong className="text-slate-200 tabular-nums ltr-num">{formatLon(selectedOutpost.center.lon)}</strong>
            </span>
            <span>·</span>
            <span>
              {t.common.datasets}: <strong className="text-cyan-400 ltr-num">{selectedOutpost.datasets.join(', ')}</strong>
            </span>
          </div>
        </div>

        {/* Interactive Location Selector */}
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label={t.lunarOutposts.locationTablistAria}>
          {LUNAR_OUTPOSTS.map((outpost) => {
            const isSelected = selectedOutpost.region_id === outpost.region_id;
            return (
              <button
                key={outpost.region_id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedOutpost(outpost)}
                className={`px-3.5 py-2 rounded text-xs font-mono transition-all cursor-pointer border whitespace-nowrap ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/60 text-white font-bold shadow-[0_0_14px_rgba(6,182,212,0.35)]'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-100 hover:border-white/20'
                }`}
              >
                {getShortLabel(outpost.name)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: 3D Lunar Pole Globe + Radar Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lunar 3D Reconnaissance Globe with Clickable Target Marker */}
        <div className="lg:col-span-5 space-y-4">
          <GlobeHUD
            planet="Moon"
            selectedRegion={selectedOutpost}
            allRegions={LUNAR_OUTPOSTS}
            onSelectRegion={setSelectedOutpost}
            onInspectRegion={(reg) => {
              setSelectedOutpost(reg);
              setIsDossierOpen(true);
            }}
          />

          {/* Outpost Strategic Assessment */}
          <div className="p-4 rounded-md border border-white/10 bg-[#0e131f]/85 backdrop-blur-md text-xs space-y-3 transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>{t.lunarOutposts.tacticalProfileTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDossierOpen(true)}
                className="px-2.5 py-1 rounded text-[11px] font-mono font-semibold text-amber-300 bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/50 hover:text-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Target className="w-3 h-3" />
                <span>{t.lunarOutposts.safetyDossierBtn}</span>
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed font-sans">
              {localizedSite?.description || selectedOutpost.description}
            </p>

            <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 rounded bg-black/40 border border-white/5">
                <span className="text-slate-500 block text-[10px]">{t.lunarOutposts.peakIllumination}</span>
                <strong className="text-white tabular-nums">
                  {localizedSite?.peakIllumination || telemetry.peak_illumination}
                </strong>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-white/5">
                <span className="text-slate-500 block text-[10px]">
                  {localizedSite?.thermalLabel ||
                    t.lunarOutposts.thermalLabels[telemetry.thermal_regime_label] ||
                    telemetry.thermal_regime_label}
                </span>
                <strong className="text-cyan-400 tabular-nums ltr-num">
                  {localizedSite?.thermalValue || telemetry.thermal_regime_value}
                </strong>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-white/5">
                <span className="text-slate-500 block text-[10px]">{t.lunarOutposts.lolaElevation}</span>
                <strong className="text-white tabular-nums ltr-num">
                  {selectedOutpost.topography?.elevation_m !== undefined
                    ? `${selectedOutpost.topography.elevation_m > 0 ? '+' : ''}${selectedOutpost.topography.elevation_m} ${t.common.m}`
                    : t.common.notAvailable}
                </strong>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-white/5">
                <span className="text-slate-500 block text-[10px]">{t.lunarOutposts.slopeP90}</span>
                <strong className="text-amber-400 tabular-nums ltr-num">
                  {selectedOutpost.topography?.slope_p90_deg ?? t.common.notAvailable}°
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Artemis Evaluation Radar & Dynamic Earth Analog Simulants */}
        <div className="lg:col-span-7 space-y-4">
          {/* Outpost Radar Evaluation */}
          <div className="p-4 rounded-md border border-white/10 bg-[#0e131f]/85 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                {t.lunarOutposts.suitabilityIndexTitle} · {getShortLabel(selectedOutpost.name)}
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold tabular-nums">
                {t.lunarOutposts.compositeLabel}{' '}
                <span className="ltr-num">{telemetry.composite_score.toFixed(1)}/100</span>
              </span>
            </div>

            <div className="relative h-56 w-full" dir="ltr">
              {/* Concentric Rotating Radar Rings & Pulsing Target Marker */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="w-44 h-44 rounded-full border border-dashed border-cyan-500/25 animate-[spin_24s_linear_infinite]">
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400/80 shadow-[0_0_10px_#06b6d4]" />
                </div>
                <div className="absolute w-32 h-32 rounded-full border border-amber-400/20 animate-[spin_36s_linear_infinite_reverse]">
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_8px_#f59e0b]" />
                </div>
                <span className="absolute flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400/90" />
                </span>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={localizedRadarMetrics}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#cbd5e1' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#080e1a',
                      borderColor: '#334155',
                      borderRadius: 4,
                      fontSize: 11,
                    }}
                  />
                  <Radar
                    name={selectedOutpost.name}
                    dataKey="A"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dynamic Terrestrial Analog Test Sites & Simulants Table */}
          <div className="p-4 rounded-md border border-white/10 bg-[#0e131f]/85 backdrop-blur-md space-y-3 transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  {t.lunarOutposts.simulantsTitle}
                </div>
                <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                  {t.lunarOutposts.calibratedFor} {selectedOutpost.name} ({localizedSite?.category || selectedOutpost.category})
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {t.lunarOutposts.simulantsSourceNote}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-start text-slate-400 text-[10px] uppercase">
                    <th className="pb-2 pe-3 text-start">{t.lunarOutposts.tableHeaders.simulant}</th>
                    <th className="pb-2 pe-3 text-start">{t.lunarOutposts.tableHeaders.origin}</th>
                    <th className="pb-2 pe-3 text-start">{t.lunarOutposts.tableHeaders.mineralogy}</th>
                    <th className="pb-2 pe-3 text-start">{t.lunarOutposts.tableHeaders.density}</th>
                    <th className="pb-2 pe-3 text-start">{t.lunarOutposts.tableHeaders.friction}</th>
                    <th className="pb-2 text-end">{t.lunarOutposts.tableHeaders.fidelity}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {telemetry.simulants.map((row) => (
                    <tr key={`${selectedOutpost.region_id}-${row.simulant}`} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 pe-3 font-bold text-white whitespace-nowrap text-start">{row.simulant}</td>
                      <td className="py-2.5 pe-3 text-slate-300 text-start">{row.origin}</td>
                      <td className="py-2.5 pe-3 text-slate-400 text-start">{row.mineralogy}</td>
                      <td className="py-2.5 pe-3 text-slate-300 tabular-nums ltr-num text-start">{row.density.toFixed(2)}</td>
                      <td className="py-2.5 pe-3 text-slate-300 tabular-nums ltr-num text-start">{row.friction}°</td>
                      <td className="py-2.5 text-end font-bold text-cyan-400 tabular-nums ltr-num">{row.matchPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Backend Known Analog Clusters & Earth Thermal Baselines */}
          {(liveAnalogs.length > 0 || earthThermals.length > 0 || loadingLive) && (
            <div className="p-4 rounded-md border border-cyan-500/25 bg-[#080e1a]/90 backdrop-blur-md space-y-3 text-xs font-mono transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase text-[11px]">
                  <Database className="w-3.5 h-3.5" />
                  <span>{t.api.lunarLiveAnalogsTitle}</span>
                </div>
                {loadingLive && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                {t.api.lunarLiveAnalogsSub}
              </p>

              {liveAnalogs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {liveAnalogs.slice(0, 4).map((ag, idx) => (
                    <div key={`${ag.known_analog}-${idx}`} className="p-2.5 rounded bg-black/40 border border-white/10 flex items-center justify-between gap-2">
                      <span className="text-white font-semibold truncate">{ag.known_analog}</span>
                      <span className="text-cyan-400 text-[11px] shrink-0 ltr-num">
                        {ag.windows != null ? `${ag.windows} windows` : `${ag.earth_region_ids?.length ?? 0} sites`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {earthThermals.length > 0 && (
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <div className="text-[10px] uppercase text-amber-300 font-bold flex items-center gap-1.5">
                    <Flame className="w-3 h-3" />
                    <span>MODIS Aqua Earth Exploratory Thermal Calibration</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {earthThermals.slice(0, 3).map((th) => (
                      <div key={th.region_id} className="p-2 rounded bg-black/40 border border-white/5">
                        <div className="text-white font-semibold truncate">{th.known_analog || th.name}</div>
                        <div className="text-amber-300 ltr-num mt-0.5">
                          ΔT: {th.diurnal_range_K != null ? `${th.diurnal_range_K.toFixed(1)} K` : 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-500 ltr-num">
                          Rank #{th.range_rank_in_planet ?? '—'}/{th.n_ranked_in_planet ?? '—'} · {th.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Extreme Environment Telemetry Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded bg-[#080e1a] border border-white/10 text-xs font-mono transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.lunarOutposts.volatileWaterIce}</span>
              </div>
              <div className="mt-1 text-lg font-bold text-white tabular-nums ltr-num">
                {telemetry.water_ice_wt}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {localizedSite?.waterIceSource || telemetry.water_ice_source}
              </div>
            </div>

            <div className="p-3 rounded bg-[#080e1a] border border-white/10 text-xs font-mono transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.lunarOutposts.electrostaticField}</span>
              </div>
              <div className="mt-1 text-lg font-bold text-white tabular-nums ltr-num">
                {telemetry.electrostatic_field}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {localizedSite?.electrostaticNote || telemetry.electrostatic_note}
              </div>
            </div>

            <div className="p-3 rounded bg-[#080e1a] border border-white/10 text-xs font-mono transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.lunarOutposts.earthDirectComm}</span>
              </div>
              <div className="mt-1 text-lg font-bold text-white tabular-nums">
                {localizedSite?.earthCommUptime || telemetry.earth_comm_uptime}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {localizedSite?.earthCommNote || telemetry.earth_comm_note}
              </div>
            </div>
          </div>

          {/* Surface Safety Summary Strip */}
          <button
            type="button"
            onClick={() => setIsDossierOpen(true)}
            className="w-full p-3.5 rounded-md border border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/30 hover:border-amber-400/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-start text-xs font-mono transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-amber-300 font-bold uppercase text-[10px] block">
                  {t.lunarOutposts.safetyRatingPrefix} {t.lunarDossier.safetyRatings[telemetry.safety_metrics.overall_rating]} · {t.lunarOutposts.landingEllipsePrefix}{' '}
                  <span className="ltr-num">{telemetry.safety_metrics.landing_ellipse_km}</span>
                </span>
                <span className="text-slate-300 text-[11px]">
                  {localizedSite?.safetyHazard || telemetry.safety_metrics.landing_slope_hazard}
                </span>
              </div>
            </div>
            <span className="text-cyan-400 font-bold text-[11px] whitespace-nowrap">
              {t.lunarOutposts.openTargetDossier}
            </span>
          </button>
        </div>
      </div>

      {/* Lunar Target Dossier Modal */}
      <LunarDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        outpost={selectedOutpost}
        telemetry={telemetry}
      />
    </div>
  );
};
