import localforage from 'localforage';
import { ProviderSettingsModal } from './components/ProviderSettingsModal';
import { fetchApi } from './utils/apiClient';
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Layers,
  SlidersHorizontal,
  BookOpen,
  ArrowLeft,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Eye,
  RefreshCw,
  Compass,
  SunMedium,
  UserCheck,
  HeartHandshake,
  MessageSquare,
  LayoutDashboard,
} from 'lucide-react';
import { ArtCritique, PortfolioArtwork, HotspotAnnotation, ArtStyle, TargetContext, PortfolioCollection } from './types';
import { SAMPLE_ARTWORKS, SampleArtwork } from './data/sampleArtworks';
import { Navbar } from './components/Navbar';
import { ImageDropzone } from './components/ImageDropzone';
import { ArtCanvasViewer } from './components/ArtCanvasViewer';
import { CritiqueOverview } from './components/CritiqueOverview';
import { PillarCritiqueCard } from './components/PillarCritiqueCard';
import { ColorPaletteBar } from './components/ColorPaletteBar';
import { MentorChat } from './components/MentorChat';
import { ComparisonViewer } from './components/ComparisonViewer';
import { PortfolioModal } from './components/PortfolioModal';
import { PortfolioDashboard } from './components/PortfolioDashboard';
import { PromptSuggestionsPanel } from './components/PromptSuggestionsPanel';
import { downloadReportFile } from './utils/exportReport';
import { resolveChain, resolveEditParent } from './utils/versionChain';

type MainViewTab = 'analyzer' | 'comparison' | 'portfolio' | 'dashboard';
type PillarTab = 'overview' | 'composition' | 'lighting' | 'anatomy' | 'storytelling' | 'chat';

const STORAGE_KEY = 'artcritique_vlm_portfolio_v1';
const COLLECTIONS_KEY = 'artcritique_vlm_collections_v1';

