const fs = require('fs');

let code = fs.readFileSync('src/components/CritiqueOverview.tsx', 'utf8');

// Add MessageSquare import
code = code.replace(
  /Award, CheckCircle2, AlertCircle, Compass, SunMedium, UserCheck, HeartHandshake, Zap, Briefcase, ChevronRight, CheckSquare, Square/,
  'Award, CheckCircle2, AlertCircle, Compass, SunMedium, UserCheck, HeartHandshake, Zap, Briefcase, ChevronRight, CheckSquare, Square, MessageSquare'
);

// Add onAskArtDirector to interface
code = code.replace(
  /onSelectPillarTab: \(pillarKey: 'composition' \| 'lighting' \| 'anatomy' \| 'storytelling'\) => void;/,
  `onSelectPillarTab: (pillarKey: 'composition' | 'lighting' | 'anatomy' | 'storytelling') => void;
  onAskArtDirector?: (prompt: string) => void;`
);

// Add onAskArtDirector to props
code = code.replace(
  /critique,\s*onSelectPillarTab,/,
  `critique,
  onSelectPillarTab,
  onAskArtDirector,`
);

// Replace Quick Wins rendering
const newQuickWins = `
          <div className="space-y-2.5">
            {(critique.quickWins || []).map((win, idx) => {
              const isDone = !!completedWins[idx];
              return (
                <div
                  key={idx}
                  className={\`flex items-start gap-3 p-2.5 rounded-xl border transition-all select-none text-xs \${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-stone-400'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 text-stone-200'
                  }\`}
                >
                  <button type="button" onClick={() => toggleWin(idx)} className="mt-0.5 text-stone-400 hover:text-amber-400 flex-shrink-0">
                    {isDone ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-500" />
                    )}
                  </button>
                  <span className={\`leading-relaxed flex-1 cursor-pointer \${isDone ? 'line-through' : ''}\`} onClick={() => toggleWin(idx)}>
                    {win}
                  </span>
                  {onAskArtDirector && !isDone && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onAskArtDirector(\`Can you explain step-by-step how to do this quick win: "\${win}"?\`); }}
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
`;

code = code.replace(
  /<div className="space-y-2\.5">[\s\S]*?<\/div>\s*<\/div>\s*<!-- \/\* Portfolio/m,
  newQuickWins.trim() + '\n        </div>\n\n        {/* Portfolio'
);

fs.writeFileSync('src/components/CritiqueOverview.tsx', code);
