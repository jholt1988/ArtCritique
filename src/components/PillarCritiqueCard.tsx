import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  SunMedium,
  UserCheck,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Lightbulb,
  Crosshair,
  ArrowRight,
  MessageSquare,
  CheckSquare,
  Square,
  ListTodo,
  AlignLeft,
  PenLine,
  Check,
  X
} from 'lucide-react';
import { PillarDetail, HotspotAnnotation } from '../types';
import confetti from 'canvas-confetti';

interface PillarCritiqueCardProps {
  pillarKey: 'composition' | 'lighting' | 'anatomy' | 'storytelling';
  pillarData: PillarDetail;
  hotspots: HotspotAnnotation[];
  onSelectHotspot: (hotspot: HotspotAnnotation) => void;
  onAskArtDirector?: (prompt: string) => void;
}

export const PillarCritiqueCard: React.FC<PillarCritiqueCardProps> = ({
  pillarKey,
  pillarData,
  hotspots,
  onSelectHotspot,
  onAskArtDirector
}) => {
  const [isRoadmapView, setIsRoadmapView] = useState(false);
  const [showAllHighPriority, setShowAllHighPriority] = useState(false);
  const [completedRoadmapItems, setCompletedRoadmapItems] = useState<Record<number, boolean>>({});
  const [roadmapNotes, setRoadmapNotes] = useState<Record<number, string>>({});
  const [editingNoteIdx, setEditingNoteIdx] = useState<number | null>(null);
  const [tempNote, setTempNote] = useState<string>("");

  const saveNote = (idx: number) => {
    setRoadmapNotes(prev => ({ ...prev, [idx]: tempNote }));
    setEditingNoteIdx(null);
  };

  const learningObjectives = (pillarData.actionableFix || '')
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 3)
    .map(s => s.trim());

  const toggleRoadmapItem = (idx: number) => {
    setCompletedRoadmapItems(prev => {
      const next = {
        ...prev,
        [idx]: !prev[idx]
      };
      
      const totalObjectives = learningObjectives.length;
      const completedCount = Object.values(next).filter(Boolean).length;
      
      if (completedCount === totalObjectives && totalObjectives > 0 && !prev[idx]) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#d97706', '#10b981']
        });
      }
      
      return next;
    });
  };

  const getPillarConfig = () => {
    switch (pillarKey) {
      case 'composition':
        return {
          title: 'Composition & Visual Architecture',
          subtitle: 'Arrangement of elements, balance, focal hierarchy, negative space, and use of compositional rules like Rule of Thirds & Golden Spiral.',
          icon: Compass,
          accentColor: 'text-sky-400',
          bgBadge: 'bg-sky-500/10 border-sky-500/20 text-sky-300',
        };
      case 'lighting':
        return {
          title: 'Lighting & Color Harmony',
          subtitle: 'Key/fill/rim light consistency, form shading, ambient occlusion, saturation control, gamut harmony, and tonal value contrast.',
          icon: SunMedium,
          accentColor: 'text-amber-400',
          bgBadge: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
        };
      case 'anatomy':
        return {
          title: 'Anatomy & Perspective Systems',
          subtitle: 'Proportions, skeletal landmarks, facial plane structure, foreshortening, vanishing lines, and perspective grid convergence.',
          icon: UserCheck,
          accentColor: 'text-emerald-400',
          bgBadge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
        };
      case 'storytelling':
        return {
          title: 'Mood & Narrative Storytelling',
          subtitle: 'Emotional resonance, atmospheric weight, intended message clarity, symbolic details, and commercial gallery/client impact.',
          icon: HeartHandshake,
          accentColor: 'text-rose-400',
          bgBadge: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
        };
    }
  };

  const config = getPillarConfig();
  const Icon = config.icon;
  const baseHotspots = hotspots.filter((h) => h.pillar === pillarKey);
  const displayedHotspots = showAllHighPriority ? hotspots.filter(h => h.severity === 'critical') : baseHotspots;

  const getScoreBadge = (score: number) => {
    if (score >= 8.5) return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    if (score >= 7.0) return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: "easeOut" } 
    },
  };

  return (
    <motion.div 
      key={pillarKey}
      id={`pillar-detail-${pillarKey}`} 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Pillar Header Card */}
      <motion.div variants={itemVariants} className="rounded-2xl bg-stone-900/80 border border-stone-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center shadow-inner">
              <Icon className={`w-6 h-6 ${config.accentColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${config.bgBadge}`}>
                  Pillar Review
                </span>
              </div>
              <h2 className="text-xl font-display font-bold text-stone-100 mt-1">
                {config.title}
              </h2>
            </div>
          </div>

          {/* Score Counter */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border flex items-baseline gap-1 ${getScoreBadge(pillarData.score)}`}>
              <span className="font-display font-extrabold text-2xl">{pillarData.score.toFixed(1)}</span>
              <span className="text-xs font-mono opacity-60">/ 10</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-stone-400 mt-3 max-w-3xl leading-relaxed">
          {config.subtitle}
        </p>

        {/* Headline verdict */}
        <div className="mt-4 pt-4 border-t border-stone-800/80">
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <span>Verdict: {pillarData.headline}</span>
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed font-normal">
            {pillarData.detailedAnalysis}
          </p>
        </div>
      </motion.div>

      {/* Strengths & Refinements in 2-column layout */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="rounded-2xl bg-stone-900/60 border border-stone-800 p-5">
          <div className="flex items-center gap-2 text-emerald-400 mb-3.5">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Key Strengths & Mastery
            </h3>
          </div>
          <ul className="space-y-2.5">
            {(pillarData.strengths || []).map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-300 bg-stone-950/40 p-3 rounded-xl border border-stone-800/60 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Refinement */}
        <div className="rounded-2xl bg-stone-900/60 border border-stone-800 p-5">
          <div className="flex items-center gap-2 text-amber-400 mb-3.5">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Areas for Refinement
            </h3>
          </div>
          <ul className="space-y-2.5">
            {(pillarData.refinements || []).map((refinement, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-300 bg-stone-950/40 p-3 rounded-xl border border-stone-800/60 leading-relaxed group">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <span className="flex-1">{refinement}</span>
                {onAskArtDirector && (
                  <button
                    onClick={() => onAskArtDirector(`How can I improve this specific issue: "${refinement}"?`)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 hover:text-amber-400 flex-shrink-0"
                    title="Ask Art Director how to improve this"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Actionable Fix & Master Technique Tip */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Immediate Step-by-Step Fix */}
        {/* Immediate Step-by-Step Fix / Roadmap */}
        <div className="rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/30 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Wrench className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Targeted Actionable Fix
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-stone-950/80 rounded-lg p-0.5 border border-stone-800">
                <button
                  onClick={() => setIsRoadmapView(false)}
                  className={`p-1 rounded-md transition-colors ${!isRoadmapView ? 'bg-amber-500/20 text-amber-400' : 'text-stone-500 hover:text-stone-300'}`}
                  title="Text View"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsRoadmapView(true)}
                  className={`p-1 rounded-md transition-colors ${isRoadmapView ? 'bg-amber-500/20 text-amber-400' : 'text-stone-500 hover:text-stone-300'}`}
                  title="Roadmap Checklist View"
                >
                  <ListTodo className="w-3.5 h-3.5" />
                </button>
              </div>
              {onAskArtDirector && (
                <button
                  onClick={() => onAskArtDirector(`Can you give me a more detailed, step-by-step walkthrough on how to execute this actionable fix: "${pillarData.actionableFix}"?`)}
                  className="text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ml-1"
                  title="Ask Art Director for step-by-step help"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span className="hidden sm:inline">Ask Director</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 bg-stone-950/80 rounded-xl border border-stone-800 overflow-hidden">
            {!isRoadmapView ? (
              <p className="text-xs text-stone-200 leading-relaxed p-3.5">
                {pillarData.actionableFix}
              </p>
            ) : (
              <div className="p-2 space-y-1">
                {learningObjectives.length > 0 ? learningObjectives.map((obj, idx) => {

                  const isDone = !!completedRoadmapItems[idx];
                  const hasNote = !!roadmapNotes[idx];
                  const isEditing = editingNoteIdx === idx;
                  
                  return (
                    <div key={idx} className={`flex flex-col gap-1 p-2 rounded-lg transition-all select-none group ${isDone ? 'bg-amber-950/20 text-stone-500' : 'hover:bg-stone-900 text-stone-300'}`}>
                      <div className="flex items-start gap-2.5">
                        <button type="button" onClick={() => toggleRoadmapItem(idx)} className={`mt-0.5 flex-shrink-0 ${isDone ? 'text-amber-500/50' : 'text-stone-500 hover:text-amber-400'}`}>
                          {isDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                        <span className={`text-xs leading-relaxed flex-1 cursor-pointer ${isDone ? 'line-through' : ''}`} onClick={() => toggleRoadmapItem(idx)}>
                          {obj}
                        </span>
                        
                        {!isEditing && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setTempNote(roadmapNotes[idx] || ""); setEditingNoteIdx(idx); }}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 ${hasNote ? 'text-amber-400 opacity-100' : 'text-stone-500 hover:text-stone-300'}`}
                            title={hasNote ? "Edit note" : "Add note"}
                          >
                            <PenLine className="w-3.5 h-3.5" />
                          </button>
                        )}
                        
                        {onAskArtDirector && !isDone && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onAskArtDirector(`Can you explain step-by-step how to execute this specific learning objective: "${obj}"?`); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 hover:text-indigo-300 flex-shrink-0 mt-0.5"
                            title="Ask Art Director about this step"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {isEditing && (
                        <div className="mt-1 flex items-center gap-2 pl-6">
                          <input
                            type="text"
                            value={tempNote}
                            onChange={(e) => setTempNote(e.target.value)}
                            placeholder="Add a scratchpad note..."
                            className="flex-1 bg-stone-950 border border-stone-700 rounded p-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500/50"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveNote(idx);
                              if (e.key === 'Escape') setEditingNoteIdx(null);
                            }}
                          />
                          <button onClick={() => saveNote(idx)} className="text-emerald-500 hover:text-emerald-400 p-1 bg-emerald-500/10 rounded">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingNoteIdx(null)} className="text-stone-500 hover:text-stone-400 p-1 bg-stone-800 rounded">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      
                      {!isEditing && hasNote && (
                        <div className="mt-0.5 pl-6 flex items-start gap-1.5">
                          <div className="w-0.5 h-full min-h-[12px] bg-amber-500/30 rounded-full mt-0.5"></div>
                          <p className="text-[11px] text-amber-200/70 italic leading-relaxed break-words pr-2">
                            {roadmapNotes[idx]}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <p className="text-xs text-stone-500 italic p-3 text-center">Could not generate a roadmap for this fix.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Master Technique Tip */}
        <div className="rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-indigo-500/30 p-5">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Lightbulb className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Senior Artist Technique Pro-Tip
            </h3>
          </div>
          <p className="text-xs text-stone-200 leading-relaxed bg-stone-950/80 p-3.5 rounded-xl border border-stone-800">
            {pillarData.techniqueTip}
          </p>
        </div>
      </motion.div>

      {/* Associated Hotspots on Canvas */}
      {(baseHotspots.length > 0 || displayedHotspots.length > 0) && (
        <motion.div variants={itemVariants} className="rounded-2xl bg-stone-900/60 border border-stone-800 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Visual Canvas Annotations ({displayedHotspots.length})
              </h3>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <label className="flex items-center gap-1.5 cursor-pointer group">
                 <input 
                   type="checkbox" 
                   className="accent-rose-500 rounded border-stone-700 bg-stone-900 cursor-pointer" 
                   checked={showAllHighPriority} 
                   onChange={(e) => setShowAllHighPriority(e.target.checked)} 
                 />
                 <span className="text-[11px] text-stone-400 group-hover:text-stone-300 transition-colors">Show All High-Priority</span>
              </label>
              <span className="text-[11px] text-stone-500 hidden sm:inline">
                Click to pinpoint
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayedHotspots.length === 0 ? (
              <div className="col-span-full p-4 text-center text-stone-500 text-xs italic">
                No high-priority annotations found.
              </div>
            ) : displayedHotspots.map((hs) => (
              <div
                key={hs.id}
                onClick={() => onSelectHotspot(hs)}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-400/60 cursor-pointer transition-all hover:bg-stone-900 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-amber-400">
                      Pin ({Math.round(hs.x)}%, {Math.round(hs.y)}%)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 capitalize flex items-center gap-1">
                      {showAllHighPriority && <span className="opacity-60">{hs.pillar} • </span>}
                      <span className={hs.severity === 'critical' ? 'text-rose-400' : hs.severity === 'strength' ? 'text-emerald-400' : 'text-amber-400'}>{hs.severity}</span>
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-200 mt-1 group-hover:text-amber-300 transition-colors">
                    {hs.title}
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {hs.issue}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0 mt-2" />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

