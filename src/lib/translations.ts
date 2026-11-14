export type Language = 'en' | 'ar';

export interface TranslationDictionary {
  common: {
    brandName: string;
    challengeLabel: string;
    earthMarsMatrix: string;
    mars: string;
    earth: string;
    moon: string;
    all: string;
    noData: string;
    close: string;
    done: string;
    km: string;
    m: string;
    deg: string;
    cm: string;
    lat: string;
    lon: string;
    datasets: string;
    window: string;
    grid450m: string;
    statusNominal: string;
    vs: string;
    notAvailable: string;
  };
  header: {
    nav: {
      desktop: string;
      mars_telemetry: string;
      lunar_outposts: string;
      spectral_twins: string;
      regolith_sensors: string;
      location_detail: string;
    };
    runAnalogMatrix: string;
    computingEngine: string;
    langToggleAria: string;
  };
  sidebar: {
    operationalNodes: string;
    missionControlSub: string;
    orbitalLinkStatus: string;
    openNavMenu: string;
    closeNavMenu: string;
    nodeTags: {
      desktop: string;
      mars_telemetry: string;
      lunar_outposts: string;
      spectral_twins: string;
      regolith_sensors: string;
    };
  };
  stages: {
    extracting: string;
    normalizing: string;
    validating: string;
  };
  footer: {
    gridLabel: string;
    statusNominal: string;
  };
  desktop: {
    harmonizationTitle: string;
    harmonizationText: string;
    methodLabel: string;
    thresholdLabel: string;
    targetMarsRegionLabel: string;
    missionObjectiveLabel: string;
    awaitingDataset: string;
    earthFilterLabel: string;
    topKLabel: string;
    orbitalSensorProber: string;
    marsTargetBtn: string;
    earthAnalogsBtn: string;
    uniquenessTitle: string;
    nonOverlappingWindows: string;
    manySimilarTitle: string;
    manySimilarBodyPrefix: string;
    manySimilarBodySuffix: string;
    highUniquenessTitle: string;
    highUniquenessBody: string;
    siteSingular: string;
    sitePlural: string;
    rankedTerrestrialAnalogs: string;
    rankedMatchesCount: string;
    targetLabel: string;
    noGoodAnalogTitle: string;
    noGoodAnalogBodyPrefix: string;
    noGoodAnalogBodySuffix: string;
    excludedCandidates: string;
    rejectedSites: string;
    hideDetails: string;
    showReasons: string;
    missions: Record<string, { label: string; description: string }>;
    areas: Record<string, string>;
    excludedReasons: Record<string, string>;
  };
  deltaCards: {
    weightedDistance: string;
    zNorm: string;
    goodMatchLimit: string;
    valid: string;
    slopeDivergence: string;
    deltaDeg: string;
    match92: string;
    terrainRuggedness: string;
    deltaRelief: string;
    high: string;
    confidenceTier: string;
    bootstrapStability: string;
    candidatesInRange: string;
    calibrated: string;
    confidenceLevels: Record<'high' | 'medium' | 'low', string>;
  };
  resultCard: {
    coordinates: string;
    analogDistance: string;
    confidence: string;
    factorBreakdown: string;
    contributionHint: string;
    weight: string;
    coverage: string;
    contribution: string;
    featuresNotCompared: string;
    scientificEvidence: string;
    papers: string;
    spectralBands: string;
    regolithData: string;
    fullDetail: string;
    readPublicationSource: string;
    page: string;
    verdicts: Record<'similar' | 'different' | 'unknown', string>;
    supports: Record<'similarity' | 'difference' | 'limitation', string>;
    factorLabels: Record<string, string>;
    warningTexts: Record<string, string>;
  };
  globe: {
    marsTitle: string;
    marsSub: string;
    earthTitle: string;
    earthSub: string;
    moonTitle: string;
    moonSub: string;
    toggle2d: string;
    toggle3d: string;
    toggleAutoRotate: string;
    resetView: string;
    targetLocked: string;
    elevShort: string;
    slopeShort: string;
    clickForDossier: string;
    sitesLabel: string;
  };
  marsTelemetry: {
    headerEyebrow: string;
    categoryLabel: string;
    stratigraphyTitle: string;
    knownAnalogs: string;
    atmPressure: string;
    atmPressureSub: string;
    surfaceTemp: string;
    surfaceTempSub: string;
    solarFlux: string;
    solarFluxSub: string;
    windVelocity: string;
    windVelocitySub: string;
    tabs: {
      topography: string;
      environmental: string;
      geology: string;
    };
    findEarthAnalogs: string;
    molaTransectTitle: string;
    slopeDistTitle: string;
    roverMaxSlope: string;
    diurnalTempTitle: string;
    solSimulation: string;
    gases: {
      co2: string;
      n2: string;
      ar: string;
      trace: string;
    };
    crismTitle: string;
    minerals: {
      phylloTitle: string;
      phylloDesc: string;
      carbTitle: string;
      carbDesc: string;
      olivineTitle: string;
      olivineDesc: string;
      sulfateTitle: string;
      sulfateDesc: string;
    };
  };
  lunarOutposts: {
    headerEyebrow: string;
    locationTablistAria: string;
    shortLabels: {
      shackleton: string;
      malapert: string;
      marius: string;
    };
    tacticalProfileTitle: string;
    safetyDossierBtn: string;
    peakIllumination: string;
    lolaElevation: string;
    slopeP90: string;
    suitabilityIndexTitle: string;
    compositeLabel: string;
    radarSubjects: Record<string, string>;
    simulantsTitle: string;
    calibratedFor: string;
    simulantsSourceNote: string;
    tableHeaders: {
      simulant: string;
      origin: string;
      mineralogy: string;
      density: string;
      friction: string;
      fidelity: string;
    };
    volatileWaterIce: string;
    electrostaticField: string;
    earthDirectComm: string;
    safetyRatingPrefix: string;
    landingEllipsePrefix: string;
    openTargetDossier: string;
    thermalLabels: Record<string, string>;
    siteTelemetry: Record<
      string,
      {
        category: string;
        description: string;
        peakIllumination: string;
        thermalLabel: string;
        thermalValue: string;
        waterIceSource: string;
        electrostaticNote: string;
        earthCommUptime: string;
        earthCommNote: string;
        safetyHazard: string;
      }
    >;
  };
  lunarDossier: {
    titlePrefix: string;
    safetyBadgePrefix: string;
    safetyRatings: Record<'NOMINAL' | 'CAUTION' | 'ELEVATED', string>;
    windowLabel: string;
    bboxLabel: string;
    sourcesLabel: string;
    elevationSectionTitle: string;
    elevationLabel: string;
    meanLunarDatum: string;
    slopeLabel: string;
    landerLimit: string;
    triLabel: string;
    localRelief: string;
    roughnessLabel: string;
    clastScale: string;
    safetySectionTitle: string;
    suitabilityScore: string;
    landingSlopeAssessment: string;
    boulderHazard: string;
    radiationOverburden: string;
    bearingCapacity: string;
    wheelSinkage: string;
    dustAbrasion: string;
    dustRisks: Record<'Low' | 'Moderate' | 'High', string>;
    landingEllipse: string;
    mitigationHeader: string;
    lightTimeLabel: string;
    matchedSimulantsTitle: string;
    topMatch: string;
    footerLabel: string;
    closeDossier: string;
  };
  spectralTwins: {
    title: string;
    subtitle: string;
    pearsonLabel: string;
    spectraRangeTitle: string;
    mineralClassLabel: string;
    marsCrism: string;
    earthEmit: string;
    wavelengthLabel: string;
    peaksTitle: string;
    matchSuffix: string;
    formulaLabel: string;
    absorptionPeakLabel: string;
    diagnosticConfirmed: string;
    footerNote: string;
    closeViewer: string;
  };
  regolithSensors: {
    title: string;
    subtitle: string;
    primarySiteLabel: string;
    compareSiteLabel: string;
    wheelSinkage: string;
    bearingCapacity: string;
    perchlorateLevel: string;
    trafficabilityIndex: string;
    analogPrefix: string;
    safeForRover: string;
    trafficabilityValues: Record<'optimal' | 'moderate' | 'hazard', string>;
    grainChartTitle: string;
    terramechanicsTitle: string;
    physicalParam: string;
    divergence: string;
    params: {
      bearing: string;
      friction: string;
      cohesion: string;
      density: string;
      sinkage: string;
    };
    footerNote: string;
    closeOverlay: string;
  };
  locationDetail: {
    analogMatchFor: string;
    distanceLabel: string;
    exportJson: string;
    tabs: {
      features: string;
      evidence: string;
      json: string;
    };
    marsWindowBadge: string;
    earthWindowBadge: string;
    centerLabel: string;
    bboxLabel: string;
    harmonizedMars: string;
    harmonizedEarth: string;
    sideBySideTitle: string;
    unitAccurate: string;
    tableHeaders: {
      featureName: string;
      marsCol: string;
      earthCol: string;
      notesCol: string;
    };
    featureRows: {
      elevation: { name: string; note: string };
      slope: { name: string; note: string };
      tri: { name: string; note: string };
      roughness: { name: string; note: string };
      albedo: { name: string; note: string };
      thermal: { name: string; note: string };
      smectite: { name: string; note: string };
      carbonate: { name: string; note: string };
      sulfate: { name: string; note: string };
    };
    rankStabilityTitle: string;
    rankStabilitySub: string;
    distanceLimitTitle: string;
    distanceLimitSub: string;
    windowCoverageTitle: string;
    windowCoverageSub: string;
    evidenceIntro: string;
    openDoi: string;
    rawJsonDesc: string;
    copyJson: string;
    copied: string;
    footerEngine: string;
  };
  api: {
    statusConnecting: string;
    statusConnected: string;
    statusOffline: string;
    offlineBannerTitle: string;
    offlineBannerBody: string;
    retryConnection: string;
    reloadBackend: string;
    reloadingBackend: string;
    rowsLoaded: string;
    onlyRankedLabel: string;
    onlyRankedAll: string;
    onlyRankedEmit: string;
    methodLimitsTitle: string;
    showLimits: string;
    hideLimits: string;
    mineralMatchLabel: string;
    combinedScoreLabel: string;
    finalRankLabel: string;
    terrainRankLabel: string;
    slopeLimitLabel: string;
    slopeWithinLimit: string;
    slopeExceedsLimit: string;
    emitStatuses: Record<string, string>;
    flagLabels: Record<string, string>;
    loadingMatches: string;
    crismEvidenceTitle: string;
    crismCoverageLabel: string;
    crismDatesLabel: string;
    crismTargetsLabel: string;
    crismTopDetectsLabel: string;
    noCrismEvidence: string;
    thermalSectionTitle: string;
    thermalExploratoryBadge: string;
    thermalDayTemp: string;
    thermalNightTemp: string;
    thermalDiurnalRange: string;
    thermalPlanetRank: string;
    thermalCoverage: string;
    thermalNoData: string;
    thermalModeTab: string;
    terramechanicsModeTab: string;
    thermalLimitsTitle: string;
    crossMissionTitle: string;
    lunarLiveAnalogsTitle: string;
    lunarLiveAnalogsSub: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    common: {
      brandName: 'Tira Nova',
      challengeLabel: 'NASA Space Apps 2026',
      earthMarsMatrix: 'Earth-Mars Analog Matrix',
      mars: 'Mars',
      earth: 'Earth',
      moon: 'Moon',
      all: 'All',
      noData: 'no data',
      close: 'Close',
      done: 'Done',
      km: 'km',
      m: 'm',
      deg: 'deg',
      cm: 'cm',
      lat: 'Lat',
      lon: 'Lon',
      datasets: 'Datasets',
      window: 'Window',
      grid450m: 'GRID: 450m',
      statusNominal: 'Status: Nominal',
      vs: 'vs',
      notAvailable: 'N/A',
    },
    header: {
      nav: {
        desktop: 'Analog Matrix',
        mars_telemetry: 'Mars Telemetry',
        lunar_outposts: 'Lunar Outposts',
        spectral_twins: 'Spectral Twins',
        regolith_sensors: 'Regolith Sensors',
        location_detail: 'Analog Detail',
      },
      runAnalogMatrix: 'Run Analog Matrix',
      computingEngine: 'Computing Engine...',
      langToggleAria: 'Switch language to Arabic',
    },
    sidebar: {
      operationalNodes: 'OPERATIONAL NODES',
      missionControlSub: 'NASA Mission Control',
      orbitalLinkStatus: 'SYS-VER 4.8.2 // ORBITAL LINK ACTIVE',
      openNavMenu: 'Open navigation menu',
      closeNavMenu: 'Close navigation menu',
      nodeTags: {
        desktop: 'CORE ENGINE',
        mars_telemetry: 'MOLA · CRISM',
        lunar_outposts: 'ARTEMIS LOLA',
        spectral_twins: 'HYPERSPECTRAL',
        regolith_sensors: 'TERRAMECHANICS',
      },
    },
    stages: {
      extracting: 'Extracting features (450m grid)...',
      normalizing: 'Engine: Normalizing z-score weights...',
      validating: 'RAG: Validating evidence citations...',
    },
    footer: {
      gridLabel: 'Grid: 450 m Harmonized',
      statusNominal: 'Status: Nominal',
    },
    desktop: {
      harmonizationTitle: 'HARMONIZATION NOTICE:',
      harmonizationText:
        'Statistical morphological similarity is not physical equivalence. Data harmonized at ~450 m grid resolution (MOLA · SRTMGL1 · EMIT · CRISM).',
      methodLabel: 'Method:',
      thresholdLabel: 'Threshold ≤',
      targetMarsRegionLabel: '1. Target Mars Region (Window ~51 km)',
      missionObjectiveLabel: '2. Mission Science Objective & Weights',
      awaitingDataset: '(Awaiting Dataset)',
      earthFilterLabel: 'Earth Filter',
      topKLabel: 'Top K',
      orbitalSensorProber: 'Orbital Sensor Prober',
      marsTargetBtn: 'Mars Target',
      earthAnalogsBtn: 'Earth Analogs',
      uniquenessTitle: 'Uniqueness & Spatial Cluster',
      nonOverlappingWindows: 'non-overlapping windows ≤',
      manySimilarTitle: 'Many similar places detected globally:',
      manySimilarBodyPrefix:
        'The match is not a single isolated geographical anomaly. Multiple terrestrial regions satisfy the',
      manySimilarBodySuffix: 'constraints.',
      highUniquenessTitle: 'High uniqueness:',
      highUniquenessBody:
        'Only a narrow cohort of Earth sites reproduce these specific terrain and mineral conditions.',
      siteSingular: 'site',
      sitePlural: 'sites',
      rankedTerrestrialAnalogs: 'Ranked Terrestrial Analogs',
      rankedMatchesCount: 'ranked matches',
      targetLabel: 'Target:',
      noGoodAnalogTitle: 'No Good Analog Found',
      noGoodAnalogBodyPrefix: 'No terrestrial windows satisfied the strict mission filters for',
      noGoodAnalogBodySuffix:
        'Per specification rules, nearest bad matches are not presented as victories.',
      excludedCandidates: 'Excluded Candidates',
      rejectedSites: 'rejected sites',
      hideDetails: 'Hide details',
      showReasons: 'Show reasons',
      missions: {
        rover_mobility: {
          label: 'Rover Mobility',
          description:
            'Terrain slope, micro-relief, and topographic roughness for chassis traverse planning and hazard avoidance.',
        },
        geobiology_biosignatures: {
          label: 'Geobiology & Biosignatures',
          description:
            'Ancient lacustrine sedimentology, deltaic clay minerals, evaporites, and chemical biosignature preservation analogs.',
        },
        subsurface_ice: {
          label: 'Subsurface Ice Prospecting',
          description:
            'Periglacial patterned ground, polygonal fractures, thermal inertia deltas, and cryospheric regolith stability.',
        },
        dust_abrasion: {
          label: 'Dust & Regolith Abrasion',
          description:
            'Eolian saltation, fine particle abrasion rates, electrostatic adhesion, and optical obscuration profiles.',
        },
        solar_irradiance: {
          label: 'Solar & Thermal Energy',
          description:
            'Diurnal thermal oscillation, surface albedo, solar panel dust deposition, and power generation survivability.',
        },
      },
      areas: {
        'Atacama Altiplano': 'Atacama Altiplano',
        'Anatolian Plateau': 'Anatolian Plateau',
        'Hawaiian Shield': 'Hawaiian Shield',
        'Arctic High Permafrost': 'Arctic High Permafrost',
      },
      excludedReasons: {
        'filter:slope_p90_deg exceeds mission limit (18.2 deg > 15 deg)':
          'filter:slope_p90_deg exceeds mission limit (18.2 deg > 15 deg)',
        'coverage:missing_emit_spectral_coverage':
          'coverage:missing_emit_spectral_coverage',
      },
    },
    deltaCards: {
      weightedDistance: 'Weighted Distance',
      zNorm: 'z-norm',
      goodMatchLimit: 'Good match ≤ 0.350',
      valid: 'Valid',
      slopeDivergence: 'Slope p90 Divergence',
      deltaDeg: 'Δ deg',
      match92: '92% Match',
      terrainRuggedness: 'Terrain Ruggedness (TRI)',
      deltaRelief: 'Δ relief',
      high: 'High',
      confidenceTier: 'Confidence Tier',
      bootstrapStability: 'bootstrap stability',
      candidatesInRange: 'candidates in range',
      calibrated: 'Calibrated',
      confidenceLevels: {
        high: 'high',
        medium: 'medium',
        low: 'low',
      },
    },
    resultCard: {
      coordinates: 'Coordinates:',
      analogDistance: 'Analog Distance',
      confidence: 'Confidence',
      factorBreakdown: 'Factor Contribution Breakdown',
      contributionHint: 'Contribution = share of distance',
      weight: 'Weight:',
      coverage: 'Coverage:',
      contribution: 'Contribution:',
      featuresNotCompared: 'Features not compared (missing in dataset):',
      scientificEvidence: 'Scientific Evidence',
      papers: 'Papers',
      spectralBands: 'Spectral Bands',
      regolithData: 'Regolith Data',
      fullDetail: 'Full Detail',
      readPublicationSource: 'Read Publication Source',
      page: 'Page',
      verdicts: {
        similar: 'similar',
        different: 'different',
        unknown: 'unknown',
      },
      supports: {
        similarity: 'similarity',
        difference: 'difference',
        limitation: 'limitation',
      },
      factorLabels: {
        slope_p90_deg: 'Slope (90th percentile)',
        tri_mean_m: 'Terrain Ruggedness Index (TRI)',
        roughness_cm: 'Surface Roughness Scale',
        mineral_smectite_index: 'Phyllosilicate / Smectite Index',
      },
      warningTexts: {
        TERRAIN_SCALE_GRID:
          'Computed at ~450 m harmonized grid resolution; micro-boulders (<30 cm) unmapped in regional DEM.',
        ATMOSPHERIC_PRESSURE_GAP:
          'Terrestrial ambient pressure (~67-101 kPa) does not simulate Martian near-vacuum (0.6 kPa) dust lofting.',
      },
    },
    globe: {
      marsTitle: 'MARS RECONNAISSANCE HUD',
      marsSub: 'MOLA + CRISM Harmonized Surface (450m)',
      earthTitle: 'TERRA ANALOG SURVEY MATRIX',
      earthSub: 'SRTMGL1 + EMIT Harmonized Analogs',
      moonTitle: 'LUNAR ARTEMIS RECONNAISSANCE',
      moonSub: 'LOLA + LROC Artemis Base Site Survey',
      toggle2d: '2D Flat',
      toggle3d: '3D Sphere',
      toggleAutoRotate: 'Toggle Orbital Auto-Rotation',
      resetView: 'Reset View & Target',
      targetLocked: 'Target Locked',
      elevShort: 'ELEV:',
      slopeShort: 'SLOPE:',
      clickForDossier: 'Click marker for Dossier',
      sitesLabel: 'Sites:',
    },
    marsTelemetry: {
      headerEyebrow: 'Orbital Reconnaissance Telemetry',
      categoryLabel: 'Category:',
      stratigraphyTitle: 'Target Stratigraphy & Geological Context',
      knownAnalogs: 'Known Terrestrial Analogs:',
      atmPressure: 'Atm. Pressure',
      atmPressureSub: '6.12 mbar (~0.6% Earth)',
      surfaceTemp: 'Surface Temp',
      surfaceTempSub: 'Diurnal: -108°C to +12°C',
      solarFlux: 'Solar Flux',
      solarFluxSub: 'Tau dust opacity = 0.45',
      windVelocity: 'Wind Velocity',
      windVelocitySub: 'Gust peak 18.2 m/s',
      tabs: {
        topography: 'topography',
        environmental: 'environmental',
        geology: 'geology',
      },
      findEarthAnalogs: 'Find Earth Analogs',
      molaTransectTitle: 'MOLA Elevation Transect (51 km Window Profile)',
      slopeDistTitle: 'Slope Gradient Frequency Distribution',
      roverMaxSlope: 'Rover chassis max limit ≤ 22°',
      diurnalTempTitle: 'Diurnal Surface Temperature & Atmospheric Pressure Variation',
      solSimulation: 'Sol 1042 Simulation',
      gases: {
        co2: 'CO2 (Carbon Dioxide)',
        n2: 'N2 (Molecular Nitrogen)',
        ar: 'Ar (Argon)',
        trace: 'O2 / H2O Trace',
      },
      crismTitle: 'CRISM Mineral Spectra Detections',
      minerals: {
        phylloTitle: 'Fe/Mg Phyllosilicates',
        phylloDesc: 'Nontronite & Saponite smectites in delta deposits',
        carbTitle: 'Hydromagnesite & Carbonates',
        carbDesc: 'Marginal lake basin terraces (Lake Salda analog)',
        olivineTitle: 'Olivine Cumulates',
        olivineDesc: 'Broad 1.0 µm absorption band in Séítah floor unit',
        sulfateTitle: 'Hydrated Sulfates',
        sulfateDesc: 'Secondary evaporitic fractures and nodules',
      },
    },
    lunarOutposts: {
      headerEyebrow: 'Artemis Base Camp Candidate Matrix',
      locationTablistAria: 'Lunar Outpost Locations',
      shortLabels: {
        shackleton: 'Shackleton',
        malapert: 'Malapert',
        marius: 'Marius',
      },
      tacticalProfileTitle: 'Tactical Site Profile & Thermal Regime',
      safetyDossierBtn: 'Safety Dossier',
      peakIllumination: 'Peak Illumination',
      lolaElevation: 'LOLA Elevation',
      slopeP90: 'Slope (90th pct)',
      suitabilityIndexTitle: 'Artemis Base Camp Suitability Index',
      compositeLabel: 'Composite:',
      radarSubjects: {
        'Solar Illumination': 'Solar Illumination',
        'Earth Line-of-Sight': 'Earth Line-of-Sight',
        'PSR Ice Proximity': 'PSR Ice Proximity',
        'Landing Slope Safety': 'Landing Slope Safety',
        'Thermal Stability': 'Thermal Stability',
        'Trafficability Index': 'Trafficability Index',
      },
      simulantsTitle: 'Terrestrial Analog Field Simulants',
      calibratedFor: 'Calibrated for',
      simulantsSourceNote: 'NASA Desert RATS / Mineralogy Match',
      tableHeaders: {
        simulant: 'Simulant / Field',
        origin: 'Terrestrial Origin',
        mineralogy: 'Mineralogy',
        density: 'Density (g/cm³)',
        friction: 'Friction (°)',
        fidelity: 'Fidelity',
      },
      volatileWaterIce: 'Volatile Water Ice',
      electrostaticField: 'Electrostatic Field',
      earthDirectComm: 'Earth Direct Comm',
      safetyRatingPrefix: 'Surface Safety Rating:',
      landingEllipsePrefix: 'Landing Ellipse',
      openTargetDossier: 'Open Target Dossier →',
      thermalLabels: {
        'PSR Cold Trap Temp': 'PSR Cold Trap Temp',
        'Ridge Diurnal Swing': 'Ridge Diurnal Swing',
        'Lava Tube Interior': 'Lava Tube Interior',
      },
      siteTelemetry: {},
    },
    lunarDossier: {
      titlePrefix: 'Lunar Target Dossier',
      safetyBadgePrefix: 'Safety:',
      safetyRatings: {
        NOMINAL: 'NOMINAL',
        CAUTION: 'CAUTION',
        ELEVATED: 'ELEVATED',
      },
      windowLabel: 'Window:',
      bboxLabel: 'BBox:',
      sourcesLabel: 'Sources:',
      elevationSectionTitle: 'Elevation & Terrain Morphology (LOLA 450m / LROC NAC)',
      elevationLabel: 'Elevation',
      meanLunarDatum: 'Mean Lunar Datum',
      slopeLabel: 'Slope (90th pct)',
      landerLimit: 'Lander Limit ≤ 15°',
      triLabel: 'Ruggedness (TRI)',
      localRelief: 'Local Relief Variance',
      roughnessLabel: 'Surface Roughness',
      clastScale: 'Sub-meter Clast Scale',
      safetySectionTitle: 'Surface Safety & Touchdown Metrics',
      suitabilityScore: 'Suitability Score:',
      landingSlopeAssessment: 'Landing Slope Assessment',
      boulderHazard: 'Boulder & Ejecta Hazard',
      radiationOverburden: 'Radiation & Overburden',
      bearingCapacity: 'Bearing Capacity',
      wheelSinkage: 'Wheel Sinkage',
      dustAbrasion: 'Dust Abrasion',
      dustRisks: {
        Low: 'Low',
        Moderate: 'Moderate',
        High: 'High',
      },
      landingEllipse: 'Landing Ellipse',
      mitigationHeader: 'Recommended Mitigation Protocol · Round-Trip Light Time',
      lightTimeLabel: 's',
      matchedSimulantsTitle: 'Matched Earth Regolith Simulants',
      topMatch: 'Top match:',
      footerLabel: 'Artemis Reconnaissance Dossier',
      closeDossier: 'Close Dossier',
    },
    spectralTwins: {
      title: 'Spectral Twins Analysis · Hyperspectral Curve Matcher',
      subtitle: 'CRISM (Mars MRO) vs EMIT (Earth ISS Imaging Spectrometer)',
      pearsonLabel: 'Pearson Correlation (r):',
      spectraRangeTitle: 'Reflectance Spectra [0.4 - 2.5 µm (400 - 2500 nm)]',
      mineralClassLabel: 'Mineral Class:',
      marsCrism: 'Mars (CRISM)',
      earthEmit: 'Earth (EMIT)',
      wavelengthLabel: 'Wavelength:',
      peaksTitle: 'Confirmed Diagnostic Absorption Peaks',
      matchSuffix: 'match',
      formulaLabel: 'Formula:',
      absorptionPeakLabel: 'Absorption Peak:',
      diagnosticConfirmed: 'Diagnostic band confirmed',
      footerNote:
        'Harmonized at 450m grid scale. Laboratory spectra via USGS & CRISM Spectral Libraries.',
      closeViewer: 'Close Viewer',
    },
    regolithSensors: {
      title: 'Regolith Geotechnical Sensors & Terramechanics',
      subtitle: 'In-situ Soil Mechanics · Wheel Sinkage · Perchlorate Toxicity Assay',
      primarySiteLabel: 'Primary Reference Site',
      compareSiteLabel: 'Comparison Field Analog',
      wheelSinkage: 'Wheel Sinkage (Bekker)',
      bearingCapacity: 'Bearing Capacity',
      perchlorateLevel: 'Perchlorate Level',
      trafficabilityIndex: 'Trafficability Index',
      analogPrefix: 'Analog:',
      safeForRover: 'Safe for rover drive',
      trafficabilityValues: {
        optimal: 'optimal',
        moderate: 'moderate',
        hazard: 'hazard',
      },
      grainChartTitle: 'Granulometric Grain Size Fraction Distribution (%)',
      terramechanicsTitle: 'Mohr-Coulomb Terramechanics Comparison',
      physicalParam: 'Physical Parameter',
      divergence: 'Divergence (Δ)',
      params: {
        bearing: 'Bearing Capacity (kPa)',
        friction: 'Internal Friction Angle',
        cohesion: 'Cohesion (c)',
        density: 'Bulk Density',
        sinkage: 'Wheel Sinkage',
      },
      footerNote:
        'Bekker-Wong terramechanics model calibrated with Curiosity & Perseverance wheel telemetry.',
      closeOverlay: 'Close Overlay',
    },
    locationDetail: {
      analogMatchFor: 'Analog match for',
      distanceLabel: 'Distance:',
      exportJson: 'Export JSON',
      tabs: {
        features: 'Side-by-Side Features',
        evidence: 'Literature Evidence',
        json: 'Raw JSON Contract',
      },
      marsWindowBadge: '[Mars Target Window]',
      earthWindowBadge: '[Earth Analog Window]',
      centerLabel: 'Center:',
      bboxLabel: 'BBox:',
      harmonizedMars: 'Harmonized with MOLA and CRISM',
      harmonizedEarth: 'Harmonized with SRTMGL1 and EMIT',
      sideBySideTitle: 'GET /v1/regions/{id}/features Side-by-Side Comparison',
      unitAccurate: 'Unit-accurate',
      tableHeaders: {
        featureName: 'Feature Name',
        marsCol: 'Mars',
        earthCol: 'Earth',
        notesCol: 'Harmonization Notes',
      },
      featureRows: {
        elevation: { name: 'Elevation (m)', note: 'Planetary baseline not compared across planets' },
        slope: { name: 'Slope (p90)', note: 'Harmonized 450m DEM' },
        tri: { name: 'Terrain Ruggedness (TRI)', note: 'Riley et al. TRI index' },
        roughness: { name: 'Roughness scale', note: 'Optical micro-relief' },
        albedo: { name: 'Bolometric Albedo', note: 'Surface reflectance' },
        thermal: { name: 'Thermal Inertia', note: 'Diurnal thermal curve' },
        smectite: { name: 'Smectite / Clays', note: 'CRISM vs EMIT' },
        carbonate: { name: 'Carbonate Fraction', note: 'Hydromagnesite/Magnesite' },
        sulfate: { name: 'Sulfate Minerals', note: 'Gypsum/Bassanite' },
      },
      rankStabilityTitle: 'Bootstrap Rank Stability',
      rankStabilitySub: 'Share of 1,000 bootstrap runs',
      distanceLimitTitle: 'Distance vs Good Limit',
      distanceLimitSub: '≤ 1.0 represents a qualified match',
      windowCoverageTitle: 'Window Coverage',
      windowCoverageSub: 'Real measurement backed pixels',
      evidenceIntro:
        'Verified RAG evidence passages retrieved from peer-reviewed planetary geology and astrobiology literature.',
      openDoi: 'Open Document DOI Citation',
      rawJsonDesc: 'Exact JSON response matching Tira Nova POST /v1/analyze schema',
      copyJson: 'Copy JSON',
      copied: 'Copied',
      footerEngine: 'Tira Nova NASA Space Apps · Engine Version 0.1.4',
    },
    api: {
      statusConnecting: 'SYNCING API...',
      statusConnected: 'LIVE FASTAPI LINK',
      statusOffline: 'API OFFLINE (FALLBACK)',
      offlineBannerTitle: 'Live FastAPI Backend Unreachable:',
      offlineBannerBody: 'Configure VITE_API_URL to your Render/FastAPI endpoint. Showing baseline catalog until connection succeeds.',
      retryConnection: 'Retry Live API',
      reloadBackend: 'Reload Data',
      reloadingBackend: 'Reloading...',
      rowsLoaded: 'rows',
      onlyRankedLabel: 'EMIT Ranking',
      onlyRankedAll: 'All',
      onlyRankedEmit: 'Ranked',
      methodLimitsTitle: 'Method Limits & Constraints',
      showLimits: 'Show limits',
      hideLimits: 'Hide limits',
      mineralMatchLabel: 'Mineral Match',
      combinedScoreLabel: 'Combined Score',
      finalRankLabel: 'EMIT Rank',
      terrainRankLabel: 'Terrain Rank',
      slopeLimitLabel: 'Slope p90 / Limit',
      slopeWithinLimit: 'Within Limit',
      slopeExceedsLimit: 'Exceeds Limit',
      emitStatuses: {
        ok: 'EMIT OK',
        low_coverage: 'Low Coverage',
        no_target_mineral: 'No Target Mineral',
        no_emit_data: 'No EMIT Data',
        terrain_only: 'Terrain Only',
      },
      flagLabels: {
        non_discriminating_terrain: 'Non-Discriminating Terrain',
        minerals_no_emit_data: 'No EMIT Coverage',
        minerals_low_coverage: 'Low Mineral Coverage',
        minerals_no_target_mineral: 'No Target Mineral Hit',
        minerals_terrain_only: 'Terrain-Only Comparison',
        single_mineral_signal: 'Single Mineral Signal',
        provisional_targets: 'Provisional Targets',
        unverified_source_pixels: 'Unverified Source Pixels',
        exploratory_only: 'Exploratory Only',
        single_scene_pair: 'Single Scene Pair (Mars)',
      },
      loadingMatches: 'Querying live FastAPI analog matrix...',
      crismEvidenceTitle: 'Live CRISM Mineral Evidence (/api/evidence)',
      crismCoverageLabel: 'CRISM Coverage:',
      crismDatesLabel: 'Dates:',
      crismTargetsLabel: 'Target Mineral Classes',
      crismTopDetectsLabel: 'Top CRISM Detection Bands (*_detect_pct)',
      noCrismEvidence: 'CRISM spectral evidence tables are not loaded for this region on the active backend.',
      thermalSectionTitle: 'Phase 2 Thermal Exploratory Telemetry (THEMIS / MODIS)',
      thermalExploratoryBadge: 'Exploratory Only · Not In Match Ranking',
      thermalDayTemp: 'Mean Day Temp',
      thermalNightTemp: 'Mean Night Temp',
      thermalDiurnalRange: 'Diurnal Range',
      thermalPlanetRank: 'Planet Range Rank',
      thermalCoverage: 'Min Coverage',
      thermalNoData: 'Phase 2 thermal CSV files (themis_features.csv / earth_thermal_features.csv) are not currently loaded on the backend.',
      thermalModeTab: 'Phase 2 Thermal (Live API)',
      terramechanicsModeTab: 'Regolith Terramechanics',
      thermalLimitsTitle: 'Exploratory Thermal Method Limits',
      crossMissionTitle: 'Cross-Mission Comparison (/api/matches/{earth_id})',
      lunarLiveAnalogsTitle: 'Live Backend Known Analog Clusters (/api/analogs & /api/thermal)',
      lunarLiveAnalogsSub: 'Terrestrial analog windows & exploratory Earth thermal baselines synced from FastAPI',
    },
  },
  ar: {
    common: {
      brandName: 'تيرا نوفا',
      challengeLabel: 'تحدي ناسا لتطبيقات الفضاء 2026',
      earthMarsMatrix: 'مصفوفة النظائر الأرضية-المريخية',
      mars: 'المريخ',
      earth: 'الأرض',
      moon: 'القمر',
      all: 'الكل',
      noData: 'لا توجد بيانات',
      close: 'إغلاق',
      done: 'تم',
      km: 'كم',
      m: 'م',
      deg: 'درجة',
      cm: 'سم',
      lat: 'خط العرض',
      lon: 'خط الطول',
      datasets: 'مجموعات البيانات',
      window: 'النافذة',
      grid450m: 'الشبكة: 450 م',
      statusNominal: 'الحالة: اسمية',
      vs: 'مقابل',
      notAvailable: 'غير متاح',
    },
    header: {
      nav: {
        desktop: 'مصفوفة النظائر',
        mars_telemetry: 'قياسات المريخ',
        lunar_outposts: 'المواقع القمرية',
        spectral_twins: 'التوائم الطيفية',
        regolith_sensors: 'مستشعرات التربة',
        location_detail: 'تفاصيل النظير',
      },
      runAnalogMatrix: 'تشغيل مصفوفة النظائر',
      computingEngine: 'جاري تشغيل المحرك...',
      langToggleAria: 'التبديل إلى اللغة الإنجليزية',
    },
    sidebar: {
      operationalNodes: 'العقد التشغيلية',
      missionControlSub: 'مركز قيادة مهام ناسا',
      orbitalLinkStatus: 'SYS-VER 4.8.2 // الرابط المداري نشط',
      openNavMenu: 'فتح قائمة التنقل',
      closeNavMenu: 'إغلاق قائمة التنقل',
      nodeTags: {
        desktop: 'المحرك الأساسي',
        mars_telemetry: 'MOLA · CRISM',
        lunar_outposts: 'ARTEMIS LOLA',
        spectral_twins: 'التحليل الطيفي',
        regolith_sensors: 'ميكانيكا التربة',
      },
    },
    stages: {
      extracting: 'استخراج السمات (شبكة 450 م)...',
      normalizing: 'المحرك: تطبيع أوزان z-score...',
      validating: 'RAG: التحقق من الاستشهادات العلمية...',
    },
    footer: {
      gridLabel: 'الشبكة: 450 م متجانسة',
      statusNominal: 'الحالة: اسمية',
    },
    desktop: {
      harmonizationTitle: 'تنبيه المواءمة البيانية:',
      harmonizationText:
        'التشابه المورفولوجي الإحصائي لا يعني التكافؤ الفيزيائي. تمت مواءمة البيانات بدقة شبكة ~450 م (MOLA · SRTMGL1 · EMIT · CRISM).',
      methodLabel: 'المنهجية:',
      thresholdLabel: 'العتبة ≤',
      targetMarsRegionLabel: '1. منطقة المريخ المستهدفة (نافذة ~51 كم)',
      missionObjectiveLabel: '2. هدف المهمة العلمية والأوزان',
      awaitingDataset: '(بانتظار مجموعة البيانات)',
      earthFilterLabel: 'نطاق الأرض',
      topKLabel: 'أعلى K',
      orbitalSensorProber: 'مسبار الاستشعار المداري',
      marsTargetBtn: 'هدف المريخ',
      earthAnalogsBtn: 'النظائر الأرضية',
      uniquenessTitle: 'التفرّد والتجمع المكاني',
      nonOverlappingWindows: 'نوافذ غير متداخلة ≤',
      manySimilarTitle: 'تم رصد مواقع متشابهة متعددة عالمياً:',
      manySimilarBodyPrefix:
        'المطابقة ليست ظاهرة جغرافية معزولة؛ إذ تستوفي عدة مناطق أرضية قيود مهمة',
      manySimilarBodySuffix: 'بدقة عالية.',
      highUniquenessTitle: 'تفرّد عالٍ:',
      highUniquenessBody:
        'مجموعة ضيقة فقط من المواقع الأرضية تعيد إنتاج هذه الظروف التضاريسية والمعدنية المحددة.',
      siteSingular: 'موقع',
      sitePlural: 'مواقع',
      rankedTerrestrialAnalogs: 'النظائر الأرضية المصنّفة',
      rankedMatchesCount: 'مطابقات مصنّفة',
      targetLabel: 'الهدف:',
      noGoodAnalogTitle: 'لم يتم العثور على نظير مناسب',
      noGoodAnalogBodyPrefix: 'لم تستوفِ أي نوافذ أرضية مرشحات المهمة الصارمة لمنطقة',
      noGoodAnalogBodySuffix:
        'وفق قواعد المواصفات، لا يتم عرض أقرب المطابقات غير المؤهلة كنتائج ناجحة.',
      excludedCandidates: 'المرشحات المستبعدة',
      rejectedSites: 'مواقع مرفوضة',
      hideDetails: 'إخفاء التفاصيل',
      showReasons: 'عرض الأسباب',
      missions: {
        rover_mobility: {
          label: 'حركية المركبة الجوالة',
          description:
            'انحدار التضاريس والتضاريس الدقيقة وخشونة السطح لتخطيط مسار المركبة وتجنب المخاطر.',
        },
        geobiology_biosignatures: {
          label: 'الجيولوجيا الحيوية والبصمات الحيوية',
          description:
            'الرسوبيات البحيرية القديمة، معادن الطين الدلتاوية، المتبخرات، ونظائر حفظ البصمات الحيوية الكيميائية.',
        },
        subsurface_ice: {
          label: 'التنقيب عن الجليد تحت السطحي',
          description:
            'الأرض المضلّعة شبه الجليدية، التشققات الحرارية، فروق القصور الحراري، واستقرار الثرى الجليدي.',
        },
        dust_abrasion: {
          label: 'الغبار وتآكل الثرى السطحي',
          description:
            'زحف الرمال الريحي، معدلات تآكل الجسيمات الدقيقة، الالتصاق الكهروستاتيكي، وملامح الحجب البصري.',
        },
        solar_irradiance: {
          label: 'الطاقة الشمسية والحرارية',
          description:
            'التذبذب الحراري النهاري، البياض السطحي (Albedo)، ترسب الغبار على الألواح الشمسية، واستدامة الطاقة.',
        },
      },
      areas: {
        'Atacama Altiplano': 'هضبة أتاكاما المرتفعة',
        'Anatolian Plateau': 'هضبة الأناضول',
        'Hawaiian Shield': 'الدرع البركاني في هاواي',
        'Arctic High Permafrost': 'التربة الصقيعية القطبية العليا',
      },
      excludedReasons: {
        'filter:slope_p90_deg exceeds mission limit (18.2 deg > 15 deg)':
          'مرشح slope_p90_deg يتجاوز حد المهمة (18.2 درجة > 15 درجة)',
        'coverage:missing_emit_spectral_coverage':
          'تغطية ناقصة: غياب التغطية الطيفية لمستشعر EMIT',
      },
    },
    deltaCards: {
      weightedDistance: 'المسافة الموزونة',
      zNorm: 'تطبيع-z',
      goodMatchLimit: 'مطابقة جيدة ≤ 0.350',
      valid: 'صالح',
      slopeDivergence: 'تباين الانحدار (p90)',
      deltaDeg: 'Δ درجة',
      match92: 'تطابق 92%',
      terrainRuggedness: 'مؤشر وعورة التضاريس (TRI)',
      deltaRelief: 'Δ التضرس',
      high: 'مرتفع',
      confidenceTier: 'مستوى الثقة',
      bootstrapStability: 'ثبات المعاينة (Bootstrap)',
      candidatesInRange: 'مرشحات ضمن النطاق',
      calibrated: 'معاير',
      confidenceLevels: {
        high: 'مرتفع',
        medium: 'متوسط',
        low: 'منخفض',
      },
    },
    resultCard: {
      coordinates: 'الإحداثيات:',
      analogDistance: 'مسافة التناظر',
      confidence: 'الثقة',
      factorBreakdown: 'تحليل مساهمة العوامل',
      contributionHint: 'المساهمة = الحصة من المسافة',
      weight: 'الوزن:',
      coverage: 'التغطية:',
      contribution: 'المساهمة:',
      featuresNotCompared: 'سمات لم تتم مقارنتها (غير متوفرة في مجموعة البيانات):',
      scientificEvidence: 'الأدلة العلمية',
      papers: 'أوراق بحثية',
      spectralBands: 'النطاقات الطيفية',
      regolithData: 'بيانات الثرى',
      fullDetail: 'التفاصيل الكاملة',
      readPublicationSource: 'قراءة المصدر البحثي',
      page: 'صفحة',
      verdicts: {
        similar: 'متشابه',
        different: 'مختلف',
        unknown: 'غير معروف',
      },
      supports: {
        similarity: 'يدعم التشابه',
        difference: 'يوضح الاختلاف',
        limitation: 'قيد منهجي',
      },
      factorLabels: {
        slope_p90_deg: 'الانحدار (المئين التسعون p90)',
        tri_mean_m: 'مؤشر وعورة التضاريس (TRI)',
        roughness_cm: 'مقياس خشونة السطح',
        mineral_smectite_index: 'مؤشر السيليكات الورقية / السميكتايت',
      },
      warningTexts: {
        TERRAIN_SCALE_GRID:
          'محسوبة على شبكة متجانسة بدقة ~450 م؛ الجلاميد الدقيقة (<30 سم) غير مرصودة في نموذج الارتفاع الإقليمي.',
        ATMOSPHERIC_PRESSURE_GAP:
          'الضغط الجوي الأرضي (~67-101 كيلوباسكال) لا يحاكي رفع الغبار في شبه الفراغ المريخي (0.6 كيلوباسكال).',
      },
    },
    globe: {
      marsTitle: 'شاشة استطلاع المريخ HUD',
      marsSub: 'سطح متجانس MOLA + CRISM (450 م)',
      earthTitle: 'مصفوفة مسح النظائر الأرضية',
      earthSub: 'نظائر متجانسة SRTMGL1 + EMIT',
      moonTitle: 'استطلاع أرتميس القمري',
      moonSub: 'مسح قواعد أرتميس LOLA + LROC',
      toggle2d: 'مسطح 2D',
      toggle3d: 'كرة 3D',
      toggleAutoRotate: 'تبديل الدوران المداري التلقائي',
      resetView: 'إعادة ضبط العرض والهدف',
      targetLocked: 'تم تثبيت الهدف',
      elevShort: 'الارتفاع:',
      slopeShort: 'الانحدار:',
      clickForDossier: 'انقر لفتح ملف الهدف',
      sitesLabel: 'المواقع:',
    },
    marsTelemetry: {
      headerEyebrow: 'قياسات الاستطلاع المداري عن بُعد',
      categoryLabel: 'الفئة:',
      stratigraphyTitle: 'الطبقات الجيولوجية والسياق البنيوي للهدف',
      knownAnalogs: 'النظائر الأرضية المعروفة:',
      atmPressure: 'الضغط الجوي',
      atmPressureSub: '6.12 مليبار (~0.6% من الأرض)',
      surfaceTemp: 'حرارة السطح',
      surfaceTempSub: 'اليومي: -108°م إلى +12°م',
      solarFlux: 'التدفق الشمسي',
      solarFluxSub: 'عتامة الغبار Tau = 0.45',
      windVelocity: 'سرعة الرياح',
      windVelocitySub: 'ذروة الهبّات 18.2 م/ث',
      tabs: {
        topography: 'التضاريس',
        environmental: 'البيئة',
        geology: 'الجيولوجيا',
      },
      findEarthAnalogs: 'ابحث عن النظائر الأرضية',
      molaTransectTitle: 'مقطع ارتفاعات MOLA (ملف نافذة 51 كم)',
      slopeDistTitle: 'التوزيع التكراري لتدرج الانحدار',
      roverMaxSlope: 'الحد الأقصى لهيكل المركبة ≤ 22°',
      diurnalTempTitle: 'التغير النهاري لحرارة السطح والضغط الجوي',
      solSimulation: 'محاكاة اليوم المريخي Sol 1042',
      gases: {
        co2: 'CO2 (ثاني أكسيد الكربون)',
        n2: 'N2 (النيتروجين الجزيئي)',
        ar: 'Ar (الأرجون)',
        trace: 'آثار O2 / H2O',
      },
      crismTitle: 'اكتشافات الأطياف المعدنية CRISM',
      minerals: {
        phylloTitle: 'السيليكات الورقية Fe/Mg',
        phylloDesc: 'طين النونترونايت والسابونايت في رواسب الدلتا',
        carbTitle: 'الهيدروماغنيسايت والكربونات',
        carbDesc: 'مصاطب حوض البحيرة الهامشي (نظير بحيرة Salda)',
        olivineTitle: 'تجمعات الأوليفين',
        olivineDesc: 'حزمة امتصاص عريضة عند 1.0 ميكرومتر في وحدة Séítah',
        sulfateTitle: 'الكبريتات المائية',
        sulfateDesc: 'شقوق وعقيدات تبخرية ثانوية',
      },
    },
    lunarOutposts: {
      headerEyebrow: 'مصفوفة المواقع المرشحة لمعسكر أرتميس القمري',
      locationTablistAria: 'مواقع القواعد القمرية',
      shortLabels: {
        shackleton: 'Shackleton (شاكليتون)',
        malapert: 'Malapert (مالابرت)',
        marius: 'Marius (ماريوس)',
      },
      tacticalProfileTitle: 'الملف التكتيكي للموقع والنظام الحراري',
      safetyDossierBtn: 'ملف السلامة',
      peakIllumination: 'ذروة الإضاءة الشمسية',
      lolaElevation: 'ارتفاع LOLA',
      slopeP90: 'الانحدار (المئين 90)',
      suitabilityIndexTitle: 'مؤشر ملاءمة معسكر أرتميس القمري',
      compositeLabel: 'المركّب:',
      radarSubjects: {
        'Solar Illumination': 'الإضاءة الشمسية',
        'Earth Line-of-Sight': 'خط الرؤية للأرض',
        'PSR Ice Proximity': 'القرب من جليد PSR',
        'Landing Slope Safety': 'سلامة انحدار الهبوط',
        'Thermal Stability': 'الاستقرار الحراري',
        'Trafficability Index': 'مؤشر قابلية الحركة',
      },
      simulantsTitle: 'محاكيات التربة الأرضية الميدانية',
      calibratedFor: 'معايرة لموقع',
      simulantsSourceNote: 'اختبارات NASA Desert RATS / التطابق المعدني',
      tableHeaders: {
        simulant: 'المحاكِي / الحقل',
        origin: 'الأصل الأرضي',
        mineralogy: 'التركيب المعدني',
        density: 'الكثافة (غ/سم³)',
        friction: 'الاحتكاك (°)',
        fidelity: 'الدقة التمثيلية',
      },
      volatileWaterIce: 'جليد الماء المتطاير',
      electrostaticField: 'المجال الكهروستاتيكي',
      earthDirectComm: 'الاتصال المباشر بالأرض',
      safetyRatingPrefix: 'تصنيف سلامة السطح:',
      landingEllipsePrefix: 'قطع الهبوط الناقص',
      openTargetDossier: 'فتح ملف الهدف ←',
      thermalLabels: {
        'PSR Cold Trap Temp': 'حرارة مصيدة البرد PSR',
        'Ridge Diurnal Swing': 'التأرجح الحراري للحافة',
        'Lava Tube Interior': 'داخل أنبوب الحمم',
      },
      siteTelemetry: {
        'Shackleton_Rim_lat-89.9_lon0.0': {
          category: 'موقع مرشح للقاعدة القمرية',
          description:
            'الموقع المرشح الرئيسي لمعسكر أرتميس الأساسي. تتلقى الحافة إضاءة شمسية شبه مستمرة (~86–92% من السنة القمرية) بمحاذاة مصائد متطايرات مظللة بشكل دائم.',
          peakIllumination: '~86–92% سنوياً',
          thermalLabel: 'حرارة مصيدة البرد PSR',
          thermalValue: '< 38 K (-235°م)',
          waterIceSource: 'عمود الاصطدام LCROSS / M3',
          electrostaticNote: 'ارتفاع الغبار عند خط الغسق',
          earthCommUptime: '84.5% جاهزية',
          earthCommNote: 'نافذة أفق الحافة المباشرة',
          safetyHazard:
            'تدرجات حافة متوسطة (p90 = 14.2°)؛ منصات هبوط مسطحة < 5° محققة على قمة الحافة',
        },
        'Malapert_Mountain_lat-86.04_lon2.7': {
          category: 'سلسلة ترحيل الاتصالات والموئل',
          description:
            'كتلة جبلية ضخمة في القطب الجنوبي توفر خط رؤية مباشر للاتصال بالأرض ونقطة ارتكاز مرتفعة لالتقاط الطاقة الشمسية.',
          peakIllumination: '~89% ذروة الضوء الأبدي',
          thermalLabel: 'التأرجح الحراري للحافة',
          thermalValue: '95 K إلى 230 K',
          waterIceSource: 'نيوترونات فوق حرارية LEND',
          electrostaticNote: 'أثر الرياح الشمسية في التضاريس العالية',
          earthCommUptime: '99.2% جاهزية',
          earthCommNote: 'ترحيل أرضي غير محجوب',
          safetyHazard:
            'منحدرات جبلية حادة (p90 = 18.5°)؛ هضبة قمة ضيقة بعرض 400 م تتطلب هبوطاً دقيقاً',
        },
        'Oceanus_Procellarum_lat23.4_lon-44.1': {
          category: 'منور تحت سطحي لأنابيب الحمم',
          description:
            'حفرة انهيار عميقة تحت السطح تؤدي إلى أنابيب حمم بازلتية سليمة توفر درعاً طبيعياً من الإشعاع الكوني والتقلب الحراري.',
          peakIllumination: '~48% (نهار استوائي)',
          thermalLabel: 'داخل أنبوب الحمم',
          thermalValue: '253 K (-20°م مستقر)',
          waterIceSource: 'قياسات SELENE / LRO Diviner',
          electrostaticNote: 'ثرى البحار القمرية منخفضة العرض',
          earthCommUptime: '100% مباشر (الجانب القريب)',
          earthCommNote: 'تغطية ترحيل مستمرة',
          safetyHazard:
            'سهل بازلتي أملس يحيط بالمنور (p90 = 12.8°)، لكن حافة حفرة الانهيار العمودية بارتفاع 65 م تشكل خطر سقوط',
        },
      },
    },
    lunarDossier: {
      titlePrefix: 'ملف الهدف القمري',
      safetyBadgePrefix: 'السلامة:',
      safetyRatings: {
        NOMINAL: 'اسمي',
        CAUTION: 'تحذير',
        ELEVATED: 'مرتفع الخطورة',
      },
      windowLabel: 'النافذة:',
      bboxLabel: 'صندوق الإحاطة:',
      sourcesLabel: 'المصادر:',
      elevationSectionTitle: 'الارتفاع ومورفولوجيا التضاريس (LOLA 450m / LROC NAC)',
      elevationLabel: 'الارتفاع',
      meanLunarDatum: 'متوسط المرجع القمري',
      slopeLabel: 'الانحدار (المئين 90)',
      landerLimit: 'حد مركبة الهبوط ≤ 15°',
      triLabel: 'الوعورة (TRI)',
      localRelief: 'تباين التضرس المحلي',
      roughnessLabel: 'خشونة السطح',
      clastScale: 'مقياس الشظايا دون المتر',
      safetySectionTitle: 'مقاييس سلامة السطح والهبوط',
      suitabilityScore: 'درجة الملاءمة:',
      landingSlopeAssessment: 'تقييم انحدار الهبوط',
      boulderHazard: 'مخاطر الصخور والمقذوفات',
      radiationOverburden: 'الإشعاع والغطاء الصخري',
      bearingCapacity: 'قدرة التحمل',
      wheelSinkage: 'غوص العجلات',
      dustAbrasion: 'تآكل الغبار',
      dustRisks: {
        Low: 'منخفض',
        Moderate: 'متوسط',
        High: 'مرتفع',
      },
      landingEllipse: 'نطاق الهبوط',
      mitigationHeader: 'بروتوكول التخفيف الموصى به · زمن الذهاب والإياب للضوء',
      lightTimeLabel: 'ث',
      matchedSimulantsTitle: 'محاكيات الثرى الأرضية المطابقة',
      topMatch: 'أعلى تطابق:',
      footerLabel: 'ملف استطلاع أرتميس',
      closeDossier: 'إغلاق الملف',
    },
    spectralTwins: {
      title: 'تحليل التوائم الطيفية · مطابق المنحنيات فائقة الطيف',
      subtitle: 'CRISM (مسبار المريخ MRO) مقابل EMIT (مطياف محطة الفضاء الدولية)',
      pearsonLabel: 'معامل ارتباط بيرسون (r):',
      spectraRangeTitle: 'أطياف الانعكاس [0.4 - 2.5 ميكرومتر (400 - 2500 نانومتر)]',
      mineralClassLabel: 'الفئة المعدنية:',
      marsCrism: 'المريخ (CRISM)',
      earthEmit: 'الأرض (EMIT)',
      wavelengthLabel: 'الطول الموجي:',
      peaksTitle: 'قمم الامتصاص التشخيصية المؤكدة',
      matchSuffix: 'تطابق',
      formulaLabel: 'الصيغة الكيميائية:',
      absorptionPeakLabel: 'قمة الامتصاص:',
      diagnosticConfirmed: 'تم تأكيد النطاق التشخيصي',
      footerNote:
        'مواءمة بدقة شبكة 450 م. الأطياف المخبرية عبر مكتبات USGS و CRISM الطيفية.',
      closeViewer: 'إغلاق العارض',
    },
    regolithSensors: {
      title: 'مستشعرات الثرى الجيوتقنية وميكانيكا التربة',
      subtitle: 'ميكانيكا التربة الموقعية · غوص العجلات · فحص سمية البيركلورات',
      primarySiteLabel: 'الموقع المرجعي الأساسي',
      compareSiteLabel: 'النظير الميداني للمقارنة',
      wheelSinkage: 'غوص العجلات (Bekker)',
      bearingCapacity: 'قدرة التحمل',
      perchlorateLevel: 'نسبة البيركلورات',
      trafficabilityIndex: 'مؤشر قابلية الحركة',
      analogPrefix: 'النظير:',
      safeForRover: 'آمن لقيادة المركبة الجوالة',
      trafficabilityValues: {
        optimal: 'مثالي',
        moderate: 'متوسط',
        hazard: 'خطر',
      },
      grainChartTitle: 'التوزيع الحجمي لحبيبات التربة (%)',
      terramechanicsTitle: 'مقارنة ميكانيكا التربة Mohr-Coulomb',
      physicalParam: 'المعامل الفيزيائي',
      divergence: 'التباين (Δ)',
      params: {
        bearing: 'قدرة التحمل (kPa)',
        friction: 'زاوية الاحتكاك الداخلي',
        cohesion: 'التماسك (c)',
        density: 'الكثافة الظاهرية',
        sinkage: 'غوص العجلات',
      },
      footerNote:
        'نموذج Bekker-Wong لميكانيكا التربة معاير ببيانات عجلات Curiosity و Perseverance.',
      closeOverlay: 'إغلاق الطبقة',
    },
    locationDetail: {
      analogMatchFor: 'نظير مطابق لمنطقة',
      distanceLabel: 'المسافة:',
      exportJson: 'تصدير JSON',
      tabs: {
        features: 'مقارنة السمات جنباً إلى جنب',
        evidence: 'الأدلة البحثية',
        json: 'عقد JSON الخام',
      },
      marsWindowBadge: '[نافذة هدف المريخ]',
      earthWindowBadge: '[نافذة النظير الأرضي]',
      centerLabel: 'المركز:',
      bboxLabel: 'صندوق الإحاطة:',
      harmonizedMars: 'متجانس مع MOLA و CRISM',
      harmonizedEarth: 'متجانس مع SRTMGL1 و EMIT',
      sideBySideTitle: 'مقارنة GET /v1/regions/{id}/features جنباً إلى جنب',
      unitAccurate: 'وحدات دقيقة',
      tableHeaders: {
        featureName: 'اسم السمة',
        marsCol: 'المريخ',
        earthCol: 'الأرض',
        notesCol: 'ملاحظات المواءمة',
      },
      featureRows: {
        elevation: { name: 'الارتفاع (م)', note: 'المرجع الكوكبي لا يُقارن عبر الكواكب' },
        slope: { name: 'الانحدار (p90)', note: 'نموذج ارتفاع رقمي متجانس 450 م' },
        tri: { name: 'وعورة التضاريس (TRI)', note: 'مؤشر Riley et al. TRI' },
        roughness: { name: 'مقياس الخشونة', note: 'التضرس الدقيق البصري' },
        albedo: { name: 'البياض البولومتري (Albedo)', note: 'انعكاسية السطح' },
        thermal: { name: 'القصور الحراري', note: 'المنحنى الحراري النهاري' },
        smectite: { name: 'السميكتايت / الطين', note: 'مقارنة CRISM و EMIT' },
        carbonate: { name: 'نسبة الكربونات', note: 'الهيدروماغنيسايت / الماغنيسايت' },
        sulfate: { name: 'معادن الكبريتات', note: 'الجبس / الباسانايت' },
      },
      rankStabilityTitle: 'ثبات الترتيب (Bootstrap)',
      rankStabilitySub: 'حصة من 1,000 تشغيل معاينة',
      distanceLimitTitle: 'المسافة مقابل حد الجودة',
      distanceLimitSub: '≤ 1.0 يمثل مطابقة مؤهلة',
      windowCoverageTitle: 'تغطية النافذة',
      windowCoverageSub: 'بكسلات مدعومة بقياس فعلي',
      evidenceIntro:
        'مقتطفات أدلة RAG محققة ومسترجعة من الأدبيات العلمية المحكّمة في جيولوجيا الكواكب والأحياء الفلكية.',
      openDoi: 'فتح مرجع DOI للوثيقة',
      rawJsonDesc: 'استجابة JSON الدقيقة المطابقة لمخطط Tira Nova POST /v1/analyze',
      copyJson: 'نسخ JSON',
      copied: 'تم النسخ',
      footerEngine: 'تيرا نوفا · تحدي ناسا لتطبيقات الفضاء · إصدار المحرك 0.1.4',
    },
    api: {
      statusConnecting: 'جاري مزامنة API...',
      statusConnected: 'رابط FASTAPI مباشر',
      statusOffline: 'الخادم غير متصل (احتياطي)',
      offlineBannerTitle: 'تعذّر الاتصال بخادم FastAPI المباشر:',
      offlineBannerBody: 'اضبط المتغير VITE_API_URL لرابط الخادم الفعلي. يتم عرض البيانات الأساسية مؤقتاً حتى يعود الاتصال.',
      retryConnection: 'إعادة المحاولة',
      reloadBackend: 'تحديث البيانات',
      reloadingBackend: 'جاري التحديث...',
      rowsLoaded: 'صف',
      onlyRankedLabel: 'تصنيف EMIT',
      onlyRankedAll: 'الكل',
      onlyRankedEmit: 'المصنّف',
      methodLimitsTitle: 'حدود المنهجية والقيود العلمية',
      showLimits: 'عرض الحدود',
      hideLimits: 'إخفاء الحدود',
      mineralMatchLabel: 'تطابق المعادن',
      combinedScoreLabel: 'النتيجة المركّبة',
      finalRankLabel: 'تصنيف EMIT',
      terrainRankLabel: 'رتبة التضاريس',
      slopeLimitLabel: 'الانحدار p90 / الحد',
      slopeWithinLimit: 'ضمن الحد',
      slopeExceedsLimit: 'يتجاوز الحد',
      emitStatuses: {
        ok: 'EMIT صالح',
        low_coverage: 'تغطية منخفضة',
        no_target_mineral: 'لا يوجد معدن مستهدف',
        no_emit_data: 'لا توجد بيانات EMIT',
        terrain_only: 'تضاريس فقط',
      },
      flagLabels: {
        non_discriminating_terrain: 'تضاريس غير مُمَيِّزة',
        minerals_no_emit_data: 'غياب تغطية EMIT',
        minerals_low_coverage: 'تغطية معدنية منخفضة',
        minerals_no_target_mineral: 'عدم تطابق المعدن المستهدف',
        minerals_terrain_only: 'مقارنة تضاريس فقط',
        single_mineral_signal: 'إشارة معدنية وحيدة',
        provisional_targets: 'أهداف مؤقتة',
        unverified_source_pixels: 'بكسلات مصدر غير محققة',
        exploratory_only: 'استكشافي فقط',
        single_scene_pair: 'زوج مشاهد واحد (المريخ)',
      },
      loadingMatches: 'جاري استعلام مصفوفة النظائر من الخادم المباشر...',
      crismEvidenceTitle: 'أدلة معادن CRISM المباشرة (/api/evidence)',
      crismCoverageLabel: 'تغطية CRISM:',
      crismDatesLabel: 'التواريخ:',
      crismTargetsLabel: 'فئات المعادن المستهدفة',
      crismTopDetectsLabel: 'أبرز نطاقات الكشف الطيفي (*_detect_pct)',
      noCrismEvidence: 'جداول أدلة CRISM غير محمّلة لهذه المنطقة على الخادم النشط.',
      thermalSectionTitle: 'قياسات المرحلة الثانية الحرارية الاستكشافية (THEMIS / MODIS)',
      thermalExploratoryBadge: 'استكشافي فقط · لا يدخل في ترتيب المطابقة',
      thermalDayTemp: 'متوسط حرارة النهار',
      thermalNightTemp: 'متوسط حرارة الليل',
      thermalDiurnalRange: 'المدى اليومي',
      thermalPlanetRank: 'الترتيب داخل الكوكب',
      thermalCoverage: 'أدنى تغطية',
      thermalNoData: 'ملفات المرحلة الثانية الحرارية (themis_features.csv / earth_thermal_features.csv) غير محمّلة حالياً على الخادم.',
      thermalModeTab: 'حرارة المرحلة الثانية (مباشر)',
      terramechanicsModeTab: 'ميكانيكا التربة السطحية',
      thermalLimitsTitle: 'حدود المنهجية الحرارية الاستكشافية',
      crossMissionTitle: 'المقارنة عبر المهام (/api/matches/{earth_id})',
      lunarLiveAnalogsTitle: 'تجمعات النظائر المعروفة من الخادم (/api/analogs و /api/thermal)',
      lunarLiveAnalogsSub: 'نوافذ النظائر الأرضية وخطوط الأساس الحرارية الاستكشافية متزامنة مع FastAPI',
    },
  },
};
