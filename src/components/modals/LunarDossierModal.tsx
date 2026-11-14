import React from 'react';
import { Region, LunarOutpostTelemetry } from '../../lib/types';
import { useLanguage } from '../../lib/LanguageContext';
import {
  X,
  Mountain,
  ShieldAlert,
  ShieldCheck,
  Compass,
  Layers,
  AlertTriangle,
  Target,
} from 'lucide-react';

interface LunarDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  outpost: Region;
  telemetry: LunarOutpostTelemetry;
}

export const LunarDossierModal: React.FC<LunarDossierModalProps> = ({
  isOpen,
  onClose,
  outpost,
  telemetry,
}) => {
  const { lang, t } = useLanguage();

  if (!isOpen) return null;

  const localizedSite = lang === 'ar' ? t.lunarOutposts.siteTelemetry[outpost.region_id] : undefined;

  const formatLat = (lat: number) => `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`;
  const formatLon = (lon: number) => `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;

  const safety = telemetry.safety_metrics;
  const ratingStyle =
    safety.overall_rating === 'NOMINAL'
      ? 'border-cyan-500/40 bg-cyan-950/50 text-cyan-300'
      : safety.overall_rating === 'CAUTION'
      ? 'border-amber-500/40 bg-amber-950/50 text-amber-300'
      : 'border-amber-500/60 bg-amber-950/70 text-amber-200';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl hud-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lunar-dossier-title"
    >
      <div className="hud-modal-in relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-lg border border-cyan-500/35 bg-[#0e131f]/95 backdrop-blur-2xl shadow-[0_0_45px_rgba(6,182,212,0.22)] overflow-hidden">
        {/* Top Modal Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#080e1a]/95">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                <span>{t.lunarDossier.titlePrefix}</span>
                <span>·</span>
                <span className="text-amber-400">{localizedSite?.category || outpost.category}</span>
              </div>
              <h2 id="lunar-dossier-title" className="font-heading font-bold text-lg text-white">
                {outpost.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded border text-[11px] font-mono font-bold uppercase ${ratingStyle}`}>
              {t.lunarDossier.safetyBadgePrefix} {t.lunarDossier.safetyRatings[safety.overall_rating]}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={t.lunarDossier.closeDossier}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Coordinate & Dataset Metadata Strip */}
          <div className="p-3.5 rounded bg-[#080e1a]/80 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-3 text-slate-300">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span className="ltr-num">
                  {formatLat(outpost.center.lat)}, {formatLon(outpost.center.lon)}
                </span>
              </span>
              <span className="text-slate-600">·</span>
              <span>
                {t.lunarDossier.windowLabel}{' '}
                <span className="ltr-num">{outpost.window_km ?? 30} {t.common.km}</span>
              </span>
              <span className="text-slate-600">·</span>
              <span>
                {t.lunarDossier.bboxLabel}{' '}
                <span className="ltr-num">[{outpost.bbox.map((v) => v.toFixed(1)).join(', ')}]</span>
              </span>
            </div>
            <div className="text-cyan-300 font-semibold">
              {t.lunarDossier.sourcesLabel}{' '}
              <span className="ltr-num">{outpost.datasets.join(' · ')}</span>
            </div>
          </div>

          {/* Primary Topographic & Elevation KPIs */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.lunarDossier.elevationSectionTitle}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 rounded bg-[#080e1a] border border-cyan-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <span className="text-[10px] uppercase text-slate-400 block">{t.lunarDossier.elevationLabel}</span>
                <div className="text-xl font-bold text-white mt-1 tabular-nums ltr-num">
                  {outpost.topography?.elevation_m !== undefined
                    ? `${outpost.topography.elevation_m > 0 ? '+' : ''}${outpost.topography.elevation_m} ${t.common.m}`
                    : t.common.notAvailable}
                </div>
                <span className="text-[10px] text-slate-500">{t.lunarDossier.meanLunarDatum}</span>
              </div>

              <div className="p-3 rounded bg-[#080e1a] border border-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <span className="text-[10px] uppercase text-slate-400 block">{t.lunarDossier.slopeLabel}</span>
                <div className="text-xl font-bold text-amber-300 mt-1 tabular-nums ltr-num">
                  {outpost.topography?.slope_p90_deg ?? t.common.notAvailable}°
                </div>
                <span className="text-[10px] text-slate-500">{t.lunarDossier.landerLimit}</span>
              </div>

              <div className="p-3 rounded bg-[#080e1a] border border-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <span className="text-[10px] uppercase text-slate-400 block">{t.lunarDossier.triLabel}</span>
                <div className="text-xl font-bold text-white mt-1 tabular-nums ltr-num">
                  {outpost.topography?.tri_mean_m ?? t.common.notAvailable} {t.common.m}
                </div>
                <span className="text-[10px] text-slate-500">{t.lunarDossier.localRelief}</span>
              </div>

              <div className="p-3 rounded bg-[#080e1a] border border-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <span className="text-[10px] uppercase text-slate-400 block">{t.lunarDossier.roughnessLabel}</span>
                <div className="text-xl font-bold text-cyan-300 mt-1 tabular-nums ltr-num">
                  {outpost.topography?.roughness_cm ?? t.common.notAvailable} {t.common.cm}
                </div>
                <span className="text-[10px] text-slate-500">{t.lunarDossier.clastScale}</span>
              </div>
            </div>
          </div>

          {/* Surface Safety Metrics & Hazard Dossier */}
          <div className="p-4 rounded-md border border-white/10 bg-[#080e1a]/80 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>{t.lunarDossier.safetySectionTitle}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {t.lunarDossier.suitabilityScore}{' '}
                <strong className="text-cyan-300 ltr-num">{telemetry.composite_score}/100</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase text-slate-400">{t.lunarDossier.landingSlopeAssessment}</span>
                <p className="text-slate-200 font-sans leading-relaxed">
                  {localizedSite?.safetyHazard || safety.landing_slope_hazard}
                </p>
              </div>

              <div className="p-3 rounded bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase text-slate-400">{t.lunarDossier.boulderHazard}</span>
                <p className="text-slate-200 font-sans leading-relaxed">{safety.boulder_density_note}</p>
              </div>

              <div className="p-3 rounded bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase text-slate-400">{t.lunarDossier.radiationOverburden}</span>
                <p className="text-slate-200 font-sans leading-relaxed">{safety.radiation_shielding}</p>
              </div>

              <div className="p-3 rounded bg-black/40 border border-white/5 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block">{t.lunarDossier.bearingCapacity}</span>
                  <strong className="text-cyan-300 text-sm tabular-nums ltr-num">{safety.bearing_capacity_kpa} kPa</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block">{t.lunarDossier.wheelSinkage}</span>
                  <strong className="text-white text-sm tabular-nums ltr-num">{safety.wheel_sinkage_cm} {t.common.cm}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block">{t.lunarDossier.dustAbrasion}</span>
                  <strong className={safety.dust_abrasion_risk === 'High' ? 'text-amber-400 text-sm' : 'text-cyan-300 text-sm'}>
                    {t.lunarDossier.dustRisks[safety.dust_abrasion_risk]}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block">{t.lunarDossier.landingEllipse}</span>
                  <strong className="text-white text-xs tabular-nums ltr-num">{safety.landing_ellipse_km}</strong>
                </div>
              </div>
            </div>

            {/* Operational Mitigation Callout */}
            <div className="p-3 rounded border border-amber-500/30 bg-amber-950/25 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono font-bold uppercase text-[10px] text-amber-300 block">
                  {t.lunarDossier.mitigationHeader}{' '}
                  <span className="ltr-num">{safety.comms_latency_s}{t.lunarDossier.lightTimeLabel}</span>
                </span>
                <span className="text-slate-200">{safety.mitigation_protocol}</span>
              </div>
            </div>
          </div>

          {/* Primary Simulants Preview */}
          <div className="p-3.5 rounded bg-[#080e1a]/70 border border-white/10 text-xs font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-slate-300 uppercase text-[11px] font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.lunarDossier.matchedSimulantsTitle}</span>
              </span>
              <span className="text-slate-500">
                {t.lunarDossier.topMatch} <span className="ltr-num">{telemetry.simulants[0]?.simulant}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {telemetry.simulants.map((sim) => (
                <div
                  key={sim.simulant}
                  className="px-2.5 py-1.5 rounded bg-black/50 border border-white/10 text-[11px]"
                >
                  <span className="text-white font-bold">{sim.simulant}</span>
                  <span className="text-cyan-400 ms-2 ltr-num">{sim.matchPct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#080e1a]/95 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>
              {t.lunarDossier.footerLabel} · <span className="ltr-num">{outpost.region_id}</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded font-heading font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-[#030712] transition-colors cursor-pointer"
          >
            {t.lunarDossier.closeDossier}
          </button>
        </div>
      </div>
    </div>
  );
};

