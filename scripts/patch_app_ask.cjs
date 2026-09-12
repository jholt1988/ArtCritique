const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const stateAddition = `
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');
  
  const handleAskArtDirector = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setActivePillarTab('chat');
  };
`;

code = code.replace(/const \[isSettingsOpen, setIsSettingsOpen\] = useState\(false\);/, stateAddition);

const propAddition1 = `
                {activePillarTab === 'overview' && (
                  <CritiqueOverview 
                    critique={currentCritique}
                    onAskArtDirector={handleAskArtDirector} 
                  />
`;

code = code.replace(
  /\{activePillarTab === 'overview' && \(\s*<CritiqueOverview critique=\{currentCritique\} \/>/m,
  propAddition1
);

const propAddition2 = `
                  <PillarCritiqueCard
                    pillarKey="composition"
                    pillarData={currentCritique.composition || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing.", strengths: [], refinements: [], actionableFix: "", techniqueTip: "" }}
                    hotspots={currentCritique.hotspots}
                    onSelectHotspot={(hs) => setSelectedHotspot(hs)}
                    onAskArtDirector={handleAskArtDirector}
                  />
`;

code = code.replace(
  /<PillarCritiqueCard\s*pillarKey="composition"\s*pillarData=\{currentCritique\.composition[^>]*\s*hotspots=\{currentCritique\.hotspots\}\s*onSelectHotspot=\{\(hs\) => setSelectedHotspot\(hs\)\}\s*\/>/m,
  propAddition2
);

const propAddition3 = `
                  <PillarCritiqueCard
                    pillarKey="lighting"
                    pillarData={currentCritique.lightingAndColor || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing.", strengths: [], refinements: [], actionableFix: "", techniqueTip: "" }}
                    hotspots={currentCritique.hotspots}
                    onSelectHotspot={(hs) => setSelectedHotspot(hs)}
                    onAskArtDirector={handleAskArtDirector}
                  />
`;

code = code.replace(
  /<PillarCritiqueCard\s*pillarKey="lighting"\s*pillarData=\{currentCritique\.lightingAndColor[^>]*\s*hotspots=\{currentCritique\.hotspots\}\s*onSelectHotspot=\{\(hs\) => setSelectedHotspot\(hs\)\}\s*\/>/m,
  propAddition3
);

const propAddition4 = `
                  <PillarCritiqueCard
                    pillarKey="anatomy"
                    pillarData={currentCritique.anatomyAndPerspective || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing.", strengths: [], refinements: [], actionableFix: "", techniqueTip: "" }}
                    hotspots={currentCritique.hotspots}
                    onSelectHotspot={(hs) => setSelectedHotspot(hs)}
                    onAskArtDirector={handleAskArtDirector}
                  />
`;

code = code.replace(
  /<PillarCritiqueCard\s*pillarKey="anatomy"\s*pillarData=\{currentCritique\.anatomyAndPerspective[^>]*\s*hotspots=\{currentCritique\.hotspots\}\s*onSelectHotspot=\{\(hs\) => setSelectedHotspot\(hs\)\}\s*\/>/m,
  propAddition4
);

const propAddition5 = `
                  <PillarCritiqueCard
                    pillarKey="storytelling"
                    pillarData={currentCritique.moodAndStorytelling || { score: 0, headline: "Not evaluated", detailedAnalysis: "Data missing.", strengths: [], refinements: [], actionableFix: "", techniqueTip: "" }}
                    hotspots={currentCritique.hotspots}
                    onSelectHotspot={(hs) => setSelectedHotspot(hs)}
                    onAskArtDirector={handleAskArtDirector}
                  />
`;

code = code.replace(
  /<PillarCritiqueCard\s*pillarKey="storytelling"\s*pillarData=\{currentCritique\.moodAndStorytelling[^>]*\s*hotspots=\{currentCritique\.hotspots\}\s*onSelectHotspot=\{\(hs\) => setSelectedHotspot\(hs\)\}\s*\/>/m,
  propAddition5
);

const mentorChatAddition = `
                {activePillarTab === 'chat' && (
                  <MentorChat
                    critique={currentCritique}
                    imageBase64={currentImage}
                    initialPrompt={chatInitialPrompt}
                    onPromptSent={() => setChatInitialPrompt('')}
                  />
                )}
`;

code = code.replace(
  /\{activePillarTab === 'chat' && \(\s*<MentorChat\s*critique=\{currentCritique\}\s*imageBase64=\{currentImage\}\s*\/>\s*\)\}/m,
  mentorChatAddition
);

fs.writeFileSync('src/App.tsx', code);
