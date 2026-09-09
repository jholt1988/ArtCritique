import React, { useState } from 'react';
import { ArtCritique } from '../types';
import { Sparkles, PenTool, Droplet, RefreshCw } from 'lucide-react';

interface PromptSuggestionsPanelProps {
  critique: ArtCritique;
  isReimagining: boolean;
  onGenerate: (prompt: string) => void;
  onCancel: () => void;
}

export const PromptSuggestionsPanel: React.FC<PromptSuggestionsPanelProps> = ({ critique, isReimagining, onGenerate, onCancel }) => {
  const [customPrompt, setCustomPrompt] = useState('');

  const suggestions = [
    {
      id: 'master',
      title: 'The Master Polish',
      icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
      prompt: `Apply the following Art Director feedback: "${critique.executiveSummary}". Focus specifically on: ${critique.quickWins?.join(', ') || 'overall finish'}. Redraw, refine, and upscale this artwork to implement these improvements while maintaining the original spirit and composition. Render it as a high-quality masterpiece.`,
      tools: 'Stable Diffusion Ultimate SD Upscale, Midjourney (v6), Photoshop Generative Fill'
    },
    {
      id: 'lighting',
      title: 'Lighting & Mood Overhaul',
      icon: <Droplet className="w-5 h-5 text-amber-400" />,
      prompt: `Maintain the exact structure and composition but completely overhaul the lighting. Focus: ${critique.lightingAndColor?.actionableFix || 'improve lighting'}. Apply this technique: ${critique.lightingAndColor?.techniqueTip || 'use stronger contrast'}. Re-render the light interactions to match the intended mood of ${critique.intendedMood || 'the piece'}.`,
      tools: 'Stable Diffusion img2img (Denoise 0.45), Photoshop Curves + Color Balance adjustments'
    },
    {
      id: 'anatomy',
      title: 'Structural & Anatomy Fix',
      icon: <PenTool className="w-5 h-5 text-rose-400" />,
      prompt: `Adjust the proportions, structural integrity, and framing. Focus on: ${critique.anatomyAndPerspective?.actionableFix || 'improving anatomy'} and ${critique.composition?.actionableFix || 'framing'}. Ensure the perspective is consistent and forms are solidly drawn before rendering the final details.`,
      tools: 'Stable Diffusion ControlNet (Depth + Canny), Photoshop Liquify Tool + Overpaint'
    }
  ];

  return (
    <div className="w-full bg-stone-900/90 border border-stone-800 rounded-2xl shadow-2xl p-6 mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <h3 className="text-lg font-bold text-stone-100 mb-2">Generative Prompts & Recommended Workflows</h3>
      <p className="text-stone-400 text-sm mb-6">Select an auto-generated prompt based on the AI critique to guide the generative upscale, or use these prompts with your suggested tools offline.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {suggestions.map(s => (
          <div key={s.id} className="flex flex-col bg-stone-950 border border-stone-800 rounded-xl p-4 hover:border-indigo-500/50 transition-colors cursor-pointer group"
               onClick={() => setCustomPrompt(s.prompt)}>
            <div className="flex items-center gap-2 mb-3">
              {s.icon}
              <h4 className="font-bold text-stone-200">{s.title}</h4>
            </div>
            <p className="text-xs text-stone-400 line-clamp-4 mb-4 flex-1">
              "{s.prompt}"
            </p>
            <div className="mt-auto pt-3 border-t border-stone-800">
              <p className="text-[10px] uppercase font-bold text-stone-500 mb-1">Recommended Tools</p>
              <p className="text-xs text-indigo-300 font-medium">{s.tools}</p>
            </div>
            <button 
              className="mt-4 w-full bg-stone-800 hover:bg-indigo-600 text-stone-200 text-xs font-bold py-2 rounded-lg transition-colors group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setCustomPrompt(s.prompt);
                onGenerate(s.prompt);
              }}
              disabled={isReimagining}
            >
              {isReimagining ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Generate With Prompt
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full bg-stone-950 p-2 rounded-xl border border-stone-800">
        <input 
          type="text" 
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Or write a custom prompt (e.g., Apply the feedback, but make it cyberpunk style...)"
          className="flex-1 bg-transparent text-stone-200 text-sm px-4 py-2.5 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customPrompt) onGenerate(customPrompt);
          }}
        />
        <div className="flex items-center gap-2 px-2 pb-2 sm:p-0">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onGenerate(customPrompt)}
            disabled={isReimagining || !customPrompt}
            className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isReimagining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};
