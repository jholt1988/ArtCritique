import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PortfolioArtwork } from '../types';
import { Sparkles } from 'lucide-react';

interface PortfolioProgressProps {
  portfolio: PortfolioArtwork[];
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;

  if (payload.isNewHigh) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={12} fill="#10b981" fillOpacity={0.2} className="animate-pulse" />
        <circle cx={cx} cy={cy} r={6} fill="#10b981" stroke="#1c1917" strokeWidth={2} />
      </g>
    );
  }

  return <circle cx={cx} cy={cy} r={4} fill="#f59e0b" stroke="#1c1917" strokeWidth={2} />;
};

export function PortfolioProgress({ portfolio }: PortfolioProgressProps) {
  const chartData = useMemo(() => {
    // Sort oldest first
    const sorted = [...portfolio].sort((a, b) => a.createdAt - b.createdAt);
    
    let currentHigh = -1;
    return sorted.map((item, index) => {
      const isNewHigh = index > 0 && (item.critique?.overallScore || 0) > currentHigh;
      if ((item.critique?.overallScore || 0) > currentHigh) {
        currentHigh = (item.critique?.overallScore || 0);
      }
      return {
        name: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: (item.critique?.overallScore || 0),
        title: item.title,
        fullDate: new Date(item.createdAt).toLocaleString(),
        isNewHigh,
      };
    });
  }, [portfolio]);

  if (portfolio.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-stone-900/60 rounded-2xl border border-stone-800 text-stone-400">
        <p className="text-xs">Add more artworks to see your progress over time.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-stone-900/60 border border-stone-800 rounded-2xl p-6">
      <h3 className="text-sm font-bold text-stone-100 mb-6 flex items-center gap-2">
        <span className="text-amber-500">📈</span> Overall Score Progression
      </h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#78716c" 
              tick={{ fill: '#78716c', fontSize: 10 }} 
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis 
              domain={[0, 10]} 
              stroke="#78716c" 
              tick={{ fill: '#78716c', fontSize: 10 }} 
              tickLine={false} 
              axisLine={false}
              dx={-10}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-stone-800 border border-stone-700 p-3 rounded-lg shadow-xl relative overflow-hidden">
                      {data.isNewHigh && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> NEW HIGH
                        </div>
                      )}
                      <p className="text-stone-300 text-[10px] font-mono mb-1">{data.fullDate}</p>
                      <p className={`font-bold text-stone-100 text-xs mb-1 ${data.isNewHigh ? 'pr-20' : ''}`}>{data.title}</p>
                      <div className="flex items-center gap-2">
                        <span className={`${data.isNewHigh ? 'text-emerald-400' : 'text-amber-500'} font-bold text-sm`}>{data.score.toFixed(1)}</span>
                        <span className="text-stone-400 text-[10px]">/ 10</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ r: 6, fill: '#f59e0b', stroke: '#1c1917', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
