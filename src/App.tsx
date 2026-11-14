import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header, ScreenId } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MissionControlDesktop } from './components/views/MissionControlDesktop';
import { MarsTelemetryView } from './components/views/MarsTelemetryView';
import { LunarOutpostsView } from './components/views/LunarOutpostsView';
import { SpectralTwinsModal } from './components/modals/SpectralTwinsModal';
import { RegolithSensorsOverlay } from './components/modals/RegolithSensorsOverlay';
import { LocationDetailModal } from './components/modals/LocationDetailModal';
import { MARS_REGIONS, MISSIONS, runAnalysis } from './lib/data';
import {
  Region,
  MissionProfile,
  AnalysisResponse,
  AnalogResult,
  ApiConnectionStatus,
  ApiAnalogGroup,
  ApiMetaResponse,
  ApiMatchesResponse,
} from './lib/types';
import {
  fetchSites,
  fetchMeta,
  fetchAnalogs,
  fetchMatches,
  reloadBackendData,
  buildMissionProfilesFromSites,
  mapApiSiteToRegion,
  mapApiMatchesToAnalysisResponse,
  prettifySiteName,
} from './services/api';
import { LanguageProvider, useLanguage } from './lib/LanguageContext';
import { Activity } from 'lucide-react';

function findLocalRegionTemplate(siteId: string, siteName: string): Region | undefined {
  const normId = siteId.toLowerCase();
  const normPretty = prettifySiteName(siteName || siteId).toLowerCase();

  return MARS_REGIONS.find((local) => {
    const localId = local.region_id.toLowerCase();
    const localName = local.name.toLowerCase();
    return (
      localId === normId ||
      localName === normPretty ||
      normId.includes(localId.split('_')[0]) ||
      normPretty.includes(localName.split(' ')[0])
    );
  });
}

