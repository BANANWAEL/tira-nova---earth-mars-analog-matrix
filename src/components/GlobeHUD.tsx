import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Planet, Region } from '../lib/types';
import { useLanguage } from '../lib/LanguageContext';
import { RotateCcw, Target, Globe as GlobeIcon, Map, Maximize2 } from 'lucide-react';

interface GlobeHUDProps {
  planet: Planet;
  selectedRegion?: Region;
  allRegions?: Region[];
  onSelectRegion?: (region: Region) => void;
  onInspectRegion?: (region: Region) => void;
  onReset?: () => void;
  className?: string;
}

export const GlobeHUD: React.FC<GlobeHUDProps> = ({
  planet,
  selectedRegion,
  allRegions = [],
  onSelectRegion,
  onInspectRegion,
  onReset,
  className = '',
}) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const markerPositionsRef = useRef<{ region: Region; x: number; y: number }[]>([]);
  const pointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const initialRotation = selectedRegion
    ? { lon: selectedRegion.center.lon, lat: selectedRegion.center.lat }
    : { lon: 77.45, lat: 18.44 };

  const [rotation, setRotation] = useState<{ lon: number; lat: number }>(initialRotation);
  const rotationRef = useRef<{ lon: number; lat: number }>(initialRotation);

  const [zoom, setZoom] = useState<number>(1);
  const zoomRef = useRef<number>(1);

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef<boolean>(false);

  const [projection, setProjection] = useState<'3d' | '2d'>('3d');
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);
  const hoveredRegionRef = useRef<Region | null>(null);
  const lastSyncedRegionIdRef = useRef<string | undefined>(selectedRegion?.region_id);

  // Default region for current planet (e.g. Jezero Crater Delta for Mars)
  const defaultRegion = useMemo(() => {
    return allRegions.find((r) => r.planet === planet) || allRegions[0];
  }, [allRegions, planet]);

  // Synchronize globe view when selected region ID changes externally
  useEffect(() => {
    if (selectedRegion && selectedRegion.region_id !== lastSyncedRegionIdRef.current) {
      lastSyncedRegionIdRef.current = selectedRegion.region_id;
      const nextRot = {
        lon: selectedRegion.center.lon,
        lat: selectedRegion.center.lat,
      };
      if (
        rotationRef.current.lon !== nextRot.lon ||
        rotationRef.current.lat !== nextRot.lat
      ) {
        rotationRef.current = nextRot;
        setRotation(nextRot);
      }
    }
  }, [selectedRegion?.region_id]);

  // Planet styling parameters
  const planetConfig = useMemo(() => {
    switch (planet) {
      case 'Mars':
        return {
          label: t.globe.marsTitle,
          color: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.25)',
          rimGlow: 'rgba(239, 68, 68, 0.2)',
          landColor: 'rgba(245, 158, 11, 0.18)',
          gridColor: 'rgba(245, 158, 11, 0.22)',
          accent: '#fbbf24',
          subLabel: t.globe.marsSub,
          features: [
            { name: 'Olympus Mons', lat: 18.65, lon: -133.8, r: 8 },
            { name: 'Valles Marineris', lat: -13.9, lon: -59.2, r: 12 },
            { name: 'Hellas Basin', lat: -42.7, lon: 70.0, r: 14 },
            { name: 'Isidis Planitia', lat: 12.9, lon: 87.0, r: 9 },
            { name: 'Elysium Mons', lat: 25.0, lon: 147.2, r: 7 },
            { name: 'Argyre Planitia', lat: -49.7, lon: -43.0, r: 10 },
          ],
        };
      case 'Earth':
        return {
          label: t.globe.earthTitle,
          color: '#06b6d4',
          glow: 'rgba(6, 182, 212, 0.28)',
          rimGlow: 'rgba(34, 211, 238, 0.25)',
          landColor: 'rgba(6, 182, 212, 0.16)',
          gridColor: 'rgba(6, 182, 212, 0.22)',
          accent: '#22d3ee',
          subLabel: t.globe.earthSub,
          features: [
            { name: 'Atacama Altiplano', lat: -24.0, lon: -68.5, r: 6 },
            { name: 'Sahara Shield', lat: 23.0, lon: 12.0, r: 15 },
            { name: 'Tibetan Plateau', lat: 31.0, lon: 88.0, r: 12 },
            { name: 'North American Basin', lat: 38.0, lon: -115.0, r: 9 },
            { name: 'Australian Outback', lat: -25.0, lon: 133.0, r: 11 },
          ],
        };
      case 'Moon':
      default:
        return {
          label: t.globe.moonTitle,
          color: '#06b6d4',
          glow: 'rgba(6, 182, 212, 0.22)',
          rimGlow: 'rgba(245, 158, 11, 0.15)',
          landColor: 'rgba(148, 163, 184, 0.16)',
          gridColor: 'rgba(6, 182, 212, 0.18)',
          accent: '#f59e0b',
          subLabel: t.globe.moonSub,
          features: [
            { name: 'Mare Tranquillitatis', lat: 8.5, lon: 31.4, r: 10 },
            { name: 'Mare Imbrium', lat: 32.8, lon: -15.6, r: 14 },
            { name: 'Oceanus Procellarum', lat: 18.4, lon: -57.4, r: 16 },
            { name: 'South Pole-Aitken Basin', lat: -53.0, lon: -169.0, r: 18 },
            { name: 'Shackleton Crater', lat: -89.9, lon: 0.0, r: 6 },
          ],
        };
    }
  }, [planet, t]);

  // Main canvas rendering loop — reads mutable rotation/zoom/hover from refs, never calls setState
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const currentRot = rotationRef.current;
      const currentZoom = zoomRef.current;
      const currentHovered = hoveredRegionRef.current;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.4 * currentZoom;
      const nextMarkerPositions: { region: Region; x: number; y: number }[] = [];

      if (projection === '3d') {
        // --- 3D ORTHOGRAPHIC PROJECTION ---
        // Atmospheric Rim Glow
        const gradient = ctx.createRadialGradient(cx, cy, radius * 0.82, cx, cy, radius * 1.08);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.85, planetConfig.glow);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.08, 0, Math.PI * 2);
        ctx.fill();

        // Planet Base Disk
        const bodyGrad = ctx.createRadialGradient(
          cx - radius * 0.35,
          cy - radius * 0.35,
          radius * 0.1,
          cx,
          cy,
          radius
        );
        bodyGrad.addColorStop(0, '#0a101d');
        bodyGrad.addColorStop(0.7, '#080d17');
        bodyGrad.addColorStop(1, '#04070e');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Planet Outer Rim Stroke
        ctx.strokeStyle = planetConfig.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Clipping region to the sphere
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();

        // 3D coordinate converter: (lat, lon) -> (x, y, visible)
        const rotLonRad = (currentRot.lon * Math.PI) / 180;
        const rotLatRad = (currentRot.lat * Math.PI) / 180;

        const project3D = (lat: number, lon: number): { x: number; y: number; visible: boolean } => {
          const phi = (lat * Math.PI) / 180;
          const lambda = (lon * Math.PI) / 180 - rotLonRad;

          // 3D unit coordinates on sphere
          const x0 = Math.cos(phi) * Math.sin(lambda);
          const y0 = Math.sin(phi);
          const z0 = Math.cos(phi) * Math.cos(lambda);

          // Rotate around X axis for tilt (lat)
          const y1 = y0 * Math.cos(rotLatRad) - z0 * Math.sin(rotLatRad);
          const z1 = y0 * Math.sin(rotLatRad) + z0 * Math.cos(rotLatRad);
          const x1 = x0;

          return {
            x: cx + x1 * radius,
            y: cy - y1 * radius,
            visible: z1 > 0, // front-facing hemisphere
          };
        };

        // Draw Parallels (Latitudes)
        ctx.strokeStyle = planetConfig.gridColor;
        ctx.lineWidth = 0.75;
        for (let lat = -60; lat <= 60; lat += 30) {
          ctx.beginPath();
          let firstPoint = true;
          for (let lon = -180; lon <= 180; lon += 5) {
            const p = project3D(lat, lon);
            if (p.visible) {
              if (firstPoint) {
                ctx.moveTo(p.x, p.y);
                firstPoint = false;
              } else {
                ctx.lineTo(p.x, p.y);
              }
            } else {
              firstPoint = true;
            }
          }
          ctx.stroke();
        }

        // Draw Meridians (Longitudes)
        for (let lon = -180; lon < 180; lon += 30) {
          ctx.beginPath();
          let firstPoint = true;
          for (let lat = -90; lat <= 90; lat += 5) {
            const p = project3D(lat, lon);
            if (p.visible) {
              if (firstPoint) {
                ctx.moveTo(p.x, p.y);
                firstPoint = false;
              } else {
                ctx.lineTo(p.x, p.y);
              }
            } else {
              firstPoint = true;
            }
          }
          ctx.stroke();
        }

        // Draw Simulated Geological Formations
        ctx.fillStyle = planetConfig.landColor;
        planetConfig.features.forEach((feat) => {
          const pt = project3D(feat.lat, feat.lon);
          if (pt.visible) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, feat.r * (radius / 150), 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = planetConfig.color + '44';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });

        // Draw Region Markers on the Globe
        allRegions
          .filter((r) => r.planet === planet)
          .forEach((reg) => {
            const pt = project3D(reg.center.lat, reg.center.lon);
            if (pt.visible) {
              nextMarkerPositions.push({ region: reg, x: pt.x, y: pt.y });
              const isSelected = selectedRegion?.region_id === reg.region_id;
              const isHovered = currentHovered?.region_id === reg.region_id;

              // Marker Ring
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, isSelected ? 7 : isHovered ? 6 : 4.5, 0, Math.PI * 2);
              ctx.fillStyle = isSelected ? planetConfig.accent : isHovered ? '#ffffff' : planetConfig.color;
              ctx.fill();

              if (isSelected || isHovered) {
                // Tactical target lock box
                ctx.strokeStyle = isSelected ? '#ffffff' : '#06b6d4';
                ctx.lineWidth = 1.5;
                const sz = isSelected ? 16 : 14;
                ctx.strokeRect(pt.x - sz / 2, pt.y - sz / 2, sz, sz);

                // Ping pulse
                const pulseR = 16 + Math.sin(Date.now() / 200) * 3.5;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, pulseR, 0, Math.PI * 2);
                ctx.strokeStyle = isSelected ? planetConfig.accent : '#22d3ee';
                ctx.lineWidth = 1.25;
                ctx.stroke();
              }

              // Label
              ctx.font = isSelected || isHovered ? 'bold 10px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
              ctx.fillStyle = isSelected || isHovered ? '#ffffff' : '#94a3b8';
              ctx.fillText(reg.name.split(' ')[0], pt.x + 12, pt.y + 3);
            }
          });

        ctx.restore();

        // Tactical HUD Crosshairs & Outer Corner Brackets
        ctx.strokeStyle = planetConfig.color + '66';
        ctx.lineWidth = 1;

        // North / South pole index
        const polePt = project3D(90, 0);
        if (polePt.visible) {
          ctx.beginPath();
          ctx.moveTo(polePt.x - 8, polePt.y);
          ctx.lineTo(polePt.x + 8, polePt.y);
          ctx.stroke();
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = planetConfig.color;
          ctx.fillText('N', polePt.x - 3, polePt.y - 8);
        }

        const southPolePt = project3D(-90, 0);
        if (southPolePt.visible) {
          ctx.beginPath();
          ctx.moveTo(southPolePt.x - 8, southPolePt.y);
          ctx.lineTo(southPolePt.x + 8, southPolePt.y);
          ctx.stroke();
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = planetConfig.accent;
          ctx.fillText('S-POLE', southPolePt.x - 16, southPolePt.y + 14);
        }

        // Center reticle
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy);
        ctx.lineTo(cx + 14, cy);
        ctx.moveTo(cx, cy - 14);
        ctx.lineTo(cx, cy + 14);
        ctx.stroke();
      } else {
        // --- 2D EQUIRECTANGULAR CYLINDRICAL PROJECTION ---
        const mapW = width - 40;
        const mapH = (width - 40) / 2;
        const ox = 20;
        const oy = cy - mapH / 2;

        // Map Border
        ctx.strokeStyle = planetConfig.color + '88';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ox, oy, mapW, mapH);

        // Map Grid
        ctx.strokeStyle = planetConfig.gridColor;
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= mapW; x += mapW / 12) {
          ctx.beginPath();
          ctx.moveTo(ox + x, oy);
          ctx.lineTo(ox + x, oy + mapH);
          ctx.stroke();
        }
        for (let y = 0; y <= mapH; y += mapH / 6) {
          ctx.beginPath();
          ctx.moveTo(ox, oy + y);
          ctx.lineTo(ox + mapW, oy + y);
          ctx.stroke();
        }

        // 2D Region Plot
        allRegions
          .filter((r) => r.planet === planet)
          .forEach((reg) => {
            const x = ox + ((reg.center.lon + 180) / 360) * mapW;
            const y = oy + ((90 - reg.center.lat) / 180) * mapH;
            nextMarkerPositions.push({ region: reg, x, y });
            const isSelected = selectedRegion?.region_id === reg.region_id;
            const isHovered = currentHovered?.region_id === reg.region_id;

            // Bounding box simulation
            if (reg.bbox) {
              const bx1 = ox + ((reg.bbox[0] + 180) / 360) * mapW;
              const by1 = oy + ((90 - reg.bbox[3]) / 180) * mapH;
              const bw = ((reg.bbox[2] - reg.bbox[0]) / 360) * mapW;
              const bh = ((reg.bbox[3] - reg.bbox[1]) / 180) * mapH;

              ctx.strokeStyle = isSelected ? planetConfig.accent : planetConfig.color + '55';
              ctx.lineWidth = 1;
              ctx.strokeRect(bx1, by1, Math.max(bw, 14), Math.max(bh, 14));
            }

            if (isSelected || isHovered) {
              const pulseR = 12 + Math.sin(Date.now() / 200) * 3;
              ctx.beginPath();
              ctx.arc(x, y, pulseR, 0, Math.PI * 2);
              ctx.strokeStyle = planetConfig.accent;
              ctx.lineWidth = 1.2;
              ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(x, y, isSelected ? 6.5 : isHovered ? 5.5 : 4, 0, Math.PI * 2);
            ctx.fillStyle = isSelected ? planetConfig.accent : isHovered ? '#ffffff' : planetConfig.color;
            ctx.fill();

            ctx.font = isSelected || isHovered ? 'bold 10px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
            ctx.fillStyle = isSelected || isHovered ? '#ffffff' : '#94a3b8';
            ctx.fillText(reg.name.split(' ')[0], x + 10, y + 3);
          });
      }

      markerPositionsRef.current = nextMarkerPositions;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [planet, projection, selectedRegion, allRegions, planetConfig]);

  // Helper: map mouse event to canvas coordinate space and find nearest marker
  const findMarkerAtPoint = (clientX: number, clientY: number): Region | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (clientX - rect.left) * scaleX;
    const cy = (clientY - rect.top) * scaleY;

    let closest: { region: Region; dist: number } | null = null;
    for (const marker of markerPositionsRef.current) {
      const dist = Math.hypot(cx - marker.x, cy - marker.y);
      if (dist <= 22 && (!closest || dist < closest.dist)) {
        closest = { region: marker.region, dist };
      }
    }
    return closest ? closest.region : null;
  };

  // Mouse / Touch Interaction for 3D globe rotation & marker clicks
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const nextRot = {
        lon: (rotationRef.current.lon - dx * 0.45) % 360,
        lat: Math.max(-85, Math.min(85, rotationRef.current.lat + dy * 0.45)),
      };
      rotationRef.current = nextRot;
      setRotation(nextRot);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const hit = findMarkerAtPoint(e.clientX, e.clientY);
    if (hoveredRegionRef.current?.region_id !== hit?.region_id) {
      hoveredRegionRef.current = hit;
      setHoveredRegion(hit);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    const moved = Math.hypot(
      e.clientX - pointerDownPosRef.current.x,
      e.clientY - pointerDownPosRef.current.y
    );

    if (moved < 6) {
      const hit = findMarkerAtPoint(e.clientX, e.clientY);
      if (hit) {
        onSelectRegion?.(hit);
        onInspectRegion?.(hit);
      }
    }
  };

  // Reset rotation, zoom, projection mode, and selected target cleanly via direct setters
  const handleReset = () => {
    const targetRegion = defaultRegion || selectedRegion;
    const nextRot = targetRegion
      ? { lon: targetRegion.center.lon, lat: targetRegion.center.lat }
      : { lon: 77.45, lat: 18.44 };

    rotationRef.current = nextRot;
    zoomRef.current = 1;
    isDraggingRef.current = false;
    hoveredRegionRef.current = null;

    setRotation(nextRot);
    setZoom(1);
    setProjection('3d');
    setIsDragging(false);
    setHoveredRegion(null);

    if (onReset) {
      onReset();
    } else if (defaultRegion && onSelectRegion && selectedRegion?.region_id !== defaultRegion.region_id) {
      lastSyncedRegionIdRef.current = defaultRegion.region_id;
      onSelectRegion(defaultRegion);
    }
  };

  return (
    <div className={`relative flex flex-col rounded-md border border-white/10 bg-[#0e131f]/85 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_0_24px_rgba(6,182,212,0.18)] ${className}`}>
      {/* HUD Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10 bg-[#080e1a]/90 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: planetConfig.color }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: planetConfig.color }}
            />
          </span>
          <span className="font-heading font-semibold tracking-wider text-slate-200">
            {planetConfig.label}
          </span>
          <span className="text-slate-500 font-mono hidden sm:inline">· {planetConfig.subLabel}</span>
        </div>

        {/* Projection and Reset Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setProjection((prev) => (prev === '3d' ? '2d' : '3d'))}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent hover:border-cyan-400/40 transition-all cursor-pointer"
            title={projection === '3d' ? t.globe.toggle2d : t.globe.toggle3d}
          >
            {projection === '3d' ? <Map className="w-3.5 h-3.5 text-cyan-400" /> : <GlobeIcon className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="uppercase">{projection === '3d' ? t.globe.toggle2d : t.globe.toggle3d}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded text-slate-400 bg-white/5 hover:text-cyan-400 hover:bg-cyan-950/40 border border-transparent hover:border-cyan-400/40 transition-all cursor-pointer"
            title={t.globe.resetView}
            aria-label={t.globe.resetView}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Stage */}
      <div
        className={`relative flex-1 min-h-[320px] flex items-center justify-center p-2 select-none overflow-hidden ${
          hoveredRegion ? 'cursor-pointer' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Concentric Orbital Trajectory Rings & Pulsing Satellite Nodes (3D Mode) */}
        {projection === '3d' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {/* Outer Counter-Rotating Orbital Ring */}
            <div className="w-[310px] h-[310px] sm:w-[340px] sm:h-[340px] rounded-full border border-dashed border-cyan-500/20 animate-[spin_36s_linear_infinite_reverse] relative">
              <span
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)] animate-pulse"
              />
              <span
                className="absolute bottom-6 right-8 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]"
              />
            </div>

            {/* Inner Clockwise Reconnaissance Orbit */}
            <div className="absolute w-[258px] h-[258px] sm:w-[284px] sm:h-[284px] rounded-full border border-cyan-400/15 animate-[spin_24s_linear_infinite]">
              <span
                className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full shadow-[0_0_12px_currentColor]"
                style={{ backgroundColor: planetConfig.accent, color: planetConfig.accent }}
              />
            </div>

            {/* Tilted Elliptical Telemetry Track */}
            <div
              className="absolute w-[330px] h-[330px] sm:w-[360px] sm:h-[360px] rounded-full border border-amber-500/15 animate-[spin_48s_linear_infinite]"
              style={{ transform: 'rotateX(66deg) rotateZ(-18deg)' }}
            />
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={540}
          height={380}
          className="relative z-10 w-full h-full max-h-[420px] object-contain"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            isDraggingRef.current = false;
            hoveredRegionRef.current = null;
            setIsDragging(false);
            setHoveredRegion(null);
          }}
        />

        {/* Floating Telemetry Coordinates Overlay */}
        <div className="z-20 absolute bottom-3 start-3 px-2.5 py-1.5 rounded bg-[#080e1a]/90 border border-white/10 text-[11px] font-mono text-slate-300 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span>
              {t.common.lat}: <strong className="text-white tabular-nums ltr-num">{rotation.lat.toFixed(2)}°</strong>
            </span>
            <span>
              {t.common.lon}: <strong className="text-white tabular-nums ltr-num">{rotation.lon.toFixed(2)}°</strong>
            </span>
            {zoom !== 1 && (
              <span className="text-cyan-400 ltr-num">{zoom.toFixed(1)}x</span>
            )}
            <span className="text-slate-500 hidden sm:inline">{t.common.grid450m}</span>
          </div>
        </div>

        {/* Interactive Target Marker Callout if region is selected */}
        {selectedRegion && (
          <button
            type="button"
            onClick={() => onInspectRegion?.(selectedRegion)}
            className={`z-20 absolute top-3 end-3 max-w-[235px] text-start p-2.5 rounded bg-[#080e1a]/95 border text-[11px] font-mono backdrop-blur-md shadow-lg shadow-black/50 transition-all duration-200 ${
              onInspectRegion
                ? 'border-cyan-500/50 hover:border-cyan-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:-translate-y-0.5 cursor-pointer'
                : 'border-cyan-500/40 cursor-default'
            }`}
          >
            <div className="flex items-center justify-between gap-2 text-cyan-400 text-[10px] uppercase font-bold tracking-wider mb-1">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <Target className="relative w-2.5 h-2.5 text-cyan-300" />
                </span>
                <span>{t.globe.targetLocked}</span>
              </span>
              <span className="text-amber-400">
                {selectedRegion.planet === 'Mars'
                  ? t.common.mars
                  : selectedRegion.planet === 'Earth'
                  ? t.common.earth
                  : t.common.moon}
              </span>
            </div>
            <div className="font-semibold text-slate-100 truncate ltr-num">{selectedRegion.name}</div>
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between gap-2">
              <span>
                {t.globe.elevShort}{' '}
                <span className="ltr-num">
                  {selectedRegion.topography?.elevation_m ?? t.common.notAvailable} {t.common.m}
                </span>
              </span>
              <span>
                {t.globe.slopeShort}{' '}
                <span className="ltr-num">
                  {selectedRegion.topography?.slope_p90_deg ?? t.common.notAvailable}°
                </span>
              </span>
            </div>
            {onInspectRegion && (
              <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between gap-2 text-[10px] text-cyan-300">
                <span>{t.globe.clickForDossier}</span>
                <Maximize2 className="w-3 h-3 shrink-0" />
              </div>
            )}
          </button>
        )}
      </div>

      {/* Region Fast Selector Strip */}
      <div className="px-3 py-2 border-t border-white/10 bg-[#080e1a]/70 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-mono shrink-0 uppercase text-[10px]">{t.globe.sitesLabel}</span>
        {allRegions
          .filter((r) => r.planet === planet)
          .map((reg) => {
            const isSelected = selectedRegion?.region_id === reg.region_id;
            return (
              <button
                key={reg.region_id}
                onClick={() => onSelectRegion?.(reg)}
                className={`px-2.5 py-1 rounded font-mono whitespace-nowrap shrink-0 transition-colors border ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/60 text-white font-medium shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                }`}
              >
                {reg.name}
              </button>
            );
          })}
      </div>
    </div>
  );
};
