import { fetchApi } from '../utils/apiClient';
import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Image as ImageIcon, Lightbulb, Loader2 } from 'lucide-react';
import { PortfolioCollection, PortfolioArtwork } from '../types';

interface CollectionViewProps {
  collection: PortfolioCollection;
  items: PortfolioArtwork[];
  isLoading?: boolean;
  onCritiqueCollection: (collectionId: string) => void;
  onSelectArtwork: (artwork: PortfolioArtwork) => void;
  onBack: () => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({
  collection,
  items,
  isLoading,
  onCritiqueCollection,
  onSelectArtwork,
  onBack,
}) => {
  const [tips, setTips] = useState<string[] | null>(null);
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);
  const [tipsError, setTipsError] = useState<string | null>(null);

  const handleGetTips = async () => {
    if (!collection.critique) return;
    setIsGeneratingTips(true);
    setTipsError(null);
    try {
      const response = await fetchApi('/api/collection-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionName: collection.name,
          critique: collection.critique,
        }),
      });
      if (!response.ok) throw new Error('Failed to generate tips');
      const data = await response.json();
      setTips(data.tips);
    } catch (err: any) {
      setTipsError(err.message || 'Failed to get tips.');
    } finally {
      setIsGeneratingTips(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          title="Back to Collections"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            {collection.name}
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700">
              {items.length} pieces
            </span>
          </h2>
          <p className="text-sm text-stone-400 mt-1">{collection.description}</p>
        </div>
        <div className="ml-auto">
           <button
            onClick={() => onCritiqueCollection(collection.id)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {collection.critique ? 'Refresh Critique' : 'Critique Collection'}
          </button>
        </div>
      </div>

      {collection.critique && (
        <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-2xl p-6">
          <div className="flex items-start gap-6 flex-col md:flex-row">
            <div className="text-center p-4 bg-stone-950 rounded-xl border border-indigo-900/50 min-w-[120px] flex-shrink-0">
              <span className="text-xs text-stone-400 block mb-1 uppercase font-bold tracking-wider">Score</span>
              <span className="text-4xl font-bold text-indigo-400">{collection.critique.overallScore.toFixed(1)}</span>
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-stone-200 italic leading-relaxed border-l-2 border-indigo-500/50 pl-4">
                "{collection.critique.executiveSummary}"
              </p>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-stone-950/50 rounded-xl p-4 border border-emerald-900/30">
                  <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Unified Strengths
                  </h4>
                  <ul className="text-sm text-stone-300 space-y-2">
                    {(collection.critique.strengths || []).map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500/50 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-stone-950/50 rounded-xl p-4 border border-rose-900/30">
                  <h4 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Areas to Improve
                  </h4>
                  <ul className="text-sm text-stone-300 space-y-2">
                    {(collection.critique.areasForImprovement || []).map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500/50 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm bg-stone-950/80 rounded-xl p-3 border border-stone-800">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-stone-900 rounded-lg border border-stone-700 text-stone-300">
                    <span className="text-stone-500 uppercase text-[10px] font-bold tracking-wider">Cohesion</span>
                    <span className="font-bold text-amber-400">{collection.critique.cohesionScore}/10</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-300">
                    <span className="text-indigo-500/70 uppercase text-[10px] font-bold tracking-wider">Portfolio Fit:</span>
                    <span className="font-medium">{collection.critique.portfolioFit}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleGetTips}
                  disabled={isGeneratingTips}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors disabled:opacity-50"
                >
                  {isGeneratingTips ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lightbulb className="w-3.5 h-3.5" />}
                  {isGeneratingTips ? 'Generating Tips...' : 'AI Improvement Tips'}
                </button>
              </div>

              {/* AI Improvement Tips Section */}
              {tips && tips.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Cross-Piece Styling & Thematic Tips
                  </h4>
                  <ul className="text-sm text-stone-300 space-y-2">
                    {(tips || []).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500/50 mt-0.5">→</span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tipsError && (
                <div className="mt-4 p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-xs text-rose-400">
                  {tipsError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Gallery Carousel */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 pt-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-stone-900/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-stone-600">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="relative flex-none w-72 sm:w-80 md:w-96 h-[400px] rounded-xl overflow-hidden border border-stone-800 group cursor-pointer snap-center bg-stone-950 shadow-xl"
            onClick={() => onSelectArtwork(item)}
          >
            <img 
              src={item.imageData} 
              alt={item.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
              <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">{item.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    ★ {item.critique.overallScore.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-stone-300">{item.critique.artistStyle}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

