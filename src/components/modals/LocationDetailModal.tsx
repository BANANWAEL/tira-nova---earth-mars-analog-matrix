import React, { useEffect, useState } from 'react';
import { AnalogResult, ApiMatchDetailResponse, Region } from '../../lib/types';
import { getRegionFeatures } from '../../lib/data';
import { useLanguage } from '../../lib/LanguageContext';
import { fetchMatchDetail, mergeMatchDetailIntoResult } from '../../services/api';
import {
  X,
  ExternalLink,
  Download,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';

interface LocationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalogResult | null;
  marsRegion: Region;
  missionId?: string;
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  isOpen,
  onClose,
  result,
  marsRegion,
  missionId,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'features' | 'evidence' | 'json'>('features');
  const [copiedJson, setCopiedJson] = useState(false);
  const [liveDetail, setLiveDetail] = useState<ApiMatchDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !result) {
      setLiveDetail(null);
      return;
    }

    const controller = new AbortController();
    let active = true;
    setLoadingDetail(true);

    fetchMatchDetail(
      result.region_id,
      marsRegion.region_id,
      missionId || result.live?.mission,
      controller.signal
    )
      .then((res) => {
        if (active) setLiveDetail(res);
      })
      .catch(() => {
        if (active) setLiveDetail(null);
      })
      .finally(() => {
        if (active) setLoadingDetail(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [isOpen, result?.region_id, marsRegion.region_id, missionId]);

  if (!isOpen || !result) return null;

  const enrichedResult = liveDetail ? mergeMatchDetailIntoResult(result, liveDetail) : result;

  const marsFeatures = getRegionFeatures(marsRegion.region_id);
  const earthFeatures = getRegionFeatures(enrichedResult.region_id);

  const featureRows =
    enrichedResult.factors.length > 0
      ? enrichedResult.factors.map((f) => ({
          name: t.resultCard.factorLabels[f.feature] || f.label,
          mars: f.mars_value,
          earth: f.earth_value,
          unit: f.unit,
          note: `${f.group || 'harmonized'} · ${f.coverage_pct}% cov`,
        }))
      : [
          {
            name: t.locationDetail.featureRows.elevation.name,
            mars: marsFeatures.elevation_m,
            earth: earthFeatures.elevation_m,
            unit: t.common.m,
            note: t.locationDetail.featureRows.elevation.note,
          },
          {
            name: t.locationDetail.featureRows.slope.name,
            mars: marsFeatures.slope_p90_deg,
            earth: earthFeatures.slope_p90_deg,
            unit: t.common.deg,
            note: t.locationDetail.featureRows.slope.note,
          },
          {
            name: t.locationDetail.featureRows.tri.name,
            mars: marsFeatures.tri_mean_m,
            earth: earthFeatures.tri_mean_m,
            unit: t.common.m,
            note: t.locationDetail.featureRows.tri.note,
          },
        ];

  const jsonPayload = liveDetail || enrichedResult;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonPayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(jsonPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tira_nova_${marsRegion.region_id}__${enrichedResult.region_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl hud-fade-in">
      <div className="hud-modal-in relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-lg border border-cyan-500/30 bg-[#0e131f]/95 shadow-[0_0_40px_rgba(6,182,212,0.25)] overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#080e1a]/95">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 font-mono font-bold text-sm flex items-center justify-center ltr-num">
              #{enrichedResult.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-lg text-white tracking-wide">
                  {enrichedResult.name}
                </h2>
                {enrichedResult.country && (
                  <span className="text-xs font-mono text-slate-400">· {enrichedResult.country}</span>
                )}
                {loadingDetail && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
              </div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">
                {t.locationDetail.analogMatchFor} <strong className="text-amber-400">{marsRegion.name}</strong> ·{' '}
                {t.locationDetail.distanceLabel} <strong className="text-cyan-400 ltr-num">{enrichedResult.distance.toFixed(3)}</strong>
                {enrichedResult.live?.mineral_match_pct != null && (
                  <>
                    {' '}· {t.api.mineralMatchLabel}{' '}
                    <strong className="text-emerald-300 ltr-num">{enrichedResult.live.mineral_match_pct}%</strong>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="p-1.5 rounded text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1 text-xs font-mono cursor-pointer"
              title={t.locationDetail.exportJson}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.locationDetail.exportJson}</span>
            </button>
            <button
              onClick={onClose}
              aria-label={t.common.close}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="px-5 py-2.5 border-b border-white/10 bg-[#080e1a]/60 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'features'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.locationDetail.tabs.features}
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'evidence'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.locationDetail.tabs.evidence} (<span className="ltr-num">{enrichedResult.evidence.length}</span>)
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'json'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.locationDetail.tabs.json}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {activeTab === 'features' && (
            <div className="space-y-4">
              {/* Geolocation Bounding Box Header */}
              <div className="p-3.5 rounded bg-black/40 border border-white/10 text-xs font-mono grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-amber-400 font-bold block mb-1">
                    {t.locationDetail.marsWindowBadge} {marsRegion.name}
                  </span>
                  <div className="text-slate-400">
                    {t.locationDetail.centerLabel}{' '}
                    <span className="ltr-num">
                      {marsRegion.center.lat.toFixed(2)}°, {marsRegion.center.lon.toFixed(2)}°
                    </span>
                  </div>
                  <div className="text-slate-400">
                    {t.locationDetail.bboxLabel}{' '}
                    <span className="ltr-num">[{marsRegion.bbox.map((n) => n.toFixed(2)).join(', ')}]</span>
                  </div>
                  <div className="text-slate-500 text-[10px] mt-1">
                    {t.locationDetail.harmonizedMars}
                  </div>
                </div>

                <div>
                  <span className="text-cyan-400 font-bold block mb-1">
                    {t.locationDetail.earthWindowBadge} {enrichedResult.name}
                  </span>
                  <div className="text-slate-400">
                    {t.locationDetail.centerLabel}{' '}
                    <span className="ltr-num">
                      {enrichedResult.center.lat.toFixed(2)}°, {enrichedResult.center.lon.toFixed(2)}°
                    </span>
                  </div>
                  <div className="text-slate-400">
                    {t.locationDetail.bboxLabel}{' '}
                    <span className="ltr-num">[{enrichedResult.bbox.map((n) => n.toFixed(2)).join(', ')}]</span>
                  </div>
                  <div className="text-slate-500 text-[10px] mt-1">
                    {t.locationDetail.harmonizedEarth}
                  </div>
                </div>
              </div>

              {/* Side-by-Side Features Table */}
              <div className="p-4 rounded-md border border-white/10 bg-[#080e1a]/80 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-white font-semibold">
                    {t.locationDetail.sideBySideTitle}
                  </span>
                  <span className="text-slate-500">{t.locationDetail.unitAccurate}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-start text-slate-400 text-[10px] uppercase">
                        <th className="pb-2 text-start">{t.locationDetail.tableHeaders.featureName}</th>
                        <th className="pb-2 text-amber-400 text-start">
                          {t.locationDetail.tableHeaders.marsCol} ({marsRegion.name.split(' ')[0]})
                        </th>
                        <th className="pb-2 text-cyan-400 text-start">
                          {t.locationDetail.tableHeaders.earthCol} ({enrichedResult.name.split(' ')[0]})
                        </th>
                        <th className="pb-2 text-start">{t.locationDetail.tableHeaders.notesCol}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {featureRows.map((row) => (
                        <tr key={row.name} className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 text-slate-300 font-medium text-start">{row.name}</td>
                          <td className="py-2.5 font-bold text-white tabular-nums ltr-num text-start">
                            {row.mars !== null ? `${row.mars} ${row.unit}` : t.common.noData}
                          </td>
                          <td className="py-2.5 font-bold text-cyan-300 tabular-nums ltr-num text-start">
                            {row.earth !== null ? `${row.earth} ${row.unit}` : t.common.noData}
                          </td>
                          <td className="py-2.5 text-[11px] text-slate-400 text-start">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cross-Mission Live Comparison Table (from /api/matches/{earth_id}) */}
              {liveDetail?.all_missions && liveDetail.all_missions.length > 0 && (
                <div className="p-4 rounded-md border border-cyan-500/25 bg-[#080e1a]/80 space-y-2">
                  <div className="text-xs font-mono font-semibold text-cyan-300">
                    {t.api.crossMissionTitle}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-white/10 text-start text-slate-400 text-[10px] uppercase">
                          <th className="pb-2 text-start">Mission</th>
                          <th className="pb-2 text-start">{t.api.terrainRankLabel}</th>
                          <th className="pb-2 text-start">{t.api.finalRankLabel}</th>
                          <th className="pb-2 text-start">{t.locationDetail.distanceLabel}</th>
                          <th className="pb-2 text-start">EMIT Status</th>
                          <th className="pb-2 text-end">{t.api.combinedScoreLabel}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {liveDetail.all_missions.map((m) => (
                          <tr key={m.mission} className="hover:bg-white/5">
                            <td className="py-2 text-white font-semibold ltr-num">{m.mission}</td>
                            <td className="py-2 text-slate-300 ltr-num">#{m.rank}</td>
                            <td className="py-2 text-cyan-300 ltr-num">{m.final_rank != null ? `#${m.final_rank}` : '—'}</td>
                            <td className="py-2 text-slate-300 ltr-num">{Number(m.distance).toFixed(3)}</td>
                            <td className="py-2 text-amber-300">{t.api.emitStatuses[m.emit_status] || m.emit_status}</td>
                            <td className="py-2 text-end text-emerald-300 font-bold ltr-num">
                              {m.combined_score != null ? `${(m.combined_score * 100).toFixed(0)}%` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Confidence Stability Card */}
              <div className="p-4 rounded-md border border-white/10 bg-[#080e1a]/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">
                    {t.locationDetail.rankStabilityTitle}
                  </span>
                  <div className="text-xl font-bold text-white mt-1 tabular-nums ltr-num">
                    {enrichedResult.confidence.rank_stability_pct}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {t.locationDetail.rankStabilitySub}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">
                    {t.locationDetail.distanceLimitTitle}
                  </span>
                  <div className="text-xl font-bold text-cyan-400 mt-1 tabular-nums ltr-num">
                    {enrichedResult.confidence.distance_vs_good}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {t.locationDetail.distanceLimitSub}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">
                    {t.locationDetail.windowCoverageTitle}
                  </span>
                  <div className="text-xl font-bold text-emerald-400 mt-1 tabular-nums ltr-num">
                    {enrichedResult.confidence.coverage_pct}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {t.locationDetail.windowCoverageSub}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400">
                {t.locationDetail.evidenceIntro}
              </div>
              {enrichedResult.evidence.length === 0 ? (
                <div className="p-6 rounded border border-dashed border-white/15 text-center text-xs font-mono text-slate-400">
                  No engine evidence citations attached for this row in the active backend subset.
                </div>
              ) : (
                enrichedResult.evidence.map((item) => (
                  <div
                    key={item.doc_id}
                    className="p-4 rounded-md bg-[#080e1a] border border-white/10 text-xs space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-heading font-semibold text-white text-sm">
                        {item.title} (<span className="ltr-num">{item.year}</span>)
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          item.supports === 'similarity'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {t.resultCard.supports[item.supports]}
                      </span>
                    </div>
                    {item.authors && (
                      <div className="text-[11px] font-mono text-slate-400">
                        {item.authors} · {item.journal}
                      </div>
                    )}
                    <p className="text-slate-300 italic text-xs border-s-2 border-cyan-400 ps-3 py-1 bg-black/20 rounded-e">
                      "{item.snippet}"
                    </p>
                    <div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:underline"
                      >
                        <span>{t.locationDetail.openDoi}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-slate-400">
                  {t.locationDetail.rawJsonDesc}
                </span>
                <button
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? t.locationDetail.copied : t.locationDetail.copyJson}</span>
                </button>
              </div>
              <pre
                dir="ltr"
                className="p-4 rounded-md bg-[#080e1a] border border-white/10 text-xs font-mono text-cyan-300 overflow-x-auto max-h-96 text-start"
              >
                {JSON.stringify(jsonPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#080e1a]/95 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>{t.locationDetail.footerEngine}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded font-heading font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-[#030712] transition-colors cursor-pointer"
          >
            {t.common.done}
          </button>
        </div>
      </div>
    </div>
  );
};
