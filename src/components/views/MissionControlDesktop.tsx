import React, { useMemo, useState } from 'react';
import {
  Region,
  MissionProfile,
  AnalysisResponse,
  AnalogResult,
  ApiConnectionStatus,
} from '../../lib/types';
import { EARTH_ANALOGS } from '../../lib/data';
import { useLanguage } from '../../lib/LanguageContext';
import { GlobeHUD } from '../GlobeHUD';
import { TelemetryDeltaCards } from '../TelemetryDeltaCards';
import { ResultCard } from '../ResultCard';
import { AlertCircle, RefreshCw, ShieldAlert, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface MissionControlDesktopProps {
  analysis: AnalysisResponse;
  marsRegions: Region[];
  missions: MissionProfile[];
  selectedMarsRegion: Region;
  selectedMission: MissionProfile;
  onSelectMarsRegion: (region: Region) => void;
  onSelectMission: (mission: MissionProfile) => void;
  onSelectDetail: (result: AnalogResult) => void;
  onViewSpectral: (result: AnalogResult) => void;
  onViewRegolith: (result: AnalogResult) => void;
  earthScope: string;
  onSelectEarthScope: (scope: string) => void;
  topK: number;
  onSelectTopK: (k: number) => void;
  onlyRanked: boolean;
  onSelectOnlyRanked: (val: boolean) => void;
  apiStatus: ApiConnectionStatus;
  apiError: string | null;
  isLoadingAnalysis: boolean;
  isReloadingBackend?: boolean;
  onRetryApi: () => void;
  onReloadBackend: () => void;
}

export const MissionControlDesktop: React.FC<MissionControlDesktopProps> = ({
  analysis,
  marsRegions,
  missions,
  selectedMarsRegion,
  selectedMission,
  onSelectMarsRegion,
  onSelectMission,
  onSelectDetail,
  onViewSpectral,
  onViewRegolith,
  earthScope,
  onSelectEarthScope,
  topK,
  onSelectTopK,
  onlyRanked,
  onSelectOnlyRanked,
  apiStatus,
  apiError,
  isLoadingAnalysis,
  isReloadingBackend = false,
  onRetryApi,
  onReloadBackend,
}) => {
  const { t } = useLanguage();
  const [activeGlobePlanet, setActiveGlobePlanet] = useState<'Mars' | 'Earth'>('Mars');
  const [showExcluded, setShowExcluded] = useState(false);
  const [showLimits, setShowLimits] = useState(false);

  const topResult = analysis.results[0];
  const localizedMission = t.desktop.missions[selectedMission.id] || {
    label: selectedMission.label,
    description: selectedMission.description,
  };

  // Map live Earth analog results onto Region markers for the Earth GlobeHUD view
  const liveEarthRegions: Region[] = useMemo(() => {
    if (!analysis.results.length) return EARTH_ANALOGS;
    return analysis.results.map((r) => ({
      region_id: r.region_id,
      name: r.name,
      planet: 'Earth',
      country: r.country,
      center: r.center,
      bbox: r.bbox,
      window_km: 50.9,
      thumbnail_url: r.thumbnail_url,
      datasets: ['SRTMGL1', 'EMIT'],
      topography: {
        elevation_m: 0,
        slope_p90_deg: r.live?.slope_p90_deg ?? 0,
        tri_mean_m: 0,
        roughness_cm: 0,
      },
    }));
  }, [analysis.results]);

  const backendLimits = analysis.limits && analysis.limits.length > 0 ? analysis.limits : null;

  return (
    <div className="space-y-6">
      {/* Live API Connection Fallback Notice (shown only when backend URL is offline / unreachable) */}
      {apiStatus === 'offline' && (
        <div className="rounded-md border border-rose-500/35 bg-rose-950/25 backdrop-blur-md p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-rose-200">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-300">{t.api.offlineBannerTitle}</strong>{' '}
              <span>{t.api.offlineBannerBody}</span>
              {apiError && (
                <div className="text-[11px] text-rose-300/80 mt-0.5 ltr-num">
                  [{apiError}]
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onRetryApi}
            className="px-3 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.api.retryConnection}</span>
          </button>
        </div>
      )}

      {/* Global Warning, Method Limits & Harmonization Banner */}
      <div className="rounded-md border border-amber-500/30 bg-amber-950/20 backdrop-blur-md p-3.5 space-y-2.5 text-xs font-mono text-amber-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>{t.desktop.harmonizationTitle}</strong> {t.desktop.harmonizationText}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-amber-300">
            <span>
              {t.desktop.methodLabel} <span className="ltr-num">{analysis.method.normalization}</span>
            </span>
            <span>·</span>
            <span>
              {t.desktop.thresholdLabel} <span className="ltr-num">{analysis.method.good_distance}</span>
            </span>
            <span>·</span>
            <span className="ltr-num">v{analysis.method.version}</span>
            {backendLimits && (
              <>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setShowLimits(!showLimits)}
                  className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
                >
                  <span>{showLimits ? t.api.hideLimits : t.api.showLimits}</span>
                  {showLimits ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </>
            )}
            {apiStatus === 'connected' && (
              <button
                type="button"
                onClick={onReloadBackend}
                disabled={isReloadingBackend}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/35 text-cyan-300 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isReloadingBackend ? 'animate-spin' : ''}`} />
                <span>{isReloadingBackend ? t.api.reloadingBackend : t.api.reloadBackend}</span>
              </button>
            )}
          </div>
        </div>

        {showLimits && backendLimits && (
          <div className="pt-2.5 border-t border-amber-500/20 space-y-1 text-[11px] text-amber-100/90">
            <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
              {t.api.methodLimitsTitle}
            </div>
            <ul className="list-disc ps-5 space-y-1 ltr-num">
              {backendLimits.map((lim, i) => (
                <li key={i}>{lim}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Control Strip: Mars Target Region & Mission Profile Selectors */}
      <div className="p-4 rounded-md border border-white/10 bg-[#0e131f]/85 backdrop-blur-md grid grid-cols-1 lg:grid-cols-12 gap-4 items-center transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
        {/* Mars Region Selector */}
        <div className="lg:col-span-4">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-cyan-400 mb-1.5">
            {t.desktop.targetMarsRegionLabel}
          </label>
          <div className="relative">
            <select
              value={selectedMarsRegion.region_id}
              onChange={(e) => {
                const reg = marsRegions.find((r) => r.region_id === e.target.value);
                if (reg) onSelectMarsRegion(reg);
              }}
              className="w-full bg-[#080e1a] border border-white/15 focus:border-cyan-400 text-slate-100 rounded px-3 py-2 text-xs font-mono outline-none cursor-pointer"
            >
              {marsRegions.map((r) => (
                <option key={r.region_id} value={r.region_id}>
                  {r.name} ({r.center.lat.toFixed(2)}°, {r.center.lon.toFixed(2)}°)
                </option>
              ))}
            </select>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center justify-between gap-2">
            <span className="truncate">
              {t.common.datasets}: <span className="ltr-num">{selectedMarsRegion.datasets.join(', ')}</span>
            </span>
            <span className="shrink-0">
              {t.common.window}: <span className="ltr-num">{selectedMarsRegion.window_km ?? 51} {t.common.km}</span>
            </span>
          </div>
        </div>

        {/* Mission Profile Selector */}
        <div className="lg:col-span-4">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-amber-400 mb-1.5">
            {t.desktop.missionObjectiveLabel}
          </label>
          <div className="relative">
            <select
              value={selectedMission.id}
              onChange={(e) => {
                const m = missions.find((item) => item.id === e.target.value);
                if (m) onSelectMission(m);
              }}
              className="w-full bg-[#080e1a] border border-white/15 focus:border-amber-400 text-slate-100 rounded px-3 py-2 text-xs font-mono outline-none cursor-pointer"
            >
              {missions.map((m) => {
                const mLoc = t.desktop.missions[m.id];
                const supportedOnSite =
                  !selectedMarsRegion.live?.missions?.length ||
                  selectedMarsRegion.live.missions.includes(m.id);
                return (
                  <option key={m.id} value={m.id} disabled={!m.available}>
                    {mLoc ? mLoc.label : m.label}{' '}
                    {!m.available ? t.desktop.awaitingDataset : !supportedOnSite ? '(no rows)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-1 truncate">
            {localizedMission.description}
          </p>
        </div>

        {/* Earth Scope, EMIT Only-Ranked & Top K Filter Buttons */}
        <div className="lg:col-span-4 flex flex-wrap items-center gap-2 justify-end">
          <div className="text-end">
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              {t.api.onlyRankedLabel}
            </label>
            <div className="flex items-center gap-1 bg-[#080e1a] p-1 rounded border border-white/10">
              <button
                type="button"
                onClick={() => onSelectOnlyRanked(false)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors cursor-pointer ${
                  !onlyRanked
                    ? 'bg-cyan-500 text-[#030712] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.api.onlyRankedAll}
              </button>
              <button
                type="button"
                onClick={() => onSelectOnlyRanked(true)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors cursor-pointer ${
                  onlyRanked
                    ? 'bg-cyan-500 text-[#030712] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.api.onlyRankedEmit}
              </button>
            </div>
          </div>

          <div className="text-end">
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              {t.desktop.earthFilterLabel}
            </label>
            <div className="flex items-center gap-1 bg-[#080e1a] p-1 rounded border border-white/10">
              {['all', 'CL', 'US', 'TR'].map((sc) => (
                <button
                  key={sc}
                  type="button"
                  onClick={() => onSelectEarthScope(sc)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors cursor-pointer ${
                    earthScope === sc
                      ? 'bg-cyan-500 text-[#030712] font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sc === 'all' ? t.common.all : sc}
                </button>
              ))}
            </div>
          </div>

          <div className="text-end">
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              {t.desktop.topKLabel}
            </label>
            <div className="flex items-center gap-1 bg-[#080e1a] p-1 rounded border border-white/10">
              {[4, 8, 12].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => onSelectTopK(k)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ltr-num ${
                    topK === k
                      ? 'bg-cyan-500 text-[#030712] font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Split View: Left Telemetry Stage + Right Analog Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-4">
          {/* Globe Viewport Header & Planet Switcher */}
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-300">
              {t.desktop.orbitalSensorProber}
            </div>
            <div className="flex items-center gap-1 bg-[#0e131f] p-1 rounded border border-white/10">
              <button
                type="button"
                onClick={() => setActiveGlobePlanet('Mars')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  activeGlobePlanet === 'Mars'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.desktop.marsTargetBtn}
              </button>
              <button
                type="button"
                onClick={() => setActiveGlobePlanet('Earth')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  activeGlobePlanet === 'Earth'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.desktop.earthAnalogsBtn}
              </button>
            </div>
          </div>

          {/* Interactive Globe HUD Canvas */}
          <GlobeHUD
            planet={activeGlobePlanet}
            selectedRegion={
              activeGlobePlanet === 'Mars'
                ? selectedMarsRegion
                : liveEarthRegions[0] || EARTH_ANALOGS[0]
            }
            allRegions={activeGlobePlanet === 'Mars' ? marsRegions : liveEarthRegions}
            onSelectRegion={(reg) => {
              if (reg.planet === 'Mars') {
                onSelectMarsRegion(reg);
              } else {
                const matchedResult = analysis.results.find((r) => r.region_id === reg.region_id);
                if (matchedResult) onSelectDetail(matchedResult);
              }
            }}
            onReset={() => {
              setActiveGlobePlanet('Mars');
              if (marsRegions[0] && selectedMarsRegion.region_id !== marsRegions[0].region_id) {
                onSelectMarsRegion(marsRegions[0]);
              }
            }}
          />

          {/* Telemetry Delta Cards */}
          {topResult && (
            <TelemetryDeltaCards
              marsRegion={selectedMarsRegion}
              topAnalogFactors={topResult.factors}
              distance={topResult.distance}
              confidenceLevel={topResult.confidence.level}
              rankStability={topResult.confidence.rank_stability_pct}
              candidatesCount={analysis.candidates_within_good}
              mineralMatchPct={topResult.live?.mineral_match_pct}
              emitHits={topResult.live?.emit_hits}
              emitTargets={topResult.live?.emit_n_targets}
            />
          )}

          {/* Uniqueness & Geographic Distribution Note */}
          <div className="p-4 rounded-md border border-white/10 bg-[#0e131f]/85 backdrop-blur-md text-xs space-y-2 transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
              <span className="uppercase text-[11px] tracking-wider text-cyan-400 font-bold">
                {t.desktop.uniquenessTitle}
              </span>
              <span className="text-slate-400">
                <strong className="ltr-num">{analysis.candidates_within_good}</strong>{' '}
                {t.desktop.nonOverlappingWindows}{' '}
                <span className="ltr-num">{analysis.method.good_distance}</span>
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              {analysis.candidates_within_good > 5 ? (
                <span>
                  <strong>{t.desktop.manySimilarTitle}</strong> {t.desktop.manySimilarBodyPrefix}{' '}
                  {localizedMission.label} {t.desktop.manySimilarBodySuffix}
                </span>
              ) : (
                <span>
                  <strong>{t.desktop.highUniquenessTitle}</strong> {t.desktop.highUniquenessBody}
                </span>
              )}
            </p>

            {/* Geographic Matches by Area */}
            <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] font-mono">
              {Object.entries(analysis.matches_by_area).map(([area, count]) => (
                <div key={area} className="p-1.5 rounded bg-black/30 flex justify-between gap-2">
                  <span className="text-slate-300 truncate">{t.desktop.areas[area] || area}</span>
                  <span className="text-cyan-400 font-bold shrink-0">
                    <span className="ltr-num">{count}</span>{' '}
                    {count > 1 ? t.desktop.sitePlural : t.desktop.siteSingular}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Ranked Analog Matrix Results */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-semibold text-lg text-white tracking-wide">
                {t.desktop.rankedTerrestrialAnalogs}
              </h2>
              <span className="text-xs font-mono text-cyan-400">
                (<span className="ltr-num">{analysis.results.length}</span>
                {analysis.total_available ? (
                  <span className="ltr-num"> / {analysis.total_available}</span>
                ) : null}{' '}
                {t.desktop.rankedMatchesCount})
              </span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              {t.desktop.targetLabel}{' '}
              <strong className="text-amber-400 ltr-num">{selectedMarsRegion.name}</strong>
            </div>
          </div>

          {/* Loading state */}
          {isLoadingAnalysis && (
            <div className="p-6 rounded-md border border-cyan-500/30 bg-[#0e131f]/75 backdrop-blur-md flex items-center justify-center gap-3 text-xs font-mono text-cyan-300">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>{t.api.loadingMatches}</span>
            </div>
          )}

          {/* Empty state handler */}
          {!isLoadingAnalysis && (analysis.status === 'no_good_analog' || analysis.results.length === 0) ? (
            <div className="p-8 rounded-md border border-dashed border-white/15 bg-[#0e131f]/50 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="font-heading font-semibold text-base text-white">
                {t.desktop.noGoodAnalogTitle}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {t.desktop.noGoodAnalogBodyPrefix}{' '}
                <span className="ltr-num">{selectedMarsRegion.name}</span>.{' '}
                {t.desktop.noGoodAnalogBodySuffix}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analysis.results.map((result) => (
                <ResultCard
                  key={result.region_id}
                  result={result}
                  marsRegion={selectedMarsRegion}
                  onSelectDetail={onSelectDetail}
                  onViewSpectral={onViewSpectral}
                  onViewRegolith={onViewRegolith}
                />
              ))}
            </div>
          )}

          {/* Excluded / Unranked Candidates Section */}
          {analysis.excluded.length > 0 && (
            <div className="rounded-md border border-white/10 bg-[#080e1a]/80 p-3.5 text-xs font-mono transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <button
                type="button"
                onClick={() => setShowExcluded(!showExcluded)}
                className="flex items-center justify-between w-full text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <span>
                  {t.desktop.excludedCandidates} (<span className="ltr-num">{analysis.excluded.length}</span>{' '}
                  {t.desktop.rejectedSites})
                </span>
                <span className="text-[11px] underline">
                  {showExcluded ? t.desktop.hideDetails : t.desktop.showReasons}
                </span>
              </button>

              {showExcluded && (
                <div className="mt-3 space-y-2 pt-2 border-t border-white/5 max-h-72 overflow-y-auto">
                  {analysis.excluded.map((item, idx) => (
                    <div
                      key={`${item.region_id}-${idx}`}
                      className="p-2.5 rounded bg-black/40 border border-white/5 text-[11px] text-slate-300 space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-rose-300 ltr-num">{item.region_id}</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.terrain_rank != null && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 ltr-num">
                              #{item.terrain_rank}
                            </span>
                          )}
                          {item.emit_status && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300">
                              {t.api.emitStatuses[item.emit_status] || item.emit_status}
                            </span>
                          )}
                          {item.slope_p90_deg != null && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-950/50 border border-rose-500/30 text-rose-300 ltr-num">
                              {item.slope_p90_deg}° / ≤ {item.slope_limit_deg ?? 22}°
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-slate-400 ltr-num">
                        {t.desktop.excludedReasons[item.reason] || item.reason}
                      </div>
                      {item.flags && item.flags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {item.flags.map((flag) => (
                            <span
                              key={flag}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400"
                            >
                              {t.api.flagLabels[flag] || flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
