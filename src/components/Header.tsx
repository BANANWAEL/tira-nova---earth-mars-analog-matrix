import React from 'react';
import { Activity, Languages, Menu, Rocket } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { ApiConnectionStatus } from '../lib/types';
import { ScreenId } from './Sidebar';

export type { ScreenId };

interface HeaderProps {
  onNavigate: (screen: ScreenId) => void;
  onRunAnalysis: () => void;
  onOpenMobileMenu: () => void;
  isAnalyzing?: boolean;
  apiStatus?: ApiConnectionStatus;
  apiRowCount?: number | null;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onRunAnalysis,
  onOpenMobileMenu,
  isAnalyzing = false,
  apiStatus = 'connecting',
  apiRowCount = null,
}) => {
  const { lang, toggleLang, t } = useLanguage();

  const statusBadgeColor =
    apiStatus === 'connected'
      ? 'border-emerald-500/35 text-emerald-300'
      : apiStatus === 'connecting'
      ? 'border-cyan-500/30 text-cyan-300'
      : 'border-amber-500/35 text-amber-300';

  const statusDotColor =
    apiStatus === 'connected'
      ? 'bg-emerald-400'
      : apiStatus === 'connecting'
      ? 'bg-cyan-400'
      : 'bg-amber-400';

  const statusText =
    apiStatus === 'connected'
      ? `${t.api.statusConnected}${apiRowCount !== null ? ` · ${apiRowCount.toLocaleString()} ${t.api.rowsLoaded}` : ''}`
      : apiStatus === 'connecting'
      ? t.api.statusConnecting
      : t.api.statusOffline;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-cyan-500/20 bg-[#060e1a]/90 backdrop-blur-xl">
      <div className="px-4 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left/Start: Mobile Sidebar Trigger + Brand Badge on <lg, Live Telemetry Status Badge on Desktop */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label={t.sidebar.openNavMenu}
            className="lg:hidden p-2 rounded-md border border-cyan-500/30 bg-[#080e1a] text-cyan-300 hover:bg-cyan-950/50 transition-colors cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Compact Rocket Brand on Mobile/Tablet */}
          <button
            type="button"
            onClick={() => onNavigate('desktop')}
            className="lg:hidden flex items-center gap-2 text-start group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-400 to-amber-500 p-[1.5px] shadow-[0_0_14px_rgba(6,182,212,0.4)]">
              <div className="w-full h-full bg-[#030712] rounded-[4px] flex items-center justify-center">
                <Rocket className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
            <span className="font-heading text-base font-bold text-white whitespace-nowrap">
              {t.common.brandName}
            </span>
          </button>

          {/* Live Telemetry & Backend Status Badges */}
          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-md border border-cyan-500/25 bg-[#080e1a]/90 text-[11px] font-mono text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.1)]">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="tracking-wider font-semibold ltr-num truncate">
                {t.sidebar.orbitalLinkStatus}
              </span>
            </div>

            <div
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-[#080e1a]/90 text-[11px] font-mono ${statusBadgeColor}`}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                {apiStatus !== 'offline' && (
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusDotColor}`}
                  />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${statusDotColor}`} />
              </span>
              <span className="tracking-wider font-semibold ltr-num truncate">
                {statusText}
              </span>
            </div>
          </div>
        </div>

        {/* Right/End: Language Switcher & Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleLang}
            aria-label={t.header.langToggleAria}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-cyan-500/35 bg-[#0e131f]/90 hover:bg-cyan-950/50 hover:border-cyan-400/70 hover:shadow-[0_0_16px_rgba(6,182,212,0.2)] text-xs font-mono transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span className={lang === 'en' ? 'text-cyan-300 font-bold' : 'text-slate-400'}>EN</span>
            <span className="text-slate-600">/</span>
            <span className={lang === 'ar' ? 'text-amber-300 font-bold' : 'text-slate-400'}>العربية</span>
          </button>

          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className={`px-4 py-2 rounded-md font-heading font-bold text-xs uppercase tracking-wider transition-all duration-200 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              isAnalyzing
                ? 'bg-cyan-900/50 text-cyan-200 cursor-wait border border-cyan-500/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-[#030712] shadow-[0_0_18px_rgba(6,182,212,0.45)] hover:shadow-[0_0_26px_rgba(6,182,212,0.65)] hover:-translate-y-0.5'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? t.header.computingEngine : t.header.runAnalogMatrix}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

