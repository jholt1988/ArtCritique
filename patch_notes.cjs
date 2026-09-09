const fs = require('fs');
let code = fs.readFileSync('src/components/PillarCritiqueCard.tsx', 'utf8');

// Add icons
code = code.replace(
  /AlignLeft\n\}/,
  "AlignLeft,\n  PenLine,\n  Check,\n  X\n}"
);

// Add state
const stateReplacement = `  const [isRoadmapView, setIsRoadmapView] = useState(false);
  const [completedRoadmapItems, setCompletedRoadmapItems] = useState<Record<number, boolean>>({});
  const [roadmapNotes, setRoadmapNotes] = useState<Record<number, string>>({});
  const [editingNoteIdx, setEditingNoteIdx] = useState<number | null>(null);
  const [tempNote, setTempNote] = useState<string>("");

  const saveNote = (idx: number) => {
    setRoadmapNotes(prev => ({ ...prev, [idx]: tempNote }));
    setEditingNoteIdx(null);
  };`;

code = code.replace(
  /  const \[isRoadmapView, setIsRoadmapView\] = useState\(false\);\n  const \[completedRoadmapItems, setCompletedRoadmapItems\] = useState<Record<number, boolean>>\(\{\}\);/,
  stateReplacement
);

const roadmapItemReplacement = `
                  const isDone = !!completedRoadmapItems[idx];
                  const hasNote = !!roadmapNotes[idx];
                  const isEditing = editingNoteIdx === idx;
                  
                  return (
                    <div key={idx} className={\`flex flex-col gap-1 p-2 rounded-lg transition-all select-none group \${isDone ? 'bg-amber-950/20 text-stone-500' : 'hover:bg-stone-900 text-stone-300'}\`}>
                      <div className="flex items-start gap-2.5">
                        <button type="button" onClick={() => toggleRoadmapItem(idx)} className={\`mt-0.5 flex-shrink-0 \${isDone ? 'text-amber-500/50' : 'text-stone-500 hover:text-amber-400'}\`}>
                          {isDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                        <span className={\`text-xs leading-relaxed flex-1 cursor-pointer \${isDone ? 'line-through' : ''}\`} onClick={() => toggleRoadmapItem(idx)}>
                          {obj}
                        </span>
                        
                        {!isEditing && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setTempNote(roadmapNotes[idx] || ""); setEditingNoteIdx(idx); }}
                            className={\`opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 \${hasNote ? 'text-amber-400 opacity-100' : 'text-stone-500 hover:text-stone-300'}\`}
                            title={hasNote ? "Edit note" : "Add note"}
                          >
                            <PenLine className="w-3.5 h-3.5" />
                          </button>
                        )}
                        
                        {onAskArtDirector && !isDone && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onAskArtDirector(\`Can you explain step-by-step how to execute this specific learning objective: "\${obj}"?\`); }}
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
`;

code = code.replace(
  /                  const isDone = !!completedRoadmapItems\[idx\];\n                  return \([\s\S]*?                  \);\n/g,
  roadmapItemReplacement
);

fs.writeFileSync('src/components/PillarCritiqueCard.tsx', code);
