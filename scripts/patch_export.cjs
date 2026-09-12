const fs = require('fs');

let code = fs.readFileSync('src/utils/exportReport.ts', 'utf8');

code = code.replace(/critique\.composition\.strengths\.map/g, '(critique.composition.strengths || []).map');
code = code.replace(/critique\.composition\.refinements\.map/g, '(critique.composition.refinements || []).map');
code = code.replace(/critique\.lightingAndColor\.strengths\.map/g, '(critique.lightingAndColor.strengths || []).map');
code = code.replace(/critique\.lightingAndColor\.refinements\.map/g, '(critique.lightingAndColor.refinements || []).map');
code = code.replace(/critique\.anatomyAndPerspective\.strengths\.map/g, '(critique.anatomyAndPerspective.strengths || []).map');
code = code.replace(/critique\.anatomyAndPerspective\.refinements\.map/g, '(critique.anatomyAndPerspective.refinements || []).map');
code = code.replace(/critique\.moodAndStorytelling\.strengths\.map/g, '(critique.moodAndStorytelling.strengths || []).map');
code = code.replace(/critique\.moodAndStorytelling\.refinements\.map/g, '(critique.moodAndStorytelling.refinements || []).map');
code = code.replace(/critique\.quickWins\.map/g, '(critique.quickWins || []).map');
code = code.replace(/critique\.portfolioRecommendations\.map/g, '(critique.portfolioRecommendations || []).map');
code = code.replace(/critique\.hotspots\.map/g, '(critique.hotspots || []).map');

fs.writeFileSync('src/utils/exportReport.ts', code);
