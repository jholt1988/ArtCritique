const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state
code = code.replace(
  /const \[isLoading, setIsLoading\] = useState\(false\);/,
  "const [isLoading, setIsLoading] = useState(false);\n  const [isReimagining, setIsReimagining] = useState(false);"
);

// 2. Add handleGenerativeEdit
const handler = `
  const handleGenerativeEdit = async () => {
    if (!currentImage || !currentCritique) return;
    setIsReimagining(true);
    setErrorMessage(null);

    try {
      const critiqueSummary = currentCritique.executiveSummary + " | Focus areas: " + 
        currentCritique.composition.actionableFix + " | " + 
        currentCritique.lightingAndColor.actionableFix;
        
      const response = await fetchApi('/api/reimagine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: currentImage,
          critiqueSummary: critiqueSummary,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || \`Server responded with status \${response.status}\`);
      }

      const { reimagedUrl } = await response.json();
      
      // Now re-trigger critique on the NEW image so the dashboard stays in sync
      const analyzeResponse = await fetchApi('/api/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: reimagedUrl,
          mimeType: 'image/jpeg',
          artworkTitle: currentCritique.artworkTitle + ' (Master Edit)',
          artistStyle: currentCritique.artistStyle,
          targetContext: currentCritique.targetContext,
          intendedMood: currentCritique.intendedMood,
          artistQuestions: 'Please critique this generative edit upscaled based on your previous feedback.',
        }),
      });
      
      if (!analyzeResponse.ok) {
        throw new Error('Edit succeeded, but failed to re-analyze the new image.');
      }
      
      const newCritiqueResult = await analyzeResponse.json();
      setCurrentImage(reimagedUrl);
      setCurrentCritique(newCritiqueResult);
      setActivePillarTab('overview');
      setSelectedHotspot(null);
      
      const newPortfolioItem = {
        id: 'artwork_' + Date.now(),
        title: newCritiqueResult.artworkTitle,
        imageData: reimagedUrl,
        critique: newCritiqueResult,
        createdAt: Date.now(),
        tags: [newCritiqueResult.artistStyle, 'Generative Edit'],
        version: (portfolio.find(p => p.id === currentCritique.id)?.version || 1) + 1,
        parentArtworkId: currentCritique.id
      };
      
      setPortfolio((prev) => [newPortfolioItem, ...prev]);
      
    } catch (err: any) {
      console.error('Reimagine request failed:', err);
      setErrorMessage(
        err?.message ||
          'Failed to perform generative edit. Please verify your connection or try again.'
      );
    } finally {
      setIsReimagining(false);
    }
  };
`;

code = code.replace("const handleAnalyzeArtwork =", handler + "\n\n  const handleAnalyzeArtwork =");

// 3. Add the button in the UI
// Find the Critique Navigation Tabs Bar
const buttonInsert = `
                {/* Generative Edit Button */}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleGenerativeEdit}
                    disabled={isReimagining || isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isReimagining ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating Master Edit...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-indigo-100" />
                        Generative Edit & Upscale
                      </>
                    )}
                  </button>
                </div>
`;

code = code.replace("{/* Critique Navigation Tabs Bar */}", buttonInsert + "\n\n                {/* Critique Navigation Tabs Bar */}");

fs.writeFileSync('src/App.tsx', code);
