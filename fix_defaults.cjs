const fs = require('fs');

const defaultPillarStr = '{ score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing.", strengths: [], refinements: [], actionableFix: "", techniqueTip: "" }';

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/\{ score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing." \}/g, defaultPillarStr);
fs.writeFileSync('src/App.tsx', appCode);

let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(/\{ score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing." \}/g, defaultPillarStr);
fs.writeFileSync('server.ts', serverCode);

