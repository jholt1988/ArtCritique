import React from 'react';
import { Palette, Sparkles, Layers, SlidersHorizontal, Image as ImageIcon, Download, BookOpen, PlusCircle, Settings } from 'lucide-react';

interface NavbarProps {
  activeTab: 'analyzer' | 'comparison' | 'portfolio' | 'dashboard';
  setActiveTab: (tab: 'analyzer' | 'comparison' | 'portfolio' | 'dashboard') => void;
  onNewCritique: () => void;
  onExportReport?: () => void;
  onOpenSettings?: () => void;
  hasActiveCritique: boolean;
  portfolioCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewCritique,
  onExportReport,
  onOpenSettings,
  hasActiveCritique,
  portfolioCount,
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-[1.5px] shadow-lg shadow-amber-500/10">
            <div className="w-full h-full bg-stone-950 rounded-[10px] flex items-center justify-center">
              <Palette className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-stone-100 via-stone-200 to-amber-200 bg-clip-text text-transparent">
                ArtCritique<span className="text-amber-400 font-mono text-xs ml-1 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 uppercase tracking-wider">VLM</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">
              Vision-Language Art & Portfolio Evaluator
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav id="primary-navigation" className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800">
          <button
            id="nav-tab-analyzer"
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analyzer'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Critique Studio</span>
          </button>

          <button
            id="nav-tab-comparison"
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'comparison'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Revision Compare</span>
          </button>

          <button
            id="nav-tab-portfolio"
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'portfolio'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Portfolio Vault</span>
            {portfolioCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-stone-800 text-[10px] flex items-center justify-center font-mono text-amber-300">
                {portfolioCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Provider Settings"
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {hasActiveCritique && (
            <button
              id="btn-export-critique"
              onClick={onExportReport}
              title="Export formatted critique sheet"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 bg-stone-900 border border-stone-800 hover:border-stone-700 hover:bg-stone-800/80 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-stone-400" />
              <span>Export Report</span>
            </button>
          )}

          <button
            id="btn-new-critique"
            onClick={onNewCritique}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-white text-stone-950 shadow-sm transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-stone-900" />
            <span>New Artwork</span>
          </button>
        </div>
      </div>
    </header>
  );
};
