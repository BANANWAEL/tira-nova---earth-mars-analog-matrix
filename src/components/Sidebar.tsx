import React from 'react';
import {
  Activity,
  Satellite,
  Layers,
  Orbit,
  Sparkles,
  Rocket,
  X,
  Radio,
} from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export type ScreenId =
  | 'desktop'
  | 'mars_telemetry'
  | 'lunar_outposts'
  | 'spectral_twins'
  | 'regolith_sensors'
  | 'location_detail';

type SidebarNodeId =
  | 'desktop'
  | 'mars_telemetry'
  | 'lunar_outposts'
  | 'spectral_twins'
  | 'regolith_sensors';

interface SidebarProps {
  activeScreen: ScreenId;
  isSpectralOpen: boolean;
  isRegolithOpen: boolean;
  onNavigate: (screen: ScreenId) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  isSpectralOpen,
  isRegolithOpen,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { t } = useLanguage();

  const navItems: {
    id: SidebarNodeId;
    label: string;
    tag: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'desktop',
      label: t.header.nav.desktop,
      tag: t.sidebar.nodeTags.desktop,
      icon: Activity,
    },
    {
      id: 'mars_telemetry',
      label: t.header.nav.mars_telemetry,
      tag: t.sidebar.nodeTags.mars_telemetry,
      icon: Orbit,
    },
    {
      id: 'lunar_outposts',
      label: t.header.nav.lunar_outposts,
      tag: t.sidebar.nodeTags.lunar_outposts,
      icon: Satellite,
    },
    {
      id: 'spectral_twins',
      label: t.header.nav.spectral_twins,
      tag: t.sidebar.nodeTags.spectral_twins,
      icon: Sparkles,
    },
    {
      id: 'regolith_sensors',
      label: t.header.nav.regolith_sensors,
      tag: t.sidebar.nodeTags.regolith_sensors,
      icon: Layers,
    },
  ];

  const isNodeActive = (id: SidebarNodeId) => {
    if (id === 'spectral_twins') return isSpectralOpen;
    if (id === 'regolith_sensors') return isRegolithOpen;
    if (isSpectralOpen || isRegolithOpen) return false;
    return activeScreen === id;
  };

  const handleSelect = (id: SidebarNodeId) => {
    onNavigate(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-64 bg-[#060e1a]/95 backdrop-blur-xl border-e border-cyan-500/20 shadow-[0_0_30px_rgba(3,7,18,0.8)] select-none">
      {/* Top Space Rocket Logo & Brand Block */}
      <div className="px-4 py-5 border-b border-cyan-500/15 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => handleSelect('desktop')}
          className="flex items-center gap-3 text-start group cursor-pointer"
        >
          {/* Glowing Space Rocket Badge with Hover Lift & Thruster Glow */}
          <div className="relative shrink-0">
            <div className="absolute -bottom-1 start-1/2 -translate-x-1/2 w-6 h-2.5 rounded-full bg-amber-500/60 blur-md hud-thruster-glow pointer-events-none" />
            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 via-cyan-300 to-amber-500 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:shadow-[0_0_26px_rgba(245,158,11,0.5)]">
              <div className="w-full h-full rounded-[6px] bg-[#030712] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/15 via-transparent to-amber-500/20" />
                <Rocket className="w-5 h-5 text-cyan-300 group-hover:text-amber-300 transition-all duration-300 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="font-heading text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors leading-tight">
              {t.common.brandName}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/80 truncate mt-0.5">
              {t.sidebar.missionControlSub}
            </div>
          </div>
        </button>

        {/* Close button on mobile drawer */}
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label={t.sidebar.closeNavMenu}
          className="lg:hidden p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Operational Nodes Navigation Group */}
      <div className="flex-1 px-3 py-5 overflow-y-auto space-y-4">
        <div className="px-2 flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-cyan-400/90">
            {t.sidebar.operationalNodes}
          </span>
          <span className="w-8 h-[1px] bg-gradient-to-r from-cyan-500/60 to-transparent" />
        </div>

        <nav className="space-y-1.5" aria-label={t.sidebar.operationalNodes}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNodeActive(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-md text-start transition-all duration-200 cursor-pointer border ${
                  active
                    ? 'border-cyan-400/50 bg-cyan-950/50 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                    : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-slate-100 hover:border-cyan-400/40 hover:bg-cyan-950/25 hover:shadow-[0_0_16px_rgba(6,182,212,0.14)]'
                }`}
              >
                {/* Active Start Accent Strip */}
                {active && (
                  <span className="absolute start-0 top-2 bottom-2 w-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                )}

                <div
                  className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border transition-colors ${
                    active
                      ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300'
                      : 'bg-[#080e1a] border-white/10 text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-heading font-semibold tracking-wide truncate">
                    {item.label}
                  </div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 group-hover:text-cyan-400/70 truncate ltr-num">
                    {item.tag}
                  </div>
                </div>

                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Orbital Telemetry Status Card */}
      <div className="p-3.5 border-t border-cyan-500/15 bg-[#040914]/80 space-y-2">
        <div className="p-2.5 rounded border border-cyan-500/20 bg-[#080e1a]/90 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{t.common.grid450m}</span>
            </span>
            <span className="text-amber-400 ltr-num">4.8.2</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 truncate ltr-num">
            SRTMGL1 · MOLA · EMIT · CRISM
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block lg:sticky lg:top-0 lg:h-screen shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile & Tablet Slide-Out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full hud-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
