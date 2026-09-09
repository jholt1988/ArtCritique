import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Wand2, Compass, Layers, HelpCircle, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { ArtStyle, TargetContext } from '../types';
import { SAMPLE_ARTWORKS, SampleArtwork } from '../data/sampleArtworks';

interface ImageDropzoneProps {
  onAnalyze: (payload: {
    imageData: string;
    mimeType: string;
    artworkTitle: string;
    artistStyle: ArtStyle;
    targetContext: TargetContext;
    intendedMood: string;
    artistQuestions: string;
  }) => void;
  onSelectPreset: (sample: SampleArtwork) => void;
  isLoading: boolean;
}

const ART_STYLES: ArtStyle[] = [
  'Digital Painting',
  'Concept Art',
  'Character Design',
  'Environment / Matte Painting',
  'Stylized / Anime / Comic',
  '3D Digital Render',
  'Fine Art / Impressionism',
  'Other / Mixed Media',
];

const TARGET_CONTEXTS: TargetContext[] = [
  'Game / Film Studio Portfolio',
  'Art Gallery Exhibition',
  'Client Freelance Commission',
  'Social Media & Print Sales',
  'Personal Mastery & Study',
];

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onAnalyze,
  onSelectPreset,
  isLoading,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [artworkTitle, setArtworkTitle] = useState('');
  const [artistStyle, setArtistStyle] = useState<ArtStyle>('Digital Painting');
  const [targetContext, setTargetContext] = useState<TargetContext>('Game / Film Studio Portfolio');
  const [intendedMood, setIntendedMood] = useState('');
  const [artistQuestions, setArtistQuestions] = useState('');
  const [isIntentExpanded, setIsIntentExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Support paste from clipboard anywhere on this component
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
          }
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    setMimeType(file.type);
    if (!artworkTitle) {
      const name = file.name.replace(/\.[^/.]+$/, '');
      setArtworkTitle(name);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewImage) {
      alert('Please upload an artwork image or select one of the presets below.');
      return;
    }
    onAnalyze({
      imageData: previewImage,
      mimeType,
      artworkTitle: artworkTitle.trim() || 'Untitled Masterpiece',
      artistStyle,
      targetContext,
      intendedMood: intendedMood.trim() || 'Evocative visual impact and mood',
      artistQuestions: artistQuestions.trim(),
    });
  };

  return (
    <div id="image-upload-container" className="max-w-5xl mx-auto py-6 px-4">
      {/* Intro Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Systematic AI Vision Art Direction</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-stone-100 tracking-tight">
          Refine Your Digital Art with Master Critique
        </h1>
        <p className="mt-3 text-sm sm:text-base text-stone-400 max-w-2xl mx-auto leading-relaxed">
          Deep VLM evaluation across <strong className="text-stone-200">Composition</strong>, <strong className="text-stone-200">Lighting & Color</strong>, <strong className="text-stone-200">Anatomy & Perspective</strong>, and <strong className="text-stone-200">Mood & Storytelling</strong> to build gallery and client-ready portfolios.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Box / Canvas Dropzone */}
        <div
          id="dropzone-area"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !previewImage && fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
            dragOver
              ? 'border-amber-400 bg-amber-500/10 scale-[1.005]'
              : previewImage
              ? 'border-stone-700 bg-stone-900/60 p-4'
              : 'border-stone-800 bg-stone-900/40 hover:border-stone-700 hover:bg-stone-900/70 p-8 sm:p-12'
          }`}
        >
          <input
            id="file-upload-input"
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            className="hidden"
          />

          {previewImage ? (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group w-full md:w-80 h-64 rounded-xl overflow-hidden bg-stone-950 border border-stone-800 flex items-center justify-center flex-shrink-0">
                <img
                  src={previewImage}
                  alt="Artwork preview"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  id="btn-replace-image"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute inset-0 bg-stone-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 text-stone-200 transition-opacity text-xs font-semibold"
                >
                  <Upload className="w-5 h-5 text-amber-400" />
                  <span>Click to Change Image</span>
                </button>
              </div>

              <div className="flex-1 w-full space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Artwork Loaded Successfully</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(null);
                      setArtworkTitle('');
                    }}
                    className="text-xs text-stone-400 hover:text-rose-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Artwork Title</label>
                  <input
                    id="input-artwork-title"
                    type="text"
                    value={artworkTitle}
                    onChange={(e) => setArtworkTitle(e.target.value)}
                    placeholder="e.g. Neon Alleyway: Rain & Shadows"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-400/80 transition-colors"
                  />
                </div>

                <p className="text-xs text-stone-500">
                  Tip: You can paste images directly with <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 font-mono text-[10px] text-stone-300">Ctrl + V</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 font-mono text-[10px] text-stone-300">Cmd + V</kbd>.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-center mb-4 text-amber-400 shadow-inner group-hover:scale-105 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-base font-semibold text-stone-200">
                Drag & drop your artwork here, or <span className="text-amber-400 underline underline-offset-4">browse files</span>
              </p>
              <p className="text-xs text-stone-400 mt-1.5">
                Supports PNG, JPG, WebP (up to 30MB) • Paste directly from clipboard
              </p>
            </div>
          )}
        </div>

        {/* Artist Intent & Context Setup (Collapsible for custom fine-tuning) */}
        <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 sm:p-6 transition-all">
          <div
            onClick={() => setIsIntentExpanded(!isIntentExpanded)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-200">
                  Artist Intent & Target Objective
                </h3>
                <p className="text-xs text-stone-400">
                  Tailor the VLM evaluation to your specific style, medium, and professional goal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-400">
              <span>{isIntentExpanded ? 'Collapse' : 'Customize'}</span>
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isIntentExpanded ? 'rotate-90' : ''}`} />
            </div>
          </div>

          {isIntentExpanded && (
            <div className="mt-5 pt-5 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Style / Medium */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Art Style & Medium
                </label>
                <select
                  id="select-art-style"
                  value={artistStyle}
                  onChange={(e) => setArtistStyle(e.target.value as ArtStyle)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs font-medium focus:outline-none focus:border-amber-400/80"
                >
                  {ART_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Context */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Target Audience / Destination
                </label>
                <select
                  id="select-target-context"
                  value={targetContext}
                  onChange={(e) => setTargetContext(e.target.value as TargetContext)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs font-medium focus:outline-none focus:border-amber-400/80"
                >
                  {TARGET_CONTEXTS.map((ctx) => (
                    <option key={ctx} value={ctx}>
                      {ctx}
                    </option>
                  ))}
                </select>
              </div>

              {/* Intended Mood & Story */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Intended Mood & Narrative (Optional)
                </label>
                <input
                  id="input-intended-mood"
                  type="text"
                  value={intendedMood}
                  onChange={(e) => setIntendedMood(e.target.value)}
                  placeholder="e.g. Gritty cyberpunk noir isolation, or triumphant mythological warrior dawn"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-600 text-xs focus:outline-none focus:border-amber-400/80"
                />
              </div>

              {/* Specific Artist Questions */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Specific Questions or Concerns for the VLM (Optional)
                </label>
                <input
                  id="input-artist-questions"
                  type="text"
                  value={artistQuestions}
                  onChange={(e) => setArtistQuestions(e.target.value)}
                  placeholder="e.g. Is the lighting angle believable? Are the hand proportions anatomical?"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-600 text-xs focus:outline-none focus:border-amber-400/80"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            id="btn-start-critique"
            disabled={isLoading || !previewImage}
            className={`flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-display font-bold text-sm transition-all shadow-lg ${
              !previewImage || isLoading
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700/40'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 hover:brightness-110 shadow-amber-500/25 active:scale-98'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                <span>VLM Analyzing Composition, Lighting, Anatomy & Mood...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Perform Master Art Critique</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preset Samples Selector for 1-Click Instant Testing */}
      <div id="sample-artworks-section" className="mt-14 pt-8 border-t border-stone-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-stone-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Or Test Instantly with Sample Artworks</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Click any piece to load its visual analysis and master critique report immediately
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_ARTWORKS.map((sample) => (
            <div
              key={sample.id}
              id={`sample-card-${sample.id}`}
              onClick={() => onSelectPreset(sample)}
              className="group relative rounded-xl bg-stone-900/60 border border-stone-800 hover:border-amber-400/60 p-3.5 cursor-pointer transition-all hover:bg-stone-900 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col"
            >
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-stone-950 border border-stone-800/80 mb-3">
                <img
                  src={sample.thumbnail}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur-sm border border-stone-700/60 text-[10px] font-mono font-semibold text-amber-300">
                  ★ {sample.critiquePreset.overallScore}
                </span>
              </div>

              <h3 className="text-xs font-bold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                {sample.title}
              </h3>
              <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                {sample.intendedMood}
              </p>

              <div className="mt-3 pt-2.5 border-t border-stone-800/60 flex items-center justify-between text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-medium">
                  {sample.artistStyle}
                </span>
                <span className="text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Critique →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
