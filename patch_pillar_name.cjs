const fs = require('fs');
let code = fs.readFileSync('src/components/PillarCritiqueCard.tsx', 'utf8');

const oldTag = `<span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 capitalize">
                      {hs.severity}
                    </span>`;
const newTag = `<span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 capitalize flex items-center gap-1">
                      {showAllHighPriority && <span className="opacity-60">{hs.pillar} • </span>}
                      <span className={hs.severity === 'critical' ? 'text-rose-400' : hs.severity === 'strength' ? 'text-emerald-400' : 'text-amber-400'}>{hs.severity}</span>
                    </span>`;

code = code.replace(oldTag, newTag);

fs.writeFileSync('src/components/PillarCritiqueCard.tsx', code);
