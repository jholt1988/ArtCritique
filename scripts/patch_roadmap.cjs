const fs = require('fs');

let code = fs.readFileSync('src/components/PillarCritiqueCard.tsx', 'utf8');

// Import useState
code = code.replace(
  /import React from 'react';/,
  "import React, { useState } from 'react';"
);

// Import icons
code = code.replace(
  /MessageSquare\s*\}/,
  "MessageSquare,\n  CheckSquare,\n  Square,\n  ListTodo,\n  AlignLeft\n}"
);

// Add state to component
code = code.replace(
  /export const PillarCritiqueCard: React\.FC<PillarCritiqueCardProps> = \(\{[\s\S]*?\}\) => \{/,
  `$&
  const [isRoadmapView, setIsRoadmapView] = useState(false);
  const [completedRoadmapItems, setCompletedRoadmapItems] = useState<Record<number, boolean>>({});

  const toggleRoadmapItem = (idx: number) => {
    setCompletedRoadmapItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const learningObjectives = (pillarData.actionableFix || '')
    .split(/(?<=[.!?])\\s+/)
    .filter(s => s.trim().length > 3)
    .map(s => s.trim());
`
);

// Replace Actionable Fix section
const roadmapReplacement = `
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
                  className={\`p-1 rounded-md transition-colors \${!isRoadmapView ? 'bg-amber-500/20 text-amber-400' : 'text-stone-500 hover:text-stone-300'}\`}
                  title="Text View"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsRoadmapView(true)}
                  className={\`p-1 rounded-md transition-colors \${isRoadmapView ? 'bg-amber-500/20 text-amber-400' : 'text-stone-500 hover:text-stone-300'}\`}
                  title="Roadmap Checklist View"
                >
                  <ListTodo className="w-3.5 h-3.5" />
                </button>
              </div>
              {onAskArtDirector && (
                <button
                  onClick={() => onAskArtDirector(\`Can you give me a more detailed, step-by-step walkthrough on how to execute this actionable fix: "\${pillarData.actionableFix}"?\`)}
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
                  return (
                    <div
                      key={idx}
                      className={\`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all select-none \${
                        isDone 
                          ? 'bg-amber-950/20 text-stone-500' 
                          : 'hover:bg-stone-900 text-stone-300'
                      }\`}
                      onClick={() => toggleRoadmapItem(idx)}
                    >
                      <button type="button" className={\`mt-0.5 flex-shrink-0 \${isDone ? 'text-amber-500/50' : 'text-stone-500 hover:text-amber-400'}\`}>
                        {isDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                      <span className={\`text-xs leading-relaxed flex-1 \${isDone ? 'line-through' : ''}\`}>
                        {obj}
                      </span>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-stone-500 italic p-3 text-center">Could not generate a roadmap for this fix.</p>
                )}
              </div>
            )}
          </div>
        </div>
`;

// we need to carefully replace the old Actionable Fix div
code = code.replace(
  /<div className="rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500\/30 p-5">[\s\S]*?<\/p>\s*<\/div>/,
  roadmapReplacement.trim()
);

fs.writeFileSync('src/components/PillarCritiqueCard.tsx', code);