export default function App() {
  const [activeView, setActiveView] = useState<MainViewTab>('analyzer');
  const [activePillarTab, setActivePillarTab] = useState<PillarTab>('overview');

  // Currently loaded artwork & critique
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentCritique, setCurrentCritique] = useState<ArtCritique | null>(null);
  // Portfolio row id the loaded artwork came from (null for fresh uploads /
  // unsaved samples). Needed so a generative edit links to the right version
  // chain — the critique id alone can never identify a portfolio row.
  const [currentArtworkId, setCurrentArtworkId] = useState<string | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotAnnotation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReimagining, setIsReimagining] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');
  
  const handleAskArtDirector = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setActivePillarTab('chat');
  };


  
  const [collections, setCollections] = useState<PortfolioCollection[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioArtwork[]>([]);
  const [isStorageReady, setIsStorageReady] = useState(false);

  useEffect(() => {
    async function loadStorage() {
      try {
        const savedPortfolio = (await localforage.getItem(STORAGE_KEY)) as PortfolioArtwork[] | null;
        if (savedPortfolio) {
          setPortfolio(savedPortfolio);
        } else {
          setPortfolio(SAMPLE_ARTWORKS.map((sample, idx) => ({
            id: 'seed_' + sample.id,
            title: sample.title,
            imageData: sample.imageData,
            critique: sample.critiquePreset,
            createdAt: Date.now() - (idx + 1) * 86400000,
            tags: [sample.artistStyle, 'Seed Study'],
            version: 1,
          })));
        }

        const savedCollections = (await localforage.getItem(COLLECTIONS_KEY)) as PortfolioCollection[] | null;
        if (savedCollections) {
          setCollections(savedCollections);
        }
      } catch (e) {
        console.error('Failed to load from storage', e);
      } finally {
        setIsStorageReady(true);
      }
    }
    loadStorage();
  }, []);

  useEffect(() => {
    if (!isStorageReady) return;
    localforage.setItem(STORAGE_KEY, portfolio).catch(e => console.error('Failed to write portfolio to storage', e));
  }, [portfolio, isStorageReady]);

  useEffect(() => {
    if (!isStorageReady) return;
    localforage.setItem(COLLECTIONS_KEY, collections).catch(e => console.error('Failed to write collections to storage', e));
  }, [collections, isStorageReady]);


  const handleAutoGroup = async () => {
    setIsLoading(true);
    try {
      const response = await fetchApi('/api/group-collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioItems: portfolio }),
      });
      if (!response.ok) throw new Error('Failed to group collections');
      const data = await response.json();
      const newCollections = data.map((c: any, i: number) => ({
        ...c,
        id: `collection_${Date.now()}_${i}`
      }));
      setCollections(newCollections);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to auto group collections.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCritiqueCollection = async (collectionId: string) => {
    // Guard BEFORE flipping any loading state: an early return after the setter
    // escapes the try/finally below and would freeze the global spinner
    // forever (see tests/loadingGuards.test.mts).
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) {
      setErrorMessage('Collection no longer exists.');
      return;
    }

    setIsLoading(true);

    try {
      const items = portfolio.filter(p => collection.itemIds.includes(p.id));
      const response = await fetchApi('/api/critique-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionName: collection.name,
          collectionDescription: collection.description,
          items: items.map(i => ({ title: i.title, imageData: i.imageData }))
        })
      });
      if (!response.ok) throw new Error('Failed to critique collection');
      const critique = await response.json();
      
      setCollections(prev => prev.map(c => 
        c.id === collectionId ? { ...c, critique } : c
      ));
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to critique collection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load sample preset on initial load if no artwork active
  useEffect(() => {
    if (!currentCritique && !currentImage && SAMPLE_ARTWORKS.length > 0) {
      const defaultSample = SAMPLE_ARTWORKS[0];
      setCurrentImage(defaultSample.imageData);
      setCurrentCritique(defaultSample.critiquePreset);
    }
  }, []);

  const handleSelectPreset = (sample: SampleArtwork) => {
    const seedId = 'seed_' + sample.id;
    setCurrentImage(sample.imageData);
    setCurrentCritique(sample.critiquePreset);
    // Link to the seeded portfolio row when it exists, so a generative edit on
    // a sample continues that chain; null otherwise (fresh upload behavior).
    setCurrentArtworkId(portfolio.some((p) => p.id === seedId) ? seedId : null);
    setActivePillarTab('overview');
    setSelectedHotspot(null);
    setErrorMessage(null);
    setActiveView('analyzer');
  };

  
  const handleGenerativeEdit = async (directPrompt?: string) => {
    if (!currentImage || !currentCritique) return;
    setIsReimagining(true);
    setErrorMessage(null);
    setIsEditMode(false); // Close the input after submit

    try {
      const critiqueSummary = currentCritique.executiveSummary + " | Focus areas: " + 
        currentCritique.composition.actionableFix + " | " + 
        currentCritique.lightingAndColor.actionableFix;
      
      const promptToUse = (typeof directPrompt === 'string' ? directPrompt : editPrompt).trim();
      const customPrompt = promptToUse;

        
      const response = await fetchApi('/api/reimagine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: currentImage,
          critiqueSummary: critiqueSummary,
          customPrompt: customPrompt ? customPrompt : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const { reimagedUrl } = await response.json();
      
      // Now re-trigger critique on the NEW image so the dashboard stays in sync
      const analyzeResponse = await fetchApi('/api/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: reimagedUrl,
          mimeType: 'image/jpeg',
          artworkTitle: currentCritique.artworkTitle + ' (Master Edit)',
          artistStyle: currentCritique.artistStyle,
          targetContext: currentCritique.targetContext,
          intendedMood: currentCritique.intendedMood,
          artistQuestions: 'Please critique this generative edit upscaled based on your previous feedback.',
        }),
      });
      
      if (!analyzeResponse.ok) {
        throw new Error('Edit succeeded, but failed to re-analyze the new image.');
      }
      
      const newCritiqueResult = await analyzeResponse.json();
      setCurrentImage(reimagedUrl);
      setCurrentCritique(newCritiqueResult);
      setActivePillarTab('overview');
      setSelectedHotspot(null);
      
      // Link the edit to the loaded artwork's version chain. The parent must be
      // a PORTFOLIO ROW id — the critique id alone can never identify one.
      const parentRowId = resolveEditParent(portfolio, currentArtworkId);
      const chain = resolveChain(portfolio, parentRowId, newCritiqueResult.artworkTitle);

      const newPortfolioItem: PortfolioArtwork = {
        id: 'artwork_' + Date.now(),
        title: newCritiqueResult.artworkTitle,
        imageData: reimagedUrl,
        critique: newCritiqueResult,
        createdAt: Date.now(),
        tags: [newCritiqueResult.artistStyle, 'Generative Edit'],
        version: chain.version,
        parentArtworkId: chain.parentArtworkId ?? undefined,
      };

      setPortfolio((prev) => [newPortfolioItem, ...prev]);
      // Invariant: the loaded identity becomes the NEWEST row created, so a
      // subsequent edit extends the chain (v2 -> v3 -> v4) instead of
      // re-deriving from the same root and stacking v2, v2, v2.
      setCurrentArtworkId(newPortfolioItem.id);
      
    } catch (err: any) {
      console.error('Reimagine request failed:', err);
      setErrorMessage(
        err?.message ||
          'Failed to perform generative edit. Please verify your connection or try again.'
      );
    } finally {
      setIsReimagining(false);
    }
  };


  const handleAnalyzeArtwork = async (payload: {
    imageData: string;
    mimeType: string;
    artworkTitle: string;
    artistStyle: ArtStyle;
    targetContext: TargetContext;
    intendedMood: string;
    artistQuestions: string;
    artworkId?: string | null;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentImage(payload.imageData);
    setCurrentArtworkId(payload.artworkId ?? null);

    try {
      const response = await fetchApi('/api/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: payload.imageData,
          mimeType: payload.mimeType,
          artworkTitle: payload.artworkTitle,
          artistStyle: payload.artistStyle,
          targetContext: payload.targetContext,
          intendedMood: payload.intendedMood,
          artistQuestions: payload.artistQuestions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const critiqueResult: ArtCritique = await response.json();
      setCurrentCritique(critiqueResult);
      setActivePillarTab('overview');
      setSelectedHotspot(null);

      // Save to Portfolio Vault — continue the version chain if this
      // re-analysis belongs to an existing artwork, else start at v1.
      const chain = resolveChain(portfolio, payload.artworkId ?? null, critiqueResult.artworkTitle);
      const newPortfolioItem: PortfolioArtwork = {
        id: 'artwork_' + Date.now(),
        title: critiqueResult.artworkTitle,
        imageData: payload.imageData,
        critique: critiqueResult,
        createdAt: Date.now(),
        tags: [payload.artistStyle, payload.targetContext.split(' ')[0]],
        version: chain.version,
        parentArtworkId: chain.parentArtworkId ?? undefined,
      };

      setPortfolio((prev) => [newPortfolioItem, ...prev]);
      // Same identity invariant as handleGenerativeEdit: the loaded artwork is
      // now the newest row created for it.
      setCurrentArtworkId(newPortfolioItem.id);

      // Fire celebratory confetti if high score
      if (critiqueResult.overallScore >= 8.5) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899'],
        });
      }
    } catch (err: any) {
      console.error('Critique request failed:', err);
      setErrorMessage(
        err?.message ||
          'Failed to perform VLM analysis. Please verify your connection or try another image.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = () => {
    if (currentCritique) {
      downloadReportFile(currentCritique);
    }
  };

  const handleSelectFromPortfolio = (item: PortfolioArtwork) => {
    setCurrentImage(item.imageData);
    setCurrentCritique(item.critique);
    setCurrentArtworkId(item.id);
    setActivePillarTab('overview');
    setSelectedHotspot(null);
    setActiveView('analyzer');
  };

  const handleDeleteFromPortfolio = (id: string) => {
    if (confirm('Remove this artwork from your portfolio vault?')) {
      setPortfolio((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleUpdateTags = (id: string, newTags: string[]) => {
    setPortfolio((prev) =>
      prev.map((item) => (item.id === id ? { ...item, tags: newTags } : item))
    );
  };

  const handleNewCritique = () => {
    setCurrentImage(null);
    setCurrentCritique(null);
    setCurrentArtworkId(null);
    setSelectedHotspot(null);
    setErrorMessage(null);
    setActiveView('analyzer');
  };

  return (
    <div id="artcritique-vlm-app" className="min-h-full flex flex-col bg-stone-950 text-stone-100 font-sans">
      <ProviderSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeView}
        setActiveTab={setActiveView}
        onNewCritique={handleNewCritique}
        onExportReport={handleExportReport}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasActiveCritique={!!currentCritique}
        portfolioCount={portfolio.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="max-w-5xl mx-auto mt-4 px-4">
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-200 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* View 1: Main Analyzer Studio */}
        {activeView === 'analyzer' && (
          <div>
            {!currentImage || !currentCritique ? (
              <ImageDropzone
                onAnalyze={handleAnalyzeArtwork}
                onSelectPreset={handleSelectPreset}
                isLoading={isLoading}
              />
            ) : (
              <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
                {/* Visual Canvas Inspector Stage */}
                <ArtCanvasViewer
                  imageSrc={currentImage}
                  artworkTitle={currentCritique.artworkTitle}
                  hotspots={currentCritique.hotspots}
                  selectedHotspotId={selectedHotspot?.id || null}
                  onSelectHotspot={(hs) => {
                    setSelectedHotspot(hs);
                    if (hs) {
                      setActivePillarTab(hs.pillar as any);
                    }
                  }}
                />

                {/* Extracted Color Script Bar */}
                <ColorPaletteBar palette={currentCritique.colorPalette} />

                
                {/* Generative Edit Interface */}
                <div className="flex flex-col items-end gap-2 mt-2">
                  {!isEditMode ? (
                    <button
                      onClick={() => setIsEditMode(true)}
                      disabled={isReimagining || isLoading}
                      className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isReimagining ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Generating Master Edit...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-indigo-100" />
                          Generative Edit & Upscale
                        </>
                      )}
                    </button>
                  ) : (
                    <PromptSuggestionsPanel 
                      critique={currentCritique}
                      isReimagining={isReimagining}
                      onCancel={() => setIsEditMode(false)}
                      onGenerate={(prompt) => {
                        setEditPrompt(prompt);
                        handleGenerativeEdit(prompt);
                      }}
                    />
                  )}
                </div>


                {/* Critique Navigation Tabs Bar */}
                <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-stone-900/90 border border-stone-800 overflow-x-auto no-scrollbar shadow-md">
                  <button
                    id="tab-pillar-overview"
                    onClick={() => setActivePillarTab('overview')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activePillarTab === 'overview'
                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Executive Overview</span>
                  </button>

                  <button
                    id="tab-pillar-composition"
                    onClick={() => setActivePillarTab('composition')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activePillarTab === 'composition'
                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Composition ({(currentCritique.composition?.score || 0).toFixed(1)})</span>
                  </button>

                  <button
                    id="tab-pillar-lighting"
                    onClick={() => setActivePillarTab('lighting')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activePillarTab === 'lighting'
                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    <SunMedium className="w-4 h-4" />
                    <span>Lighting & Color ({(currentCritique.lightingAndColor?.score || 0).toFixed(1)})</span>
                  </button>

                  <button
                    id="tab-pillar-anatomy"
                    onClick={() => setActivePillarTab('anatomy')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activePillarTab === 'anatomy'
                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Anatomy & Perspective ({(currentCritique.anatomyAndPerspective?.score || 0).toFixed(1)})</span>
                  </button>

                  <button
                    id="tab-pillar-storytelling"
                    onClick={() => setActivePillarTab('storytelling')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activePillarTab === 'storytelling'
                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Mood & Story ({(currentCritique.moodAndStorytelling?.score || 0).toFixed(1)})</span>
                  </button>

                  <button
                    id="tab-pillar-chat"
                    onClick={() => setActivePillarTab('chat')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activePillarTab === 'chat'
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Art Director Chat</span>
                  </button>
                </div>

                {/* Pillar Tab Viewport */}
                
                {activePillarTab === 'overview' && (
                  <CritiqueOverview 
                    critique={currentCritique}
                    onSelectPillarTab={(pillarKey) => setActivePillarTab(pillarKey)}
                    onAskArtDirector={handleAskArtDirector} 
                  />
                )}


                {activePillarTab === 'composition' && (
                  
                  <PillarCritiqueCard
                    pillarKey="composition"
                    pillarData={currentCritique.composition || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing.", strengths: [], refinements: [], actionableFix: "", techniqueTip: "" }}
                    hotspots={currentCritique.hotspots}
                    onSelectHotspot={(hs) => setSelectedHotspot(hs)}
                    onAskArtDirector={handleAskArtDirector}
                  />

                )}

                {activePillarTab === 'lighting' && (
                  
                  <PillarCritiqueCard
                    pillarKey="lighting"
                    pillarData={currentCritique.lightingAndColor || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing.", strengths: [], refinements: [], actionableFix: "", techniqueTip: "" }}
                    hotspots={currentCritique.hotspots}
                    onSelectHotspot={(hs) => setSelectedHotspot(hs)}
                    onAskArtDirector={handleAskArtDirector}
                  />

                )}

                {activePillarTab === 'anatomy' && (
                  
                  <PillarCritiqueCard
                    pillarKey="anatomy"
                    pillarData={currentCritique.anatomyAndPerspective || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing.", strengths: [], refinements: [], actionableFix: "", techniqueTip: "" }}
                    hotspots={currentCritique.hotspots}
                    onSelectHotspot={(hs) => setSelectedHotspot(hs)}
                    onAskArtDirector={handleAskArtDirector}
                  />

                )}

                {activePillarTab === 'storytelling' && (
                  
                  <PillarCritiqueCard
                    pillarKey="storytelling"
                    pillarData={currentCritique.moodAndStorytelling || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing.", strengths: [], refinements: [], actionableFix: "", techniqueTip: "" }}
                    hotspots={currentCritique.hotspots}
                    onSelectHotspot={(hs) => setSelectedHotspot(hs)}
                    onAskArtDirector={handleAskArtDirector}
                  />

                )}

                
                {activePillarTab === 'chat' && (
                  <MentorChat
                    critique={currentCritique}
                    imageBase64={currentImage}
                    initialPrompt={chatInitialPrompt}
                    onPromptSent={() => setChatInitialPrompt('')}
                  />
                )}

              </div>
            )}
          </div>
        )}

        {/* View 2: Revision Compare Mode */}
        {activeView === 'comparison' && (
          <ComparisonViewer
            portfolio={portfolio}
            onSelectArtworkForCritique={handleSelectFromPortfolio}
          />
        )}

        {/* View 3: Portfolio Vault */}
        {activeView === 'portfolio' && (
          <PortfolioModal
            portfolio={portfolio}
            collections={collections}
            isLoading={isLoading}
            onSelectArtwork={handleSelectFromPortfolio}
            onDeleteArtwork={handleDeleteFromPortfolio}
            onUpdateTags={handleUpdateTags}
            onExportMarkdown={(item) => downloadReportFile(item.critique)}
            onNewArtwork={handleNewCritique}
            onAutoGroup={handleAutoGroup}
            onCritiqueCollection={handleCritiqueCollection}
          />
        )}

        {/* View 4: Dashboard */}
        {activeView === 'dashboard' && (
          <PortfolioDashboard portfolio={portfolio} />
        )}
      </main>
    </div>
  );
}
