import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowRight, TrendingUp, Sparkles, CheckCircle2, Award, RefreshCw } from 'lucide-react';
import { PortfolioArtwork } from '../types';

interface ComparisonViewerProps {
  portfolio: PortfolioArtwork[];
  onSelectArtworkForCritique: (artwork: PortfolioArtwork) => void;
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  portfolio,
  onSelectArtworkForCritique,
}) => {
  const [selectedIdA, setSelectedIdA] = useState<string>(portfolio[0]?.id || '');
  const [selectedIdB, setSelectedIdB] = useState<string>(portfolio[1]?.id || portfolio[0]?.id || '');
  const [sliderPos, setSliderPos] = useState(50);

  const versionGroups = useMemo(() => {
    const groups: Record<string, PortfolioArtwork[]> = {};
    portfolio.forEach(p => {
      if (!groups[p.title]) groups[p.title] = [];
      groups[p.title].push(p);
    });
    return Object.values(groups).filter(g => g.length > 1);
  }, [portfolio]);

  const artA = portfolio.find((p) => p.id === selectedIdA) || portfolio[0];
  const artB = portfolio.find((p) => p.id === selectedIdB) || portfolio[1] || portfolio[0];

  if (!artA || portfolio.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto mb-4 text-amber-400">
          <SlidersHorizontal className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-200">Revision Comparison Mode</h2>
        <p className="text-sm text-stone-400 mt-2 max-w-md mx-auto">
          Evaluate two iterations or different artworks side-by-side to measure score improvements, lighting refinements, and composition progress.
        </p>
      </div>
    );
  }

  const scoreDiff = (artB.critique.overallScore - artA.critique.overallScore).toFixed(1);
  const compDiff = ((artB.critique.composition?.score || 0) - (artA.critique.composition?.score || 0)).toFixed(1);
  const lightDiff = ((artB.critique.lightingAndColor?.score || 0) - (artA.critique.lightingAndColor?.score || 0)).toFixed(1);
  const anatDiff = ((artB.critique.anatomyAndPerspective?.score || 0) - (artA.critique.anatomyAndPerspective?.score || 0)).toFixed(1);
  const moodDiff = ((artB.critique.moodAndStorytelling?.score || 0) - (artA.critique.moodAndStorytelling?.score || 0)).toFixed(1);

  const formatDelta = (val: string) => {
    const num = parseFloat(val);
    if (num > 0) return <span className="text-emerald-400 font-bold">+{val} ▲</span>;
    if (num < 0) return <span className="text-rose-400 font-bold">{val} ▼</span>;
    return <span className="text-stone-400 font-bold">0.0 (No change)</span>;
  };

  return (
    <div id="comparison-viewer-container" className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Title & Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-stone-900/60 p-5 rounded-2xl border border-stone-800">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <span>Revision & Iteration Comparative Analysis</span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Compare earlier drafts vs revised paintings to track technical mastery growth
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Piece A Selector */}
          <div className="flex-1 sm:w-52">
            <label className="block text-[10px] uppercase font-mono font-bold text-stone-400 mb-1">
              Base Piece (A)
            </label>
            <select
              value={selectedIdA}
              onChange={(e) => setSelectedIdA(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-400"
            >
              {portfolio.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} (v{item.version || 1})
                </option>
              ))}
            </select>
          </div>

          <ArrowRight className="w-4 h-4 text-stone-500 mt-4 flex-shrink-0" />

          {/* Piece B Selector */}
          <div className="flex-1 sm:w-52">
            <label className="block text-[10px] uppercase font-mono font-bold text-stone-400 mb-1">
              Revised Piece (B)
            </label>
            <select
              value={selectedIdB}
              onChange={(e) => setSelectedIdB(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-400"
            >
              {portfolio.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} (v{item.version || 1})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Suggested Version Comparisons */}
      {versionGroups.length > 0 && (
        <div className="bg-amber-900/10 border border-amber-500/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="text-xs font-bold text-amber-500/80 flex items-center gap-1.5 uppercase tracking-wider">
            <RefreshCw className="w-3.5 h-3.5" /> Version Pairs Detected:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {versionGroups.map((group) => {
              const sorted = [...group].sort((a, b) => a.createdAt - b.createdAt);
              const oldest = sorted[0];
              const newest = sorted[sorted.length - 1];
              const isActive = selectedIdA === oldest.id && selectedIdB === newest.id;
              
              return (
                <button
                  key={oldest.title}
                  onClick={() => {
                    setSelectedIdA(oldest.id);
                    setSelectedIdB(newest.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg border transition-all text-xs flex items-center gap-2 ${
                    isActive 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                      : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-amber-500/50 hover:bg-stone-800'
                  }`}
                >
                  <span className="font-bold">{oldest.title}</span>
                  <span className={isActive ? "text-amber-500/70" : "text-stone-500"}>
                    (v{oldest.version || 1} vs v{newest.version || group.length})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Side-by-side Visual Viewport */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Canvas A */}
        <div className="rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden flex flex-col p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-200 truncate">
              A: {artA.title}
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-800 text-amber-300">
              ★ {artA.critique.overallScore.toFixed(1)}/10
            </span>
          </div>
          <div className="w-full h-80 bg-stone-900 rounded-xl overflow-hidden flex items-center justify-center">
            <img
              src={artA.imageData}
              alt={artA.title}
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-xs text-stone-400 mt-3 italic line-clamp-2">
            "{artA.critique.executiveSummary}"
          </p>
        </div>

        {/* Canvas B */}
        <div className="rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden flex flex-col p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-200 truncate">
              B: {artB.title}
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-800 text-amber-300">
              ★ {artB.critique.overallScore.toFixed(1)}/10
            </span>
          </div>
          <div className="w-full h-80 bg-stone-900 rounded-xl overflow-hidden flex items-center justify-center">
            <img
              src={artB.imageData}
              alt={artB.title}
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-xs text-stone-400 mt-3 italic line-clamp-2">
            "{artB.critique.executiveSummary}"
          </p>
        </div>
      </div>

      {/* Delta Metrics Grid */}
      <div className="rounded-2xl bg-stone-900/60 border border-stone-800 p-6 shadow-xl">
        <h3 className="text-sm font-bold text-stone-200 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Technical Growth & Score Progression Delta</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase font-mono">Overall Score</span>
            <div className="text-base font-bold text-stone-100 mt-1">
              {artA.critique.overallScore.toFixed(1)} → {artB.critique.overallScore.toFixed(1)}
            </div>
            <div className="text-xs mt-1">{formatDelta(scoreDiff)}</div>
          </div>

          <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase font-mono">Composition</span>
            <div className="text-base font-bold text-stone-100 mt-1">
              {(artA.critique.composition?.score || 0).toFixed(1)} → {(artB.critique.composition?.score || 0).toFixed(1)}
            </div>
            <div className="text-xs mt-1">{formatDelta(compDiff)}</div>
          </div>

          <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase font-mono">Lighting & Color</span>
            <div className="text-base font-bold text-stone-100 mt-1">
              {(artA.critique.lightingAndColor?.score || 0).toFixed(1)} → {(artB.critique.lightingAndColor?.score || 0).toFixed(1)}
            </div>
            <div className="text-xs mt-1">{formatDelta(lightDiff)}</div>
          </div>

          <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase font-mono">Anatomy & Persp</span>
            <div className="text-base font-bold text-stone-100 mt-1">
              {(artA.critique.anatomyAndPerspective?.score || 0).toFixed(1)} → {(artB.critique.anatomyAndPerspective?.score || 0).toFixed(1)}
            </div>
            <div className="text-xs mt-1">{formatDelta(anatDiff)}</div>
          </div>

          <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase font-mono">Mood & Story</span>
            <div className="text-base font-bold text-stone-100 mt-1">
              {(artA.critique.moodAndStorytelling?.score || 0).toFixed(1)} → {(artB.critique.moodAndStorytelling?.score || 0).toFixed(1)}
            </div>
            <div className="text-xs mt-1">{formatDelta(moodDiff)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