function DashboardShell() {
  const { isRTL, t } = useLanguage();
  const [activeScreen, setActiveScreen] = useState<ScreenId>('desktop');

  // Dynamic catalogs populated from /api/sites & /api/analogs (with offline fallback)
  const [marsRegions, setMarsRegions] = useState<Region[]>(MARS_REGIONS);
  const [missions, setMissions] = useState<MissionProfile[]>(MISSIONS);
  const [analogs, setAnalogs] = useState<ApiAnalogGroup[]>([]);
  const [meta, setMeta] = useState<ApiMetaResponse | null>(null);

  const [selectedMarsRegion, setSelectedMarsRegion] = useState<Region>(MARS_REGIONS[0]);
  const [selectedMission, setSelectedMission] = useState<MissionProfile>(MISSIONS[0]);
  const [topK, setTopK] = useState<number>(4);
  const [earthScope, setEarthScope] = useState<string>('all');
  const [onlyRanked, setOnlyRanked] = useState<boolean>(false);

  // Live API connection & query state
  const [apiStatus, setApiStatus] = useState<ApiConnectionStatus>('connecting');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isReloadingBackend, setIsReloadingBackend] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStageKey, setAnalysisStageKey] = useState<
    'extracting' | 'normalizing' | 'validating' | ''
  >('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [refreshNonce, setRefreshNonce] = useState<number>(0);

  // Raw cached response from /api/matches
  const [rawMatchesResp, setRawMatchesResp] = useState<ApiMatchesResponse | null>(null);

  // Modals state
  const [isSpectralOpen, setIsSpectralOpen] = useState<boolean>(false);
  const [isRegolithOpen, setIsRegolithOpen] = useState<boolean>(false);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [activeDetailResult, setActiveDetailResult] = useState<AnalogResult | null>(null);

  // Bootstrap /api/sites, /api/meta, and /api/analogs
  const bootstrapApi = useCallback(async (signal?: AbortSignal): Promise<boolean> => {
    setApiStatus('connecting');
    setApiError(null);

    try {
      const [sitesRes, metaRes, analogsRes] = await Promise.allSettled([
        fetchSites(signal),
        fetchMeta(signal),
        fetchAnalogs(signal),
      ]);

      if (signal?.aborted) return false;

      let connected = false;

      if (sitesRes.status === 'fulfilled' && Array.isArray(sitesRes.value) && sitesRes.value.length > 0) {
        connected = true;
        const mappedRegions = sitesRes.value.map((site) =>
          mapApiSiteToRegion(site, findLocalRegionTemplate(site.mars_region_id, site.name))
        );
        const mappedMissions = buildMissionProfilesFromSites(sitesRes.value, MISSIONS);

        setMarsRegions(mappedRegions);
        setMissions(mappedMissions);

        setSelectedMarsRegion((prev) => {
          const matched =
            mappedRegions.find((r) => r.region_id === prev.region_id) || mappedRegions[0];
          return matched;
        });

        setSelectedMission((prev) => {
          const matched =
            mappedMissions.find((m) => m.id === prev.id) || mappedMissions[0];
          return matched;
        });
      }

      if (metaRes.status === 'fulfilled') {
        connected = true;
        setMeta(metaRes.value);
      }

      if (analogsRes.status === 'fulfilled' && Array.isArray(analogsRes.value)) {
        connected = true;
        setAnalogs(analogsRes.value);
      }

      if (connected) {
        setApiStatus('connected');
        setApiError(null);
        return true;
      }

      const firstErr =
        sitesRes.status === 'rejected'
          ? sitesRes.reason
          : metaRes.status === 'rejected'
          ? metaRes.reason
          : null;
      const errMsg =
        firstErr instanceof Error
          ? firstErr.message
          : 'Unable to reach Tira Nova FastAPI backend';

      setApiStatus('offline');
      setApiError(errMsg);
      return false;
    } catch (err) {
      if (signal?.aborted) return false;
      setApiStatus('offline');
      setApiError(err instanceof Error ? err.message : 'Network error reaching Tira Nova API');
      return false;
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void bootstrapApi(controller.signal);
    return () => controller.abort();
  }, [bootstrapApi]);

  // Keep selected mission aligned with supported missions for selected Mars region
  const handleSelectMarsRegion = useCallback(
    (region: Region) => {
      setSelectedMarsRegion(region);
      const supported = region.live?.missions;
      if (supported && supported.length > 0 && !supported.includes(selectedMission.id)) {
        const nextMission = missions.find((m) => supported.includes(m.id));
        if (nextMission) {
          setSelectedMission(nextMission);
        }
      }
    },
    [missions, selectedMission.id]
  );

  // Fetch /api/matches whenever Mars region, mission, onlyRanked, or refreshNonce changes
  useEffect(() => {
    if (apiStatus === 'offline') {
      setRawMatchesResp(null);
      setIsLoadingAnalysis(false);
      return;
    }

    const controller = new AbortController();
    let active = true;
    setIsLoadingAnalysis(true);

    fetchMatches({
      mars: selectedMarsRegion.region_id,
      mission: selectedMission.id,
      only_ranked: onlyRanked,
      limit: 200,
      offset: 0,
      signal: controller.signal,
    })
      .then((resp) => {
        if (!active) return;
        setRawMatchesResp(resp);
        setApiStatus('connected');
        setApiError(null);
      })
      .catch((err) => {
        if (!active || controller.signal.aborted) return;
        // Fallback smoothly when backend is unreachable; surface status if connection dropped
        if (err && typeof err.status === 'number' && err.status === 0) {
          setApiStatus('offline');
          setApiError(err.message || 'Network error reaching Tira Nova API');
        }
        setRawMatchesResp(null);
      })
      .finally(() => {
        if (active) setIsLoadingAnalysis(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedMarsRegion.region_id, selectedMission.id, onlyRanked, apiStatus, refreshNonce]);

  // Derive final AnalysisResponse from live /api/matches or offline baseline
  const analysis: AnalysisResponse = useMemo(() => {
    if (rawMatchesResp && apiStatus === 'connected') {
      return mapApiMatchesToAnalysisResponse(
        rawMatchesResp,
        selectedMarsRegion,
        selectedMission,
        { topK, earthScope, onlyRanked }
      );
    }

    return runAnalysis(selectedMarsRegion.region_id, selectedMission.id, {
      topK,
      earthScope,
      includeEvidence: true,
    });
  }, [
    rawMatchesResp,
    apiStatus,
    selectedMarsRegion,
    selectedMission,
    topK,
    earthScope,
    onlyRanked,
  ]);

  // Trigger live analysis execution with stage indicator
  const handleRunAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisStageKey('extracting');

    const stageTimer1 = window.setTimeout(() => setAnalysisStageKey('normalizing'), 260);
    const stageTimer2 = window.setTimeout(() => setAnalysisStageKey('validating'), 520);

    try {
      if (apiStatus === 'offline') {
        const reconnected = await bootstrapApi();
        if (reconnected) {
          setRefreshNonce((n) => n + 1);
        }
      } else {
        const resp = await fetchMatches({
          mars: selectedMarsRegion.region_id,
          mission: selectedMission.id,
          only_ranked: onlyRanked,
          limit: 200,
          offset: 0,
        });
        setRawMatchesResp(resp);
        setApiStatus('connected');
        setApiError(null);
      }
    } catch {
      // Offline fallback automatically remains active via useMemo
    } finally {
      window.setTimeout(() => {
        window.clearTimeout(stageTimer1);
        window.clearTimeout(stageTimer2);
        setIsAnalyzing(false);
        setAnalysisStageKey('');
      }, 650);
    }
  }, [apiStatus, bootstrapApi, selectedMarsRegion.region_id, selectedMission.id, onlyRanked]);

  const handleRetryApi = useCallback(async () => {
    const ok = await bootstrapApi();
    if (ok) {
      setRefreshNonce((n) => n + 1);
    }
  }, [bootstrapApi]);

  const handleReloadBackend = useCallback(async () => {
    setIsReloadingBackend(true);
    try {
      await reloadBackendData();
      const ok = await bootstrapApi();
      if (ok) {
        setRefreshNonce((n) => n + 1);
      }
    } catch (err) {
      setApiStatus('offline');
      setApiError(err instanceof Error ? err.message : 'Failed to reload backend CSVs');
    } finally {
      setIsReloadingBackend(false);
    }
  }, [bootstrapApi]);

  // Handle navigation requests
  const handleNavigate = (screen: ScreenId) => {
    if (screen === 'spectral_twins') {
      setIsSpectralOpen(true);
    } else if (screen === 'regolith_sensors') {
      setIsRegolithOpen(true);
    } else if (screen === 'location_detail') {
      if (analysis.results[0]) {
        setActiveDetailResult(analysis.results[0]);
        setIsDetailOpen(true);
      }
    } else {
      setActiveScreen(screen);
    }
  };

  // Detail viewer handler
  const handleOpenDetail = (result: AnalogResult) => {
    setActiveDetailResult(result);
    setIsDetailOpen(true);
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#030712] text-[#dde2f3] flex font-sans hud-grid-bg selection:bg-cyan-500/30 selection:text-cyan-200"
    >
      {/* Left Operational Nodes Sidebar */}
      <Sidebar
        activeScreen={activeScreen}
        isSpectralOpen={isSpectralOpen}
        isRegolithOpen={isRegolithOpen}
        onNavigate={handleNavigate}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Right Workspace Column: Streamlined Top Bar + Main Content + Footer */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Streamlined Top Command Header */}
        <Header
          onNavigate={handleNavigate}
          onRunAnalysis={() => void handleRunAnalysis()}
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          isAnalyzing={isAnalyzing}
          apiStatus={apiStatus}
          apiRowCount={meta?.rows ?? null}
        />

        {/* Real-time Calculation Stage Toast */}
        {isAnalyzing && analysisStageKey && (
          <div className="fixed top-20 end-6 z-50 p-3 rounded-md border border-cyan-500/40 bg-[#080e1a]/95 text-xs font-mono text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2.5 animate-pulse hud-fade-in">
            <Activity className="w-4 h-4 animate-spin text-cyan-400" />
            <span>{t.stages[analysisStageKey]}</span>
          </div>
        )}

        {/* Main Workspace Frame */}
        <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeScreen === 'desktop' && (
            <div key="desktop" className="hud-fade-in">
              <MissionControlDesktop
                analysis={analysis}
                marsRegions={marsRegions}
                missions={missions}
                selectedMarsRegion={selectedMarsRegion}
                selectedMission={selectedMission}
                onSelectMarsRegion={handleSelectMarsRegion}
                onSelectMission={setSelectedMission}
                onSelectDetail={handleOpenDetail}
                onViewSpectral={(res) => {
                  setActiveDetailResult(res);
                  setIsSpectralOpen(true);
                }}
                onViewRegolith={(res) => {
                  setActiveDetailResult(res);
                  setIsRegolithOpen(true);
                }}
                earthScope={earthScope}
                onSelectEarthScope={setEarthScope}
                topK={topK}
                onSelectTopK={setTopK}
                onlyRanked={onlyRanked}
                onSelectOnlyRanked={setOnlyRanked}
                apiStatus={apiStatus}
                apiError={apiError}
                isLoadingAnalysis={isLoadingAnalysis}
                isReloadingBackend={isReloadingBackend}
                onRetryApi={() => void handleRetryApi()}
                onReloadBackend={() => void handleReloadBackend()}
              />
            </div>
          )}

          {activeScreen === 'mars_telemetry' && (
            <div key="mars_telemetry" className="hud-fade-in">
              <MarsTelemetryView
                marsRegions={marsRegions}
                selectedRegion={selectedMarsRegion}
                onSelectRegion={handleSelectMarsRegion}
                onRunAnalogSearch={(reg) => {
                  handleSelectMarsRegion(reg);
                  setActiveScreen('desktop');
                  void handleRunAnalysis();
                }}
              />
            </div>
          )}

          {activeScreen === 'lunar_outposts' && (
            <div key="lunar_outposts" className="hud-fade-in">
              <LunarOutpostsView
                onSelectDetail={(site) => {
                  if (site && typeof site === 'object' && 'region_id' in site && 'factors' in site) {
                    handleOpenDetail(site as AnalogResult);
                  }
                }}
                initialAnalogs={analogs}
              />
            </div>
          )}
        </main>

        {/* Modals & Overlays */}
        <SpectralTwinsModal
          isOpen={isSpectralOpen}
          onClose={() => setIsSpectralOpen(false)}
          marsRegionId={selectedMarsRegion.region_id}
          marsRegionName={selectedMarsRegion.name}
          liveMatches={analysis.results}
        />

        <RegolithSensorsOverlay
          isOpen={isRegolithOpen}
          onClose={() => setIsRegolithOpen(false)}
          marsRegionId={selectedMarsRegion.region_id}
        />

        <LocationDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          result={activeDetailResult || analysis.results[0] || null}
          marsRegion={selectedMarsRegion}
          missionId={selectedMission.id}
        />

        {/* Tactical Quiet Footer */}
        <footer className="border-t border-cyan-500/15 bg-[#060e1a]/90 py-4 px-6 mt-12 text-xs font-mono text-slate-400">
          <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-heading font-semibold">{t.common.brandName}</span>
              <span>·</span>
              <span>{t.common.challengeLabel}</span>
              <span>·</span>
              <span className="text-cyan-400">{t.common.earthMarsMatrix}</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span>{t.footer.gridLabel}</span>
              <span>·</span>
              <span className="ltr-num">SRTMGL1 · MOLA · EMIT · CRISM</span>
              <span>·</span>
              <span className="text-emerald-400">{t.footer.statusNominal}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <DashboardShell />
    </LanguageProvider>
  );
}
