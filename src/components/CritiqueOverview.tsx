import React, { useState } from 'react';
import { Award, CheckCircle2, AlertCircle, Compass, SunMedium, UserCheck, HeartHandshake, Zap, Briefcase, ChevronRight, CheckSquare, Square, MessageSquare } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ArtCritique } from '../types';

interface CritiqueOverviewProps {
  critique: ArtCritique;
  onSelectPillarTab: (pillarKey: 'composition' | 'lighting' | 'anatomy' | 'storytelling') => void;
  onAskArtDirector?: (prompt: string) => void;
}

export const CritiqueOverview: React.FC<CritiqueOverviewProps> = ({
  critique,
  onSelectPillarTab,
  onAskArtDirector,
}) => {
  const [completedWins, setCompletedWins] = useState<Record<number, boolean>>({});

  const toggleWin = (idx: number) => {
    setCompletedWins((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 7.0) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getBarColor = (score: number) => {
    if (score >= 8.5) return 'bg-emerald-500';
    if (score >= 7.0) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const pillars = [
    {
      key: 'composition' as const,
      label: 'Composition',
      sublabel: 'Arrangement, Balance, Rule of 3rds',
      score: critique.composition?.score || 0,
      headline: critique.composition?.headline || "Not evaluated",
      icon: Compass,
      color: 'text-sky-400',
    },
    {
      key: 'lighting' as const,
      label: 'Lighting & Color',
      sublabel: 'Light Sources, Shading, Value Contrast',
      score: critique.lightingAndColor?.score || 0,
      headline: critique.lightingAndColor?.headline || "Not evaluated",
      icon: SunMedium,
      color: 'text-amber-400',
    },
    {
      key: 'anatomy' as const,
      label: 'Anatomy & Perspective',
      sublabel: 'Proportions, Vanishing Lines, Scale',
      score: critique.anatomyAndPerspective?.score || 0,
      headline: critique.anatomyAndPerspective?.headline || "Not evaluated",
      icon: UserCheck,
      color: 'text-emerald-400',
    },
    {
      key: 'storytelling' as const,
      label: 'Mood & Storytelling',
      sublabel: 'Emotion, Atmosphere, Narrative Clarity',
      score: critique.moodAndStorytelling?.score || 0,
      headline: critique.moodAndStorytelling?.headline || "Not evaluated",
      icon: HeartHandshake,
      color: 'text-rose-400',
    },
  ];

  const radarData = [
    { subject: 'Comp', score: critique.composition?.score || 0, fullMark: 10 },
    { subject: 'Lighting', score: critique.lightingAndColor?.score || 0, fullMark: 10 },
    { subject: 'Anatomy', score: critique.anatomyAndPerspective?.score || 0, fullMark: 10 },
    { subject: 'Story', score: critique.moodAndStorytelling?.score || 0, fullMark: 10 },
  ];

  return (
    <div id="critique-overview-section" className="space-y-6">
      {/* Top Banner: Overall Score & Executive Verdict */}
      <div className="relative rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-stone-800 p-6 shadow-xl overflow-hidden">
        {/* Glow accent in corner */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Score Badge */}
              <div className="relative flex-shrink-0 w-24 h-24 rounded-2xl bg-stone-950 border-2 border-stone-800 flex flex-col items-center justify-center p-2 shadow-inner">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-400">
                  Master Score
                </span>
                <div className="flex items-baseline gap-0.5 mt-0.5">
                  <span className="font-display font-extrabold text-3xl sm:text-4xl text-stone-100">
                    {critique.overallScore.toFixed(1)}
                  </span>
                  <span className="text-stone-500 font-mono text-xs">/10</span>
                </div>
                <div className="w-full bg-stone-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    style={{ width: `${(critique.overallScore / 10) * 100}%` }}
                    className={`h-full ${getBarColor(critique.overallScore)} transition-all duration-500`}
                  />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-2 bg-stone-950/80 border-amber-400/30 text-amber-300">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{critique.galleryReadiness}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-100">
                  {critique.artworkTitle}
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Evaluated for: <span className="text-stone-300 font-medium">{critique.targetContext}</span> • Style: <span className="text-stone-300 font-medium">{critique.artistStyle}</span>
                </p>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="mt-5 pt-4 border-t border-stone-800/80">
              <p className="text-sm text-stone-300 leading-relaxed font-normal">
                "{critique.executiveSummary}"
              </p>
            </div>
          </div>

          {/* Radial Score Chart */}
          <div className="md:col-span-1 h-48 sm:h-56 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="#57534e" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#a8a29e', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="score" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4 Pillars Grid (Interactive Click to jump to deep-dive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.key}
              id={`pillar-card-${pillar.key}`}
              onClick={() => onSelectPillarTab(pillar.key)}
              className="group relative rounded-xl bg-stone-900/60 border border-stone-800 hover:border-amber-400/60 p-4 cursor-pointer transition-all hover:bg-stone-900 hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-stone-800/80 border border-stone-700 flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${pillar.color}`} />
                    </div>
                    <span className="text-xs font-bold text-stone-200">{pillar.label}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getScoreColor(pillar.score)}`}>
                    {pillar.score.toFixed(1)}
                  </span>
                </div>

                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden mb-2.5">
                  <div
                    style={{ width: `${(pillar.score / 10) * 100}%` }}
                    className={`h-full ${getBarColor(pillar.score)}`}
                  />
                </div>

                <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                  {pillar.headline}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>View Deep Critique</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick 5-Minute Wins & Client Perception in 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Wins Actionable Checklist */}
        <div className="rounded-2xl bg-stone-900/60 border border-stone-800 p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-200">
                Quick 5-Minute Polish Wins
              </h3>
            </div>
            <span className="text-[11px] text-stone-400">
              Interactive Checklist
            </span>
          </div>

          <div className="space-y-2.5">
            {(critique.quickWins || []).map((win, idx) => {
              const isDone = !!completedWins[idx];
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all select-none text-xs ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-stone-400'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 text-stone-200'
                  }`}
                >
                  <button type="button" onClick={() => toggleWin(idx)} className="mt-0.5 text-stone-400 hover:text-amber-400 flex-shrink-0">
                    {isDone ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-500" />
                    )}
                  </button>
                  <span className={`leading-relaxed flex-1 cursor-pointer ${isDone ? 'line-through' : ''}`} onClick={() => toggleWin(idx)}>
                    {win}
                  </span>
                  {onAskArtDirector && !isDone && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onAskArtDirector(`Can you explain step-by-step how to do this quick win: "${win}"?`); }}
                      className="mt-0.5 text-indigo-400 hover:text-indigo-300 opacity-50 hover:opacity-100 flex-shrink-0 transition-opacity"
                      title="Ask Art Director how to do this"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Client & Gallery Commercial Impression */}
        <div className="rounded-2xl bg-stone-900/60 border border-stone-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-200">
                Gallery & Art Director Perception
              </h3>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed italic bg-stone-950/60 p-3.5 rounded-xl border border-stone-800/80 mb-4">
              "{critique.clientImpression}"
            </p>

            <h4 className="text-xs font-semibold text-stone-300 mb-2">
              Portfolio Strategy Recommendations:
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              {(critique.portfolioRecommendations || []).map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
