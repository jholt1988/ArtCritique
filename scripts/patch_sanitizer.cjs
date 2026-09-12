const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const sanitizerCode = `
    const critiqueJson = JSON.parse(response.text || '{}');
    
    // Sanitize missing nested objects to prevent frontend crashes
    critiqueJson.composition = critiqueJson.composition || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing." };
    critiqueJson.lightingAndColor = critiqueJson.lightingAndColor || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing." };
    critiqueJson.anatomyAndPerspective = critiqueJson.anatomyAndPerspective || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing." };
    critiqueJson.moodAndStorytelling = critiqueJson.moodAndStorytelling || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing." };
    critiqueJson.overallScore = critiqueJson.overallScore || 0;
    critiqueJson.hotspots = critiqueJson.hotspots || [];
    critiqueJson.colorPalette = critiqueJson.colorPalette || [];
    critiqueJson.quickWins = critiqueJson.quickWins || [];
    critiqueJson.portfolioRecommendations = critiqueJson.portfolioRecommendations || [];
`;

code = code.replace(
  "const critiqueJson = JSON.parse(response.text || '{}');",
  sanitizerCode
);

fs.writeFileSync('server.ts', code);
