import React, { useEffect, useState } from 'react';
import { SPECTRAL_TWINS_DATA } from '../../lib/data';
import { AnalogResult, ApiEvidenceResponse } from '../../lib/types';
import { useLanguage } from '../../lib/LanguageContext';
import { fetchEvidence, prettifySiteName } from '../../services/api';
import {
  X,
  Sparkles,
  Info,
  CheckCircle2,
  Loader2,
  Database,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
} from 'recharts';

interface SpectralTwinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSetId?: string;
  marsRegionId?: string;
  marsRegionName?: string;
  liveMatches?: AnalogResult[];
}

export const SpectralTwinsModal: React.FC<SpectralTwinsModalProps> = ({
  isOpen,
  onClose,
  initialSetId,
  marsRegionId,
  marsRegionName,
  liveMatches = [],
}) => {
  const { t } = useLanguage();
  const [selectedSetId, setSelectedSetId] = useState<string>(
    initialSetId || SPECTRAL_TWINS_DATA[0].id
  );
  const [highlightAbsorption] = useState(true);
  const [evidence, setEvidence] = useState<ApiEvidenceResponse | null>(null);
  const [loadingEvidence, setLoadingEvidence] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !marsRegionId) return;
    const controller = new AbortController();
    let active = true;
    setLoadingEvidence(true);

    fetchEvidence(marsRegionId, controller.signal)
      .then((res) => {
        if (active) setEvidence(res);
      })
      .catch(() => {
        if (active) setEvidence(null);
      })
      .finally(() => {
        if (active) setLoadingEvidence(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [isOpen, marsRegionId]);

  if (!isOpen) return null;

  const currentSet =
    SPECTRAL_TWINS_DATA.find((s) => s.id === selectedSetId) || SPECTRAL_TWINS_DATA[0];

  const liveEmitMatches = liveMatches.filter((m) => m.live?.emit_n_targets != null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl hud-fade-in">
      <div className="hud-modal-in relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-lg border border-cyan-500/30 bg-[#0e131f]/95 shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#080e1a]/95">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-white tracking-wide">
                {t.spectralTwins.title}
                {marsRegionName ? ` · ${marsRegionName}` : ''}
              </h2>
              <div className="text-[11px] font-mono text-slate-400">
                {t.spectralTwins.subtitle}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {loadingEvidence && <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
            <button
              onClick={onClose}
              aria-label={t.common.close}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Live CRISM Evidence & EMIT Signal Match Matrix (/api/evidence) */}
          {(evidence || liveEmitMatches.length > 0) && (
            <div className="p-4 rounded-md border border-cyan-500/30 bg-cyan-950/15 space-y-3 text-xs font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-cyan-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>{t.api.crismEvidenceTitle}</span>
                </span>
                {evidence && (
                  <span className="text-slate-300 text-[11px] ltr-num">
                    {t.api.crismCoverageLabel}{' '}
                    <strong className="text-amber-300">
                      {evidence.crism_coverage_pct != null ? `${evidence.crism_coverage_pct.toFixed(1)}%` : 'N/A'}
                    </strong>
                    {evidence.crism_dates ? ` · ${evidence.crism_dates}` : ''}
                  </span>
                )}
              </div>

              {evidence?.note && (
                <div className="text-[11px] text-slate-400">{evidence.note}</div>
              )}

              {/* Live EMIT Hits across Top Earth Analog Windows */}
              {liveEmitMatches.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {liveEmitMatches.slice(0, 4).map((m) => {
                    const pct = m.live?.mineral_match_pct;
                    return (
                      <div key={m.region_id} className="p-2.5 rounded bg-black/40 border border-white/10">
                        <div className="text-white font-semibold truncate">{m.name}</div>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="text-emerald-300 font-bold ltr-num">
                            {pct !== null && pct !== undefined ? `${pct}%` : m.live?.emit_status}
                          </span>
                          <span className="text-[10px] text-slate-400 ltr-num">
                            {m.live?.emit_hits ?? 0}/{m.live?.emit_n_targets ?? 0} hits
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Live CRISM Detect Percentage Chart */}
              {evidence && evidence.top_detect_features.length > 0 && (
                <div className="h-36 w-full pt-1" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={evidence.top_detect_features.slice(0, 8).map((d) => ({
                        name: prettifySiteName(d.feature_name.replace(/_detect_pct$/i, '')),
                        value: Number((d.value ?? 0).toFixed(2)),
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} unit="%" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#080e1a', borderColor: '#334155', borderRadius: 4, fontSize: 11 }}
                      />
                      <Bar dataKey="value" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Spectral Pair Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded bg-black/40 border border-white/10">
            <div className="flex items-center gap-2 overflow-x-auto">
              {SPECTRAL_TWINS_DATA.map((set) => (
                <button
                  key={set.id}
                  onClick={() => setSelectedSetId(set.id)}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer border whitespace-nowrap ${
                    selectedSetId === set.id
                      ? 'border-cyan-400 bg-cyan-950/70 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {set.pair_label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">{t.spectralTwins.pearsonLabel}</span>
              <span className="text-cyan-300 font-bold text-sm tabular-nums ltr-num">
                {currentSet.correlation.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Main Hyperspectral Graph */}
          <div className="p-4 rounded-md border border-white/10 bg-[#080e1a]/80 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div>
                <span className="text-white font-semibold">
                  {t.spectralTwins.spectraRangeTitle}
                </span>
                <span className="text-slate-400 ms-2">
                  {t.spectralTwins.mineralClassLabel}{' '}
                  <strong className="text-cyan-400">{currentSet.mineral_class}</strong>
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-[#f59e0b]" />
                  <span className="text-amber-400 font-bold">{t.spectralTwins.marsCrism}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-[#06b6d4]" />
                  <span className="text-cyan-400 font-bold">{t.spectralTwins.earthEmit}</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full pt-2" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentSet.bands} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="wavelength_nm"
                    stroke="#64748b"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    unit=" nm"
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    domain={[0, 0.6]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#080e1a',
                      borderColor: '#334155',
                      borderRadius: 4,
                      fontSize: 11,
                    }}
                    formatter={(val: unknown, name: unknown) => [
                      val as string | number,
                      name === 'mars_reflectance' ? t.spectralTwins.marsCrism : t.spectralTwins.earthEmit,
                    ]}
                    labelFormatter={(label) => `${t.spectralTwins.wavelengthLabel} ${label} nm`}
                  />
                  {highlightAbsorption && (
                    <>
                      <ReferenceLine x={1445} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'H2O / Sulfate 1445nm', fill: '#f59e0b', fontSize: 9 }} />
                      <ReferenceLine x={2290} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: 'Smectite 2290nm', fill: '#06b6d4', fontSize: 9 }} />
                      <ReferenceLine x={2315} stroke="#22d3ee" strokeDasharray="3 3" label={{ value: 'Carbonate 2315nm', fill: '#22d3ee', fontSize: 9 }} />
                    </>
                  )}
                  <Line
                    type="monotone"
                    dataKey="mars_reflectance"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#f59e0b' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="earth_reflectance"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    dot={{ r: 3, fill: '#06b6d4' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Minerals Identified Table */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-heading font-semibold text-sm text-white uppercase tracking-wider">
                {t.spectralTwins.peaksTitle}
              </h3>
              <span className="text-[11px] font-mono text-slate-400 ltr-num">
                CRISM ID: {currentSet.crism_dataset} · EMIT ID: {currentSet.emit_dataset}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentSet.key_minerals.map((mineral) => (
                <div
                  key={mineral.name}
                  className="p-3.5 rounded bg-black/40 border border-white/10 text-xs font-mono space-y-1.5 transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white text-sm">{mineral.name}</span>
                    <span className="text-cyan-400 font-bold">
                      <span className="ltr-num">{(mineral.similarity_score * 100).toFixed(1)}%</span>{' '}
                      {t.spectralTwins.matchSuffix}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {t.spectralTwins.formulaLabel}{' '}
                    <span className="text-slate-200 ltr-num">{mineral.formula}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-white/5">
                    <span>
                      {t.spectralTwins.absorptionPeakLabel}{' '}
                      <span className="ltr-num">{mineral.absorption_peak_nm} nm</span>
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {t.spectralTwins.diagnosticConfirmed}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#080e1a]/90 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{t.spectralTwins.footerNote}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded font-heading font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-[#030712] transition-colors cursor-pointer"
          >
            {t.spectralTwins.closeViewer}
          </button>
        </div>
      </div>
    </div>
  );
};
