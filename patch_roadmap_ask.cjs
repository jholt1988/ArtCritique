const fs = require('fs');
let code = fs.readFileSync('src/components/PillarCritiqueCard.tsx', 'utf8');

const itemReplace = `
                    <div
                      key={idx}
                      className={\`flex items-start gap-2.5 p-2 rounded-lg transition-all select-none group \${
                        isDone 
                          ? 'bg-amber-950/20 text-stone-500' 
                          : 'hover:bg-stone-900 text-stone-300'
                      }\`}
                    >
                      <button type="button" onClick={() => toggleRoadmapItem(idx)} className={\`mt-0.5 flex-shrink-0 \${isDone ? 'text-amber-500/50' : 'text-stone-500 hover:text-amber-400'}\`}>
                        {isDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                      <span className={\`text-xs leading-relaxed flex-1 cursor-pointer \${isDone ? 'line-through' : ''}\`} onClick={() => toggleRoadmapItem(idx)}>
                        {obj}
                      </span>
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
`;

code = code.replace(
  /<div\s*key=\{idx\}\s*className={`flex items-start gap-2\.5 p-2 rounded-lg cursor-pointer transition-all select-none \$\{\s*isDone[\s\S]*?<\/div>/,
  itemReplace.trim()
);

fs.writeFileSync('src/components/PillarCritiqueCard.tsx', code);
