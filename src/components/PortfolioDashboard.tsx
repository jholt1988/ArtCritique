import React, { useMemo } from 'react';
import { TrendingUp, Award, Image as ImageIcon, Sparkles, Activity } from 'lucide-react';
import { PortfolioArtwork } from '../types';
import { PortfolioProgress } from './PortfolioProgress';

interface PortfolioDashboardProps {
  portfolio: PortfolioArtwork[];
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({ portfolio }) => {
  const stats = useMemo(() => {
    if (portfolio.length === 0) return null;

    const totalArtworks = portfolio.length;
    
    // Average Overall Score
    const totalScore = portfolio.reduce((sum, item) => sum + (item.critique?.overallScore || 0), 0);
    const averageScore = (totalScore / totalArtworks).toFixed(1);

    // Get latest score vs previous
    const sorted = [...portfolio].sort((a, b) => b.createdAt - a.createdAt);
    const latestScore = sorted[0]?.critique.overallScore || 0;
    const previousScore = sorted[1]?.critique.overallScore;
    const scoreDiff = previousScore ? (latestScore - previousScore).toFixed(1) : null;
    const isPositive = scoreDiff ? parseFloat(scoreDiff) >= 0 : true;

    // Highest rated artwork
    const highestRated = [...portfolio].sort((a, b) => b.critique.overallScore - a.critique.overallScore)[0];

    return {
      totalArtworks,
      averageScore,
      latestScore: latestScore.toFixed(1),
      scoreDiff,
      isPositive,
      highestRated,
    };
  }, [portfolio]);

  if (!stats) {
    return (
      <div className="py-24 text-center">
        <TrendingUp className="w-12 h-12 text-stone-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-stone-200">No Data Available</h3>
        <p className="text-stone-400 mt-2">Upload and critique artworks to populate your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-500" /> Dashboard
          </h2>
          <p className="text-sm text-stone-400 mt-1">Track your artistic growth and portfolio metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Artworks */}
        <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-stone-400 mb-4">
            <div className="p-2 bg-stone-950 rounded-lg border border-stone-800">
              <ImageIcon className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Total Pieces</span>
          </div>
          <div className="text-3xl font-bold text-stone-100">{stats.totalArtworks}</div>
        </div>

        {/* Average Score */}
        <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-stone-400 mb-4">
            <div className="p-2 bg-stone-950 rounded-lg border border-stone-800">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Avg Score</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-100">{stats.averageScore}</span>
            <span className="text-sm font-bold text-stone-500">/ 10</span>
          </div>
        </div>

        {/* Latest Score */}
        <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-stone-400 mb-4">
            <div className="p-2 bg-stone-950 rounded-lg border border-stone-800">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Latest Score</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-stone-100">{stats.latestScore}</span>
            </div>
            {stats.scoreDiff && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                stats.isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {stats.isPositive ? '+' : ''}{stats.scoreDiff}
              </span>
            )}
          </div>
        </div>

        {/* Top Rated */}
        <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-stone-400 mb-4">
            <div className="p-2 bg-stone-950 rounded-lg border border-stone-800">
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Top Rated</span>
          </div>
          <div>
            <div className="text-sm font-bold text-stone-200 truncate">{stats.highestRated.title}</div>
            <div className="text-xs text-stone-500 font-mono mt-1">Score: {stats.highestRated.critique.overallScore.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <PortfolioProgress portfolio={portfolio} />
    </div>
  );
};
