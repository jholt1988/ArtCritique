import React, { useState } from 'react';
import { BookOpen, Sparkles, Trash2, ExternalLink, Download, Search, Filter, Plus, Calendar, Tag, Award, SlidersHorizontal, Library, RefreshCw, LayoutGrid } from 'lucide-react';
import { PortfolioArtwork, PortfolioCollection } from '../types';
import { CollectionView } from './CollectionView';

interface PortfolioModalProps {
  portfolio: PortfolioArtwork[];
  collections: PortfolioCollection[];
  isLoading?: boolean;
  onSelectArtwork: (artwork: PortfolioArtwork) => void;
  onDeleteArtwork: (id: string) => void;
  onUpdateTags?: (id: string, tags: string[]) => void;
  onExportMarkdown: (artwork: PortfolioArtwork) => void;
  onNewArtwork: () => void;
  onAutoGroup: () => void;
  onCritiqueCollection: (collectionId: string) => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  portfolio,
  collections,
  isLoading,
  onSelectArtwork,
  onDeleteArtwork,
  onUpdateTags,
  onExportMarkdown,
  onNewArtwork,
  onAutoGroup,
  onCritiqueCollection,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'collections'>('grid');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null);
  const [tagInputValue, setTagInputValue] = useState('');

  // Unique tags
  const allTags = ['All', ...Array.from(new Set(portfolio.flatMap((p) => p.tags || [])))];

  const handleStartEditingTags = (item: PortfolioArtwork) => {
    setEditingTagsId(item.id);
    setTagInputValue((item.tags || []).join(', '));
  };

  const handleSaveTags = (item: PortfolioArtwork) => {
    const newTags = tagInputValue
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    // Deduplicate
    const uniqueTags = Array.from(new Set(newTags));
    if (onUpdateTags) {
      onUpdateTags(item.id, uniqueTags);
    }
    setEditingTagsId(null);
  };

  const filteredPortfolio = portfolio.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.critique.artistStyle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.critique.targetContext.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || (item.tags && item.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const getScoreBadge = (score: number) => {
    if (score >= 8.5) return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    if (score >= 7.0) return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
  };

  return (
    <div id="portfolio-vault-section" className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-stone-900/60 p-5 rounded-2xl border border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-stone-100">
              Artist Portfolio Vault ({portfolio.length})
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Archived digital pieces, master critique sheets, and revision milestones
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* View Toggles */}
          <div className="flex items-center bg-stone-950 rounded-xl border border-stone-800 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-stone-800 text-stone-100 shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('collections')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'collections' ? 'bg-stone-800 text-stone-100 shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Collections View"
            >
              <Library className="w-4 h-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, style..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            onClick={onNewArtwork}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-md active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Critique New</span>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <>
          {/* Tag Filters */}
          {allTags.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-stone-500 uppercase font-mono font-bold flex-shrink-0">
                Filter:
              </span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
                    selectedTag === tag
                      ? 'bg-stone-100 text-stone-950 shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Grid of Portfolio Cards */}
          {filteredPortfolio.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-stone-900/30 border border-stone-800/80 p-8">
              <BookOpen className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-stone-300">No Artworks Found</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {searchQuery ? 'No pieces match your search terms.' : 'Upload and critique an artwork to add it to your curated vault.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPortfolio.map((item) => (
                <div
                  key={item.id}
                  id={`portfolio-item-${item.id}`}
                  className="group rounded-2xl bg-stone-900/70 border border-stone-800 hover:border-amber-400/60 overflow-hidden flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-amber-500/5"
                >
                  <div>
                    {/* Thumbnail Image Container */}
                    <div
                      onClick={() => onSelectArtwork(item)}
                      className="relative aspect-video w-full bg-stone-950 overflow-hidden cursor-pointer flex items-center justify-center border-b border-stone-800"
                    >
                      <img
                        src={item.imageData}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Score pill */}
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-stone-950/85 backdrop-blur-md border border-stone-700/80 font-mono text-xs font-bold text-amber-300 shadow-md">
                        ★ {item.critique.overallScore.toFixed(1)}/10
                      </span>

                      {item.version && item.version > 1 && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-indigo-950/90 border border-indigo-700/80 font-mono text-[10px] font-bold text-indigo-300">
                          v{item.version}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-mono mb-1">
                        <Calendar className="w-3 h-3 text-stone-500" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="text-stone-300 font-medium">{item.critique.artistStyle}</span>
                      </div>

                      <h3
                        onClick={() => onSelectArtwork(item)}
                        className="text-sm font-bold text-stone-100 group-hover:text-amber-300 transition-colors cursor-pointer line-clamp-1"
                      >
                        {item.title}
                      </h3>

                      <p className="text-xs text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
                        "{item.critique.executiveSummary}"
                      </p>

                      {/* Tags Manager */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {editingTagsId === item.id ? (
                          <div className="flex items-center gap-2 w-full">
                            <input
                              type="text"
                              value={tagInputValue}
                              onChange={(e) => setTagInputValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTags(item);
                                if (e.key === 'Escape') setEditingTagsId(null);
                              }}
                              className="flex-1 bg-stone-950 border border-amber-500/50 rounded-md px-2 py-1 text-[10px] text-stone-200 focus:outline-none"
                              placeholder="tag1, tag2..."
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveTags(item)}
                              className="text-[10px] font-bold text-amber-500 hover:text-amber-400 bg-amber-500/10 px-2 py-1 rounded"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <>
                            <Tag className="w-3 h-3 text-stone-500" />
                            {item.tags?.map((tag, idx) => (
                              <span
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(tag);
                                }}
                                className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 text-[9px] cursor-pointer hover:bg-stone-700 hover:text-amber-300"
                              >
                                {tag}
                              </span>
                            ))}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditingTags(item);
                              }}
                              className="px-1.5 py-0.5 rounded border border-dashed border-stone-700 text-stone-500 text-[9px] hover:border-amber-500/50 hover:text-amber-500"
                            >
                              + Add Tag
                            </button>
                          </>
                        )}
                      </div>

                      {/* 4 Mini Pillar Scores */}
                      <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-stone-800/80 text-[10px] font-mono text-center">
                        <div className="bg-stone-950/80 p-1 rounded border border-stone-800">
                          <span className="text-stone-500 block text-[9px]">COMP</span>
                          <span className="font-bold text-sky-400">{(item.critique.composition?.score || 0).toFixed(1)}</span>
                        </div>
                        <div className="bg-stone-950/80 p-1 rounded border border-stone-800">
                          <span className="text-stone-500 block text-[9px]">LGT</span>
                          <span className="font-bold text-amber-400">{(item.critique.lightingAndColor?.score || 0).toFixed(1)}</span>
                        </div>
                        <div className="bg-stone-950/80 p-1 rounded border border-stone-800">
                          <span className="text-stone-500 block text-[9px]">ANT</span>
                          <span className="font-bold text-emerald-400">{(item.critique.anatomyAndPerspective?.score || 0).toFixed(1)}</span>
                        </div>
                        <div className="bg-stone-950/80 p-1 rounded border border-stone-800">
                          <span className="text-stone-500 block text-[9px]">STORY</span>
                          <span className="font-bold text-rose-400">{(item.critique.moodAndStorytelling?.score || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="px-4 py-3 bg-stone-950/60 border-t border-stone-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onSelectArtwork(item)}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Open Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onExportMarkdown(item)}
                        title="Export Markdown Critique Report"
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteArtwork(item.id)}
                        title="Delete Artwork from Vault"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : selectedCollectionId ? (
        (() => {
          const collection = collections.find(c => c.id === selectedCollectionId);
          if (!collection) return null;
          const items = portfolio.filter(p => collection.itemIds.includes(p.id));
          return (
            <CollectionView
              collection={collection}
              items={items}
              isLoading={isLoading}
              onCritiqueCollection={onCritiqueCollection}
              onSelectArtwork={onSelectArtwork}
              onBack={() => setSelectedCollectionId(null)}
            />
          );
        })()
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-stone-900/40 p-4 rounded-xl border border-stone-800/80">
            <div>
              <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> AI Auto-Grouping
              </h3>
              <p className="text-xs text-stone-400 mt-1">Let the AI analyze your portfolio and group pieces that belong together visually or conceptually.</p>
            </div>
            <button
              onClick={onAutoGroup}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all border border-stone-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Analyzing...' : 'Auto-Group Now'}</span>
            </button>
          </div>

          {collections.length === 0 ? (
             <div className="py-16 text-center rounded-2xl bg-stone-900/30 border border-stone-800/80 p-8">
               <Library className="w-12 h-12 text-stone-600 mx-auto mb-3" />
               <h3 className="text-sm font-bold text-stone-300">No Collections Yet</h3>
               <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                 Click the "Auto-Group Now" button to have AI organize your portfolio into meaningful collections.
               </p>
             </div>
          ) : (
            <div className="space-y-8">
              {collections.map(collection => {
                const collectionItems = portfolio.filter(p => collection.itemIds.includes(p.id));
                if (collectionItems.length === 0) return null;

                return (
                  <div key={collection.id} className="bg-stone-900/50 rounded-2xl border border-stone-800 overflow-hidden">
                    <div className="p-5 border-b border-stone-800 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                          {collection.name}
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">
                            {collectionItems.length} pieces
                          </span>
                        </h3>
                        <p className="text-sm text-stone-400 mt-1">{collection.description}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <button
                          onClick={() => onCritiqueCollection(collection.id)}
                          disabled={isLoading}
                          className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-colors disabled:opacity-50 flex-shrink-0"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Critique
                        </button>
                        <button
                          onClick={() => setSelectedCollectionId(collection.id)}
                          className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors flex-shrink-0"
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          Open Gallery
                        </button>
                      </div>
                    </div>

                    {/* Collection Critique Results */}
                    {collection.critique && (
                      <div className="p-5 bg-indigo-950/20 border-b border-indigo-900/30">
                        <div className="flex items-start gap-4">
                          <div className="text-center p-3 bg-stone-950 rounded-xl border border-indigo-900/50 min-w-[100px]">
                            <span className="text-xs text-stone-400 block mb-1 uppercase font-bold tracking-wider">Overall</span>
                            <span className="text-2xl font-bold text-indigo-400">{collection.critique.overallScore.toFixed(1)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-stone-200 italic leading-relaxed">
                              "{collection.critique.executiveSummary}"
                            </p>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-xs font-bold text-emerald-400 mb-1">Strengths</h4>
                                <ul className="text-xs text-stone-400 list-disc pl-4 space-y-1">
                                  {(collection.critique.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-rose-400 mb-1">Areas to Improve</h4>
                                <ul className="text-xs text-stone-400 list-disc pl-4 space-y-1">
                                  {(collection.critique.areasForImprovement || []).map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center gap-4 text-xs">
                              <span className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300">
                                <strong>Cohesion:</strong> {collection.critique.cohesionScore}/10
                              </span>
                              <span className="text-indigo-300">
                                <strong>Fit:</strong> {collection.critique.portfolioFit}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-5">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {collectionItems.map(item => (
                          <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden border border-stone-800 group cursor-pointer" onClick={() => onSelectArtwork(item)}>
                            <img src={item.imageData} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                              <span className="text-[10px] font-bold text-white truncate">{item.title}</span>
                              <span className="text-[9px] text-amber-400 font-mono">{item.critique.overallScore.toFixed(1)}/10</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
