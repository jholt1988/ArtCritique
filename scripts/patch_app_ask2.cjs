const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const propAddition1 = `
                {activePillarTab === 'overview' && (
                  <CritiqueOverview 
                    critique={currentCritique}
                    onSelectPillarTab={(pillarKey) => setActivePillarTab(pillarKey)}
                    onAskArtDirector={handleAskArtDirector} 
                  />
                )}
`;

code = code.replace(
  /\{activePillarTab === 'overview' && \(\s*<CritiqueOverview\s*critique=\{currentCritique\}\s*onSelectPillarTab=\{\(pillarKey\) => setActivePillarTab\(pillarKey\)\}\s*\/>\s*\)\}/m,
  propAddition1
);

fs.writeFileSync('src/App.tsx', code);
