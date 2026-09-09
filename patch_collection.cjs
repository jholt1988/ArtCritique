const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
    const critique = JSON.parse(response.text || '{}');
    
    critique.strengths = critique.strengths || [];
    critique.areasForImprovement = critique.areasForImprovement || [];
    critique.overallScore = critique.overallScore || 0;
    critique.cohesionScore = critique.cohesionScore || 0;
    critique.executiveSummary = critique.executiveSummary || 'Data missing.';
    critique.portfolioFit = critique.portfolioFit || 'Data missing.';
    critique.collectionName = critique.collectionName || collectionName;

    res.json(critique);
`;

code = code.replace(
  /const critique = JSON\.parse\(response\.text \|\| '\{\}'\);\s*res\.json\(critique\);/,
  replacement.trim()
);

fs.writeFileSync('server.ts', code);
