const fs = require('fs');
let code = fs.readFileSync('src/components/PillarCritiqueCard.tsx', 'utf8');

// 1. Add state
code = code.replace(
  /const \[isRoadmapView, setIsRoadmapView\] = useState\(false\);/,
  "const [isRoadmapView, setIsRoadmapView] = useState(false);\n  const [showAllHighPriority, setShowAllHighPriority] = useState(false);"
);

// 2. Change relatedHotspots definition
code = code.replace(
  /const relatedHotspots = hotspots\.filter\(\(h\) => h\.pillar === pillarKey\);/,
  "const baseHotspots = hotspots.filter((h) => h.pillar === pillarKey);\n  const displayedHotspots = showAllHighPriority ? hotspots.filter(h => h.severity === 'critical') : baseHotspots;"
);

// 3. Replace usage in JSX
// Find `{relatedHotspots.length > 0 && (`
code = code.replace(
  /\{relatedHotspots\.length > 0 && \(/,
  "{(baseHotspots.length > 0 || displayedHotspots.length > 0) && ("
);

// 4. Update the heading and add the toggle
const oldHeader = `<div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Visual Canvas Annotations ({relatedHotspots.length})
              </h3>
            </div>
            <span className="text-[11px] text-stone-400">
              Click to pinpoint on artwork above
            </span>
          </div>`;

const newHeader = `<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
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
          </div>`;
          
code = code.replace(oldHeader, newHeader);

// 5. Replace relatedHotspots map
code = code.replace(
  /\{relatedHotspots\.map\(/,
  "{displayedHotspots.length === 0 ? (\n              <div className=\"col-span-full p-4 text-center text-stone-500 text-xs italic\">\n                No high-priority annotations found.\n              </div>\n            ) : displayedHotspots.map("
);

fs.writeFileSync('src/components/PillarCritiqueCard.tsx', code);
