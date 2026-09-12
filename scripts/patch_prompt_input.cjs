const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add edit prompt state
code = code.replace(
  "const [isReimagining, setIsReimagining] = useState(false);",
  "const [isReimagining, setIsReimagining] = useState(false);\n  const [editPrompt, setEditPrompt] = useState('');\n  const [isEditMode, setIsEditMode] = useState(false);"
);

// Update handleGenerativeEdit to optionally use the prompt
const oldHandler = `const handleGenerativeEdit = async () => {`;
const newHandler = `const handleGenerativeEdit = async () => {
    if (!currentImage || !currentCritique) return;
    setIsReimagining(true);
    setErrorMessage(null);
    setIsEditMode(false); // Close the input after submit

    try {
      const critiqueSummary = currentCritique.executiveSummary + " | Focus areas: " + 
        currentCritique.composition.actionableFix + " | " + 
        currentCritique.lightingAndColor.actionableFix;
      
      const customPrompt = editPrompt.trim();
`;
code = code.replace(oldHandler, newHandler);

// Pass customPrompt
code = code.replace(
  "critiqueSummary: critiqueSummary,",
  "critiqueSummary: critiqueSummary,\n          customPrompt: customPrompt ? customPrompt : undefined,"
);

// We need to replace the static button section with an input + button combo
const oldButtonSection = `{/* Generative Edit Button */}
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
                </div>`;

const newButtonSection = `{/* Generative Edit Interface */}
                <div className="flex flex-col items-end gap-2 mt-2">
                  {!isEditMode ? (
                    <button
                      onClick={() => setIsEditMode(true)}
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
                  ) : (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full max-w-2xl bg-stone-900/90 p-2 rounded-2xl border border-stone-800 shadow-xl">
                      <input 
                        type="text" 
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="e.g. Apply the feedback, but make it cyberpunk style..."
                        className="flex-1 bg-stone-950 border border-stone-800 text-stone-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/50"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleGenerativeEdit();
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsEditMode(false)}
                          className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleGenerativeEdit}
                          disabled={isReimagining || isLoading}
                          className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {isReimagining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          Generate
                        </button>
                      </div>
                    </div>
                  )}
                </div>`;

code = code.replace(oldButtonSection, newButtonSection);

fs.writeFileSync('src/App.tsx', code);
