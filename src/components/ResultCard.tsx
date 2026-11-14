import React, { useState } from 'react';
import { AnalogResult, Region } from '../lib/types';
import { useLanguage } from '../lib/LanguageContext';
import { ChevronDown, ChevronUp, ExternalLink, AlertTriangle, BookOpen } from 'lucide-react';

interface ResultCardProps {
  result: AnalogResult;
  marsRegion: Region;
  onSelectDetail: (result: AnalogResult) => void;
  onViewSpectral?: (result: AnalogResult) => void;
  onViewRegolith?: (result: AnalogResult) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onSelectDetail,
  onViewSpectral,
  onViewRegolith,
}) => {
  const { t } = useLanguage();
  const [showEvidence, setShowEvidence] = useState(false);
  const [showFactors, setShowFactors] = useState(true);

  const confidenceColor = {
    high: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
    medium: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    low: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
  }[result.confidence.level];

  const localizedConfidence =
    t.deltaCards.confidenceLevels[result.confidence.level] || result.confidence.level;

  const live = result.live;
  const emitStatus = live?.emit_status;
  const mineralMatchPct =
    live?.mineral_match_pct ??
    (live?.emit_n_targets && live.emit_n_targets > 0 && live.emit_hits != null
      ? Math.round((live.emit_hits / live.emit_n_targets) * 100)
      : null);

  const slopeFactor = result.factors.find((f) => f.feature.includes('slope'));
  const slopeVal = live?.slope_p90_deg ?? slopeFactor?.earth_value ?? null;
  const slopeLimit = live?.slope_limit_deg ?? 22;
  const slopeExceeds = slopeVal !== null && slopeVal > slopeLimit;

  const emitBadgeClass =
    emitStatus === 'ok'
      ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
      : emitStatus === 'no_target_mineral' || emitStatus === 'low_coverage'
      ? 'border-amber-500/40 bg-amber-950/40 text-amber-300'
      : 'border-slate-500/40 bg-slate-900/60 text-slate-300';

  return (
    <div className="rounded-md border border-white/10 bg-[#0e131f]/85 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_22px_rgba(6,182,212,0.2)]">
      {/* Card Header Bar */}
      <div
        onClick={() => onSelectDetail(result)}
        className="p-4 bg-[#080e1a]/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 cursor-pointer group hover:bg-[#0b1324]/90 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Rank Badge */}
          <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 font-mono font-bold text-sm flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_14px_rgba(6,182,212,0.35)] transition-shadow ltr-num">
            #{result.rank}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading font-semibold text-base text-white tracking-wide group-hover:text-cyan-300 transition-colors">
                {result.name}
              </h3>
              {result.country && (
                <span className="text-xs font-mono text-slate-400">
                  · {result.country}
                </span>
              )}
              {emitStatus && (
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border font-bold ${emitBadgeClass}`}>
                  {t.api.emitStatuses[emitStatus] || emitStatus}
                </span>
              )}
            </div>
            <div className="text-xs font-mono text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
              <span>
                {t.resultCard.coordinates}{' '}
                <span className="ltr-num">
                  {result.center.lat.toFixed(2)}°, {result.center.lon.toFixed(2)}°
                </span>
              </span>
              <span>·</span>
              <span className="text-cyan-400 ltr-num">SRTMGL1 + EMIT</span>
              {live?.terrain_rank != null && (
                <>
                  <span>·</span>
                  <span className="text-slate-300 ltr-num">
                    {t.api.terrainRankLabel}: #{live.terrain_rank}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Distance, Mineral Match & Confidence Metric Cluster */}
        <div className="flex flex-wrap items-center gap-3">
          {mineralMatchPct !== null && (
            <div className="text-end pe-3 border-e border-white/10">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {t.api.mineralMatchLabel}
              </div>
              <div className="text-sm font-mono font-bold text-emerald-300 tabular-nums ltr-num">
                {mineralMatchPct}% ({live?.emit_hits}/{live?.emit_n_targets})
              </div>
            </div>
          )}

          {live?.combined_score != null && (
            <div className="text-end pe-3 border-e border-white/10 hidden sm:block">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {t.api.combinedScoreLabel}
              </div>
              <div className="text-sm font-mono font-bold text-amber-300 tabular-nums ltr-num">
                {(live.combined_score * 100).toFixed(0)}%
              </div>
            </div>
          )}

          <div className="text-end">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              {t.resultCard.analogDistance}
            </div>
            <div className="text-lg font-mono font-bold text-cyan-300 tabular-nums ltr-num">
              {result.distance.toFixed(3)}
            </div>
          </div>

          <div className="text-end ps-3 border-s border-white/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              {t.resultCard.confidence}
            </div>
            <div className={`text-xs font-mono uppercase font-bold px-2 py-0.5 rounded border mt-0.5 ${confidenceColor}`}>
              {localizedConfidence}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Live Telemetry Highlights: Slope Limit + Caution Flags */}
        {(slopeVal !== null || (live?.flags && live.flags.length > 0)) && (
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
            {slopeVal !== null && (
              <span
                className={`px-2 py-1 rounded border font-semibold ltr-num ${
                  slopeExceeds
                    ? 'border-rose-500/40 bg-rose-950/40 text-rose-300'
                    : 'border-cyan-500/30 bg-cyan-950/30 text-cyan-300'
                }`}
              >
                {t.api.slopeLimitLabel}: {slopeVal.toFixed(1)}° / ≤ {slopeLimit}° (
                {slopeExceeds ? t.api.slopeExceedsLimit : t.api.slopeWithinLimit})
              </span>
            )}
            {live?.flags?.map((flag) => (
              <span
                key={flag}
                className="px-2 py-1 rounded border border-amber-500/30 bg-amber-950/30 text-amber-300"
              >
                {t.api.flagLabels[flag] || flag}
              </span>
            ))}
          </div>
        )}

        {/* Explanation Text from Supervisor Engine */}
        <div className="text-xs text-slate-300 leading-relaxed bg-[#080e1a]/50 p-3 rounded border border-white/5 font-sans">
          {result.explanation}
        </div>

        {/* Factors Breakdown Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowFactors(!showFactors)}
              className="flex items-center gap-1.5 text-xs font-heading font-semibold text-slate-300 hover:text-cyan-400 transition-colors uppercase tracking-wider cursor-pointer"
            >
              <span>{t.resultCard.factorBreakdown}</span>
              {showFactors ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[11px] font-mono text-slate-400">
              {t.resultCard.contributionHint}
            </span>
          </div>

          {showFactors && (
            <div className="space-y-2.5 pt-1">
              {result.factors.map((factor) => {
                const isUnknown = factor.verdict === 'unknown';
                const isSimilar = factor.verdict === 'similar';
                const factorLabel = t.resultCard.factorLabels[factor.feature] || factor.label;
                const verdictLabel = t.resultCard.verdicts[factor.verdict] || factor.verdict;

                return (
                  <div key={factor.feature} className="p-2.5 rounded bg-black/30 border border-white/5 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono mb-1.5">
                      <span className="text-slate-300 font-medium">{factorLabel}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-400">
                          {t.common.mars}:{' '}
                          <strong className="text-amber-400 ltr-num">
                            {factor.mars_value !== null ? `${factor.mars_value} ${factor.unit}` : t.common.noData}
                          </strong>
                        </span>
                        <span className="text-slate-500">{t.common.vs}</span>
                        <span className="text-slate-400">
                          {t.common.earth}:{' '}
                          <strong className="text-cyan-400 ltr-num">
                            {factor.earth_value !== null ? `${factor.earth_value} ${factor.unit}` : t.common.noData}
                          </strong>
                        </span>
                        <span
                          className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ${
                            isSimilar
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                              : isUnknown
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {verdictLabel}
                        </span>
                      </div>
                    </div>

                    {/* Factor Bar sized by contribution */}
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden flex">
                      {!isUnknown && (
                        <div
                          className={`h-full rounded-full transition-all ${
                            isSimilar ? 'bg-cyan-500/60' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, factor.contribution * 100)}%` }}
                        />
                      )}
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-1">
                      <span>
                        {t.resultCard.weight} <span className="ltr-num">{(factor.weight * 100).toFixed(0)}%</span>
                      </span>
                      <span>
                        {t.resultCard.coverage} <span className="ltr-num">{factor.coverage_pct}%</span>
                      </span>
                      <span>
                        {t.resultCard.contribution} <span className="ltr-num">{(factor.contribution * 100).toFixed(0)}%</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Warnings Strip (Always visible, never collapsed) */}
        {result.warnings.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {result.warnings.map((w, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded text-xs font-mono flex items-start gap-2 border ${
                  w.severity === 'warn'
                    ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                    : 'bg-cyan-950/30 border-cyan-500/20 text-cyan-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] me-1.5 ltr-num">
                    [{w.code}]:
                  </span>
                  <span>{t.resultCard.warningTexts[w.code] || w.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Features Missing / Not Compared List */}
        {result.confidence.features_missing.length > 0 && (
          <div className="text-[11px] font-mono text-slate-400 bg-white/5 p-2 rounded flex flex-wrap items-center justify-between gap-2">
            <span>{t.resultCard.featuresNotCompared}</span>
            <span className="text-amber-300 font-medium ltr-num">
              {result.confidence.features_missing.join(', ')}
            </span>
          </div>
        )}

        {/* Evidence Drawer Toggle */}
        <div className="border-t border-white/10 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="flex items-center gap-1.5 text-xs font-heading font-semibold text-slate-300 hover:text-cyan-400 transition-colors uppercase tracking-wider cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {t.resultCard.scientificEvidence} (<span className="ltr-num">{result.evidence.length}</span> {t.resultCard.papers})
              </span>
              {showEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {onViewSpectral && (
                <button
                  onClick={() => onViewSpectral(result)}
                  className="px-2 py-1 rounded text-[11px] font-mono text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 border border-cyan-500/30 transition-colors cursor-pointer"
                >
                  {t.resultCard.spectralBands}
                </button>
              )}
              {onViewRegolith && (
                <button
                  onClick={() => onViewRegolith(result)}
                  className="px-2 py-1 rounded text-[11px] font-mono text-amber-300 hover:text-amber-200 bg-amber-950/40 border border-amber-500/30 transition-colors cursor-pointer"
                >
                  {t.resultCard.regolithData}
                </button>
              )}
              <button
                onClick={() => onSelectDetail(result)}
                className="px-3 py-1 rounded text-xs font-heading font-bold text-[#030712] bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{t.resultCard.fullDetail}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Grouped Evidence Passages */}
          {showEvidence && (
            <div className="mt-3 space-y-2">
              {result.evidence.map((item) => (
                <div
                  key={item.doc_id}
                  className="p-3 rounded bg-[#080e1a] border border-white/10 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-200 font-heading ltr-num text-start">
                      {item.title} ({item.year})
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        item.supports === 'similarity'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : item.supports === 'limitation'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {t.resultCard.supports[item.supports] || item.supports}
                    </span>
                  </div>
                  {item.authors && (
                    <div className="text-[11px] font-mono text-slate-400 ltr-num text-start">
                      {item.authors} · {item.journal}{' '}
                      {item.page ? `· ${t.resultCard.page} ${item.page}` : ''}
                    </div>
                  )}
                  <p className="text-slate-300 italic text-[11px] border-s-2 border-cyan-500/40 ps-2 py-0.5 ltr-num text-start">
                    "{item.snippet}"
                  </p>
                  <div className="pt-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:underline"
                    >
                      <span>{t.resultCard.readPublicationSource}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
