const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const badCode = `
    if (!currentImage || !currentCritique) return;
    setIsReimagining(true);
    setErrorMessage(null);

    try {
      const critiqueSummary = currentCritique.executiveSummary + " | Focus areas: " + 
        currentCritique.composition.actionableFix + " | " + 
        currentCritique.lightingAndColor.actionableFix;`;
        
code = code.replace(badCode, "");
fs.writeFileSync('src/App.tsx', code);
