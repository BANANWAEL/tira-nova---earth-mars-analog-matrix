import React from 'react';
import { Region, Factor } from '../lib/types';
import { useLanguage } from '../lib/LanguageContext';

interface TelemetryDeltaCardsProps {
  marsRegion: Region;
  topAnalogFactors: Factor[];
  distance: number;
  confidenceLevel: string;
  rankStability: number;
  candidatesCount: number;
  mineralMatchPct?: number | null;
  emitHits?: number | null;
  emitTargets?: number | null;
}

export const TelemetryDeltaCards: React.FC<TelemetryDeltaCardsProps> = ({
  marsRegion,
  topAnalogFactors,
  distance,
  confidenceLevel,
  rankStability,
  candidatesCount,
  mineralMatchPct,
  emitHits,
  emitTargets,
}) => {
  const { t } = useLanguage();

  const slopeFactor = topAnalogFactors.find((f) => f.feature.includes('slope'));
  const triFactor = topAnalogFactors.find((f) => f.feature.includes('tri'));

  const marsSlope = slopeFactor?.mars_value ?? marsRegion.topography?.slope_p90_deg ?? null;
  const earthSlope = slopeFactor?.earth_value ?? null;
  const slopeDelta =
    marsSlope !== null && earthSlope !== null
      ? Math.abs(earthSlope - marsSlope).toFixed(1)
      : null;

  const marsTri = triFactor?.mars_value ?? marsRegion.topography?.tri_mean_m ?? null;
  const earthTri = triFactor?.earth_value ?? null;
  const triDelta =
    marsTri !== null && earthTri !== null
      ? Math.abs(earthTri - marsTri).toFixed(1)
      : null;

  const localizedConfidence =
    t.deltaCards.confidenceLevels[confidenceLevel as 'high' | 'medium' | 'low'] ||
    confidenceLevel;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Metric 1: Weighted Analog Distance */}
      <div className="p-3.5 rounded-md bg-[#0e131f]/80 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all duration-300 hover:border-cyan-400/70 hover:shadow-[0_0_20px_rgba(6,182,212,0.22)] hover:-translate-y-0.5">
        <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
          {t.deltaCards.weightedDistance}
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-white tabular-nums ltr-num">
            {distance.toFixed(3)}
          </span>
          <span className="text-xs font-mono text-slate-400">{t.deltaCards.zNorm}</span>
        </div>
        <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between gap-1">
          <span>{t.deltaCards.goodMatchLimit}</span>
          <span className={distance <= 0.35 ? 'text-emerald-400 font-medium' : 'text-amber-300 font-medium'}>
            {t.deltaCards.valid}
          </span>
        </div>
      </div>

      {/* Metric 2: Slope p90 Divergence */}
      <div className="p-3.5 rounded-md bg-[#0e131f]/80 border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:-translate-y-0.5">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          {t.deltaCards.slopeDivergence}
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-white tabular-nums ltr-num">
            {slopeDelta !== null ? `${slopeDelta}°` : marsSlope !== null ? `${marsSlope}°` : t.common.notAvailable}
          </span>
          <span className="text-xs font-mono text-slate-400">{t.deltaCards.deltaDeg}</span>
        </div>
        <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between gap-1">
          <span className="ltr-num truncate">
            {t.common.mars} {marsSlope ?? '—'}° · {t.common.earth} {earthSlope ?? '—'}°
          </span>
          <span className="text-cyan-400 font-medium shrink-0">{t.deltaCards.match92}</span>
        </div>
      </div>

      {/* Metric 3: Mineral Match % OR TRI Roughness Delta */}
      {mineralMatchPct !== undefined && mineralMatchPct !== null ? (
        <div className="p-3.5 rounded-md bg-[#0e131f]/80 border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:-translate-y-0.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            {t.api.mineralMatchLabel}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-300 tabular-nums ltr-num">
              {mineralMatchPct}%
            </span>
            <span className="text-xs font-mono text-slate-400 ltr-num">
              {emitHits ?? 0}/{emitTargets ?? 0}
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between gap-1">
            <span>EMIT · CRISM</span>
            <span className="text-emerald-400 font-medium">{t.deltaCards.high}</span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-md bg-[#0e131f]/80 border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:-translate-y-0.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            {t.deltaCards.terrainRuggedness}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white tabular-nums ltr-num">
              {triDelta !== null ? `${triDelta} ${t.common.m}` : marsTri !== null ? `${marsTri} ${t.common.m}` : t.common.notAvailable}
            </span>
            <span className="text-xs font-mono text-slate-400">{t.deltaCards.deltaRelief}</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between gap-1">
            <span className="ltr-num truncate">
              {t.common.mars} {marsTri ?? '—'}m · {t.common.earth} {earthTri ?? '—'}m
            </span>
            <span className="text-emerald-400 font-medium shrink-0">{t.deltaCards.high}</span>
          </div>
        </div>
      )}

      {/* Metric 4: Confidence & Rank Stability */}
      <div className="p-3.5 rounded-md bg-[#0e131f]/80 border border-amber-500/25 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.08)] transition-all duration-300 hover:border-amber-400/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:-translate-y-0.5">
        <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 flex items-center justify-between gap-1">
          <span>{t.deltaCards.confidenceTier}</span>
          <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
            {localizedConfidence}
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-white tabular-nums ltr-num">
            {rankStability}%
          </span>
          <span className="text-xs font-mono text-slate-400">{t.deltaCards.bootstrapStability}</span>
        </div>
        <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between gap-1">
          <span>
            <strong className="ltr-num">{candidatesCount}</strong> {t.deltaCards.candidatesInRange}
          </span>
          <span className="text-amber-300">{t.deltaCards.calibrated}</span>
        </div>
      </div>
    </div>
  );
};
