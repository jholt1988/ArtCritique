const fs = require('fs');
let code = fs.readFileSync('src/components/PillarCritiqueCard.tsx', 'utf8');

const refinementsReplacement = `
          <ul className="space-y-2.5">
            {(pillarData.refinements || []).map((refinement, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-300 bg-stone-950/40 p-3 rounded-xl border border-stone-800/60 leading-relaxed group">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <span className="flex-1">{refinement}</span>
                {onAskArtDirector && (
                  <button
                    onClick={() => onAskArtDirector(\`How can I improve this specific issue: "\${refinement}"?\`)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 hover:text-amber-400 flex-shrink-0"
                    title="Ask Art Director how to improve this"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
`;

code = code.replace(
  /<ul className="space-y-2\.5">\s*\{\(pillarData\.refinements \|\| \[\]\)\.map\(\(refinement, idx\) => \(\s*<li key=\{idx\} className="flex items-start gap-2\.5 text-xs text-stone-300 bg-stone-950\/40 p-3 rounded-xl border border-stone-800\/60 leading-relaxed">\s*<span className="w-1\.5 h-1\.5 rounded-full bg-amber-400 mt-1\.5 flex-shrink-0" \/>\s*<span>\{refinement\}<\/span>\s*<\/li>\s*\)\)\}\s*<\/ul>/,
  refinementsReplacement.trim()
);

const fixReplacement = `
        {/* Immediate Step-by-Step Fix */}
        <div className="rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/30 p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Wrench className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Targeted Actionable Fix
              </h3>
            </div>
            {onAskArtDirector && (
              <button
                onClick={() => onAskArtDirector(\`Can you give me a more detailed, step-by-step walkthrough on how to execute this actionable fix: "\${pillarData.actionableFix}"?\`)}
                className="text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                title="Ask Art Director for step-by-step help"
              >
                <MessageSquare className="w-3 h-3" />
                Ask Director
              </button>
            )}
          </div>
          <p className="text-xs text-stone-200 leading-relaxed bg-stone-950/80 p-3.5 rounded-xl border border-stone-800">
            {pillarData.actionableFix}
          </p>
        </div>
`;

code = code.replace(
  /\{\/\* Immediate Step-by-Step Fix \*\/\}\s*<div className="rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500\/30 p-5">\s*<div className="flex items-center gap-2 text-amber-400 mb-2">\s*<Wrench className="w-4 h-4" \/>\s*<h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">\s*Targeted Actionable Fix\s*<\/h3>\s*<\/div>\s*<p className="text-xs text-stone-200 leading-relaxed bg-stone-950\/80 p-3\.5 rounded-xl border border-stone-800">\s*\{pillarData\.actionableFix\}\s*<\/p>\s*<\/div>/,
  fixReplacement.trim()
);

fs.writeFileSync('src/components/PillarCritiqueCard.tsx', code);
