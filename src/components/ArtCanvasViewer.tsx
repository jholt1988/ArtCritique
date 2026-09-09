import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Eye,
  Crosshair,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  HelpCircle,
  FlipHorizontal,
  Flame,
  Info,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';
import { HotspotAnnotation } from '../types';

interface ArtCanvasViewerProps {
  imageSrc: string;
  artworkTitle: string;
  hotspots?: HotspotAnnotation[];
  selectedHotspotId?: string | null;
  onSelectHotspot?: (hotspot: HotspotAnnotation | null) => void;
}

export const ArtCanvasViewer: React.FC<ArtCanvasViewerProps> = ({
  imageSrc,
  artworkTitle,
  hotspots = [],
  selectedHotspotId = null,
  onSelectHotspot,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Visual Inspection Overlays
  const [showRuleOfThirds, setShowRuleOfThirds] = useState(false);
  const [showGoldenSpiral, setShowGoldenSpiral] = useState(false);
  const [goldenSpiralOrientation, setGoldenSpiralOrientation] = useState<0 | 90 | 180 | 270>(0);
  const [goldenSpiralFlipX, setGoldenSpiralFlipX] = useState(false);
  const [showDiagonals, setShowDiagonals] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [isGrayscaleValueMode, setIsGrayscaleValueMode] = useState(false);
  const [isInvertedMode, setIsInvertedMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoTouring, setIsAutoTouring] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleSelectHotspot = (hotspot: HotspotAnnotation | null) => {
    if (!hotspot && isAutoTouring) {
      setIsAutoTouring(false);
    }
    if (onSelectHotspot) {
      onSelectHotspot(hotspot);
    }
  };

  useEffect(() => {
    let timer: number | null = null;
    if (isAutoTouring && hotspots.length > 0) {
      timer = window.setInterval(() => {
        const currentIndex = hotspots.findIndex((h) => h.id === selectedHotspotId);
        const nextIndex = (currentIndex + 1) % hotspots.length;
        if (onSelectHotspot) {
          onSelectHotspot(hotspots[nextIndex]);
        }
      }, 4000);
    }
    return () => {
      if (timer !== null) window.clearInterval(timer);
    };
  }, [isAutoTouring, hotspots, selectedHotspotId, onSelectHotspot]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const activeHotspot = hotspots.find((h) => h.id === selectedHotspotId);

  return (
    <div
      ref={containerRef}
      id="art-canvas-viewer-container"
      className="relative rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden flex flex-col shadow-2xl transition-all"
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-stone-900/90 border-b border-stone-800 text-xs z-20">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-200 truncate max-w-[200px] sm:max-w-xs">
            {artworkTitle}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Overlay Action Tools */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Rule of Thirds Toggle */}
          <button
            id="btn-toggle-thirds"
            onClick={() => setShowRuleOfThirds(!showRuleOfThirds)}
            title="Toggle Rule of Thirds Grid"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              showRuleOfThirds
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 bg-stone-800/80 hover:bg-stone-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rule of 3rds</span>
          </button>

          {/* Golden Spiral Toggle */}
          <button
            id="btn-toggle-spiral"
            onClick={() => setShowGoldenSpiral(!showGoldenSpiral)}
            title="Toggle Golden Ratio / Fibonacci Spiral"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              showGoldenSpiral
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 bg-stone-800/80 hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Golden Spiral</span>
          </button>

          {showGoldenSpiral && (
            <div className="flex items-center gap-1 bg-stone-950 px-1.5 py-0.5 rounded-lg border border-stone-700">
              <button
                onClick={() => setGoldenSpiralOrientation(((goldenSpiralOrientation + 90) % 360) as any)}
                title="Rotate Spiral 90°"
                className="p-1 hover:text-amber-400 text-stone-400"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <button
                onClick={() => setGoldenSpiralFlipX(!goldenSpiralFlipX)}
                title="Flip Spiral"
                className="p-1 hover:text-amber-400 text-stone-400"
              >
                <FlipHorizontal className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Value / Grayscale Checker */}
          <button
            id="btn-toggle-value-mode"
            onClick={() => setIsGrayscaleValueMode(!isGrayscaleValueMode)}
            title="Desaturate to test Value Contrast & Tonal Hierarchy"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              isGrayscaleValueMode
                ? 'bg-indigo-500 text-white font-bold shadow-sm'
                : 'text-stone-300 bg-stone-800/80 hover:bg-stone-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Value (B&W)</span>
          </button>

          {/* Hotspots Toggle Group */}
          {hotspots.length > 0 && (
            <div className="flex items-center bg-stone-800/80 rounded-lg p-0.5 border border-stone-700/50">
              <button
                id="btn-toggle-hotspots"
                onClick={() => setShowHotspots(!showHotspots)}
                title="Toggle AI Critique Hotspot Pins on Canvas"
                className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-all ${
                  showHotspots
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-stone-300 hover:bg-stone-700/80'
                }`}
              >
                <Crosshair className="w-3 h-3" />
                <span>Pins ({hotspots.length})</span>
              </button>
              
              <button
                id="btn-auto-tour"
                onClick={() => {
                  const nextState = !isAutoTouring;
                  setIsAutoTouring(nextState);
                  if (nextState) {
                    setShowHotspots(true);
                    if (!selectedHotspotId) {
                      onSelectHotspot?.(hotspots[0]);
                    }
                  }
                }}
                title={isAutoTouring ? "Pause Auto-Tour" : "Start Auto-Tour"}
                className={`flex items-center justify-center p-1.5 ml-0.5 rounded-md transition-all ${
                  isAutoTouring
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-700/80'
                }`}
              >
                {isAutoTouring ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
            </div>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-stone-950 px-1 py-0.5 rounded-lg border border-stone-800 ml-1">
            <button
              id="btn-zoom-out"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 hover:text-stone-100 text-stone-400 rounded"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-zoom-reset"
              onClick={handleResetZoom}
              title="Reset Zoom & Pan"
              className="px-1.5 py-0.5 text-[10px] font-mono hover:text-stone-100 text-stone-400 rounded"
            >
              1:1
            </button>
            <button
              id="btn-zoom-in"
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 hover:text-stone-100 text-stone-400 rounded"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            id="btn-toggle-fullscreen"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 hover:text-stone-100 text-stone-400 bg-stone-800/80 hover:bg-stone-800 rounded-lg"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Viewport Stage */}
      <div
        id="canvas-viewport"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full h-[460px] sm:h-[540px] lg:h-[620px] bg-stone-950 flex items-center justify-center select-none overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Canvas Background Texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Transformed Stage */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="relative max-w-full max-h-full flex items-center justify-center"
        >
          {/* Main Artwork Image */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt={artworkTitle}
            draggable={false}
            style={{
              filter: `${isGrayscaleValueMode ? 'grayscale(100%) contrast(120%)' : ''} ${
                isInvertedMode ? 'invert(100%)' : ''
              }`,
            }}
            className="max-h-[500px] sm:max-h-[580px] w-auto object-contain rounded-lg shadow-2xl pointer-events-none transition-[filter] duration-200"
          />

          {/* Rule of Thirds Overlay */}
          {showRuleOfThirds && (
            <div className="absolute inset-0 pointer-events-none border border-amber-400/40">
              {/* Vertical Third Lines */}
              <div className="absolute left-1/3 top-0 bottom-0 w-[1.5px] bg-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <div className="absolute left-2/3 top-0 bottom-0 w-[1.5px] bg-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              {/* Horizontal Third Lines */}
              <div className="absolute top-1/3 left-0 right-0 h-[1.5px] bg-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <div className="absolute top-2/3 left-0 right-0 h-[1.5px] bg-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              {/* Focal Power Points (Intersections) */}
              <div className="absolute left-1/3 top-1/3 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-300 bg-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,1)]" />
              <div className="absolute left-2/3 top-1/3 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-300 bg-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,1)]" />
              <div className="absolute left-1/3 top-2/3 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-300 bg-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,1)]" />
              <div className="absolute left-2/3 top-2/3 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-300 bg-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,1)]" />
            </div>
          )}

          {/* Golden Spiral / Fibonacci Overlay */}
          {showGoldenSpiral && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none stroke-amber-400/80"
              viewBox="0 0 1000 618"
              preserveAspectRatio="none"
              style={{
                transform: `rotate(${goldenSpiralOrientation}deg) ${goldenSpiralFlipX ? 'scaleX(-1)' : ''}`,
                transformOrigin: 'center center',
              }}
            >
              <path
                d="M 1000 618 A 618 618 0 0 0 382 0 A 382 382 0 0 0 0 382 A 236 236 0 0 0 236 618 A 146 146 0 0 0 382 472 A 90 90 0 0 0 292 382 A 56 56 0 0 0 236 438"
                fill="none"
                strokeWidth="4"
                strokeDasharray="6 4"
                className="drop-shadow-[0_0_6px_rgba(245,158,11,0.9)]"
              />
              <rect x="0" y="0" width="382" height="618" fill="none" strokeWidth="1.5" stroke="rgba(245,158,11,0.3)" />
              <rect x="382" y="0" width="618" height="382" fill="none" strokeWidth="1.5" stroke="rgba(245,158,11,0.3)" />
            </svg>
          )}

          {/* Interactive Hotspots Pins */}
          {showHotspots &&
            (hotspots || []).map((hotspot, idx) => {
              const isSelected = selectedHotspotId === hotspot.id;
              const severityColor =
                hotspot.severity === 'strength'
                  ? 'bg-emerald-500 border-emerald-300 text-stone-950 shadow-emerald-500/50'
                  : hotspot.severity === 'critical'
                  ? 'bg-rose-500 border-rose-300 text-white shadow-rose-500/50'
                  : 'bg-amber-500 border-amber-300 text-stone-950 shadow-amber-500/50';

              return (
                <div
                  key={hotspot.id || `hotspot-${idx}`}
                  id={`hotspot-pin-${hotspot.id}`}
                  style={{
                    left: `${hotspot.x}%`,
                    top: `${hotspot.y}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectHotspot(isSelected ? null : hotspot);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
                >
                  {/* Pin Circle */}
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs shadow-lg transition-transform duration-200 ${severityColor} ${
                      isSelected ? 'scale-125 ring-4 ring-white/40 animate-pulse' : 'hover:scale-110'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {/* Pin Radar Pulse for Critical / Selected */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-amber-400 opacity-40 -z-10" />
                  )}

                  {/* Hover Tooltip Preview */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 rounded-xl bg-stone-900/95 border border-stone-700 text-stone-100 text-[11px] shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-40 backdrop-blur-md">
                    <p className="font-bold text-amber-300 truncate">{hotspot.title}</p>
                    <p className="text-stone-300 mt-1 line-clamp-2">{hotspot.issue}</p>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Floating Active Pin Card (When Selected) */}
        {activeHotspot && (
          <div
            id="active-hotspot-card"
            className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 p-4 rounded-2xl bg-stone-900/95 backdrop-blur-md border border-stone-700/80 shadow-2xl z-30 text-xs animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                    activeHotspot.severity === 'strength'
                      ? 'bg-emerald-500 text-stone-950'
                      : activeHotspot.severity === 'critical'
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-500 text-stone-950'
                  }`}
                >
                  {hotspots.findIndex((h) => h.id === activeHotspot.id) + 1}
                </span>
                <span className="font-bold text-stone-100 uppercase tracking-wider text-[10px] text-amber-400">
                  {activeHotspot.pillar} Annotation
                </span>
              </div>
              <button
                onClick={() => handleSelectHotspot(null)}
                className="text-stone-400 hover:text-stone-200 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <h4 className="text-sm font-bold text-stone-100 mt-1.5">{activeHotspot.title}</h4>
            <p className="text-stone-300 mt-1 text-[11px] leading-relaxed">{activeHotspot.issue}</p>

            <div className="mt-2.5 pt-2 border-t border-stone-800 flex items-start gap-1.5 text-[11px] text-amber-200 bg-amber-500/10 p-2 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span><strong>Fix:</strong> {activeHotspot.recommendation}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Helper / Shortcut Bar */}
      <div className="px-4 py-2 bg-stone-900/90 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>💡 <strong>Click & Drag</strong> to Pan</span>
          <span>•</span>
          <span><strong>Value Mode (B&W)</strong> checks tonal hierarchy</span>
        </div>
        <div className="font-mono text-[10px] text-stone-500">
          VLM Precision Coordinates Active
        </div>
      </div>
    </div>
  );
};
